// @flow

import { locallyUniqueToRealizedThreadIDsSelector } from 'lib/selectors/thread-selectors';
import {
  createPendingThread,
  parseLocallyUniqueThreadID,
  threadIsPending,
} from 'lib/shared/thread-utils';
import { type RawThreadInfo, threadTypes } from 'lib/types/thread-types';
import type { UserInfos } from 'lib/types/user-types';

import type { Action } from '../redux/redux-setup';
import { type NavInfo, updateNavInfoActionType } from '../types/nav-types';

export default function reduceNavInfo(
  oldState: NavInfo,
  action: Action,
  newThreadInfos: { +[id: string]: RawThreadInfo },
  userID: ?string,
  userInfos: UserInfos,
): NavInfo {
  let state = oldState;
  if (action.type === updateNavInfoActionType) {
    state = {
      ...state,
      ...action.payload,
    };
  }

  const { activeChatThreadID, pendingThread } = state;
  if (activeChatThreadID) {
    const locallyUniqueToRealizedThreadIDs = locallyUniqueToRealizedThreadIDsSelector(
      newThreadInfos,
    );
    const realizedThreadID = locallyUniqueToRealizedThreadIDs.get(
      activeChatThreadID,
    );
    if (realizedThreadID) {
      state = {
        ...state,
        activeChatThreadID: realizedThreadID,
      };
    } else if (
      threadIsPending(activeChatThreadID) &&
      pendingThread?.id !== activeChatThreadID
    ) {
      const pendingThreadData = parseLocallyUniqueThreadID(activeChatThreadID);
      // We do not create a pending sidebar yet, because it would require
      // an efficient way of finding parent thread basing on source message ID
      if (
        pendingThreadData &&
        pendingThreadData.threadType !== threadTypes.SIDEBAR &&
        userID
      ) {
        const members = pendingThreadData.memberIDs
          .map(id => userInfos[id])
          .filter(Boolean);
        const newPendingThread = createPendingThread({
          viewerID: userID,
          threadType: pendingThreadData.threadType,
          members,
        });
        state = {
          ...state,
          activeChatThreadID: newPendingThread.id,
          pendingThread: newPendingThread,
        };
      }
    }
  }

  if (state.pendingThread && !threadIsPending(state.activeChatThreadID)) {
    const {
      pendingThread: currentPendingThread,
      ...stateWithoutPendingThread
    } = state;
    state = stateWithoutPendingThread;
  }

  return state;
}
