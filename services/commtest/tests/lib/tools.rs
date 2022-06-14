use bytesize::ByteSize;
use std::env;

#[allow(dead_code)]
pub fn generate_nbytes(n: usize, c: Option<u8>) -> Vec<u8> {
  let c: u8 = match c {
    Some(c) => c,
    None => b'A',
  };
  return vec![c; n];
}

#[derive(
  Debug, derive_more::Display, derive_more::From, derive_more::Error,
)]
pub enum Error {
  #[display(...)]
  EnvVar(env::VarError),
  #[display(...)]
  Proto(std::io::Error),
  #[display(...)]
  Tonic(tonic::transport::Error),
  #[display(...)]
  TonicStatus(tonic::Status),
}
