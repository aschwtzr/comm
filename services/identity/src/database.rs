use rusoto_core::Region;
use rusoto_dynamodb::DynamoDbClient;

pub struct DatabaseClient {
  client: DynamoDbClient,
}

impl DatabaseClient {
  fn new(region: Region) -> Self {
    DatabaseClient {
      client: DynamoDbClient::new(region),
    }
  }
}

impl Default for DatabaseClient {
  fn default() -> Self {
    DatabaseClient::new(Region::UsEast2)
  }
}
