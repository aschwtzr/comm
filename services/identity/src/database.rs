use std::collections::HashMap;

use rusoto_core::Region;
use rusoto_dynamodb::{AttributeValue, DynamoDbClient};

pub struct DatabaseClient {
  client: DynamoDbClient,
}

impl DatabaseClient {
  pub fn new(region: Region) -> Self {
    DatabaseClient {
      client: DynamoDbClient::new(region),
    }
  }
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
