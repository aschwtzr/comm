use futures_core::Stream;
use opaque_ke::{
  errors::ProtocolError, CredentialRequest,
  RegistrationRequest as PakeRegistrationRequest, RegistrationUpload,
  ServerLogin, ServerLoginStartParameters, ServerLoginStartResult,
  ServerRegistration,
};
use rand::{CryptoRng, Rng};
use std::pin::Pin;
use tokio::sync::mpsc::{error::SendError, Sender};
use tonic::{Request, Response, Status};

use crate::{
  config::Config,
  database::{DatabaseClient, Error as DatabaseError},
  opaque::Cipher,
};

pub use proto::identity_service_server::IdentityServiceServer;
use proto::{
  identity_service_server::IdentityService,
  registration_response::Data::PakeRegistrationResponse, LoginRequest,
  LoginResponse, RegistrationRequest, RegistrationResponse,
  VerifyUserTokenRequest, VerifyUserTokenResponse,
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

  async fn login_user(
    &self,
    request: Request<tonic::Streaming<LoginRequest>>,
  ) -> Result<Response<Self::LoginUserStream>, Status> {
    println!("Got a login request: {:?}", request);
    unimplemented!()
  }

  async fn verify_user_token(
    &self,
    request: Request<VerifyUserTokenRequest>,
  ) -> Result<Response<VerifyUserTokenResponse>, Status> {
    println!("Got a lookup request: {:?}", request);
    unimplemented!()
  }
}

impl MyIdentityService {
  async fn pake_registration_start(
    &self,
    pake_registration_request: Vec<u8>,
    rng: &mut (impl Rng + CryptoRng),
    tx: Sender<Result<RegistrationResponse, Status>>,
  ) -> Result<(), Error> {
    let server_registration_start_result = ServerRegistration::<Cipher>::start(
      rng,
      PakeRegistrationRequest::deserialize(&pake_registration_request)?,
      &self.config.server_secret_key,
    )
    .map_err(Error::Pake)?;
    tx.send(Ok(RegistrationResponse {
      data: Some(PakeRegistrationResponse(
        server_registration_start_result.message.serialize(),
      )),
    }))
    .await
    .map_err(Error::Channel)?;
    Ok(())
  }

  async fn pake_registration_finish(
    &self,
    user_id: String,
    pake_registration_upload: &Vec<u8>,
    server_registration: ServerRegistration<Cipher>,
  ) -> Result<(), Error> {
    let server_registration_finish_result = server_registration.finish(
      RegistrationUpload::<Cipher>::deserialize(pake_registration_upload)?,
    )?;
    self
      .client
      .put_pake_registration(user_id, server_registration_finish_result)
      .await
      .map_err(Error::Database)?;
    Ok(())
  }

  async fn pake_login_start(
    &self,
    user_id: String,
    pake_credential_request: &Vec<u8>,
    rng: &mut (impl Rng + CryptoRng),
  ) -> Result<ServerLoginStartResult<Cipher>, Error> {
    let server_registration =
      self.client.get_pake_registration(user_id).await?;
    let pake_credential_request =
      CredentialRequest::deserialize(pake_credential_request)?;
    match server_registration {
      None => Err(Error::MissingRegistration),
      Some(registration) => ServerLogin::start(
        rng,
        registration,
        &self.config.server_secret_key,
        pake_credential_request,
        ServerLoginStartParameters::default(),
      )
      .map_err(Error::Pake),
    }
  }
}

#[derive(
  Debug, derive_more::Display, derive_more::From, derive_more::Error,
)]
pub enum Error {
  #[display(...)]
  Pake(ProtocolError),
  #[display(...)]
  Channel(SendError<Result<RegistrationResponse, Status>>),
  #[display(...)]
  Database(DatabaseError),
  #[display(...)]
  MissingRegistration,
}
