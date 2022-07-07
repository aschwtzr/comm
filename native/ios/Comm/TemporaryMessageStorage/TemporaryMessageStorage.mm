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

  if (![NSFileManager.defaultManager fileExistsAtPath:directoryPath]) {
    [NSFileManager.defaultManager createDirectoryAtPath:directoryPath
                            withIntermediateDirectories:NO
                                             attributes:nil
                                                  error:nil];
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
