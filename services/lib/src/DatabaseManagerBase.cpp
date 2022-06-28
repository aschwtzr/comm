#include "DatabaseManagerBase.h"

#include "Item.h"

#include <aws/core/utils/Outcome.h>
#include <aws/dynamodb/model/BatchWriteItemRequest.h>
#include <aws/dynamodb/model/BatchWriteItemResult.h>
#include <aws/dynamodb/model/DeleteItemRequest.h>

#include <iostream>

namespace comm {
namespace network {
namespace database {

void DatabaseManagerBase::innerPutItem(
    std::shared_ptr<Item> item,
    const Aws::DynamoDB::Model::PutItemRequest &request) {
  const Aws::DynamoDB::Model::PutItemOutcome outcome =
      getDynamoDBClient()->PutItem(request);
  if (!outcome.IsSuccess()) {
    throw std::runtime_error(outcome.GetError().GetMessage());
  }
}

void DatabaseManagerBase::innerRemoveItem(const Item &item) {
  Aws::DynamoDB::Model::DeleteItemRequest request;
  request.SetTableName(item.getTableName());
  PrimaryKeyDescriptor pk = item.getPrimaryKeyDescriptor();
  PrimaryKeyValue primaryKeyValue = item.getPrimaryKeyValue();
  request.AddKey(
      pk.partitionKey,
      Aws::DynamoDB::Model::AttributeValue(primaryKeyValue.partitionKey));
  if (pk.sortKey != nullptr && primaryKeyValue.sortKey != nullptr) {
    request.AddKey(
        *pk.sortKey,
        Aws::DynamoDB::Model::AttributeValue(*primaryKeyValue.sortKey));
  }

  const Aws::DynamoDB::Model::DeleteItemOutcome &outcome =
      getDynamoDBClient()->DeleteItem(request);
  if (!outcome.IsSuccess()) {
    throw std::runtime_error(outcome.GetError().GetMessage());
  }
}

void DatabaseManagerBase::innerBatchWriteItem(
    const std::string &tableName,
    std::vector<Aws::DynamoDB::Model::WriteRequest> &writeRequests) {
  Aws::DynamoDB::Model::BatchWriteItemOutcome outcome;
  // We don't need to split write requests if the size is smaller or equal
  // to MAX_DYNAMODB_BATCH_ITEMS
  if (writeRequests.size() <= MAX_DYNAMODB_BATCH_ITEMS) {
    Aws::DynamoDB::Model::BatchWriteItemRequest writeRequest;
    writeRequest.AddRequestItems(tableName, writeRequests);
    outcome = getDynamoDBClient()->BatchWriteItem(writeRequest);
    if (!outcome.IsSuccess()) {
      throw std::runtime_error(outcome.GetError().GetMessage());
    }
    return;
  }
  // Split write requests to chunks by MAX_DYNAMODB_BATCH_ITEMS size and write
  // them by batch
  std::vector<Aws::DynamoDB::Model::WriteRequest> writeRequestsChunk;
  std::vector<Aws::DynamoDB::Model::WriteRequest>::iterator chunkPositionStart,
      chunkPositionEnd;
  for (int i = 0; i < writeRequests.size(); i += MAX_DYNAMODB_BATCH_ITEMS) {
    chunkPositionStart = writeRequests.begin() + i;
    if ((i + MAX_DYNAMODB_BATCH_ITEMS) > writeRequests.size()) {
      chunkPositionEnd = writeRequests.end();
    } else {
      chunkPositionEnd = writeRequests.end() -
          (writeRequests.size() - i - MAX_DYNAMODB_BATCH_ITEMS);
    }
    writeRequestsChunk = std::vector<Aws::DynamoDB::Model::WriteRequest>(
        chunkPositionStart, chunkPositionEnd);

    Aws::DynamoDB::Model::BatchWriteItemRequest writeBatchRequest;
    writeBatchRequest.AddRequestItems(tableName, writeRequestsChunk);
    outcome = getDynamoDBClient()->BatchWriteItem(writeBatchRequest);
    if (!outcome.IsSuccess()) {
      throw std::runtime_error(outcome.GetError().GetMessage());
    }
  }
}

} // namespace database
} // namespace network
} // namespace comm
