use crate::backup_utils::{
  proto::pull_backup_response::Data, proto::pull_backup_response::Data::*,
  proto::PullBackupRequest, BackupServiceClient,
};

use crate::backup_utils::BackupData;
use tonic::Request;

#[derive(PartialEq, Debug)]
enum State {
  Compaction,
  Log,
}

pub async fn run(
  client: &mut BackupServiceClient<tonic::transport::Channel>,
  backup_data: &BackupData,
) -> Result<BackupData, Box<dyn std::error::Error>> {
  println!("pull backup");
  let cloned_user_id = backup_data.user_id.clone();
  let cloned_backup_id = backup_data.backup_id.clone();

  let mut result = BackupData {
    user_id: String::new(),
    device_id: String::new(),
    backup_id: String::new(),
    backup_chunk_sizes: Vec::new(),
    logs_sizes: Vec::new(),
  };

  let response = client
    .pull_backup(Request::new(PullBackupRequest {
      user_id: cloned_user_id,
      backup_id: cloned_backup_id,
    }))
    .await?;
  let mut inbound = response.into_inner();
  let mut state: State = State::Compaction;
  while let Some(response) = inbound.message().await? {
    let r: Option<Data> = response.data;
    if let Some(CompactionChunk(cc)) = r {
      if state != State::Compaction {
        return Err(
          format!("invalid state, expected compaction, got {:?}", state).into(),
        );
      }
      println!(
        "comp chunk no. {} size {}",
        response.chunk_counter,
        cc.len()
      );
      result.backup_chunk_sizes.push(cc.len())
    } else if let Some(LogChunk(lc)) = r {
      if state == State::Compaction {
        state = State::Log;
      }
      if state != State::Log {
        return Err("invalid state, expected compaction".into());
      }
      if response.chunk_counter == 0 {
        result.logs_sizes.push(Vec::new());
      }
      let size = result.logs_sizes.len();
      result.logs_sizes[size - 1].push(lc.len());

      println!("log chunk no. {} size {}", response.chunk_counter, lc.len());
    }
  }
  Ok(result)
}
