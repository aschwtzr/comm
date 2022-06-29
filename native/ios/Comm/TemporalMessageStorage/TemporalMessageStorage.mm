#import "TemporalMessageStorage.h"
#import "EncryptedFileUtils.h"
#import "Logger.h"
#import "NonBlockingLock.h"
#import <string>

int const randomFilesNumberThreshold = 20;

@implementation TemporalMessageStorage
- (instancetype)init {
  self = [self initAtDirectory:@"TemporalMessageStorage"
               withMainStorage:@"mainStorage"
                  withLockName:@"group.app.comm/tmp_msg_sem"];
  return self;
}

- (instancetype)initAtDirectory:(NSString *)directoryName
                withMainStorage:(NSString *)mainStorageName
                   withLockName:(NSString *)lockName {
  self = [super init];
  if (self) {
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
    NSString *mainStoragePath =
        [directoryURL URLByAppendingPathComponent:mainStorageName].path;

    if (![NSFileManager.defaultManager fileExistsAtPath:mainStoragePath]) {
      [NSFileManager.defaultManager createFileAtPath:mainStoragePath
                                            contents:nil
                                          attributes:nil];
    }
    _directoryURL = directoryURL;
    _directoryPath = directoryPath;
    _mainStoragePath = mainStoragePath;
    _lockName = lockName;
  }
  return self;
}

- (void)writeMessage:(NSString *)message {
  if ([message containsString:encryptedDataSeparator]) {
    comm::Logger::log(
        "Messages containing separator not allowed. Skipping notification.");
    return;
  }

  if (![NSFileManager.defaultManager fileExistsAtPath:self.mainStoragePath]) {
    comm::Logger::log("Store not existing yet. Skipping notification");
    return;
  }

  NSError *err = nil;
  NonBlockingLock *lock = [[NonBlockingLock alloc] initWithName:self.lockName];
  BOOL acquired = [lock tryAcquireLock:&err];
  if (!acquired) {
    NSString *randomPath =
        [self.directoryURL URLByAppendingPathComponent:[NSUUID UUID].UUIDString]
            .path;
    [EncryptedFileUtils writeData:message toFileAtPath:randomPath error:nil];
    comm::Logger::log(
        "Failed to acquire lock. Details: " +
        std::string([err.localizedDescription UTF8String]));
    return;
  }
  [EncryptedFileUtils appendData:message
                    toFileAtPath:self.mainStoragePath
                           error:&err];
  [lock releaseLock:nil];
  if (err) {
    comm::Logger::log(
        "Failed to append message to storage. Details: " +
        std::string([err.localizedDescription UTF8String]));
  }
}

- (NSArray<NSString *> *)readAndClearMessages {
  NSArray<NSString *> *storageContents =
      [NSFileManager.defaultManager contentsOfDirectoryAtPath:self.directoryPath
                                                        error:nil];
  NSError *lockErr = nil;
  NonBlockingLock *lock = [[NonBlockingLock alloc] initWithName:self.lockName];

  NSMutableArray<NSString *> *allMessages = [NSMutableArray array];

  for (NSString *fileName in storageContents) {
    NSString *path =
        [self.directoryURL URLByAppendingPathComponent:fileName].path;

    NSString *fileContent = nil;
    NSError *fileReadErr = nil;
    NSError *fileClearErr = nil;

    if (![path isEqualToString:self.mainStoragePath]) {
      fileContent = [EncryptedFileUtils readFromFileAtPath:path
                                                     error:&fileReadErr];
      [NSFileManager.defaultManager removeItemAtPath:path error:nil];
    } else if ([lock tryAcquireLock:&lockErr]) {
      fileContent = [EncryptedFileUtils readFromFileAtPath:path
                                                     error:&fileReadErr];
      [EncryptedFileUtils clearContentAtPath:path error:&fileClearErr];
      [lock releaseLock:nil];
    } else {
      fileContent = [EncryptedFileUtils readFromFileAtPath:path
                                                     error:&fileReadErr];
    }
    if (lockErr) {
      comm::Logger::log(
          "Failed to acquire lock. Details: " +
          std::string([lockErr.localizedDescription UTF8String]));
    }
    if (fileClearErr) {
      comm::Logger::log(
          "Failed to clear file at path: " + std::string([path UTF8String]) +
          "Details: " +
          std::string([fileReadErr.localizedDescription UTF8String]));
    }
    if (fileReadErr) {
      comm::Logger::log(
          "Failed to read file at path: " + std::string([path UTF8String]) +
          "Details: " +
          std::string([fileReadErr.localizedDescription UTF8String]));
      continue;
    }

    NSArray<NSString *> *fileMessages =
        [fileContent componentsSeparatedByString:encryptedDataSeparator];
    [allMessages addObjectsFromArray:fileMessages];
  }
  [allMessages removeObject:@""];
  return allMessages;
}

@end
