use std::env;

pub mod proto {
  tonic::include_proto!("backup");
}

pub mod backup_utils;
mod create_new_backup;
mod pull_backup;
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
        ByteSize::mb(4).as_u64() as usize,
        ByteSize::mb(4).as_u64() as usize,
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

  let result = pull_backup::run(&mut client, &backup_data)
    .await
    .map_err(|err| -> String { format!("pull backup: {}", err) })?;

  // check backup size
  let expected: usize = backup_data.backup_chunk_sizes.iter().sum();
  let from_result: usize = result.backup_chunk_sizes.iter().sum();
  if from_result != expected {
    return Err(
      format!(
        "backup sizes do not match, expected {}, got {}",
        expected, from_result
      )
      .into(),
    );
  }

  // check number of logs
  let expected: usize = backup_data.logs_sizes.len();
  let from_result: usize = result.logs_sizes.len();
  if expected != from_result {
    return Err(
      format!(
        "number of logs do not match, expected {}, got {}",
        expected, from_result
      )
      .into(),
    );
  }

  // check log sizes
  for i in 0..backup_data.logs_sizes.len() {
    let expected: usize = backup_data.logs_sizes[i].iter().sum();
    let from_result: usize = result.logs_sizes[i].iter().sum();
    if from_result != expected {
      return Err(
        format!(
          "log number {} sizes do not match, expected {}, got {}",
          i, expected, from_result
        )
        .into(),
      );
    }
  }

  println!("tested");
  Ok(())
}
