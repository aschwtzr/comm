#include "MessageOperationsUtilities.h"
#include "MessageSpecs.h"

#include <folly/String.h>
#include <folly/json.h>
#include <stdexcept>

namespace comm {
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
} // namespace comm
