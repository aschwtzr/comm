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

#[allow(dead_code)]
pub const GRPC_METADATA_SIZE: usize = 5;

#[allow(dead_code)]
pub fn get_grpc_chunk_size_limit() -> usize {
  (ByteSize::mib(4).as_u64() as usize) - GRPC_METADATA_SIZE
}

#[allow(dead_code)]
pub const ATTACHMENT_DELIMITER: char = ';';
