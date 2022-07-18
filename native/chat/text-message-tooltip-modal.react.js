// @flow

import Clipboard from '@react-native-community/clipboard';
import invariant from 'invariant';
import * as React from 'react';

import { createMessageReply } from 'lib/shared/message-utils';
import type { DispatchFunctions, ActionFunc } from 'lib/utils/action-utils';

import type { InputState } from '../input/input-state';
import { displayActionResultModal } from '../navigation/action-result-modal';
import {
  createTooltip,
  tooltipHeight,
  type TooltipParams,
  type TooltipRoute,
  type BaseTooltipProps,
} from '../navigation/tooltip.react';
import type { ChatTextMessageInfoItemWithHeight } from '../types/chat-types';
import { navigateToSidebar } from './sidebar-navigation';
import TextMessageTooltipButton from './text-message-tooltip-button.react';

export type TextMessageTooltipModalParams = TooltipParams<{
  +item: ChatTextMessageInfoItemWithHeight,
}>;

const confirmCopy = () => displayActionResultModal('copied!');
const confirmReport = () => displayActionResultModal('reported to admin');

function onPressCopy(route: TooltipRoute<'TextMessageTooltipModal'>) {
  Clipboard.setString(route.params.item.messageInfo.text);
  setTimeout(confirmCopy);
}

function onPressReply(
  route: TooltipRoute<'TextMessageTooltipModal'>,
  dispatchFunctions: DispatchFunctions,
  bindServerCall: <F>(serverCall: ActionFunc<F>) => F,
  inputState: ?InputState,
) {
  invariant(
    inputState,
    'inputState should be set in TextMessageTooltipModal.onPressReply',
  );
  inputState.addReply(createMessageReply(route.params.item.messageInfo.text));
}

const spec = {
  entries: [
    { id: 'copy', text: 'Copy', onPress: onPressCopy },
    { id: 'reply', text: 'Reply', onPress: onPressReply },
    {
      id: 'report',
      text: 'Report',
      onPress: confirmReport,
    },
    {
      id: 'create_sidebar',
      text: 'Create thread',
      onPress: navigateToSidebar,
    },
    {
      id: 'open_sidebar',
      text: 'Go to thread',
      onPress: navigateToSidebar,
    },
  ],
};

const TextMessageTooltipModal: React.ComponentType<
  BaseTooltipProps<'TextMessageTooltipModal'>,
> = createTooltip<'TextMessageTooltipModal'>(TextMessageTooltipButton, spec);

const textMessageTooltipHeight: number = tooltipHeight(spec.entries.length);

export { TextMessageTooltipModal, textMessageTooltipHeight };
