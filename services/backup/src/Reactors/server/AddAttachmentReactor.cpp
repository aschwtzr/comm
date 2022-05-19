#include "AddAttachmentReactor.h"

#include "Constants.h"
#include "DatabaseManager.h"
#include "GlobalTools.h"
#include "Tools.h"

#include <iostream>

namespace comm {
namespace network {
namespace reactor {

void AddAttachmentReactor::initializePutReactor() {
  if (this->holder.empty()) {
    throw std::runtime_error(
        "put reactor cannot be initialized with empty value");
  }
  if (this->hash.empty()) {
    throw std::runtime_error(
        "put reactor cannot be initialized with empty hash");
  }
  if (this->putReactor == nullptr) {
    this->putReactor = std::make_shared<reactor::BlobPutClientReactor>(
        this->holder, this->hash, &this->blobPutDoneCV);
    this->blobClient.put(this->putReactor);
  }
}

void AddAttachmentReactor::storeInDatabase() {
}

std::unique_ptr<grpc::Status>
AddAttachmentReactor::readRequest(backup::AddAttachmentRequest request) {
  // we make sure that the blob client's state is flushed to the main memory
  // as there may be multiple threads from the pool taking over here
  const std::lock_guard<std::mutex> lock(this->reactorStateMutex);
  switch (this->state) {
    case State::USER_ID: {
      if (!request.has_userid()) {
        throw std::runtime_error("user id expected but not received");
      }
      this->userID = request.userid();
      this->state = State::BACKUP_ID;
      return nullptr;
    };
    case State::BACKUP_ID: {
      if (!request.has_backupid()) {
        throw std::runtime_error("backup id expected but not received");
      }
      this->backupItem =
          database::DatabaseManager::getInstance().findBackupItem(
              this->userID, request.backupid());
      if (this->backupItem == nullptr) {
        throw std::runtime_error(
            "trying to add an attachment for a non-existent backup");
      }
      this->state = State::LOG_ID;
      return nullptr;
    };
    case State::LOG_ID: {
      if (!request.has_logid()) {
        this->state = State::DATA_HASH;
        this->parentType = ParentType::BACKUP;
        return nullptr;
      }
      this->parentType = ParentType::LOG;
      this->logItem = database::DatabaseManager::getInstance().findLogItem(
          this->backupItem->getBackupID(), request.logid());
      if (logItem == nullptr) {
        throw std::runtime_error(
            "trying to add an attachment for a non-existent log");
      }
      this->state = State::DATA_HASH;
      return nullptr;
    };
    case State::DATA_HASH: {
      if (!request.has_datahash()) {
        throw std::runtime_error("data hash expected but not received");
      }
      this->hash = request.datahash();
      this->state = State::DATA_CHUNK;
      return nullptr;
    };
    case State::DATA_CHUNK: {
    };
  }
  throw std::runtime_error("send attachment - invalid state");
}

void AddAttachmentReactor::terminateCallback() {
}

} // namespace reactor
} // namespace network
} // namespace comm
