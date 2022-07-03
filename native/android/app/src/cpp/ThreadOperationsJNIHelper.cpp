#include <DatabaseManagers/SQLiteQueryExecutor.h>
#include <Internal/ThreadOperationsJNIHelper.h>
#include <Native/ThreadOperations.h>

namespace comm {
void ThreadOperationsJNIHelper::updateSQLiteUnreadStatus(
    facebook::jni::alias_ref<ThreadOperationsJNIHelper> jThis,
    std::string sqliteFilePath,
    std::string threadID,
    bool unread) {
  SQLiteQueryExecutor::initialize(sqliteFilePath);
  ThreadOperations::updateSQLiteUnreadStatus(threadID, unread);
}

void ThreadOperationsJNIHelper::registerNatives() {
  javaClassStatic()->registerNatives({
      makeNativeMethod(
          "updateSQLiteUnreadStatus",
          ThreadOperationsJNIHelper::updateSQLiteUnreadStatus),
  });
}
} // namespace comm
