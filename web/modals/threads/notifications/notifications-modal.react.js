// @flow

import * as React from 'react';

import {
  updateSubscription,
  updateSubscriptionActionTypes,
} from 'lib/actions/user-actions';
import { threadInfoSelector } from 'lib/selectors/thread-selectors';
import {
  useServerCall,
  useDispatchActionPromise,
} from 'lib/utils/action-utils';

import {
  assetCacheURLPrefix,
  backgroundNotificationsIllustrationFileName,
  backgroundNotificationsIllustrationHeight,
  backgroundNotificationsIllustrationWidth,
  badgeOnlyNotificationsIllustrationFileName,
  badgeOnlyNotificationsIllustrationHeight,
  badgeOnlyNotificationsIllustrationWidth,
  focusedNotificationsIllustrationFileName,
  focusedNotificationsIllustrationHeight,
  focusedNotificationsIllustrationWidth,
} from '../../../assets';
import Button from '../../../components/button.react';
import { useSelector } from '../../../redux/redux-utils';
import Modal from '../../modal.react';
import EnumSettingsOption from './enum-settings-option.react';
import css from './notifications-modal.css';

type NotificationSettings = 'focused' | 'badge-only' | 'background';

type Props = {
  +threadID: string,
  +onClose: () => void,
};

function NotificationsModal(props: Props): React.Node {
  const { onClose, threadID } = props;
  const threadInfo = useSelector(state => threadInfoSelector(state)[threadID]);
  const { subscription } = threadInfo.currentUser;

  const initialThreadSetting = React.useMemo<NotificationSettings>(() => {
    if (!subscription.home) {
      return 'background';
    }
    if (!subscription.pushNotifs) {
      return 'badge-only';
    }
    return 'focused';
  }, [subscription.home, subscription.pushNotifs]);

  const [
    notificationSettings,
    setNotificationSettings,
  ] = React.useState<NotificationSettings>(initialThreadSetting);

  const onFocusedSelected = React.useCallback(
    () => setNotificationSettings('focused'),
    [],
  );
  const onBadgeOnlySelected = React.useCallback(
    () => setNotificationSettings('badge-only'),
    [],
  );
  const onBackgroundSelected = React.useCallback(
    () => setNotificationSettings('background'),
    [],
  );

  const isFocusedSelected = notificationSettings === 'focused';
  const focusedItem = React.useMemo(() => {
    const statements = [
      { statement: 'Banner notifs', isStatementValid: true },
      { statement: 'Badge count', isStatementValid: true },
      { statement: 'Lives in Focused tab', isStatementValid: true },
    ];
    const icon = (
      <img
        src={`${assetCacheURLPrefix}/${focusedNotificationsIllustrationFileName}`}
        height={focusedNotificationsIllustrationHeight}
        width={focusedNotificationsIllustrationWidth}
      />
    );
    return (
      <EnumSettingsOption
        selected={isFocusedSelected}
        title="Focused (enabled)"
        statements={statements}
        icon={icon}
        onSelect={onFocusedSelected}
      />
    );
  }, [isFocusedSelected, onFocusedSelected]);

  const isFocusedBadgeOnlySelected = notificationSettings === 'badge-only';
  const focusedBadgeOnlyItem = React.useMemo(() => {
    const statements = [
      { statement: 'Banner notifs', isStatementValid: false },
      { statement: 'Badge count', isStatementValid: true },
      { statement: 'Lives in Focused tab', isStatementValid: true },
    ];
    const icon = (
      <img
        src={`${assetCacheURLPrefix}/${badgeOnlyNotificationsIllustrationFileName}`}
        height={badgeOnlyNotificationsIllustrationHeight}
        width={badgeOnlyNotificationsIllustrationWidth}
      />
    );
    return (
      <EnumSettingsOption
        selected={isFocusedBadgeOnlySelected}
        title="Focused (badge only)"
        statements={statements}
        icon={icon}
        onSelect={onBadgeOnlySelected}
      />
    );
  }, [isFocusedBadgeOnlySelected, onBadgeOnlySelected]);

  const isBackgroundSelected = notificationSettings === 'background';
  const backgroundItem = React.useMemo(() => {
    const statements = [
      { statement: 'Banner notifs', isStatementValid: false },
      { statement: 'Badge count', isStatementValid: false },
      { statement: 'Lives in Focused tab', isStatementValid: true },
    ];
    const icon = (
      <img
        src={`${assetCacheURLPrefix}/${backgroundNotificationsIllustrationFileName}`}
        height={backgroundNotificationsIllustrationHeight}
        width={backgroundNotificationsIllustrationWidth}
      />
    );
    return (
      <EnumSettingsOption
        selected={isBackgroundSelected}
        title="Background"
        statements={statements}
        icon={icon}
        onSelect={onBackgroundSelected}
      />
    );
  }, [isBackgroundSelected, onBackgroundSelected]);

  const dispatchActionPromise = useDispatchActionPromise();

  const callUpdateSubscription = useServerCall(updateSubscription);

  const onClickSave = React.useCallback(() => {
    dispatchActionPromise(
      updateSubscriptionActionTypes,
      callUpdateSubscription({
        threadID: threadID,
        updatedFields: {
          home: notificationSettings !== 'background',
          pushNotifs: notificationSettings === 'focused',
        },
      }),
    );
    onClose();
  }, [
    callUpdateSubscription,
    dispatchActionPromise,
    notificationSettings,
    onClose,
    threadID,
  ]);

  return (
    <Modal name="Channel notifications" size="fit-content" onClose={onClose}>
      <div className={css.container}>
        <div className={css.optionsContainer}>
          {focusedItem}
          {focusedBadgeOnlyItem}
          {backgroundItem}
        </div>
        <Button
          type="primary"
          onClick={onClickSave}
          disabled={notificationSettings === initialThreadSetting}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}

export default NotificationsModal;
