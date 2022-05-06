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
  std::unique_ptr<std::string> local_id = rawMessageInfo.count("localID")
      ? std::make_unique<std::string>(rawMessageInfo["localID"].asString())
      : nullptr;
  MessageType type = static_cast<MessageType>(rawMessageInfo["type"].asInt());
  int64_t time = rawMessageInfo["time"].asInt();
  std::unique_ptr<int> future_type = (type == MessageType::UNSUPPORTED)
      ? std::make_unique<int>(
            rawMessageInfo["unsupportedMessageInfo"]["type"].asInt())
      : nullptr;
  std::unique_ptr<std::string> content =
      MESSAGE_SPECS.find(type) != MESSAGE_SPECS.end()
      ? MESSAGE_SPECS.at(type)->messageContentForClientDB(rawMessageInfo)
      : nullptr;
  std::vector<Media> media_infos;
  if (type == MessageType::IMAGES || type == MessageType::MULTIMEDIA) {
    for (const auto &rawMediaInfo : rawMessageInfo["media"]) {
      media_infos.push_back(
          translateMediaToClientDBMediaInfo(rawMediaInfo, id, thread));
    }
  }
  return {
      Message{
          id,
          std::move(local_id),
          std::move(thread),
          std::move(user),
          type,
          std::move(future_type),
          std::move(content),
          time},
      std::move(media_infos)};
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
  std::vector<std::pair<Message, std::vector<Media>>> clientDBMessageInfos;
  if (rawMessageInfos.isObject()) {
    clientDBMessageInfos.push_back(
        translateRawMessageInfoToClientDBMessageInfo(rawMessageInfoString));
    return clientDBMessageInfos;
  }

  for (const auto &messageInfo : rawMessageInfos) {
    if (!messageInfo.isObject()) {
      throw std::runtime_error(
          "Invalid message content. Message content is expected to be an array "
          "of JSON objects.");
    }
    clientDBMessageInfos.push_back(
        translateRawMessageInfoToClientDBMessageInfo(messageInfo));
  }
  return clientDBMessageInfos;
}

void MessageOperationsUtilities::storeNotification(
    std::string rawMessageInfoString) {
  std::vector<std::pair<Message, std::vector<Media>>> clientDBMessageInfos =
      translateStringToClientDBMessageInfo(rawMessageInfoString);
  for (const auto &clientDBMessageInfo : clientDBMessageInfos) {
    DatabaseManager::getQueryExecutor().replaceMessage(
        clientDBMessageInfo.first);
    for (const auto &mediaInfo : clientDBMessageInfo.second) {
      DatabaseManager::getQueryExecutor().replaceMedia(mediaInfo);
    }
  }
}

} // namespace comm
