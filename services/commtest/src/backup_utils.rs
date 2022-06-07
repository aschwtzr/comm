pub mod proto {
  tonic::include_proto!("backup");
}

pub use proto::backup_service_client::BackupServiceClient;

pub struct BackupData {
  pub user_id: String,
  pub device_id: String,
  pub backup_id: String,
  pub backup_chunk_sizes: Vec<usize>,
  pub logs_sizes: Vec<Vec<usize>>,
}
