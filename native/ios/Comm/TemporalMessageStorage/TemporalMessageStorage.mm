#import "TemporalMessageStorage.h"
#import "EncryptedFileUtils.h"
#import "Logger.h"
#import "NonBlockingLock.h"
#import <string>

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

@end
