// @flow

import * as React from 'react';
import { useDispatch } from 'react-redux';

import { setMessageStoreMessages } from 'lib/actions/message-actions.js';
import { setThreadStoreActionType } from 'lib/actions/thread-actions';
import { sqliteLoadFailure } from 'lib/actions/user-actions';
import { fetchNewCookieFromNativeCredentials } from 'lib/utils/action-utils';
import { convertClientDBThreadInfosToRawThreadInfos } from 'lib/utils/thread-ops-utils';

import { useSelector } from '../redux/redux-utils';
import { SQLiteContext } from './sqlite-context';

type Props = {
  +children: React.Node,
};

function SQLiteContextProvider(props: Props): React.Node {
  const [storeLoaded, setStoreLoaded] = React.useState<boolean>(false);

  const dispatch = useDispatch();
  const rehydrateConcluded = useSelector(
    state => !!(state._persist && state._persist.rehydrated),
  );
  const cookie = useSelector(state => state.cookie);
  const urlPrefix = useSelector(state => state.urlPrefix);

  React.useEffect(() => {
    if (storeLoaded || !rehydrateConcluded) {
      return;
    }
    (async () => {
      try {
        const threads = await global.CommCoreModule.getAllThreads();
        const threadInfosFromDB = convertClientDBThreadInfosToRawThreadInfos(
          threads,
        );
        dispatch({
          type: setThreadStoreActionType,
          payload: { threadInfos: threadInfosFromDB },
        });
        const messages = await global.CommCoreModule.getAllMessages();
        dispatch({
          type: setMessageStoreMessages,
          payload: messages,
        });
      } catch {
        await fetchNewCookieFromNativeCredentials(
          dispatch,
          cookie,
          urlPrefix,
          sqliteLoadFailure,
        );
      } finally {
        setStoreLoaded(true);
      }
    })();
  }, [storeLoaded, urlPrefix, rehydrateConcluded, cookie, dispatch]);

  const contextValue = React.useMemo(
    () => ({
      storeLoaded,
    }),
    [storeLoaded],
  );

  return (
    <SQLiteContext.Provider value={contextValue}>
      {props.children}
    </SQLiteContext.Provider>
  );
}

export { SQLiteContextProvider };
