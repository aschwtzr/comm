#import "NotificationService.h"
#import "TemporalMessageStorage.h"

@interface NotificationService ()

@property(nonatomic, strong) void (^contentHandler)
    (UNNotificationContent *contentToDeliver);
@property(nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request
                   withContentHandler:
                       (void (^)(UNNotificationContent *_Nonnull))
                           contentHandler {
  self.contentHandler = contentHandler;
  self.bestAttemptContent = [request.content mutableCopy];
  NSString *message = self.bestAttemptContent.userInfo[@"messageInfos"];
  TemporalMessageStorage *temporalStorage =
      [[TemporalMessageStorage alloc] init];
  [temporalStorage writeMessage:message];
  [temporalStorage ensureLockUsable];
  // TODO modify self.bestAttemptContent here

  self.contentHandler(self.bestAttemptContent);
}

- (void)serviceExtensionTimeWillExpire {
  // Called just before the extension will be terminated by the system.
  // Use this as an opportunity to deliver your "best attempt" at modified
  // content, otherwise the original push payload will be used.
  self.contentHandler(self.bestAttemptContent);
}

@end
