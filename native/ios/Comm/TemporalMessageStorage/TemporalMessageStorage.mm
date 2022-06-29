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

@end
