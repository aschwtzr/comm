#pragma once

#include "ReactorStatusHolder.h"

#include <grpcpp/grpcpp.h>

#include <memory>

namespace comm {
namespace network {
namespace reactor {

class BaseReactor {
public:
  // returns a status holder that consists of:
  // - reactor's state
  // - status of the operation that's being performed by this reactor
  virtual std::shared_ptr<ReactorStatusHolder> getStatusHolder() = 0;
  // should be called when we plan to terminate the connection for some reason
  // either with a success or a failure status
  // receives a status indicating a result of the reactor's operation
  virtual void terminate(const grpc::Status &status) = 0;
  // validates current values of the reactor's fields
  virtual void validate() = 0;
  // should be called when `OnDone` is called. gRPC calls `OnDone` when there 
  // are not going to be more rpc operations
  virtual void doneCallback() = 0;
  // shoudl be called when `terminate` is called
  virtual void terminateCallback() = 0;
};

} // namespace reactor
} // namespace network
} // namespace comm
