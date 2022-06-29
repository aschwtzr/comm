#import "TemporalMessageStorage.h"
#import "EncryptedFileUtils.h"
#import "Logger.h"
#import "NonBlockingLock.h"
#import <string>

int const randomFilesNumberThreshold = 20;
NSString *const messageSeparator = @"\n";

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
  if ([message containsString:messageSeparator]) {
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
  [EncryptedFileUtils
        appendData:[messageSeparator stringByAppendingString:message]
      toFileAtPath:self.mainStoragePath
             error:&err];
  [lock releaseLock:nil];
  if (err) {
    comm::Logger::log(
        "Failed to append message to storage. Details: " +
        std::string([err.localizedDescription UTF8String]));
  }
}

@end
