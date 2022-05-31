use crate::backup_utils::{
  proto::send_log_request::Data::*, proto::SendLogRequest, BackupServiceClient,
};

use tonic::Request;

pub async fn run(
  client: &mut BackupServiceClient<tonic::transport::Channel>,
  user_id: &String,
  backup_id: &String,
) -> Result<String, Box<dyn std::error::Error>> {
  println!("send log");
  let cloned_user_id = format!("{}", user_id).to_string();
  let cloned_backup_id = format!("{}", backup_id).to_string();
  let outbound = async_stream::stream! {
    loop {
      println!(" - sending user id");
      let request = SendLogRequest {
        data: Some(UserId(cloned_user_id)),
      };
      yield request;
      println!(" - sending backup id");
      let request = SendLogRequest {
        data: Some(BackupId(cloned_backup_id)),
      };
      yield request;
      println!(" - sending log hash");
      let request = SendLogRequest {
        data: Some(LogHash(vec![65,66,67,68])),
      };
      yield request;
      println!(" - sending log data");
      let request = SendLogRequest {
        data: Some(LogData(vec![68,67,66,65])),
      };
      yield request;
      break;
    }
  };

  let response = client.send_log(Request::new(outbound)).await?;
  let inbound = response.into_inner();
  println!("send log response: {:?}", inbound.log_checkpoint);
  Ok(inbound.log_checkpoint)
}
