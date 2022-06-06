pub mod proto {
  tonic::include_proto!("backup");
}

pub use proto::backup_service_client::BackupServiceClient;
