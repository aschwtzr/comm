// @flow

import classnames from 'classnames';
import * as React from 'react';

import { useRelationshipCallbacks } from 'lib/hooks/relationship-prompt';
import { userRelationshipStatus } from 'lib/types/relationship-types';

import MenuItem from '../../components/menu-item.react';
import Menu from '../../components/menu.react';
import SWMansionIcon from '../../SWMansionIcon.react';
import css from './friend-list-row.css';
import type { UserRowProps } from './user-list.react';

function FriendListRow(props: UserRowProps): React.Node {
  const { userInfo } = props;

  const { friendUser, unfriendUser } = useRelationshipCallbacks(userInfo.id);
  let buttons = null;
  if (userInfo.relationshipStatus === userRelationshipStatus.REQUEST_SENT) {
    buttons = (
      <button
        className={classnames([css.button, css.destructive])}
        onClick={unfriendUser}
      >
        Cancel request
      </button>
    );
  } else if (
    userInfo.relationshipStatus === userRelationshipStatus.REQUEST_RECEIVED
  ) {
    buttons = (
      <>
        <button className={css.button} onClick={friendUser}>
          Accept
        </button>
        <button
          className={classnames([css.button, css.destructive])}
          onClick={unfriendUser}
        >
          Reject
        </button>
      </>
    );
  } else if (userInfo.relationshipStatus === userRelationshipStatus.FRIEND) {
    buttons = (
      <div className={css.edit_menu}>
        <Menu
          icon={<SWMansionIcon icon="edit" size={22} />}
          variant="member-actions"
        >
          <MenuItem
            key="unfriend"
            text="Unfriend"
            icon="user-cross"
            onClick={unfriendUser}
          />
        </Menu>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.usernameContainer}>{userInfo.username}</div>
      <div className={css.buttons}>{buttons}</div>
    </div>
  );
}

export default FriendListRow;
