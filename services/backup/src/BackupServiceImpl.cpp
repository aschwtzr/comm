#include "BackupServiceImpl.h"

#include "CreateNewBackupReactor.h"
#include "DatabaseManager.h"
#include "PullBackupReactor.h"
#include "ReactorStatusHolder.h"
#include "RecoverBackupKeyReactor.h"
#include "SendLogReactor.h"

#include <aws/core/Aws.h>

namespace comm {
namespace network {

BackupServiceImpl::BackupServiceImpl() {
  Aws::InitAPI({});
}

BackupServiceImpl::~BackupServiceImpl() {
  Aws::ShutdownAPI({});
}

grpc::ServerBidiReactor<
    backup::CreateNewBackupRequest,
    backup::CreateNewBackupResponse> *
BackupServiceImpl::CreateNewBackup(grpc::CallbackServerContext *context) {
  return new reactor::CreateNewBackupReactor();
}

grpc::ServerReadReactor<backup::SendLogRequest> *BackupServiceImpl::SendLog(
    grpc::CallbackServerContext *context,
    backup::SendLogResponse *response) {
  return new reactor::SendLogReactor(response);
}

grpc::ServerBidiReactor<
    backup::RecoverBackupKeyRequest,
    backup::RecoverBackupKeyResponse> *
BackupServiceImpl::RecoverBackupKey(grpc::CallbackServerContext *context) {
  return new reactor::RecoverBackupKeyReactor();
}

grpc::ServerWriteReactor<backup::PullBackupResponse> *
BackupServiceImpl::PullBackup(
    grpc::CallbackServerContext *context,
    const backup::PullBackupRequest *request) {
  reactor::PullBackupReactor *reactor = new reactor::PullBackupReactor(request);
  reactor->start();
  return reactor;
}

grpc::ServerUnaryReactor *BackupServiceImpl::AddAttachments(
    grpc::CallbackServerContext *context,
    const backup::AddAttachmentsRequest *request,
    google::protobuf::Empty *response) {
  grpc::Status status = grpc::Status::OK;
  std::string userID = request->userid();
  std::string backupID = request->backupid();
  std::string logID = request->logid();
  const std::string holders = request->holders();
  try {
    if (userID.empty()) {
      throw std::runtime_error("user id required but not provided");
    }
    if (backupID.empty()) {
      throw std::runtime_error("backup id required but not provided");
    }
    if (holders.empty()) {
      throw std::runtime_error("holders required but not provided");
    }

    if (logID.empty()) {
      // add these attachments to backup
      std::shared_ptr<database::BackupItem> backupItem =
          database::DatabaseManager::getInstance().findBackupItem(
              userID, backupID);
      backupItem->addAttachmentHolders(holders);
      database::DatabaseManager::getInstance().putBackupItem(*backupItem);
    } else {
      // add these attachments to log
      std::shared_ptr<database::LogItem> logItem =
          database::DatabaseManager::getInstance().findLogItem(backupID, logID);
      logItem->addAttachmentHolders(holders);
      if (database::LogItem::getItemSize(logItem.get()) >
          LOG_DATA_SIZE_DATABASE_LIMIT) {
        std::string holder = tools::generateHolder(
            logItem->getDataHash(),
            logItem->getBackupID(),
            logItem->getLogID());
        std::string data = std::move(logItem->getValue());
        logItem = std::make_shared<database::LogItem>(
            logItem->getBackupID(),
            logItem->getLogID(),
            logItem->getPersistedInBlob(),
            holder,
            logItem->getAttachmentHolders(),
            logItem->getDataHash());
        // put into S3
        std::condition_variable blobPutDoneCV;
        std::mutex blobPutDoneCVMutex;
        std::shared_ptr<reactor::BlobPutClientReactor> putReactor =
            std::make_shared<reactor::BlobPutClientReactor>(
                holder, logItem->getDataHash(), &blobPutDoneCV);
        ServiceBlobClient().put(putReactor);
        std::unique_lock<std::mutex> lockPut(blobPutDoneCVMutex);
        putReactor->scheduleSendingDataChunk(
            std::make_unique<std::string>(std::move(data)));
        putReactor->scheduleSendingDataChunk(std::make_unique<std::string>(""));
        if (putReactor->getStatusHolder()->state !=
            reactor::ReactorState::DONE) {
          blobPutDoneCV.wait(lockPut);
        }
        if (!putReactor->getStatusHolder()->getStatus().ok()) {
          throw std::runtime_error(
              putReactor->getStatusHolder()->getStatus().error_message());
        }
      }
      database::DatabaseManager::getInstance().putLogItem(*logItem);
    }
  } catch (std::runtime_error &e) {
    std::cout << "error: " << e.what() << std::endl;
    status = grpc::Status(grpc::StatusCode::INTERNAL, e.what());
  }
  auto *reactor = context->DefaultReactor();
  reactor->Finish(status);
  return reactor;
}

} // namespace network
} // namespace comm
