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
use crate::token::{AuthType, Token};

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
  ) -> Result<Option<Token>, Error> {
    let primary_key = HashMap::from([
      (
        "userID".to_string(),
        AttributeValue {
          s: Some(user_id.clone()),
          ..Default::default()
        },
      ),
      (
        "deviceID".to_string(),
        AttributeValue {
          s: Some(device_id.clone()),
          ..Default::default()
        },
      ),
    ]);
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
        if let Some(AttributeValue { s: Some(token), .. }) = item.get("token") {
          let created = if let Some(AttributeValue {
            s: Some(datetime), ..
          }) = item.get("created")
          {
            match datetime.parse() {
              Ok(r) => Some(r),
              Err(e) => {
                error!("Could not parse DateTime from 'created' attribute {} for user {}'s token for device {}: {}", datetime, user_id, device_id, e);
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
            s: Some(auth_variant),
            ..
          }) = item.get("authType")
          {
            match auth_variant.as_str() {
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
          let valid = if let Some(AttributeValue { bool: Some(b), .. }) =
            item.get("valid")
          {
            Some(*b)
          } else {
            error!(
              "'valid' attribute missing for user {}'s token for device {}",
              user_id, device_id
            );
            None
          };
          Ok(Some(Token {
            token: token.to_string(),
            created: created,
            auth_type: auth_type,
            valid: valid,
          }))
        } else {
          error!(
            "No token found corresponding to user {} and device {}",
            user_id, device_id
          );
          Err(Error::MissingAttribute)
        }
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
