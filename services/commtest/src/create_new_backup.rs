use crate::backup_utils::{
  proto::create_new_backup_request::Data::*, proto::CreateNewBackupRequest,
  BackupServiceClient,
};

use tonic::Request;

use crate::tools::generate_nbytes;

use crate::backup_utils::BackupData;

pub async fn run(
  client: &mut BackupServiceClient<tonic::transport::Channel>,
  backup_data: &BackupData,
) -> Result<String, Box<dyn std::error::Error>> {
  println!("create new backup");
  let cloned_user_id = backup_data.user_id.clone();
  let cloned_device_id = backup_data.device_id.clone();
  let cloned_backup_chunk_sizes = backup_data.backup_chunk_sizes.clone();
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
    // todo calculate the real hash, this is a mocked value
    let request = CreateNewBackupRequest {
      data: Some(NewCompactionHash(vec![68,67,66,65,66])),
    };
    yield request;
    for chunk_size in cloned_backup_chunk_sizes {
      println!(" - sending data chunk {}", chunk_size);
      let request = CreateNewBackupRequest {
        data: Some(NewCompactionChunk(generate_nbytes(chunk_size, None))),
      };
      yield request;
    }
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
