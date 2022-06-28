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
  NSUInteger paddingLength =
      data.length + kCCBlockSizeAES128 - data.length % kCCBlockSizeAES128;
  NSString *paddedData = [[encryptedDataSeparator stringByAppendingString:data]
      stringByPaddingToLength:paddingLength
                   withString:encryptedDataSeparator
              startingAtIndex:0];
  return [EncryptedFileUtils
      _runCryptor:[paddedData dataUsingEncoding:NSUTF8StringEncoding]
        operation:kCCEncrypt
            error:error];
}

+ (NSString *)_decryptBinary:(NSData *)binary error:(NSError **)error {
  NSString *decryptedData =
      [[NSString alloc] initWithData:[EncryptedFileUtils _runCryptor:binary
                                                           operation:kCCDecrypt
                                                               error:error]
                            encoding:NSUTF8StringEncoding];
  return [decryptedData
      stringByTrimmingCharactersInSet:NSCharacterSet.newlineCharacterSet];
}

+ (NSData *)_runCryptor:(NSData *)binary
              operation:(CCOperation)operation
                  error:(NSError **)err {
  NSString *keyString =
      [[CommSecureStoreIOSWrapper sharedInstance] get:@"comm.encryptionKey"];
  if (!keyString) {
    *err = [NSError
        errorWithDomain:@"app.comm"
                   code:NSCoderValueNotFoundError
               userInfo:@{
                 NSLocalizedDescriptionKey : @"Encryption key not created yet"
               }];
    return nil;
  }

  NSUInteger AES256KeyByteCount = 32;
  NSData *key = [[keyString substringToIndex:AES256KeyByteCount]
      dataUsingEncoding:NSUTF8StringEncoding];
  NSMutableData *resultBinary = [NSMutableData dataWithLength:binary.length];

  size_t processedBytes = 0;
  CCCryptorStatus ccStatus = CCCrypt(
      operation,
      kCCAlgorithmAES,
      kCCOptionECBMode,
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
