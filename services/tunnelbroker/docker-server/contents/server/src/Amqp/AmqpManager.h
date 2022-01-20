#pragma once

#include <amqpcpp.h>
#include <amqpcpp/libboostasio.h>

#include <atomic>
#include <string>

namespace comm {
namespace network {

static std::unique_ptr<AMQP::TcpChannel> AmqpChannel;
static std::atomic<bool> AmqpReady;

void AMQPConnectWrapper();
void AMQPConnect();
bool AMQPSend(
    std::string toDeviceID,
    std::string fromDeviceID,
    std::string payload);

} // namespace network
} // namespace comm
