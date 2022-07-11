// @flow

import classNames from 'classnames';
import invariant from 'invariant';
import _isEqual from 'lodash/fp/isEqual';
import * as React from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch } from 'react-redux';

import { threadInfoSelector } from 'lib/selectors/thread-selectors';
import { userInfoSelectorForPotentialMembers } from 'lib/selectors/user-selectors';
import {
  useWatchThread,
  useExistingThreadInfoFinder,
  createPendingThread,
} from 'lib/shared/thread-utils';
import { threadTypes } from 'lib/types/thread-types';
import type { AccountUserInfo } from 'lib/types/user-types';

import { InputStateContext } from '../input/input-state';
import { useSelector } from '../redux/redux-utils';
import { updateNavInfoActionType } from '../types/nav-types';
import ChatInputBar from './chat-input-bar.react';
import css from './chat-message-list-container.css';
import ChatMessageList from './chat-message-list.react';
import ChatThreadComposer from './chat-thread-composer.react';
import ThreadTopBar from './thread-top-bar.react';

function ChatMessageListContainer(): React.Node {
  const activeChatThreadID = useSelector(
    state => state.navInfo.activeChatThreadID,
  );
  const isChatCreation =
    useSelector(state => state.navInfo.chatMode) === 'create';

  const selectedUserIDs = useSelector(state => state.navInfo.selectedUserList);
  const otherUserInfos = useSelector(userInfoSelectorForPotentialMembers);
  const userInfoInputArray: $ReadOnlyArray<AccountUserInfo> = React.useMemo(
    () => selectedUserIDs?.map(id => otherUserInfos[id]).filter(Boolean) ?? [],
    [otherUserInfos, selectedUserIDs],
  );
  const viewerID = useSelector(state => state.currentUserInfo?.id);
  invariant(viewerID, 'should be set');

  const pendingPrivateThread = React.useRef(
    createPendingThread({
      viewerID,
      threadType: threadTypes.PRIVATE,
    }),
  );
  const existingThreadInfoFinderForCreatingThread = useExistingThreadInfoFinder(
    pendingPrivateThread.current,
  );

  const baseThreadInfo = useSelector(state => {
    const activeID = activeChatThreadID;
    if (!activeID) {
      return null;
    }
    return threadInfoSelector(state)[activeID] ?? state.navInfo.pendingThread;
  });
  const existingThreadInfoFinder = useExistingThreadInfoFinder(baseThreadInfo);
  const threadInfo = React.useMemo(() => {
    if (isChatCreation) {
      return existingThreadInfoFinderForCreatingThread({
        searching: true,
        userInfoInputArray,
      });
    }

    return existingThreadInfoFinder({
      searching: false,
      userInfoInputArray: [],
    });
  }, [
    existingThreadInfoFinder,
    existingThreadInfoFinderForCreatingThread,
    isChatCreation,
    userInfoInputArray,
  ]);

  const dispatch = useDispatch();

  // The effect removes members from list in navInfo
  // if some of the user IDs don't exist in redux store
  React.useEffect(() => {
    if (!isChatCreation) {
      return;
    }
    const existingSelectedUsersSet = new Set(
      userInfoInputArray.map(userInfo => userInfo.id),
    );
    if (
      selectedUserIDs?.length !== existingSelectedUsersSet.size ||
      !_isEqual(new Set(selectedUserIDs), existingSelectedUsersSet)
    ) {
      dispatch({
        type: updateNavInfoActionType,
        payload: {
          selectedUserList: Array.from(existingSelectedUsersSet),
        },
      });
    }
  }, [
    dispatch,
    isChatCreation,
    otherUserInfos,
    selectedUserIDs,
    userInfoInputArray,
  ]);

  const inputState = React.useContext(InputStateContext);
  const [{ isActive }, connectDropTarget] = useDrop({
    accept: NativeTypes.FILE,
    drop: item => {
      const { files } = item;
      if (inputState && files.length > 0) {
        inputState.appendFiles(files);
      }
    },
    collect: monitor => ({
      isActive: monitor.isOver() && monitor.canDrop(),
    }),
  });

  useWatchThread(threadInfo);

  invariant(threadInfo, 'ThreadInfo should be set if messageListData is');
  invariant(inputState, 'InputState should be set');
  const containerStyle = classNames({
    [css.container]: true,
    [css.activeContainer]: isActive,
  });

  const containerRef = React.useRef();

  const onPaste = React.useCallback(
    (e: ClipboardEvent) => {
      if (!inputState) {
        return;
      }
      const { clipboardData } = e;
      if (!clipboardData) {
        return;
      }
      const { files } = clipboardData;
      if (files.length === 0) {
        return;
      }
      e.preventDefault();
      inputState.appendFiles([...files]);
    },
    [inputState],
  );

  React.useEffect(() => {
    const currentContainerRef = containerRef.current;
    if (!currentContainerRef) {
      return;
    }
    currentContainerRef.addEventListener('paste', onPaste);
    return () => {
      currentContainerRef.removeEventListener('paste', onPaste);
    };
  }, [onPaste]);

  const content = React.useMemo(() => {
    const topBar = <ThreadTopBar threadInfo={threadInfo} />;
    const messageListAndInput = (
      <>
        <ChatMessageList threadInfo={threadInfo} />
        <ChatInputBar threadInfo={threadInfo} inputState={inputState} />
      </>
    );
    if (!isChatCreation) {
      return (
        <>
          {topBar}
          {messageListAndInput}
        </>
      );
    }
    const chatUserSelection = (
      <ChatThreadComposer
        userInfoInputArray={userInfoInputArray}
        otherUserInfos={otherUserInfos}
        threadID={threadInfo.id}
        isThreadSelected={!!userInfoInputArray.length}
        inputState={inputState}
      />
    );

    if (!userInfoInputArray.length) {
      return chatUserSelection;
    }
    return (
      <>
        {topBar}
        {chatUserSelection}
        {messageListAndInput}
      </>
    );
  }, [
    inputState,
    isChatCreation,
    otherUserInfos,
    threadInfo,
    userInfoInputArray,
  ]);

  return connectDropTarget(
    <div className={containerStyle} ref={containerRef}>
      {content}
    </div>,
  );
}

export default ChatMessageListContainer;
