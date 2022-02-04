#include "Tools.h"
#include "ConfigManager.h"
#include "Constants.h"

#include <boost/lexical_cast.hpp>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_generators.hpp>
#include <boost/uuid/uuid_io.hpp>

#include <chrono>
#include <iostream>
#include <random>
#include <regex>

namespace comm {
namespace network {

std::string generateRandomString(std::size_t length) {
  const std::string CHARACTERS =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  thread_local static std::random_device random_device;
  thread_local static std::mt19937 generator(random_device());
  std::uniform_int_distribution<> distribution(0, CHARACTERS.size() - 1);
  std::string random_string;
  for (std::size_t i = 0; i < length; ++i) {
    random_string += CHARACTERS[distribution(generator)];
  }
  return random_string;
}

long long getCurrentTimestamp() {
  using namespace std::chrono;
  return duration_cast<milliseconds>(system_clock::now().time_since_epoch())
      .count();
}

bool validateDeviceId(std::string deviceId) {
  try {
    static const std::regex deviceIdKeyserverRegexp("^ks:.*");
    if (std::regex_match(deviceId, deviceIdKeyserverRegexp)) {
      return (
          deviceId ==
          config::ConfigManager::getInstance().getParameter(
              config::ConfigManager::OPTION_DEFAULT_KEYSERVER_ID));
    }
    return std::regex_match(deviceId, DEVICEID_FORMAT_REGEX);
  } catch (const std::exception &e) {
    std::cout << "Tools: "
              << "Got an exception at `validateDeviceId`: " << e.what()
              << std::endl;
    return false;
  }
}

std::string generateUUID() {
  thread_local static std::random_device random_device;
  thread_local static std::mt19937 mt19937(random_device());
  thread_local static boost::uuids::basic_random_generator<std::mt19937>
      random_generator(mt19937);
  return boost::uuids::to_string(random_generator());
}

} // namespace network
} // namespace comm
