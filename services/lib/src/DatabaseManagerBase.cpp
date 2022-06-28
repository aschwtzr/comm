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
    const size_t &chunkSize,
    std::vector<Aws::DynamoDB::Model::WriteRequest> &writeRequests) {
  // Split write requests to chunks by chunkSize size and write
  // them by batch
  Aws::DynamoDB::Model::BatchWriteItemOutcome outcome;
  std::vector<Aws::DynamoDB::Model::WriteRequest> writeRequestsChunk;
  std::vector<Aws::DynamoDB::Model::WriteRequest>::iterator chunkPositionStart,
      chunkPositionEnd;
  for (size_t i = 0; i < writeRequests.size(); i += chunkSize) {
    chunkPositionStart = writeRequests.begin() + i;
    chunkPositionEnd =
        writeRequests.begin() + std::min(writeRequests.size(), i + chunkSize);
    writeRequestsChunk = std::vector<Aws::DynamoDB::Model::WriteRequest>(
        chunkPositionStart, chunkPositionEnd);

    Aws::DynamoDB::Model::BatchWriteItemRequest writeBatchRequest;
    writeBatchRequest.AddRequestItems(tableName, writeRequestsChunk);
    outcome = getDynamoDBClient()->BatchWriteItem(writeBatchRequest);
    if (!outcome.IsSuccess()) {
      throw std::runtime_error(outcome.GetError().GetMessage());
    }

    while (!outcome.GetResult().GetUnprocessedItems().empty()) {
      writeBatchRequest.SetRequestItems(
          outcome.GetResult().GetUnprocessedItems());
      outcome = getDynamoDBClient()->BatchWriteItem(writeBatchRequest);
      if (!outcome.IsSuccess()) {
        throw std::runtime_error(outcome.GetError().GetMessage());
      }
    }
  }
}

} // namespace database
} // namespace network
} // namespace comm
