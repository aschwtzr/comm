// @flow

import classNames from 'classnames';
import { detect as detectBrowser } from 'detect-browser';
import invariant from 'invariant';
import * as React from 'react';

import {
  fetchMessagesBeforeCursorActionTypes,
  fetchMessagesBeforeCursor,
  fetchMostRecentMessagesActionTypes,
  fetchMostRecentMessages,
} from 'lib/actions/message-actions';
import { registerFetchKey } from 'lib/reducers/loading-reducer';
import {
  type ChatMessageItem,
  useMessageListData,
} from 'lib/selectors/chat-selectors';
import { messageKey } from 'lib/shared/message-utils';
import { threadIsPending } from 'lib/shared/thread-utils';
import type { FetchMessageInfosPayload } from 'lib/types/message-types';
import { type ThreadInfo } from 'lib/types/thread-types';
import {
  type DispatchActionPromise,
  useServerCall,
  useDispatchActionPromise,
} from 'lib/utils/action-utils';

import { type InputState, InputStateContext } from '../input/input-state';
import LoadingIndicator from '../loading-indicator.react';
import { useTextMessageRulesFunc } from '../markdown/rules.react';
import { useSelector } from '../redux/redux-utils';
import css from './chat-message-list.css';
import { MessageListContext } from './message-list-types';
import MessageTimestampTooltip from './message-timestamp-tooltip.react';
import Message from './message.react';
import type {
  OnMessagePositionWithContainerInfo,
  MessagePositionInfo,
} from './position-types';
import RelationshipPrompt from './relationship-prompt/relationship-prompt';

type BaseProps = {
  +threadInfo: ThreadInfo,
};

type Props = {
  ...BaseProps,
  // Redux state
  +activeChatThreadID: ?string,
  +messageListData: ?$ReadOnlyArray<ChatMessageItem>,
  +startReached: boolean,
  +timeZone: ?string,
  +supportsReverseFlex: boolean,
  // Redux dispatch functions
  +dispatchActionPromise: DispatchActionPromise,
  // async functions that hit server APIs
  +fetchMessagesBeforeCursor: (
    threadID: string,
    beforeMessageID: string,
  ) => Promise<FetchMessageInfosPayload>,
  +fetchMostRecentMessages: (
    threadID: string,
  ) => Promise<FetchMessageInfosPayload>,
  // withInputState
  +inputState: ?InputState,
};
type State = {
  +mouseOverMessagePosition: ?OnMessagePositionWithContainerInfo,
};
type Snapshot = {
  +scrollTop: number,
  +scrollHeight: number,
};
class ChatMessageList extends React.PureComponent<Props, State> {
  state: State = {
    mouseOverMessagePosition: null,
  };
  container: ?HTMLDivElement;
  messageContainer: ?HTMLDivElement;
  loadingFromScroll = false;

  componentDidMount() {
    this.scrollToBottom();
  }

  getSnapshotBeforeUpdate(prevProps: Props) {
    if (
      ChatMessageList.hasNewMessage(this.props, prevProps) &&
      this.messageContainer
    ) {
      const { scrollTop, scrollHeight } = this.messageContainer;
      return { scrollTop, scrollHeight };
    }
    return null;
  }

  static hasNewMessage(props: Props, prevProps: Props) {
    const { messageListData } = props;
    if (!messageListData || messageListData.length === 0) {
      return false;
    }
    const prevMessageListData = prevProps.messageListData;
    if (!prevMessageListData || prevMessageListData.length === 0) {
      return true;
    }
    return (
      ChatMessageList.keyExtractor(prevMessageListData[0]) !==
      ChatMessageList.keyExtractor(messageListData[0])
    );
  }

  componentDidUpdate(prevProps: Props, prevState: State, snapshot: ?Snapshot) {
    const { messageListData } = this.props;
    const prevMessageListData = prevProps.messageListData;

    if (
      this.loadingFromScroll &&
      messageListData &&
      (!prevMessageListData ||
        messageListData.length > prevMessageListData.length ||
        this.props.startReached)
    ) {
      this.loadingFromScroll = false;
    }

    const { messageContainer } = this;
    if (messageContainer && prevMessageListData !== messageListData) {
      this.onScroll();
    }

    // We'll scroll to the bottom if the user was already scrolled to the bottom
    // before the new message, or if the new message was composed locally
    const hasNewMessage = ChatMessageList.hasNewMessage(this.props, prevProps);
    if (
      this.props.activeChatThreadID !== prevProps.activeChatThreadID ||
      (hasNewMessage &&
        messageListData &&
        messageListData[0].itemType === 'message' &&
        messageListData[0].messageInfo.localID) ||
      (hasNewMessage && snapshot && Math.abs(snapshot.scrollTop) <= 1)
    ) {
      this.scrollToBottom();
    } else if (hasNewMessage && messageContainer && snapshot) {
      const { scrollTop, scrollHeight } = messageContainer;
      if (
        scrollHeight > snapshot.scrollHeight &&
        scrollTop === snapshot.scrollTop
      ) {
        const newHeight = scrollHeight - snapshot.scrollHeight;
        const newScrollTop = Math.abs(scrollTop) + newHeight;
        if (this.props.supportsReverseFlex) {
          messageContainer.scrollTop = -1 * newScrollTop;
        } else {
          messageContainer.scrollTop = newScrollTop;
        }
      }
    }
  }

  scrollToBottom() {
    if (this.messageContainer) {
      this.messageContainer.scrollTop = 0;
    }
  }

  static keyExtractor(item: ChatMessageItem) {
    if (item.itemType === 'loader') {
      return 'loader';
    }
    return messageKey(item.messageInfo);
  }

  renderItem = item => {
    if (item.itemType === 'loader') {
      return (
        <div key="loader" className={css.loading}>
          <LoadingIndicator status="loading" size="large" color="white" />
        </div>
      );
    }
    const { threadInfo } = this.props;
    invariant(threadInfo, 'ThreadInfo should be set if messageListData is');
    return (
      <Message
        item={item}
        threadInfo={threadInfo}
        setMouseOverMessagePosition={this.setMouseOverMessagePosition}
        mouseOverMessagePosition={this.state.mouseOverMessagePosition}
        timeZone={this.props.timeZone}
        key={ChatMessageList.keyExtractor(item)}
      />
    );
  };

  setMouseOverMessagePosition = (messagePositionInfo: MessagePositionInfo) => {
    if (!this.messageContainer) {
      return;
    }
    if (messagePositionInfo.type === 'off') {
      this.setState({ mouseOverMessagePosition: null });
      return;
    }
    const {
      top: containerTop,
      bottom: containerBottom,
      left: containerLeft,
      right: containerRight,
      height: containerHeight,
      width: containerWidth,
    } = this.messageContainer.getBoundingClientRect();
    const mouseOverMessagePosition = {
      ...messagePositionInfo,
      messagePosition: {
        ...messagePositionInfo.messagePosition,
        top: messagePositionInfo.messagePosition.top - containerTop,
        bottom: messagePositionInfo.messagePosition.bottom - containerTop,
        left: messagePositionInfo.messagePosition.left - containerLeft,
        right: messagePositionInfo.messagePosition.right - containerLeft,
      },
      containerPosition: {
        top: containerTop,
        bottom: containerBottom,
        left: containerLeft,
        right: containerRight,
        height: containerHeight,
        width: containerWidth,
      },
    };
    this.setState({ mouseOverMessagePosition });
  };

  render() {
    const { messageListData, threadInfo, inputState } = this.props;
    if (!messageListData) {
      return <div className={css.container} />;
    }
    invariant(inputState, 'InputState should be set');
    const messages = messageListData.map(this.renderItem);

    let tooltip;
    if (this.state.mouseOverMessagePosition) {
      const messagePositionInfo = this.state.mouseOverMessagePosition;
      tooltip = (
        <MessageTimestampTooltip
          messagePositionInfo={messagePositionInfo}
          timeZone={this.props.timeZone}
        />
      );
    }

    let relationshipPrompt;
    if (threadInfo) {
      relationshipPrompt = <RelationshipPrompt threadInfo={threadInfo} />;
    }

    const messageContainerStyle = classNames({
      [css.messageContainer]: true,
      [css.mirroredMessageContainer]: !this.props.supportsReverseFlex,
    });
    return (
      <div className={css.outerMessageContainer}>
        {relationshipPrompt}
        <div className={messageContainerStyle} ref={this.messageContainerRef}>
          {messages}
        </div>
        {tooltip}
      </div>
    );
  }

  messageContainerRef = (messageContainer: ?HTMLDivElement) => {
    this.messageContainer = messageContainer;
    // In case we already have all the most recent messages,
    // but they're not enough
    this.possiblyLoadMoreMessages();
    if (messageContainer) {
      messageContainer.addEventListener('scroll', this.onScroll);
    }
  };

  onScroll = () => {
    if (!this.messageContainer) {
      return;
    }
    if (this.state.mouseOverMessagePosition) {
      this.setState({ mouseOverMessagePosition: null });
    }
    this.possiblyLoadMoreMessages();
  };

  possiblyLoadMoreMessages() {
    if (!this.messageContainer) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = this.messageContainer;
    if (
      this.props.startReached ||
      Math.abs(scrollTop) + clientHeight + 55 < scrollHeight
    ) {
      return;
    }

    if (this.loadingFromScroll) {
      return;
    }
    this.loadingFromScroll = true;

    const threadID = this.props.activeChatThreadID;
    invariant(threadID, 'should be set');

    const oldestMessageServerID = this.oldestMessageServerID();
    if (oldestMessageServerID) {
      this.props.dispatchActionPromise(
        fetchMessagesBeforeCursorActionTypes,
        this.props.fetchMessagesBeforeCursor(threadID, oldestMessageServerID),
      );
    } else {
      this.props.dispatchActionPromise(
        fetchMostRecentMessagesActionTypes,
        this.props.fetchMostRecentMessages(threadID),
      );
    }
  }

  oldestMessageServerID(): ?string {
    const data = this.props.messageListData;
    invariant(data, 'should be set');
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].itemType === 'message' && data[i].messageInfo.id) {
        return data[i].messageInfo.id;
      }
    }
    return null;
  }
}

registerFetchKey(fetchMessagesBeforeCursorActionTypes);
registerFetchKey(fetchMostRecentMessagesActionTypes);
const ConnectedChatMessageList: React.ComponentType<BaseProps> = React.memo<BaseProps>(
  function ConnectedChatMessageList(props: BaseProps): React.Node {
    const { threadInfo } = props;
    const userAgent = useSelector(state => state.userAgent);
    const supportsReverseFlex = React.useMemo(() => {
      const browser = detectBrowser(userAgent);
      return (
        !browser ||
        browser.name !== 'firefox' ||
        parseInt(browser.version) >= 81
      );
    }, [userAgent]);

    const timeZone = useSelector(state => state.timeZone);

    const messageListData = useMessageListData({
      threadInfo,
      searching: false,
      userInfoInputArray: [],
    });

    const startReached = !!useSelector(state => {
      const activeID = threadInfo.id;
      if (!activeID) {
        return null;
      }

      if (threadIsPending(activeID)) {
        return true;
      }

      const threadMessageInfo = state.messageStore.threads[activeID];
      if (!threadMessageInfo) {
        return null;
      }
      return threadMessageInfo.startReached;
    });

    const dispatchActionPromise = useDispatchActionPromise();
    const callFetchMessagesBeforeCursor = useServerCall(
      fetchMessagesBeforeCursor,
    );
    const callFetchMostRecentMessages = useServerCall(fetchMostRecentMessages);

    const inputState = React.useContext(InputStateContext);

    const getTextMessageMarkdownRules = useTextMessageRulesFunc(threadInfo.id);
    const messageListContext = React.useMemo(() => {
      if (!getTextMessageMarkdownRules) {
        return undefined;
      }
      return { getTextMessageMarkdownRules };
    }, [getTextMessageMarkdownRules]);

    return (
      <MessageListContext.Provider value={messageListContext}>
        <ChatMessageList
          activeChatThreadID={threadInfo.id}
          threadInfo={threadInfo}
          messageListData={messageListData}
          startReached={startReached}
          timeZone={timeZone}
          supportsReverseFlex={supportsReverseFlex}
          inputState={inputState}
          dispatchActionPromise={dispatchActionPromise}
          fetchMessagesBeforeCursor={callFetchMessagesBeforeCursor}
          fetchMostRecentMessages={callFetchMostRecentMessages}
        />
      </MessageListContext.Provider>
    );
  },
);

export default ConnectedChatMessageList;
