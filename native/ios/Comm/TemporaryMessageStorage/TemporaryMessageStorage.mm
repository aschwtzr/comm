#import "TemporaryMessageStorage.h"
#import "EncryptedFileUtils.h"
#import "Logger.h"
#import "NonBlockingLock.h"
#import <string>

@interface TemporaryMessageStorage ()
- (BOOL)_updateCurrentStorage;
- (NSString *)_getLockName:(NSString *)fileName;
- (NSString *)_getPath:(NSString *)fileName;
@end

@implementation TemporaryMessageStorage

- (instancetype)init {
  self = [self initAtDirectory:@"TemporaryMessageStorage"];
  return self;
}

- (instancetype)initAtDirectory:(NSString *)directoryName {
  self = [super init];
  if (!self) {
    return self;
  }

  NSURL *groupURL = [NSFileManager.defaultManager
      containerURLForSecurityApplicationGroupIdentifier:@"group.app.comm"];
  NSURL *directoryURL = [groupURL URLByAppendingPathComponent:directoryName];
  NSString *directoryPath = directoryURL.path;
  NSError *err = nil;

  if (![NSFileManager.defaultManager fileExistsAtPath:directoryPath]) {
    [NSFileManager.defaultManager createDirectoryAtPath:directoryPath
                            withIntermediateDirectories:NO
                                             attributes:nil
                                                  error:&err];
  }
  if (err) {
    comm::Logger::log(
        "Failed to create directory at path: " +
        std::string([directoryPath UTF8String]) +
        ". Details: " + std::string([err.localizedDescription UTF8String]));
  }
  _directoryURL = directoryURL;
  _directoryPath = directoryPath;
  return self;
}

- (void)writeMessage:(NSString *)message {
  NSArray<NSString *> *storageContent =
      [NSFileManager.defaultManager contentsOfDirectoryAtPath:self.directoryPath
                                                        error:nil];
  if (!storageContent || !storageContent.count) {
    comm::Logger::log("Storage not existing yet. Skipping notification");
    return;
  }

  NSString *currentFileName =
      [storageContent sortedArrayUsingSelector:@selector(compare:)].lastObject;
  NSString *currentFilePath = [self _getPath:currentFileName];
  NSString *lockName = [self _getLockName:currentFileName];
  NonBlockingLock *lock = [[NonBlockingLock alloc] initWithName:lockName];

  NSError *lockError = nil;
  NSError *writeError = nil;

  @try {
    if (![lock tryAcquireLock:&lockError]) {
      NSString *randomPath =
          [self.directoryURL
              URLByAppendingPathComponent:[NSUUID UUID].UUIDString]
              .path;
      [EncryptedFileUtils writeData:message toFileAtPath:randomPath error:nil];
      comm::Logger::log(
          "Failed to acquire lock. Details: " +
          std::string([lockError.localizedDescription UTF8String]));
      return;
    }
    [EncryptedFileUtils appendData:message
                      toFileAtPath:currentFilePath
                             error:&writeError];
  } @finally {
    [lock releaseLock:&lockError];
  }

  if (writeError) {
    comm::Logger::log(
        "Failed to append message to storage. Details: " +
        std::string([writeError.localizedDescription UTF8String]));
  }
}

- (NSArray<NSString *> *)readAndClearMessages {
  NSMutableArray<NSString *> *allMessages = [NSMutableArray array];
  NSArray<NSString *> *storageContents =
      [NSFileManager.defaultManager contentsOfDirectoryAtPath:self.directoryPath
                                                        error:nil];
  if (!storageContents) {
    comm::Logger::log("Temporary storage directory not existing");
    return allMessages;
  }

  NSString *previousFileName =
      [storageContents sortedArrayUsingSelector:@selector(compare:)].lastObject;
  NSString *previousStoragePath = [self _getPath:previousFileName];

  BOOL storageUpdated = [self _updateCurrentStorage];

  for (NSString *fileName in storageContents) {
    NSString *path = [self _getPath:fileName];
    NSError *fileReadErr = nil;
    NSArray<NSString *> *fileMessages = nil;

    if ([path isEqualToString:previousStoragePath]) {
      NSError *lockErr = nil;
      NSString *lockName = [self _getLockName:previousFileName];
      NonBlockingLock *lock = [[NonBlockingLock alloc] initWithName:lockName];
      @try {
        BOOL lockAcquired = [lock tryAcquireLock:&lockErr];
        fileMessages = [EncryptedFileUtils readFromFileAtPath:path
                                                        error:&fileReadErr];
        if (storageUpdated && lockAcquired) {
          [NSFileManager.defaultManager removeItemAtPath:path error:nil];
        } else if (lockErr) {
          comm::Logger::log(
              "Failed to acquire lock. Details: " +
              std::string([lockErr.localizedDescription UTF8String]));
        }
      } @finally {
        [lock releaseLock:&lockErr];
        [lock destroyLock:&lockErr];
      }
    } else {
      fileMessages = [EncryptedFileUtils readFromFileAtPath:path
                                                      error:&fileReadErr];
      [NSFileManager.defaultManager removeItemAtPath:path error:nil];
    }

    if (!fileMessages) {
      comm::Logger::log(
          "Failed to read file at path: " + std::string([path UTF8String]) +
          "Details: " +
          std::string([fileReadErr.localizedDescription UTF8String]));
    } else {
      [allMessages addObjectsFromArray:fileMessages];
    }
  }
  return allMessages;
}

- (BOOL)_updateCurrentStorage {
  int64_t updateTimestamp = (int64_t)[NSDate date].timeIntervalSince1970;
  NSString *updatedStorageName =
      [NSString stringWithFormat:@"msg_%lld", updateTimestamp];
  NSString *updatedStoragePath =
      [self.directoryURL URLByAppendingPathComponent:updatedStorageName].path;
  return [NSFileManager.defaultManager createFileAtPath:updatedStoragePath
                                               contents:nil
                                             attributes:nil];
}

- (NSString *)_getLockName:(NSString *)fileName {
  return [NSString stringWithFormat:@"group.app.comm/%@", fileName];
}

- (NSString *)_getPath:(NSString *)fileName {
  if (!fileName) {
    return nil;
  }
  return [self.directoryURL URLByAppendingPathComponent:fileName].path;
}

@end
