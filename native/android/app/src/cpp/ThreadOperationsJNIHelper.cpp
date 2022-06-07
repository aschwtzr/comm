#include "ThreadOperationsJNIHelper.h"
#include "SQLiteQueryExecutor.h"
#include "ThreadOperations.h"

namespace comm {
void ThreadOperationsJNIHelper::updateSQLiteUnreadStatus(
    facebook::jni::alias_ref<ThreadOperationsJNIHelper> jThis,
    facebook::jni::JString sqliteFilePath,
    facebook::jni::JString threadID,
    bool unread) {
  std::string sqliteFilePathCpp = sqliteFilePath.toStdString();
  std::string threadIDCpp = threadID.toStdString();
  SQLiteQueryExecutor::initialize(sqliteFilePathCpp);
  ThreadOperations::updateSQLiteUnreadStatus(threadIDCpp, unread);
}

void ThreadOperationsJNIHelper::registerNatives() {
  javaClassStatic()->registerNatives({
      makeNativeMethod(
          "updateSQLiteUnreadStatus",
          ThreadOperationsJNIHelper::updateSQLiteUnreadStatus),
  });
}
} // namespace comm