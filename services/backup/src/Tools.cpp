#include "Tools.h"

#include "GlobalTools.h"

#include <chrono>
#include <cstdlib>
#include <random>

namespace comm {
namespace network {
namespace tools {

std::string generateRandomString(std::size_t length) {
  const std::string CHARACTERS =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  thread_local std::random_device generator;
  std::uniform_int_distribution<> distribution(0, CHARACTERS.size() - 1);
  std::string random_string;
  for (std::size_t i = 0; i < length; ++i) {
    random_string += CHARACTERS[distribution(generator)];
  }
  return random_string;
}

std::string generateHolder(
    const std::string &backupID,
    const std::string &resourceID,
    const std::string &blobHash) {
  if (resourceID.empty()) {
    return backupID + ID_SEPARATOR + blobHash + ID_SEPARATOR +
        tools::generateUUID();
  }
  return backupID + ID_SEPARATOR + resourceID + ID_SEPARATOR + blobHash +
      ID_SEPARATOR + tools::generateUUID();
}

std::string
generateHolder(const std::string &backupID, const std::string &blobHash) {
  return generateHolder(backupID, "", blobHash);
}

} // namespace tools
} // namespace network
} // namespace comm
