use chrono::Utc;
use constant_time_eq::constant_time_eq;
use futures_core::Stream;
use rand::rngs::OsRng;
use rand::{CryptoRng, Rng};
use rusoto_core::RusotoError;
use rusoto_dynamodb::{GetItemError, PutItemError};
use siwe::Message;
use std::pin::Pin;
use tokio::sync::mpsc;
use tokio_stream::{wrappers::ReceiverStream, StreamExt};
use tonic::{Request, Response, Status};
use tracing::{error, info, instrument};

use crate::database::DatabaseClient;
use crate::token::{AccessTokenData, AuthType};
use crate::{config::Config, database::Error};

pub use proto::identity_service_server::IdentityServiceServer;
use proto::{
  identity_service_server::IdentityService,
  login_request::Data::PakeLoginRequest,
  login_request::Data::WalletLoginRequest,
  login_response::Data::PakeLoginResponse,
  login_response::Data::WalletLoginResponse,
  pake_login_response::Data::AccessToken, LoginRequest, LoginResponse,
  PakeLoginResponse as PakeLoginResponseStruct, RegistrationRequest,
  RegistrationResponse, VerifyUserTokenRequest, VerifyUserTokenResponse,
  WalletLoginRequest as WalletLoginRequestStruct,
  WalletLoginResponse as WalletLoginResponseStruct,
};

mod proto {
  tonic::include_proto!("identity");
}

enum PakeWorkflow {
  Registration,
  Login,
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
      let mut num_messages_received = 0;
      while let Some(message) = in_stream.next().await {
        match message {
          Ok(login_request) => {
            if let Some(data) = login_request.data {
              match data {
                WalletLoginRequest(req) => {
                  if let Err(e) = tx
                    .send(
                      wallet_login_helper(
                        client,
                        req,
                        &mut OsRng,
                        num_messages_received,
                      )
                      .await,
                    )
                    .await
                  {
                    error!("Response was dropped: {}", e);
                  }
                  break;
                }
                PakeLoginRequest(_) => unimplemented!(),
              }
            } else {
              error!("Received empty login request");
              if let Err(e) = tx
                .send(Err(Status::invalid_argument("invalid message")))
                .await
              {
                error!("Response was dropped: {}", e);
              }
              break;
            }
          }
          Err(e) => {
            error!("Received an unexpected error: {}", e);
            if let Err(e) = tx.send(Err(Status::unknown("unknown error"))).await
            {
              error!("Response was dropped: {}", e);
            }
            break;
          }
        }
        num_messages_received += 1;
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
      .get_access_token_data(message.user_id, message.device_id)
      .await
    {
      Ok(Some(access_token_data)) => constant_time_eq(
        access_token_data.access_token.as_bytes(),
        message.access_token.as_bytes(),
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

async fn put_token_helper(
  client: DatabaseClient,
  auth_type: AuthType,
  user_id: &str,
  device_id: &str,
  rng: &mut (impl Rng + CryptoRng),
) -> Result<String, Status> {
  if user_id.is_empty() || device_id.is_empty() {
    error!(
      "Incomplete data: user ID {}, device ID {}",
      user_id, device_id
    );
    return Err(Status::aborted("user not found"));
  }
  let access_token_data = AccessTokenData::new(
    user_id.to_string(),
    device_id.to_string(),
    auth_type.clone(),
    rng,
  );
  match client
    .put_access_token_data(access_token_data.clone())
    .await
  {
    Ok(_) => Ok(access_token_data.access_token),
    Err(Error::RusotoPut(RusotoError::Service(
      PutItemError::ResourceNotFound(_),
    )))
    | Err(Error::RusotoPut(RusotoError::Credentials(_))) => {
      Err(Status::failed_precondition("internal error"))
    }
    Err(Error::RusotoPut(_)) => Err(Status::unavailable("please retry")),
    Err(e) => {
      error!("Encountered an unexpected error: {}", e);
      Err(Status::failed_precondition("unexpected error"))
    }
  }
}

fn parse_and_verify_siwe_message(
  user_id: &str,
  device_id: &str,
  siwe_message: &str,
  siwe_signature: Vec<u8>,
) -> Result<(), Status> {
  if user_id.is_empty() || device_id.is_empty() {
    error!(
      "Incomplete data: user ID {}, device ID {}",
      user_id, device_id
    );
    return Err(Status::aborted("user not found"));
  }
  let siwe_message: Message = match siwe_message.parse() {
    Ok(m) => m,
    Err(e) => {
      error!("Failed to parse SIWE message: {}", e);
      return Err(Status::invalid_argument("invalid message"));
    }
  };
  match siwe_message.verify(
    match siwe_signature.try_into() {
      Ok(s) => s,
      Err(e) => {
        error!("Conversion to SIWE signature failed: {:?}", e);
        return Err(Status::invalid_argument("invalid message"));
      }
    },
    None,
    None,
    Some(&Utc::now()),
  ) {
    Err(e) => {
      error!(
        "Signature verification failed for user {} on device {}: {}",
        user_id, device_id, e
      );
      Err(Status::unauthenticated("message not authenticated"))
    }
    Ok(_) => Ok(()),
  }
}

async fn wallet_login_helper(
  client: DatabaseClient,
  wallet_login_request: WalletLoginRequestStruct,
  rng: &mut (impl Rng + CryptoRng),
  num_messages_received: u8,
) -> Result<LoginResponse, Status> {
  if num_messages_received != 0 {
    error!("Too many messages received in stream, aborting");
    return Err(Status::aborted("please retry"));
  }
  match parse_and_verify_siwe_message(
    &wallet_login_request.user_id,
    &wallet_login_request.device_id,
    &wallet_login_request.siwe_message,
    wallet_login_request.siwe_signature,
  ) {
    Ok(()) => Ok(LoginResponse {
      data: Some(WalletLoginResponse(WalletLoginResponseStruct {
        access_token: put_token_helper(
          client,
          AuthType::Wallet,
          &wallet_login_request.user_id,
          &wallet_login_request.device_id,
          rng,
        )
        .await?,
      })),
    }),
    Err(e) => Err(e),
  }
}
