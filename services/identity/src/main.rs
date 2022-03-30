use futures_core::Stream;
use std::pin::Pin;
use tonic::{transport::Server, Request, Response, Status};

use identity::identity_service_server::{IdentityService, IdentityServiceServer};
use identity::{
  GetUserTokenRequest, GetUserTokenResponse, LoginRequest, LoginResponse, RegistrationRequest,
  RegistrationResponse,
};

pub mod identity {
  tonic::include_proto!("identity");
}

#[derive(Debug, Default)]
pub struct MyIdentityService {}

#[tonic::async_trait]
impl IdentityService for MyIdentityService {
  type RegisterUserStream =
    Pin<Box<dyn Stream<Item = Result<RegistrationResponse, Status>> + Send + 'static>>;

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

  async fn get_user_token(
    &self,
    request: Request<GetUserTokenRequest>,
  ) -> Result<Response<GetUserTokenResponse>, Status> {
    println!("Got a lookup request: {:?}", request);
    unimplemented!()
  }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let addr = "[::]:50054".parse()?;
  let identity_service = MyIdentityService::default();

  Server::builder()
    .add_service(IdentityServiceServer::new(identity_service))
    .serve(addr)
    .await?;

  Ok(())
}
