use std::collections::HashMap;

use bytes::Bytes;
use opaque_ke::{errors::ProtocolError, ServerRegistration};
use rusoto_core::{Region, RusotoError};
use rusoto_dynamodb::{
  AttributeValue, DynamoDb, DynamoDbClient, GetItemError, GetItemInput,
  GetItemOutput, PutItemError, PutItemInput, PutItemOutput,
};
use tracing::{error, info};

use crate::opaque::Cipher;
use crate::token::{AccessToken, AuthType};

pub struct DatabaseClient {
  client: DynamoDbClient,
}

impl DatabaseClient {
  pub fn new(region: Region) -> Self {
    DatabaseClient {
      client: DynamoDbClient::new(region),
    }
  }

  pub async fn get_pake_registration(
    &self,
    user_id: String,
  ) -> Result<Option<ServerRegistration<Cipher>>, Error> {
    let primary_key = construct_primary_key_from_strings(
      ("userID".to_string(), user_id.clone()),
      None,
    );
    let get_item_input = GetItemInput {
      table_name: "identity-pake-registration".to_string(),
      key: primary_key,
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
            Ok(server_registration) => Ok(Some(server_registration)),
            Err(e) => {
              error!(
                "Failed to deserialize ServerRegistration struct for user {}: {}",
                user_id, e
              );
              Err(Error::Pake(e))
            }
          }
        } else {
          error!("No registration data found for registered user {}", user_id);
          Err(Error::MissingAttribute)
        }
      }
      Ok(_) => {
        info!(
          "No item found for user {} in PAKE registration table",
          user_id
        );
        Ok(None)
      }
      Err(e) => {
        error!(
          "DynamoDB client failed to get registration data for user {}: {}",
          user_id, e
        );
        Err(Error::RusotoGet(e))
      }
    }
  }

  pub async fn put_pake_registration(
    &self,
    user_id: String,
    registration: ServerRegistration<Cipher>,
  ) -> Result<PutItemOutput, RusotoError<PutItemError>> {
    let input = PutItemInput {
      table_name: "identity-pake-registration".to_string(),
      item: HashMap::from([
        (
          "userID".to_string(),
          AttributeValue {
            s: Some(user_id),
            ..Default::default()
          },
        ),
        (
          "pakeRegistrationData".to_string(),
          AttributeValue {
            b: Some(Bytes::from(registration.serialize())),
            ..Default::default()
          },
        ),
      ]),
      ..PutItemInput::default()
    };
    self.client.put_item(input).await
  }

  pub async fn get_token(
    &self,
    user_id: String,
    device_id: String,
  ) -> Result<Option<AccessToken>, Error> {
    let primary_key = construct_primary_key_from_strings(
      ("userID".to_string(), user_id.clone()),
      Some(("deviceID".to_string(), device_id.clone())),
    );
    let get_item_input = GetItemInput {
      table_name: "identity-tokens".to_string(),
      key: primary_key,
      consistent_read: Some(true),
      ..GetItemInput::default()
    };
    let get_item_result = self.client.get_item(get_item_input).await;
    match get_item_result {
      Ok(GetItemOutput {
        item: Some(item), ..
      }) => {
        let created = if let Some(AttributeValue {
          s: Some(created), ..
        }) = item.get("created")
        {
          match created.parse() {
            Ok(r) => Some(r),
            Err(e) => {
              error!("Could not parse DateTime from 'created' attribute {} for user {}'s token for device {}: {}", created, user_id, device_id, e);
              None
            }
          }
        } else {
          error!(
            "'created' attribute missing for user {}'s token for device {}",
            user_id, device_id
          );
          None
        };
        let auth_type = if let Some(AttributeValue {
          s: Some(auth_type), ..
        }) = item.get("authType")
        {
          match auth_type.as_str() {
            "password" => Some(AuthType::Password),
            "wallet" => Some(AuthType::Wallet),
            unsupported => {
              error!("Expected valid AuthType variant for user {}'s token for device {}, found: {}", user_id, device_id, unsupported);
              None
            }
          }
        } else {
          error!(
            "'authType' attribute missing for user {}'s token for device {}",
            user_id, device_id
          );
          None
        };
        let valid = if let Some(AttributeValue {
          bool: Some(valid), ..
        }) = item.get("valid")
        {
          Some(*valid)
        } else {
          error!(
            "'valid' attribute missing for user {}'s token for device {}",
            user_id, device_id
          );
          None
        };
        let token = if let Some(AttributeValue { s: Some(token), .. }) =
          item.get("token")
        {
          Some(token.to_string())
        } else {
          error!(
            "'token' attribute missing for user {}'s token for device {}",
            user_id, device_id
          );
          None
        };
        Ok(Some(AccessToken {
          token: token,
          created: created,
          auth_type: auth_type,
          valid: valid,
        }))
      }
      Ok(_) => {
        info!(
          "No item found for user {} and device {} in token table",
          user_id, device_id
        );
        Ok(None)
      }
      Err(e) => {
        error!(
          "DynamoDB client failed to get token for user {} on device {}: {}",
          user_id, device_id, e
        );
        Err(Error::RusotoGet(e))
      }
    }
  }
}

#[derive(
  Debug, derive_more::Display, derive_more::From, derive_more::Error,
)]
pub enum Error {
  #[display(...)]
  RusotoGet(RusotoError<GetItemError>),
  #[display(...)]
  RusotoPut(RusotoError<PutItemError>),
  #[display(...)]
  Pake(ProtocolError),
  #[display(...)]
  MissingAttribute,
}

type AttributeName = String;

fn construct_primary_key_from_strings(
  partition_key: (AttributeName, String),
  sort_key: Option<(AttributeName, String)>,
) -> HashMap<AttributeName, AttributeValue> {
  let mut primary_key = HashMap::from([(
    partition_key.0,
    AttributeValue {
      s: Some(partition_key.1),
      ..Default::default()
    },
  )]);

  match sort_key {
    None => primary_key,
    Some((name, value)) => {
      primary_key.insert(
        name,
        AttributeValue {
          s: Some(value),
          ..Default::default()
        },
      );
      primary_key
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_construct_primary_key_from_strings_simple() {
    let partition_key_name = "userID".to_string();
    let partition_key_value = "12345".to_string();
    let partition_key =
      (partition_key_name.clone(), partition_key_value.clone());
    let primary_key = construct_primary_key_from_strings(partition_key, None);
    assert_eq!(primary_key.len(), 1);
    let attribute = primary_key.get(&partition_key_name);
    assert!(attribute.is_some());
    assert_eq!(
      attribute,
      Some(AttributeValue {
        s: Some(partition_key_value),
        ..Default::default()
      })
      .as_ref()
    );
  }

  #[test]
  fn test_construct_primary_key_from_strings_composite() {
    let partition_key_name = "userID".to_string();
    let partition_key_value = "12345".to_string();
    let partition_key =
      (partition_key_name.clone(), partition_key_value.clone());
    let sort_key_name = "deviceID".to_string();
    let sort_key_value = "54321".to_string();
    let sort_key = (sort_key_name.clone(), sort_key_value.clone());
    let primary_key =
      construct_primary_key_from_strings(partition_key, Some(sort_key));
    assert_eq!(primary_key.len(), 2);
    let partition_key_attribute = primary_key.get(&partition_key_name);
    assert!(partition_key_attribute.is_some());
    assert_eq!(
      partition_key_attribute,
      Some(AttributeValue {
        s: Some(partition_key_value),
        ..Default::default()
      })
      .as_ref()
    );
    let sort_key_attribute = primary_key.get(&sort_key_name);
    assert!(sort_key_attribute.is_some());
    assert_eq!(
      sort_key_attribute,
      Some(AttributeValue {
        s: Some(sort_key_value),
        ..Default::default()
      })
      .as_ref()
    )
  }
}
