#[path = "./backup_utils.rs"]
mod backup_utils;
#[path = "../lib/tools.rs"]
mod tools;

use tonic::Request;

use crate::backup_utils::{
  proto::pull_backup_response::Data, proto::pull_backup_response::Data::*,
  proto::pull_backup_response::Id, proto::pull_backup_response::Id::*,
  proto::PullBackupRequest, BackupServiceClient,
};

use crate::backup_utils::{BackupData, Item};
use crate::tools::{Error, ATTACHMENT_DELIMITER};

#[derive(PartialEq, Debug)]
enum State {
  Compaction,
  Log,
}

pub async fn run(
  client: &mut BackupServiceClient<tonic::transport::Channel>,
  backup_data: &BackupData,
) -> Result<BackupData, Error> {
  println!("pull backup");
  let cloned_user_id = backup_data.user_id.clone();
  let cloned_backup_id = backup_data.backup_item.id.clone();

  let mut result = BackupData {
    user_id: String::new(),
    device_id: String::new(),
    backup_item: Item::new(String::new(), Vec::new(), Vec::new()),
    log_items: Vec::new(),
  };

  let response = client
    .pull_backup(Request::new(PullBackupRequest {
      user_id: cloned_user_id,
      backup_id: cloned_backup_id,
    }))
    .await?;
  let mut inbound = response.into_inner();
  let mut state: State = State::Compaction;
  let mut current_id: String = String::new();
  while let Some(response) = inbound.message().await? {
    let response_data: Option<Data> = response.data;
    let id: Option<Id> = response.id;
    let mut backup_id: Option<String> = None;
    let mut log_id: Option<String> = None;
    match id {
      Some(BackupId(id)) => backup_id = Some(id),
      Some(LogId(id)) => log_id = Some(id),
      None => {}
    };
    let attachment_holders = response.attachment_holders.unwrap_or("".to_string());
    let mut holders_split: Vec<&str> = Vec::new();
    if !attachment_holders.is_empty() {
      holders_split = attachment_holders.split(ATTACHMENT_DELIMITER).collect();
    }
    match response_data {
      Some(CompactionChunk(chunk)) => {
        assert_eq!(
          state,
          State::Compaction,
          "invalid state, expected compaction, got {:?}",
          state
        );
        current_id = backup_id.expect("backup id expected but not received");
        result.backup_item.chunks_sizes.push(chunk.len());
        println!(
          "compaction (id {}), pushing chunk (size: {}), attachments: {}",
          current_id,
          chunk.len(),
          holders_split.len()
        );
        if !holders_split.is_empty() {
          for holder in holders_split {
            if holder.is_empty() {
              continue;
            }
            result
              .backup_item
              .attachments_holders
              .push(holder.to_string());
          }
        }
      }
      Some(LogChunk(chunk)) => {
        if state == State::Compaction {
          state = State::Log;
        }
        assert_eq!(state, State::Log, "invalid state, expected compaction");
        let log_id = log_id.expect("log id expected but not received");
        if log_id != current_id {
          result.log_items.push(Item::new(
            log_id.clone(),
            Vec::new(),
            Vec::new(),
          ));
          current_id = log_id;
        }
        let log_items_size = result.log_items.len() - 1;
        result.log_items[log_items_size]
          .chunks_sizes
          .push(chunk.len());
        println!("log (id {}) chunk size {}, attachments: {}", current_id, chunk.len(), holders_split.len());
        if !holders_split.is_empty() {
          let log_items_size = result.log_items.len() - 1;
          for holder in holders_split {
            if holder.is_empty() {
              continue;
            }
            result.log_items[log_items_size]
              .attachments_holders
              .push(holder.to_string());
          }
        }
      }
      None => {}
    }
  }
  Ok(result)
}
