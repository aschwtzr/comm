// @flow

import * as React from 'react';

import { searchUsers } from 'lib/actions/user-actions.js';
import { userStoreSearchIndex as userStoreSearchIndexSelector } from 'lib/selectors/user-selectors.js';
import type { GlobalAccountUserInfo } from 'lib/types/user-types.js';
import { useServerCall } from 'lib/utils/action-utils.js';

import { useSelector } from '../../redux/redux-utils.js';

type Props = {
  +searchText: string,
};

function AddUsersList(props: Props): React.Node {
  const { searchText } = props;

  const userStoreSearchIndex = useSelector(userStoreSearchIndexSelector);
  const [userStoreSearchResults, setUserStoreSearchResults] = React.useState<
    $ReadOnlySet<string>,
  >(new Set(userStoreSearchIndex.getSearchResults(searchText)));
  React.useEffect(() => {
    setUserStoreSearchResults(
      new Set(userStoreSearchIndex.getSearchResults(searchText)),
    );
  }, [searchText, userStoreSearchIndex]);

  const [serverSearchResults, setServerSearchResults] = React.useState<
    $ReadOnlyArray<GlobalAccountUserInfo>,
  >([]);
  const callSearchUsers = useServerCall(searchUsers);
  React.useEffect(() => {
    (async () => {
      if (searchText.length === 0) {
        setServerSearchResults([]);
      } else {
        const { userInfos } = await callSearchUsers(searchText);
        setServerSearchResults(userInfos);
      }
    })();
  }, [callSearchUsers, searchText]);

  const searchTextPresent = searchText.length > 0;
  const userInfos = useSelector(state => state.userStore.userInfos);
  const mergedUserInfos = React.useMemo(() => {
    const mergedInfos = {};

    for (const userInfo of serverSearchResults) {
      mergedInfos[userInfo.id] = userInfo;
    }

    const userStoreUserIDs = searchTextPresent
      ? userStoreSearchResults
      : Object.keys(userInfos);
    for (const id of userStoreUserIDs) {
      const { username, relationshipStatus } = userInfos[id];
      if (username) {
        mergedInfos[id] = { id, username, relationshipStatus };
      }
    }

    return mergedInfos;
  }, [
    searchTextPresent,
    serverSearchResults,
    userInfos,
    userStoreSearchResults,
  ]);

  // eslint-disable-next-line no-unused-vars
  const sortedUsers = React.useMemo(() => {
    const users = [];
    for (const userID in mergedUserInfos) {
      users.push(mergedUserInfos[userID]);
    }
    return users.sort((user1, user2) =>
      user1.username.localeCompare(user2.username),
    );
  }, [mergedUserInfos]);

  return null;
}

export default AddUsersList;
