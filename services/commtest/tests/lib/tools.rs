use bytesize::ByteSize;

#[allow(dead_code)]
pub fn generate_nbytes(
  number_of_bytes: usize,
  predefined_byte_value: Option<u8>,
) -> Vec<u8> {
  let byte_value = predefined_byte_value.unwrap_or(b'A');
  return vec![byte_value; number_of_bytes];
}

#[derive(
  Debug, derive_more::Display, derive_more::From, derive_more::Error,
)]
pub enum Error {
  #[display(...)]
  Proto(std::io::Error),
  #[display(...)]
  Tonic(tonic::transport::Error),
  #[display(...)]
  TonicStatus(tonic::Status),
}

#[allow(dead_code)]
pub fn get_dynamo_db_item_size_limit() -> usize {
  ByteSize::kib(400).as_u64() as usize
}

#[allow(dead_code)]
pub const GRPC_METADATA_SIZE: usize = 5;

#[allow(dead_code)]
pub fn get_grpc_chunk_size_limit() -> usize {
  (ByteSize::mib(4).as_u64() as usize) - GRPC_METADATA_SIZE
}

#[allow(dead_code)]
pub const ATTACHMENT_DELIMITER: char = ';';
