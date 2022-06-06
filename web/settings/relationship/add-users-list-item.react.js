// @flow

import * as React from 'react';

import type { AccountUserInfo } from 'lib/types/user-types.js';

import css from './add-users-list.css';

type Props = {
  +userInfo: AccountUserInfo,
  +selectUser: (userID: string) => mixed,
};

function AddUsersListItem(props: Props): React.Node {
  const { userInfo, selectUser } = props;
  const onClick = React.useCallback(() => selectUser(userInfo.id), [
    selectUser,
    userInfo.id,
  ]);
  return (
    <button className={css.addUserButton} onClick={onClick}>
      <div className={css.addUserButtonUsername}>{userInfo.username}</div>
      add
    </button>
  );
}

export default AddUsersListItem;
