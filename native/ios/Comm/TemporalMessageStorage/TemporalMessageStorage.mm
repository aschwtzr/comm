#import "TemporalMessageStorage.h"
#import "EncryptedFileUtils.h"
#import "Logger.h"
#import "NonBlockingLock.h"
#import <string>

@interface TemporalMessageStorage ()
- (BOOL)_updateCurrentStorage;
- (NSString *)_getLockName:(NSString *)fileName;
- (NSString *)_getPath:(NSString *)fileName;
@end

@implementation TemporalMessageStorage

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
