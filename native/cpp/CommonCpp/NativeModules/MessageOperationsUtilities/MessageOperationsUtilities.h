#pragma once

#include "../../DatabaseManagers/DatabaseManager.h"
#include "../../DatabaseManagers/entities/Media.h"
#include "../../DatabaseManagers/entities/Message.h"

#include <folly/dynamic.h>
#include <string>
#include <vector>

namespace comm {
class MessageOperationsUtilities {
public:
  static std::pair<Message, std::vector<Media>>
  translateRawMessageInfoToClientDBMessageInfo(
      const folly::dynamic &rawMessageInfo);
  static Media translateMediaToClientDBMediaInfo(
      const folly::dynamic &rawMediaInfo,
      const std::string &container,
      const std::string &thread);
  static std::vector<std::pair<Message, std::vector<Media>>>
  translateStringToClientDBMessageInfo(std::string rawMessageInfoString);
  static void storeNotification(std::string rawMessageInfoString);
};
} // namespace comm