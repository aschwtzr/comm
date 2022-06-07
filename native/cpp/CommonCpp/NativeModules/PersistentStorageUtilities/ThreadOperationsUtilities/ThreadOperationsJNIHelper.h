#pragma once

#include <fbjni/fbjni.h>

namespace comm {
class ThreadOperationsJNIHelper
    : public facebook::jni::JavaClass<ThreadOperationsJNIHelper> {
public:
  static auto constexpr kJavaDescriptor =
      "Lapp/comm/android/fbjni/ThreadOperations;";
  static void updateSQLiteUnreadStatus(
      facebook::jni::alias_ref<ThreadOperationsJNIHelper> jThis,
      facebook::jni::JString sqliteFilePath,
      facebook::jni::JString threadID,
      bool unread);
  static void registerNatives();
};
} // namespace comm