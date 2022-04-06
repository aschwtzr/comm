// @generated by the gRPC C++ plugin.
// If you make any local change, they will be lost.
// source: backup.proto

#include "backup.pb.h"
#include "backup.grpc.pb.h"

#include <functional>
#include <grpcpp/impl/codegen/async_stream.h>
#include <grpcpp/impl/codegen/async_unary_call.h>
#include <grpcpp/impl/codegen/channel_interface.h>
#include <grpcpp/impl/codegen/client_unary_call.h>
#include <grpcpp/impl/codegen/client_callback.h>
#include <grpcpp/impl/codegen/message_allocator.h>
#include <grpcpp/impl/codegen/method_handler.h>
#include <grpcpp/impl/codegen/rpc_service_method.h>
#include <grpcpp/impl/codegen/server_callback.h>
#include <grpcpp/impl/codegen/server_callback_handlers.h>
#include <grpcpp/impl/codegen/server_context.h>
#include <grpcpp/impl/codegen/service_type.h>
#include <grpcpp/impl/codegen/sync_stream.h>
namespace backup {

static const char* BackupService_method_names[] = {
  "/backup.BackupService/CreateNewBackup",
  "/backup.BackupService/SendLog",
  "/backup.BackupService/RecoverBackupKey",
  "/backup.BackupService/PullBackup",
};

std::unique_ptr< BackupService::Stub> BackupService::NewStub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options) {
  (void)options;
  std::unique_ptr< BackupService::Stub> stub(new BackupService::Stub(channel, options));
  return stub;
}

BackupService::Stub::Stub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options)
  : channel_(channel), rpcmethod_CreateNewBackup_(BackupService_method_names[0], options.suffix_for_stats(),::grpc::internal::RpcMethod::BIDI_STREAMING, channel)
  , rpcmethod_SendLog_(BackupService_method_names[1], options.suffix_for_stats(),::grpc::internal::RpcMethod::CLIENT_STREAMING, channel)
  , rpcmethod_RecoverBackupKey_(BackupService_method_names[2], options.suffix_for_stats(),::grpc::internal::RpcMethod::BIDI_STREAMING, channel)
  , rpcmethod_PullBackup_(BackupService_method_names[3], options.suffix_for_stats(),::grpc::internal::RpcMethod::SERVER_STREAMING, channel)
  {}

::grpc::ClientReaderWriter< ::backup::CreateNewBackupRequest, ::backup::CreateNewBackupResponse>* BackupService::Stub::CreateNewBackupRaw(::grpc::ClientContext* context) {
  return ::grpc::internal::ClientReaderWriterFactory< ::backup::CreateNewBackupRequest, ::backup::CreateNewBackupResponse>::Create(channel_.get(), rpcmethod_CreateNewBackup_, context);
}

void BackupService::Stub::async::CreateNewBackup(::grpc::ClientContext* context, ::grpc::ClientBidiReactor< ::backup::CreateNewBackupRequest,::backup::CreateNewBackupResponse>* reactor) {
  ::grpc::internal::ClientCallbackReaderWriterFactory< ::backup::CreateNewBackupRequest,::backup::CreateNewBackupResponse>::Create(stub_->channel_.get(), stub_->rpcmethod_CreateNewBackup_, context, reactor);
}

::grpc::ClientAsyncReaderWriter< ::backup::CreateNewBackupRequest, ::backup::CreateNewBackupResponse>* BackupService::Stub::AsyncCreateNewBackupRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq, void* tag) {
  return ::grpc::internal::ClientAsyncReaderWriterFactory< ::backup::CreateNewBackupRequest, ::backup::CreateNewBackupResponse>::Create(channel_.get(), cq, rpcmethod_CreateNewBackup_, context, true, tag);
}

::grpc::ClientAsyncReaderWriter< ::backup::CreateNewBackupRequest, ::backup::CreateNewBackupResponse>* BackupService::Stub::PrepareAsyncCreateNewBackupRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncReaderWriterFactory< ::backup::CreateNewBackupRequest, ::backup::CreateNewBackupResponse>::Create(channel_.get(), cq, rpcmethod_CreateNewBackup_, context, false, nullptr);
}

::grpc::ClientWriter< ::backup::SendLogRequest>* BackupService::Stub::SendLogRaw(::grpc::ClientContext* context, ::google::protobuf::Empty* response) {
  return ::grpc::internal::ClientWriterFactory< ::backup::SendLogRequest>::Create(channel_.get(), rpcmethod_SendLog_, context, response);
}

void BackupService::Stub::async::SendLog(::grpc::ClientContext* context, ::google::protobuf::Empty* response, ::grpc::ClientWriteReactor< ::backup::SendLogRequest>* reactor) {
  ::grpc::internal::ClientCallbackWriterFactory< ::backup::SendLogRequest>::Create(stub_->channel_.get(), stub_->rpcmethod_SendLog_, context, response, reactor);
}

::grpc::ClientAsyncWriter< ::backup::SendLogRequest>* BackupService::Stub::AsyncSendLogRaw(::grpc::ClientContext* context, ::google::protobuf::Empty* response, ::grpc::CompletionQueue* cq, void* tag) {
  return ::grpc::internal::ClientAsyncWriterFactory< ::backup::SendLogRequest>::Create(channel_.get(), cq, rpcmethod_SendLog_, context, response, true, tag);
}

::grpc::ClientAsyncWriter< ::backup::SendLogRequest>* BackupService::Stub::PrepareAsyncSendLogRaw(::grpc::ClientContext* context, ::google::protobuf::Empty* response, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncWriterFactory< ::backup::SendLogRequest>::Create(channel_.get(), cq, rpcmethod_SendLog_, context, response, false, nullptr);
}

::grpc::ClientReaderWriter< ::backup::RecoverBackupKeyRequest, ::backup::RecoverBackupKeyResponse>* BackupService::Stub::RecoverBackupKeyRaw(::grpc::ClientContext* context) {
  return ::grpc::internal::ClientReaderWriterFactory< ::backup::RecoverBackupKeyRequest, ::backup::RecoverBackupKeyResponse>::Create(channel_.get(), rpcmethod_RecoverBackupKey_, context);
}

void BackupService::Stub::async::RecoverBackupKey(::grpc::ClientContext* context, ::grpc::ClientBidiReactor< ::backup::RecoverBackupKeyRequest,::backup::RecoverBackupKeyResponse>* reactor) {
  ::grpc::internal::ClientCallbackReaderWriterFactory< ::backup::RecoverBackupKeyRequest,::backup::RecoverBackupKeyResponse>::Create(stub_->channel_.get(), stub_->rpcmethod_RecoverBackupKey_, context, reactor);
}

::grpc::ClientAsyncReaderWriter< ::backup::RecoverBackupKeyRequest, ::backup::RecoverBackupKeyResponse>* BackupService::Stub::AsyncRecoverBackupKeyRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq, void* tag) {
  return ::grpc::internal::ClientAsyncReaderWriterFactory< ::backup::RecoverBackupKeyRequest, ::backup::RecoverBackupKeyResponse>::Create(channel_.get(), cq, rpcmethod_RecoverBackupKey_, context, true, tag);
}

::grpc::ClientAsyncReaderWriter< ::backup::RecoverBackupKeyRequest, ::backup::RecoverBackupKeyResponse>* BackupService::Stub::PrepareAsyncRecoverBackupKeyRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncReaderWriterFactory< ::backup::RecoverBackupKeyRequest, ::backup::RecoverBackupKeyResponse>::Create(channel_.get(), cq, rpcmethod_RecoverBackupKey_, context, false, nullptr);
}

::grpc::ClientReader< ::backup::PullBackupResponse>* BackupService::Stub::PullBackupRaw(::grpc::ClientContext* context, const ::backup::PullBackupRequest& request) {
  return ::grpc::internal::ClientReaderFactory< ::backup::PullBackupResponse>::Create(channel_.get(), rpcmethod_PullBackup_, context, request);
}

void BackupService::Stub::async::PullBackup(::grpc::ClientContext* context, const ::backup::PullBackupRequest* request, ::grpc::ClientReadReactor< ::backup::PullBackupResponse>* reactor) {
  ::grpc::internal::ClientCallbackReaderFactory< ::backup::PullBackupResponse>::Create(stub_->channel_.get(), stub_->rpcmethod_PullBackup_, context, request, reactor);
}

::grpc::ClientAsyncReader< ::backup::PullBackupResponse>* BackupService::Stub::AsyncPullBackupRaw(::grpc::ClientContext* context, const ::backup::PullBackupRequest& request, ::grpc::CompletionQueue* cq, void* tag) {
  return ::grpc::internal::ClientAsyncReaderFactory< ::backup::PullBackupResponse>::Create(channel_.get(), cq, rpcmethod_PullBackup_, context, request, true, tag);
}

::grpc::ClientAsyncReader< ::backup::PullBackupResponse>* BackupService::Stub::PrepareAsyncPullBackupRaw(::grpc::ClientContext* context, const ::backup::PullBackupRequest& request, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncReaderFactory< ::backup::PullBackupResponse>::Create(channel_.get(), cq, rpcmethod_PullBackup_, context, request, false, nullptr);
}

BackupService::Service::Service() {
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      BackupService_method_names[0],
      ::grpc::internal::RpcMethod::BIDI_STREAMING,
      new ::grpc::internal::BidiStreamingHandler< BackupService::Service, ::backup::CreateNewBackupRequest, ::backup::CreateNewBackupResponse>(
          [](BackupService::Service* service,
             ::grpc::ServerContext* ctx,
             ::grpc::ServerReaderWriter<::backup::CreateNewBackupResponse,
             ::backup::CreateNewBackupRequest>* stream) {
               return service->CreateNewBackup(ctx, stream);
             }, this)));
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      BackupService_method_names[1],
      ::grpc::internal::RpcMethod::CLIENT_STREAMING,
      new ::grpc::internal::ClientStreamingHandler< BackupService::Service, ::backup::SendLogRequest, ::google::protobuf::Empty>(
          [](BackupService::Service* service,
             ::grpc::ServerContext* ctx,
             ::grpc::ServerReader<::backup::SendLogRequest>* reader,
             ::google::protobuf::Empty* resp) {
               return service->SendLog(ctx, reader, resp);
             }, this)));
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      BackupService_method_names[2],
      ::grpc::internal::RpcMethod::BIDI_STREAMING,
      new ::grpc::internal::BidiStreamingHandler< BackupService::Service, ::backup::RecoverBackupKeyRequest, ::backup::RecoverBackupKeyResponse>(
          [](BackupService::Service* service,
             ::grpc::ServerContext* ctx,
             ::grpc::ServerReaderWriter<::backup::RecoverBackupKeyResponse,
             ::backup::RecoverBackupKeyRequest>* stream) {
               return service->RecoverBackupKey(ctx, stream);
             }, this)));
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      BackupService_method_names[3],
      ::grpc::internal::RpcMethod::SERVER_STREAMING,
      new ::grpc::internal::ServerStreamingHandler< BackupService::Service, ::backup::PullBackupRequest, ::backup::PullBackupResponse>(
          [](BackupService::Service* service,
             ::grpc::ServerContext* ctx,
             const ::backup::PullBackupRequest* req,
             ::grpc::ServerWriter<::backup::PullBackupResponse>* writer) {
               return service->PullBackup(ctx, req, writer);
             }, this)));
}

BackupService::Service::~Service() {
}

::grpc::Status BackupService::Service::CreateNewBackup(::grpc::ServerContext* context, ::grpc::ServerReaderWriter< ::backup::CreateNewBackupResponse, ::backup::CreateNewBackupRequest>* stream) {
  (void) context;
  (void) stream;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}

::grpc::Status BackupService::Service::SendLog(::grpc::ServerContext* context, ::grpc::ServerReader< ::backup::SendLogRequest>* reader, ::google::protobuf::Empty* response) {
  (void) context;
  (void) reader;
  (void) response;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}

::grpc::Status BackupService::Service::RecoverBackupKey(::grpc::ServerContext* context, ::grpc::ServerReaderWriter< ::backup::RecoverBackupKeyResponse, ::backup::RecoverBackupKeyRequest>* stream) {
  (void) context;
  (void) stream;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}

::grpc::Status BackupService::Service::PullBackup(::grpc::ServerContext* context, const ::backup::PullBackupRequest* request, ::grpc::ServerWriter< ::backup::PullBackupResponse>* writer) {
  (void) context;
  (void) request;
  (void) writer;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}


}  // namespace backup

