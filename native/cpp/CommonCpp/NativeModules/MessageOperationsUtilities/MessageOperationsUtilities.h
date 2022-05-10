#pragma once

#include "../../DatabaseManagers/DatabaseManager.h"
#include "../../DatabaseManagers/entities/Media.h"
#include "../../DatabaseManagers/entities/Message.h"

#include <folly/dynamic.h>
#include <string>
#include <vector>

namespace comm {
typedef std::pair<Message, std::vector<Media>> ClientDBMessageInfo;
class MessageOperationsUtilities {
private:
  static ClientDBMessageInfo translateRawMessageInfoToClientDBMessageInfo(
      const folly::dynamic &rawMessageInfo);
  static Media translateMediaToClientDBMediaInfo(
      const folly::dynamic &rawMediaInfo,
      const std::string &container,
      const std::string &thread);

public:
  static std::vector<ClientDBMessageInfo>
  translateStringToClientDBMessageInfos(std::string rawMessageInfoString);
  static void storeNotification(std::string rawMessageInfoString);
};
} // namespace comm
