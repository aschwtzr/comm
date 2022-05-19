#pragma once

#include "DatabaseEntitiesTools.h"
#include "ServerReadReactorBase.h"
#include "ServiceBlobClient.h"

#include "../_generated/backup.grpc.pb.h"
#include "../_generated/backup.pb.h"

#include <memory>
#include <string>

namespace comm {
namespace network {
namespace reactor {

class AddAttachmentReactor : public ServerReadReactorBase<
                                 backup::AddAttachmentRequest,
                                 google::protobuf::Empty> {
  enum class State {
    USER_ID = 1,
    BACKUP_ID = 2,
    LOG_ID = 3,
    DATA_HASH = 4,
    DATA_CHUNK = 5,
  };

  enum class ParentType {
    UNKNOWN = 0,
    BACKUP = 1,
    LOG = 2,
  };

  State state = State::USER_ID;
  ParentType parentType = ParentType::UNKNOWN;
  std::string userID;
  std::shared_ptr<database::BackupItem> backupItem;
  std::shared_ptr<database::LogItem> logItem;
  std::string logID;
  std::string holder;
  std::string hash;
  std::mutex reactorStateMutex;

  std::condition_variable blobPutDoneCV;
  std::mutex blobPutDoneCVMutex;

  std::shared_ptr<reactor::BlobPutClientReactor> putReactor;
  ServiceBlobClient blobClient;

  void initializePutReactor();
  void storeInDatabase();

public:
  using ServerReadReactorBase<
      backup::AddAttachmentRequest,
      google::protobuf::Empty>::ServerReadReactorBase;

  std::unique_ptr<grpc::Status>
  readRequest(backup::AddAttachmentRequest request) override;
  void terminateCallback() override;
};

} // namespace reactor
} // namespace network
} // namespace comm
