// @flow

import { chatMessageItemPropType } from 'lib/selectors/chat-selectors';
import type {
  TextMessageInfo,
  LocalMessageInfo,
} from 'lib/types/message-types';
import type { ThreadInfo } from 'lib/types/thread-types';
import {
  type VerticalBounds,
  verticalBoundsPropType,
} from '../types/layout-types';
import {
  type MessageListNavProp,
  messageListNavPropType,
} from './message-list-types';
import {
  type ScrollViewModalState,
  scrollViewModalStatePropType,
  withScrollViewModalState,
} from '../navigation/scroll-view-modal-state';
import {
  type KeyboardState,
  keyboardStatePropType,
  withKeyboardState,
} from '../keyboard/keyboard-state';

import * as React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

import { messageKey } from 'lib/shared/message-utils';

import InnerTextMessage from './inner-text-message.react';
import { textMessageTooltipHeight } from './text-message-tooltip-modal.react';
import { TextMessageTooltipModalRouteName } from '../navigation/route-names';
import { ComposedMessage, clusterEndHeight } from './composed-message.react';
import { authorNameHeight } from './message-header.react';
import { failedSendHeight } from './failed-send.react';
import textMessageSendFailed from './text-message-send-failed';

export type ChatTextMessageInfoItemWithHeight = {|
  itemType: 'message',
  messageShapeType: 'text',
  messageInfo: TextMessageInfo,
  localMessageInfo: ?LocalMessageInfo,
  threadInfo: ThreadInfo,
  startsConversation: boolean,
  startsCluster: boolean,
  endsCluster: boolean,
  contentHeight: number,
|};

function textMessageItemHeight(item: ChatTextMessageInfoItemWithHeight) {
  const { messageInfo, contentHeight, startsCluster, endsCluster } = item;
  const { isViewer } = messageInfo.creator;
  let height = 17 + contentHeight; // for padding, margin, and text
  if (!isViewer && startsCluster) {
    height += authorNameHeight;
  }
  if (endsCluster) {
    height += clusterEndHeight;
  }
  if (textMessageSendFailed(item)) {
    height += failedSendHeight;
  }
  return height;
}

type Props = {|
  item: ChatTextMessageInfoItemWithHeight,
  navigation: MessageListNavProp,
  focused: boolean,
  toggleFocus: (messageKey: string) => void,
  verticalBounds: ?VerticalBounds,
  // withScrollViewModalState
  scrollViewModalState: ?ScrollViewModalState,
  // withKeyboardState
  keyboardState: ?KeyboardState,
|};
class TextMessage extends React.PureComponent<Props> {
  static propTypes = {
    item: chatMessageItemPropType.isRequired,
    navigation: messageListNavPropType.isRequired,
    focused: PropTypes.bool.isRequired,
    toggleFocus: PropTypes.func.isRequired,
    verticalBounds: verticalBoundsPropType,
    scrollViewModalState: scrollViewModalStatePropType,
    keyboardState: keyboardStatePropType,
  };
  message: ?View;

  render() {
    const { item, focused } = this.props;
    return (
      <ComposedMessage
        item={item}
        sendFailed={textMessageSendFailed(item)}
        focused={focused}
      >
        <InnerTextMessage
          item={item}
          onPress={this.onPress}
          messageRef={this.messageRef}
        />
      </ComposedMessage>
    );
  }

  messageRef = (message: ?View) => {
    this.message = message;
  };

  onPress = () => {
    if (this.dismissKeyboardIfShowing()) {
      return;
    }

    const {
      message,
      props: { verticalBounds },
    } = this;
    if (!message || !verticalBounds) {
      return;
    }

    const { focused, toggleFocus, item } = this.props;
    if (!focused) {
      toggleFocus(messageKey(item.messageInfo));
    }

    const { scrollViewModalState } = this.props;
    if (scrollViewModalState) {
      scrollViewModalState.setScrollDisabled(true);
    }

    message.measure((x, y, width, height, pageX, pageY) => {
      const coordinates = { x: pageX, y: pageY, width, height };

      const messageTop = pageY;
      const messageBottom = pageY + height;
      const boundsTop = verticalBounds.y;
      const boundsBottom = verticalBounds.y + verticalBounds.height;

      const belowMargin = 20;
      const belowSpace = textMessageTooltipHeight + belowMargin;
      const { isViewer } = item.messageInfo.creator;
      const aboveMargin = isViewer ? 30 : 50;
      const aboveSpace = textMessageTooltipHeight + aboveMargin;

      let location = 'below',
        margin = belowMargin;
      if (
        messageBottom + belowSpace > boundsBottom &&
        messageTop - aboveSpace > boundsTop
      ) {
        location = 'above';
        margin = aboveMargin;
      }

      this.props.navigation.navigate({
        routeName: TextMessageTooltipModalRouteName,
        params: {
          presentedFrom: this.props.navigation.state.key,
          initialCoordinates: coordinates,
          verticalBounds,
          location,
          margin,
          item,
        },
      });
    });
  };

  dismissKeyboardIfShowing = () => {
    const { keyboardState } = this.props;
    return !!(keyboardState && keyboardState.dismissKeyboardIfShowing());
  };
}

const WrappedTextMessage = withKeyboardState(
  withScrollViewModalState(TextMessage),
);

export { WrappedTextMessage as TextMessage, textMessageItemHeight };
