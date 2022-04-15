// @flow

import * as React from 'react';

import { userStoreSearchIndex as userStoreSearchIndexSelector } from 'lib/selectors/user-selectors';
import type { AccountUserInfo } from 'lib/types/user-types';

import { useSelector } from '../../redux/redux-utils';
import css from './user-list.css';

export type UserRowProps = {
  +userInfo: AccountUserInfo,
};

type UserListProps = {
  +userRowComponent: React.ComponentType<UserRowProps>,
  +filterUser: (userInfo: AccountUserInfo) => boolean,
  +usersComparator: (user1: AccountUserInfo, user2: AccountUserInfo) => number,
  +searchText: string,
};

export function UserList(props: UserListProps): React.Node {
  const { userRowComponent, filterUser, usersComparator, searchText } = props;
  const userInfos = useSelector(state => state.userStore.userInfos);
  const userStoreSearchIndex = useSelector(userStoreSearchIndexSelector);

  const searchResult = React.useMemo(
    () => userStoreSearchIndex.getSearchResults(searchText),
    [searchText, userStoreSearchIndex],
  );

  const users = React.useMemo(() => {
    const userIDs = searchText ? searchResult : Object.keys(userInfos);
    const unfilteredUserInfos = [];
    for (const id of userIDs) {
      const { username, relationshipStatus } = userInfos[id];
      if (!username) {
        continue;
      }
      unfilteredUserInfos.push({
        id,
        username,
        relationshipStatus,
      });
    }
    return unfilteredUserInfos.filter(filterUser).sort(usersComparator);
  }, [filterUser, searchResult, searchText, userInfos, usersComparator]);

  const userRows = React.useMemo(() => {
    const UserRow = userRowComponent;
    return users.map(user => <UserRow userInfo={user} key={user.id} />);
  }, [users, userRowComponent]);

  return <div className={css.container}>{userRows}</div>;
}
