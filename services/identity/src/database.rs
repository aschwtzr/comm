use std::collections::HashMap;

use opaque_ke::ServerRegistration;
use rusoto_core::Region;
use rusoto_dynamodb::{
  AttributeValue, DynamoDb, DynamoDbClient, GetItemInput, GetItemOutput,
};
use tracing::error;

use crate::opaque::Cipher;

pub struct DatabaseClient {
  client: DynamoDbClient,
}

impl DatabaseClient {
  fn new(region: Region) -> Self {
    DatabaseClient {
      client: DynamoDbClient::new(region),
    }
  }

  pub async fn get_pake_registration(
    &self,
    user_id: String,
  ) -> Option<ServerRegistration<Cipher>> {
    let partition_key = HashMap::from([(
      "userID".to_string(),
      AttributeValue {
        s: Some(user_id.clone()),
        ..Default::default()
      },
    )]);
    let get_item_input = GetItemInput {
      table_name: "identity-pake-registration".to_string(),
      key: partition_key,
      consistent_read: Some(true),
      ..GetItemInput::default()
    };
    let get_item_result = self.client.get_item(get_item_input).await;
    match get_item_result {
      Ok(GetItemOutput {
        item: Some(item), ..
      }) => {
        if let Some(AttributeValue {
          b: Some(server_registration_bytes),
          ..
        }) = item.get("pakeRegistrationData")
        {
          match ServerRegistration::<Cipher>::deserialize(
            server_registration_bytes,
          ) {
            Ok(server_registration) => Some(server_registration),
            Err(e) => {
              error!(
                "Failed to deserialize ServerRegistration struct for user {}: {}",
                user_id, e
              );
              None
            }
          }
        } else {
          error!("No registration data found for registered user {}", user_id);
          None
        }
      }
      Ok(_) => None,
      Err(e) => {
        error!(
          "DynamoDB client failed to get registration data for user {}: {}",
          user_id, e
        );
        None
      }
    }
  }
}

impl Default for DatabaseClient {
  fn default() -> Self {
    DatabaseClient::new(Region::UsEast2)
  }
}
