#include "MessageOperationsUtilities.h"
#include "MessageSpecs.h"

#include <folly/String.h>
#include <folly/json.h>
#include <stdexcept>

namespace comm {
std::pair<Message, std::vector<Media>>
MessageOperationsUtilities::translateRawMessageInfoToClientDBMessageInfo(
    const folly::dynamic &rawMessageInfo) {
  std::string id = rawMessageInfo.count("id")
      ? rawMessageInfo["id"].asString()
      : rawMessageInfo["localID"].asString();
  std::string thread = rawMessageInfo["threadID"].asString();
  std::string user = rawMessageInfo["creatorID"].asString();
  std::unique_ptr<std::string> localID = rawMessageInfo.count("localID")
      ? std::make_unique<std::string>(rawMessageInfo["localID"].asString())
      : nullptr;
  int type = rawMessageInfo["type"].asInt();
  MessageType messageType = static_cast<MessageType>(type);
  int64_t time = rawMessageInfo["time"].asInt();
  std::unique_ptr<int> futureType = (messageType == MessageType::UNSUPPORTED)
      ? std::make_unique<int>(
            rawMessageInfo["unsupportedMessageInfo"]["type"].asInt())
      : nullptr;
  std::unique_ptr<std::string> content =
      messageSpecsHolder.find(messageType) != messageSpecsHolder.end()
      ? messageSpecsHolder.at(messageType)
            ->messageContentForClientDB(rawMessageInfo)
      : nullptr;
  std::vector<Media> mediaInfos;
  if (messageType == MessageType::IMAGES ||
      messageType == MessageType::MULTIMEDIA) {
    for (const auto &rawMediaInfo : rawMessageInfo["media"]) {
      mediaInfos.push_back(
          translateMediaToClientDBMediaInfo(rawMediaInfo, id, thread));
    }
  }
  return {
      Message{
          id,
          std::move(localID),
          std::move(thread),
          std::move(user),
          type,
          std::move(futureType),
          std::move(content),
          time},
      std::move(mediaInfos)};
}

Media MessageOperationsUtilities::translateMediaToClientDBMediaInfo(
    const folly::dynamic &rawMediaInfo,
    const std::string &container,
    const std::string &thread) {
  std::string id = rawMediaInfo["id"].asString();
  std::string uri = rawMediaInfo["uri"].asString();
  std::string type = rawMediaInfo["type"].asString();
  folly::dynamic extrasData =
      folly::dynamic::object("dimensions", rawMediaInfo["dimensions"])(
          "loop", (type == "video") ? rawMediaInfo["loop"] : false);
  if (rawMediaInfo.count("localMediaSelection")) {
    extrasData["local_media_selection"] = rawMediaInfo["localMediaSelection"];
  }
  std::string extras = folly::toJson(extrasData);
  return Media{
      std::move(id),
      std::move(container),
      std::move(thread),
      std::move(uri),
      std::move(type),
      std::move(extras)};
}

std::vector<std::pair<Message, std::vector<Media>>>
MessageOperationsUtilities::translateStringToClientDBMessageInfo(
    std::string rawMessageInfoString) {
  folly::dynamic rawMessageInfos =
      folly::parseJson(folly::trimWhitespace(rawMessageInfoString));
  if (!rawMessageInfos.isArray()) {
    throw std::runtime_error(
        "messageInfos is expected to be an array of JSON objects");
  }
  std::vector<std::pair<Message, std::vector<Media>>> clientDBMessageInfos;
  for (const auto &messageInfo : rawMessageInfos) {
    if (!messageInfo.isObject()) {
      throw std::runtime_error(
          "encountered messageInfos element that is not JSON object");
    }
    clientDBMessageInfos.push_back(
        translateRawMessageInfoToClientDBMessageInfo(messageInfo));
  }
  return clientDBMessageInfos;
}
} // namespace comm
