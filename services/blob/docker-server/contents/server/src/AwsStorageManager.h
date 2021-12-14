#pragma once

#include "AwsS3Bucket.h"

#include <aws/core/Aws.h>

#include <memory>
#include <string>
#include <vector>

namespace comm {
namespace network {

class AwsStorageManager {
public:
  static AwsStorageManager &getInstance();
  AwsS3Bucket getBucket(const std::string &bucketName) const;
  std::vector<std::string> listBuckets() const;
};

} // namespace network
} // namespace comm
