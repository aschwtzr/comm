#include "MessageOperationsUtilitiesJNIHelper.h"
#include "MessageOperationsUtilities.h"
#include "SQLiteQueryExecutor.h"

namespace comm {
void MessageOperationsUtilitiesJNIHelper::storeNotification(
    facebook::jni::alias_ref<MessageOperationsUtilitiesJNIHelper> jThis,
    facebook::jni::JString sqliteFilePath,
    facebook::jni::JString rawMessageInfoString) {
  std::string sqliteFilePathCpp = sqliteFilePath.toStdString();
  std::string rawMessageInfoStringCpp = rawMessageInfoString.toStdString();
  SQLiteQueryExecutor::initialize(sqliteFilePathCpp);
  MessageOperationsUtilities::storeNotification(rawMessageInfoStringCpp);
}

void MessageOperationsUtilitiesJNIHelper::registerNatives() {
  javaClassStatic()->registerNatives({
      makeNativeMethod(
          "storeNotification",
          MessageOperationsUtilitiesJNIHelper::storeNotification),
  });
}
} // namespace comm