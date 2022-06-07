use std::env;

pub mod proto {
  tonic::include_proto!("backup");
}

pub mod backup_utils;
mod create_new_backup;
mod send_log;
pub mod tools;

use backup_utils::BackupData;
use backup_utils::BackupServiceClient;
use bytesize::ByteSize;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let target_service = env::var("COMM_TEST_TARGET")?;
  println!("testing service {}", target_service);

  let mut client = BackupServiceClient::connect("http://[::0]:50052").await?;

  let mut backup_data = BackupData {
    user_id: "user0000".to_string(),
    device_id: "device0000".to_string(),
    backup_id: String::new(),
    backup_chunk_sizes: vec![ByteSize::mb(1).as_u64() as usize; 6],
    logs_sizes: vec![
      vec![100],
      vec![ByteSize::kb(400).as_u64() as usize],
      vec![
        ByteSize::kb(500).as_u64() as usize,
        ByteSize::kb(100).as_u64() as usize,
      ],
    ],
  };

  backup_data.backup_id = create_new_backup::run(&mut client, &backup_data)
    .await
    .map_err(|err| -> String { format!("create new backup error: {}", err) })?;
  println!("backup id in main: {}", backup_data.backup_id);

  for log_index in 0..backup_data.logs_sizes.len() {
    send_log::run(&mut client, &backup_data, log_index)
      .await
      .map_err(|err| -> String { format!("send log: {}", err) })?;
  }

  println!("tested");
  Ok(())
}
