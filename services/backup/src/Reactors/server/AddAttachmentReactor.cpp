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
    };
    case State::BACKUP_ID: {
    };
    case State::LOG_ID: {
    };
    case State::DATA_HASH: {
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
