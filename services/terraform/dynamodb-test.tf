resource "aws_dynamodb_table" "backup-service-backup-test" {
  name           = "backup-service-backup-test"
  hash_key       = "userID"
  range_key      = "backupID"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "userID"
    type = "S"
  }

  attribute {
    name = "backupID"
    type = "S"
  }

  attribute {
    name = "created"
    type = "S"
  }

  global_secondary_index {
    name               = "userID-created-index"
    hash_key           = "userID"
    range_key          = "created"
    write_capacity     = 10
    read_capacity      = 10
    projection_type    = "INCLUDE"
    non_key_attributes = ["recoveryData"]
  }
}

resource "aws_dynamodb_table" "backup-service-log-test" {
  name           = "backup-service-log-test"
  hash_key       = "backupID"
  range_key      = "logID"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "backupID"
    type = "S"
  }

  attribute {
    name = "logID"
    type = "S"
  }
}

resource "aws_dynamodb_table" "blob-service-blob-test" {
  name           = "blob-service-blob-test"
  hash_key       = "blobHash"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "blobHash"
    type = "S"
  }
}

resource "aws_dynamodb_table" "blob-service-reverse-index-test" {
  name           = "blob-service-reverse-index-test"
  hash_key       = "holder"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "holder"
    type = "S"
  }

  attribute {
    name = "blobHash"
    type = "S"
  }

  global_secondary_index {
    name               = "blobHash-index"
    hash_key           = "blobHash"
    write_capacity     = 10
    read_capacity      = 10
    projection_type    = "ALL"
  }
}

resource "aws_dynamodb_table" "tunnelbroker-device-session-test" {
  name           = "tunnelbroker-device-session-test"
  hash_key       = "SessionId"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "SessionId"
    type = "S"
  }

  attribute {
    name = "Expire"
    type = "N"
  }

  ttl {
    attribute_name = "Expire"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "tunnelbroker-verification-message-test" {
  name           = "tunnelbroker-verification-message-test"
  hash_key       = "DeviceId"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "DeviceId"
    type = "S"
  }

  attribute {
    name = "Expire"
    type = "N"
  }

  ttl {
    attribute_name = "Expire"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "tunnelbroker-public-key-test" {
  name           = "tunnelbroker-public-key-test"
  hash_key       = "DeviceId"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "DeviceId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "tunnelbroker-message-test" {
  name           = "tunnelbroker-message-test"
  hash_key       = "MessageID"
  write_capacity = 10
  read_capacity  = 10

  attribute {
    name = "MessageID"
    type = "S"
  }

  attribute {
    name = "ToDeviceID"
    type = "S"
  }

  attribute {
    name = "Expire"
    type = "N"
  }

  global_secondary_index {
    name               = "ToDeviceID-index"
    hash_key           = "ToDeviceID"
    write_capacity     = 10
    read_capacity      = 10
    projection_type    = "ALL"
  }

  ttl {
    attribute_name = "Expire"
    enabled        = true
  }
}
