#pragma once

#include <string>

namespace comm {
namespace network {
namespace tools {

std::string generateRandomString(std::size_t length = 20);

std::string generateHolder(
    const std::string &blobHash,
    const std::string &backupID,
    const std::string &resourceID = "");

std::string validateAttachmentHolders(const std::string &holders);

std::size_t getUtf8Length(std::string &str);

} // namespace tools
} // namespace network
} // namespace comm
