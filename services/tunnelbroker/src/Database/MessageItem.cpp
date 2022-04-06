#include "MessageItem.h"
#include "ConfigManager.h"
#include "Tools.h"

#include <vector>

namespace comm {
namespace network {
namespace database {

const std::string MessageItem::FIELD_MESSAGE_ID = "MessageID";
const std::string MessageItem::FIELD_FROM_DEVICE_ID = "FromDeviceID";
const std::string MessageItem::FIELD_TO_DEVICE_ID = "ToDeviceID";
const std::string MessageItem::FIELD_PAYLOAD = "Payload";
const std::string MessageItem::FIELD_BLOB_HASHES = "BlobHashes";
const std::string MessageItem::FIELD_EXPIRE = "Expire";

MessageItem::MessageItem(
    const std::string messageID,
    const std::string fromDeviceID,
    const std::string toDeviceID,
    const std::string payload,
    const std::string blobHashes,
    const uint64_t expire)
    : messageID(messageID),
      fromDeviceID(fromDeviceID),
      toDeviceID(toDeviceID),
      payload(payload),
      blobHashes(blobHashes),
      expire(expire) {
  this->validate();
}

MessageItem::MessageItem(const AttributeValues &itemFromDB) {
  this->assignItemFromDatabase(itemFromDB);
}

void MessageItem::validate() const {
  tools::checkIfNotEmpty("messageID", this->messageID);
  tools::checkIfNotZero("expire", this->expire);
}

void MessageItem::assignItemFromDatabase(const AttributeValues &itemFromDB) {
  try {
    this->messageID = itemFromDB.at(MessageItem::FIELD_MESSAGE_ID).GetS();
    this->fromDeviceID =
        itemFromDB.at(MessageItem::FIELD_FROM_DEVICE_ID).GetS();
    this->toDeviceID = itemFromDB.at(MessageItem::FIELD_TO_DEVICE_ID).GetS();
    this->payload = itemFromDB.at(MessageItem::FIELD_PAYLOAD).GetS();
    this->blobHashes = itemFromDB.at(MessageItem::FIELD_BLOB_HASHES).GetS();
    this->expire = std::stoull(itemFromDB.at(MessageItem::FIELD_EXPIRE).GetN());
  } catch (const std::exception &e) {
    throw std::runtime_error(
        "Got an exception at MessageItem: " + std::string(e.what()));
  }
  this->validate();
}

std::string MessageItem::getTableName() const {
  return config::ConfigManager::getInstance().getParameter(
      config::ConfigManager::OPTION_DYNAMODB_MESSAGES_TABLE);
}

std::string MessageItem::getPrimaryKey() const {
  return MessageItem::FIELD_MESSAGE_ID;
}

std::string MessageItem::getMessageID() const {
  return this->messageID;
}

std::string MessageItem::getFromDeviceID() const {
  return this->fromDeviceID;
}

std::string MessageItem::getToDeviceID() const {
  return this->toDeviceID;
}

std::string MessageItem::getPayload() const {
  return this->payload;
}

std::string MessageItem::getBlobHashes() const {
  return this->blobHashes;
}

uint64_t MessageItem::getExpire() const {
  return this->expire;
}

} // namespace database
} // namespace network
} // namespace comm
