#include "GlobalTools.h"

#include <glog/logging.h>
#include <openssl/sha.h>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_generators.hpp>
#include <boost/uuid/uuid_io.hpp>

#include <chrono>
#include <iomanip>
#include <regex>
#include <string>

namespace comm {
namespace network {
namespace tools {

uint64_t getCurrentTimestamp() {
  using namespace std::chrono;
  return duration_cast<milliseconds>(system_clock::now().time_since_epoch())
      .count();
}

bool hasEnvFlag(const std::string &flag) {
  if (std::getenv(flag.c_str()) == nullptr) {
    return false;
  }
  return std::string(std::getenv(flag.c_str())) == "1";
}

std::string decorateTableName(const std::string &baseName) {
  std::string suffix = "";
  if (hasEnvFlag("COMM_TEST_SERVICES")) {
    suffix = "-test";
  }
  return baseName + suffix;
}

bool isSandbox() {
  return hasEnvFlag("COMM_SERVICES_SANDBOX");
}

std::string generateUUID() {
  thread_local boost::uuids::random_generator random_generator;
  return boost::uuids::to_string(random_generator());
}

bool validateUUIDv4(const std::string &uuid) {
  const std::regex uuidV4RegexFormat(
      "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
  try {
    return std::regex_match(uuid, uuidV4RegexFormat);
  } catch (const std::exception &e) {
    LOG(ERROR) << "Tools: "
               << "Got an exception at `validateUUID`: " << e.what();
    return false;
  }
}

} // namespace tools
} // namespace network
} // namespace comm
