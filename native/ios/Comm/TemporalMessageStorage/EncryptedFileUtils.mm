#import "EncryptedFileUtils.h"
#import "CommSecureStoreIOSWrapper.h"
#import "Logger.h"
#import <CommonCrypto/CommonCryptor.h>

@interface EncryptedFileUtils ()
+ (NSData *)_runCryptor:(NSData *)binary
              operation:(CCOperation)operation
                  error:(NSError **)error;
+ (NSData *)_encryptData:(NSString *)data error:(NSError **)error;
+ (NSString *)_decryptBinary:(NSData *)binary error:(NSError **)error;
@end

@implementation EncryptedFileUtils
+ (NSData *)_encryptData:(NSString *)data error:(NSError **)error {
  return [EncryptedFileUtils
      _runCryptor:[data dataUsingEncoding:NSUTF8StringEncoding]
        operation:kCCEncrypt
            error:error];
}

+ (NSString *)_decryptBinary:(NSData *)binary error:(NSError **)error {
  return
      [[NSString alloc] initWithData:[EncryptedFileUtils _runCryptor:binary
                                                           operation:kCCDecrypt
                                                               error:error]
                            encoding:NSUTF8StringEncoding];
}

+ (NSData *)_runCryptor:(NSData *)binary
              operation:(CCOperation)operation
                  error:(NSError **)err {
  NSData *key = [[[CommSecureStoreIOSWrapper sharedInstance]
      get:@"comm.encryptionKey"] dataUsingEncoding:NSUTF8StringEncoding];
  if (!key) {
    *err = [NSError
        errorWithDomain:@"app.comm"
                   code:NSCoderValueNotFoundError
               userInfo:@{
                 NSLocalizedDescriptionKey : @"Encryption key not created yet"
               }];
    return nil;
  }
  NSMutableData *resultBinary =
      [NSMutableData dataWithLength:binary.length + kCCBlockSizeBlowfish];

  size_t processedBytes = 0;
  CCCryptorStatus ccStatus = CCCrypt(
      operation,
      kCCAlgorithmRC4,
      kCCOptionPKCS7Padding,
      key.bytes,
      key.length,
      nil,
      binary.bytes,
      binary.length,
      resultBinary.mutableBytes,
      resultBinary.length,
      &processedBytes);

  resultBinary.length = processedBytes;
  if (ccStatus != kCCSuccess) {
    *err = [NSError
        errorWithDomain:@"app.comm"
                   code:ccStatus
               userInfo:@{
                 NSLocalizedDescriptionKey : @"Cryptographic operation failed"
               }];
    return nil;
  }
  return resultBinary;
}

@end