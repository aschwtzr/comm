// @flow

import * as React from 'react';

import { sidebarInfoSelector } from '../selectors/thread-selectors';
import type { SidebarInfo, ThreadInfo } from '../types/thread-types';
import { useSelector } from '../utils/redux-utils';

function useSearchSidebars(
  threadInfo: ThreadInfo,
): {
  listData: $ReadOnlyArray<SidebarInfo>,
  searchState: { text: string, results: Set<string> },
  setSearchState: (
    searchState:
      | {
          text: string,
          results: Set<string>,
        }
      | ((state: { text: string, results: Set<string> }) => {
          text: string,
          results: Set<string>,
        }),
  ) => void,
} {
  const [searchState, setSearchState] = React.useState({
    text: '',
    results: new Set<string>(),
  });

  const sidebarInfos = useSelector(
    state => sidebarInfoSelector(state)[threadInfo.id] ?? [],
  );

  const listData = React.useMemo(() => {
    if (!searchState.text) {
      return sidebarInfos;
    }
    return sidebarInfos.filter(sidebarInfo =>
      searchState.results.has(sidebarInfo.threadInfo.id),
    );
  }, [sidebarInfos, searchState]);

  return React.useMemo(() => ({ listData, searchState, setSearchState }), [
    listData,
    setSearchState,
    searchState,
  ]);
}

export { useSearchSidebars };
