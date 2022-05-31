pub mod proto {
  tonic::include_proto!("backup");
}

pub use proto::backup_service_client::BackupServiceClient;

pub use proto::{
  create_new_backup_request::Data::{
    DeviceId, KeyEntropy, NewCompactionChunk, NewCompactionHash,
    UserId as CreateNewBackupUserId,
  },
  send_log_request::Data::{
    BackupId, LogData, LogHash, UserId as SendLogUserId,
  },
  CreateNewBackupRequest, SendLogRequest,
};
