use crate::backup_utils::{
  proto::create_new_backup_request::Data::*, proto::CreateNewBackupRequest,
  BackupServiceClient,
};

use tonic::Request;

pub async fn run(
  client: &mut BackupServiceClient<tonic::transport::Channel>,
  user_id: &String,
  device_id: &String,
) -> Result<String, Box<dyn std::error::Error>> {
  println!("create new backup");
  let cloned_user_id = user_id.clone();
  let cloned_device_id = device_id.clone();
  let outbound = async_stream::stream! {
    println!(" - sending user id");
    let request = CreateNewBackupRequest {
      data: Some(UserId(cloned_user_id.to_string())),
    };
    yield request;
    println!(" - sending device id");
    let request = CreateNewBackupRequest {
      data: Some(DeviceId(cloned_device_id.to_string())),
    };
    yield request;
    println!(" - sending key entropy");
    let request = CreateNewBackupRequest {
      data: Some(KeyEntropy(vec![65,66,67,68])),
    };
    yield request;
    println!(" - sending data hash");
    let request = CreateNewBackupRequest {
      data: Some(NewCompactionHash(vec![68,67,66,65])),
    };
    yield request;
    // todo send multiple chunks
    println!(" - sending data chunk");
    let request = CreateNewBackupRequest {
      data: Some(NewCompactionChunk(vec![68,67,66,65])),
    };
    yield request;
  };

  let mut backup_id: String = String::new();
  let response = client.create_new_backup(Request::new(outbound)).await?;
  let mut inbound = response.into_inner();
  while let Some(response) = inbound.message().await? {
    if !response.backup_id.is_empty() {
      backup_id = response.backup_id;
    }
  }
  if backup_id.is_empty() {
    return Err("could not get a backup id from the server".into());
  }
  Ok(backup_id)
}
