#include "AmqpManager.h"
#include "Constants.h"
#include "DeliveryBroker.h"

#include <amqpcpp/libuv.h>
#include <uv.h>

namespace comm {
namespace network {

static std::unique_ptr<AMQP::TcpChannel> amqpChannel;
static std::atomic<bool> amqpReady;
static TunnelbrokerConfig config;

void AMQPConnect() {
  config.loadConfig();
  std::cout << "AMQP: Connecting to " << config.amqpURI << std::endl;

  auto *loop = uv_default_loop();
  AMQP::LibUvHandler handler(loop);

  AMQP::TcpConnection connection(&handler, AMQP::Address(config.amqpURI));
  amqpChannel = std::make_unique<AMQP::TcpChannel>(&connection);
  amqpChannel->onError([&connection](const char *message) {
    std::cout << "AMQP: channel error: " << message << ", will try to reconnect"
              << std::endl;
    amqpReady = false;
  });

  AMQP::Table arguments;
  arguments["x-message-ttl"] = AMQP_MESSAGE_TTL;
  arguments["x-expires"] = AMQP_QUEUE_TTL;
  amqpChannel->declareExchange(AMQP_FANOUT_EXCHANGE_NAME, AMQP::fanout);
  amqpChannel->declareQueue(config.tunnelbrokerID, AMQP::durable, arguments)
      .onSuccess([&connection](
                     const std::string &name,
                     uint32_t messagecount,
                     uint32_t consumercount) {
        std::cout << "AMQP: Queue " << name << " created" << std::endl;
        amqpChannel
            ->bindQueue(AMQP_FANOUT_EXCHANGE_NAME, config.tunnelbrokerID, "")
            .onError([](const char *message) {
              std::cout << "AMQP: Failed to bind queue:  "
                        << config.tunnelbrokerID
                        << " to exchange: " << AMQP_FANOUT_EXCHANGE_NAME
                        << std::endl;
              amqpReady = false;
            });
        amqpReady = true;
        amqpChannel->consume(config.tunnelbrokerID)
            .onReceived([&](const AMQP::Message &message,
                            uint64_t deliveryTag,
                            bool redelivered) {
              try {
                AMQP::Table headers = message.headers();
                const std::string payload(message.body());
                const std::string toDeviceID(headers[AMQP_HEADER_TO_DEVICEID]);
                const std::string fromDeviceID(
                    headers[AMQP_HEADER_FROM_DEVICEID]);
                std::cout << "AMQP: Message consumed for deviceId: "
                          << toDeviceID << std::endl;
                DeliveryBroker::getInstance().push(
                    deliveryTag, toDeviceID, fromDeviceID, payload);
              } catch (const std::exception &e) {
                std::cout << "AMQP: Message parsing exception: " << e.what()
                          << std::endl;
              }
            })
            .onError([](const char *message) {
              std::cout << "AMQP: Error on message consume:  " << message
                        << std::endl;
            });
      })
      .onError([&](const char *message) {
        throw std::runtime_error(
            "AMQP: Queue creation error: " + std::string(message));
      });
  uv_run(loop, UV_RUN_DEFAULT);
};

bool AMQPSend(
    std::string toDeviceID,
    std::string fromDeviceID,
    std::string payload) {
  if (!amqpReady) {
    std::cout << "AMQP: Message send error: channel not ready" << std::endl;
    return false;
  }
  try {
    AMQP::Envelope env(payload.c_str(), payload.size());
    AMQP::Table headers;
    headers[AMQP_HEADER_FROM_DEVICEID] = fromDeviceID;
    headers[AMQP_HEADER_TO_DEVICEID] = toDeviceID;
    // Set delivery mode to: Durable (2)
    env.setDeliveryMode(2);
    env.setHeaders(std::move(headers));
    amqpChannel->publish(AMQP_FANOUT_EXCHANGE_NAME, "", env);
  } catch (std::runtime_error &e) {
    std::cout << "AMQP: Error while publishing message:  " << e.what()
              << std::endl;
    return false;
  }
  return true;
};

void AMQPAck(uint64_t deliveryTag) {
  if (!amqpReady) {
    std::cout << "AMQP: Message ACK error: channel not ready" << std::endl;
    return;
  }
  amqpChannel->ack(deliveryTag);
}

} // namespace network
} // namespace comm
