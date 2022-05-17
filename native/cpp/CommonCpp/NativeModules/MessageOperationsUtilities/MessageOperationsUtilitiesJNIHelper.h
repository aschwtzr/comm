#pragma once

#include <fbjni/fbjni.h>

namespace comm {
class MessageOperationsUtilitiesJNIHelper
    : public facebook::jni::JavaClass<MessageOperationsUtilitiesJNIHelper> {
public:
  static auto constexpr kJavaDescriptor =
      "Lapp/comm/android/fbjni/MessageOperationsUtilities;";

  static void storeNotification(
      facebook::jni::alias_ref<MessageOperationsUtilitiesJNIHelper> jThis,
      facebook::jni::JString sqliteFilePath,
      facebook::jni::JString rawMessageInfoString);
  static void registerNatives();
};
} // namespace comm
