#pragma once

#import <Foundation/Foundation.h>

@interface TemporalMessageStorage : NSObject
@property(readonly) NSURL *directoryURL;
@property(readonly) NSString *directoryPath;
@property(readonly) NSString *mainStoragePath;
@property(readonly) NSString *lockName;

- (instancetype)initAtPath:(NSString *)directoryName
           withMainStorage:(NSString *)mainStorageName
              withLockName:(NSString *)lockName;
- (void)writeMessage:(NSString *)message;
- (NSArray<NSString *> *)readAndClearMessages;
- (void)ensureLockUsable;
@end
