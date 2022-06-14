use chrono::Utc;
use constant_time_eq::constant_time_eq;
use futures_core::Stream;
use rand::rngs::OsRng;
use rusoto_core::RusotoError;
use rusoto_dynamodb::{GetItemError, PutItemError};
use siwe::Message;
use std::pin::Pin;
use tokio::sync::mpsc;
use tokio_stream::{wrappers::ReceiverStream, StreamExt};
use tonic::{Request, Response, Status};
use tracing::{error, info, instrument};

use crate::database::DatabaseClient;
use crate::token::{AccessToken, AuthType};
use crate::{config::Config, database::Error};

pub use proto::identity_service_server::IdentityServiceServer;
use proto::{
  identity_service_server::IdentityService, LoginRequest, LoginResponse,
  RegistrationRequest, RegistrationResponse, VerifyUserTokenRequest,
  VerifyUserTokenResponse,
};

use self::proto::login_response::Data;
use self::proto::WalletLoginResponse;
use self::proto::{
  login_request::Data::PakeLoginRequest,
  login_request::Data::WalletLoginRequest,
};

mod proto {
  tonic::include_proto!("identity");
}

#[derive(derive_more::Constructor)]
pub struct MyIdentityService {
  config: Config,
  client: DatabaseClient,
}

#[tonic::async_trait]
impl IdentityService for MyIdentityService {
  type RegisterUserStream = Pin<
    Box<
      dyn Stream<Item = Result<RegistrationResponse, Status>> + Send + 'static,
    >,
  >;

  async fn register_user(
    &self,
    request: Request<tonic::Streaming<RegistrationRequest>>,
  ) -> Result<Response<Self::RegisterUserStream>, Status> {
    println!("Got a registration request: {:?}", request);
    unimplemented!()
  }

  type LoginUserStream =
    Pin<Box<dyn Stream<Item = Result<LoginResponse, Status>> + Send + 'static>>;

  #[instrument(skip(self))]
  async fn login_user(
    &self,
    request: Request<tonic::Streaming<LoginRequest>>,
  ) -> Result<Response<Self::LoginUserStream>, Status> {
    let mut in_stream = request.into_inner();
    let (tx, rx) = mpsc::channel(1);
    let client = self.client.clone();
    tokio::spawn(async move {
      while let Some(message) = in_stream.next().await {
        if let Ok(login_request) = message {
          if let Some(data) = login_request.data {
            match data {
              WalletLoginRequest(req) => {
                let siwe_message: Message = match req.message.parse() {
                  Ok(m) => m,
                  Err(e) => {
                    error!("Failed to parse SIWE message: {}", e);
                    if let Err(e) = tx
                      .send(Err(Status::invalid_argument("invalid message")))
                      .await
                    {
                      error!("Response was dropped: {}", e);
                    }
                    break;
                  }
                };
                if let Err(e) = siwe_message.verify(
                  match req.signature.try_into() {
                    Ok(s) => s,
                    Err(e) => {
                      error!("Conversion to SIWE signature failed: {:?}", e);
                      break;
                    }
                  },
                  None,
                  None,
                  Some(&Utc::now()),
                ) {
                  error!("Signature verification failed for user {} on device {}: {}", req.user_id, req.device_id, e);
                  if let Err(e) = tx
                    .send(Err(Status::unauthenticated(
                      "message not authenticated",
                    )))
                    .await
                  {
                    error!("Response was dropped: {}", e);
                  }
                  break;
                } else {
                  let token = AccessToken::new(
                    req.user_id,
                    req.device_id,
                    AuthType::Wallet,
                    &mut OsRng,
                  );
                  match client.put_token(token.clone()).await {
                    Ok(_) => {
                      if let Err(e) = tx
                        .send(Ok(LoginResponse {
                          data: Some(Data::WalletLoginResponse(
                            WalletLoginResponse {
                              token: token.token.into_bytes(),
                            },
                          )),
                        }))
                        .await
                      {
                        error!("Response was dropped: {}", e);
                      }
                      break;
                    }
                    Err(Error::RusotoPut(RusotoError::Service(
                      PutItemError::ResourceNotFound(_),
                    )))
                    | Err(Error::RusotoPut(RusotoError::Credentials(_))) => {
                      if let Err(e) = tx
                        .send(Err(Status::failed_precondition(
                          "internal error",
                        )))
                        .await
                      {
                        error!("Response was dropped: {}", e);
                      }
                      break;
                    }
                    Err(Error::RusotoPut(_)) => {
                      if let Err(e) =
                        tx.send(Err(Status::unavailable("please retry"))).await
                      {
                        error!("Response was dropped: {}", e);
                      }
                      break;
                    }
                    Err(e) => {
                      error!("Encountered an unexpected error: {}", e);
                      if let Err(e) = tx
                        .send(Err(Status::failed_precondition(
                          "unexpected error",
                        )))
                        .await
                      {
                        error!("Response was dropped: {}", e);
                      }
                      break;
                    }
                  }
                }
              }
              PakeLoginRequest(_) => unimplemented!(),
            }
          }
        }
      }
    });
    let out_stream = ReceiverStream::new(rx);
    Ok(Response::new(Box::pin(out_stream) as Self::LoginUserStream))
  }

  #[instrument(skip(self))]
  async fn verify_user_token(
    &self,
    request: Request<VerifyUserTokenRequest>,
  ) -> Result<Response<VerifyUserTokenResponse>, Status> {
    info!("Received VerifyUserToken request: {:?}", request);
    let message = request.into_inner();
    let token_valid = match self
      .client
      .get_token(message.user_id, message.device_id)
      .await
    {
      Ok(Some(access_token)) => constant_time_eq(
        access_token.token.as_bytes(),
        message.token.as_bytes(),
      ),
      Ok(None) => false,
      Err(Error::RusotoGet(RusotoError::Service(
        GetItemError::ResourceNotFound(_),
      )))
      | Err(Error::RusotoGet(RusotoError::Credentials(_))) => {
        return Err(Status::failed_precondition("internal error"))
      }
      Err(Error::RusotoGet(_)) => {
        return Err(Status::unavailable("please retry"))
      }
      Err(e) => {
        error!("Encountered an unexpected error: {}", e);
        return Err(Status::failed_precondition("unexpected error"));
      }
    };
    let response = Response::new(VerifyUserTokenResponse { token_valid });
    info!("Sending VerifyUserToken response: {:?}", response);
    Ok(response)
  }
}
