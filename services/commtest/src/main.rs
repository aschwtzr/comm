use std::env;

pub mod proto {
  tonic::include_proto!("backup");
}

pub mod backup_utils;
mod create_new_backup;
mod send_log;

use backup_utils::BackupServiceClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  let target_service = env::var("COMM_TEST_TARGET")?;
  println!("testing service {}", target_service);

  let mut client = BackupServiceClient::connect("http://[::0]:50052").await?;

  let user_id: String = "user0000".to_string();
  let device_id: String = "device0000".to_string();

  let backup_id = create_new_backup::run(&mut client, &user_id, &device_id)
    .await
    .map_err(|err| -> String { format!("create new backup error: {}", err) })?;
  println!("backup id in main: {}", backup_id);
  send_log::run(&mut client, &user_id, &backup_id)
    .await
    .map_err(|err| -> String { format!("send log: {}", err) })?;

  println!("tested");
  Ok(())
}
