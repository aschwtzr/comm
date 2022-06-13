// @flow

import * as React from 'react';

import {
  relationshipActions,
  userRelationshipStatus,
} from 'lib/types/relationship-types.js';

import AddUsersListModal from './add-users-list-modal.react';

type Props = {
  +onClose: () => void,
};

const excludedStatuses = new Set([
  userRelationshipStatus.FRIEND,
  userRelationshipStatus.BLOCKED_VIEWER,
  userRelationshipStatus.BOTH_BLOCKED,
  userRelationshipStatus.REQUEST_SENT,
  userRelationshipStatus.REQUEST_RECEIVED,
]);

function AddFriendsModal(props: Props): React.Node {
  const { onClose } = props;

  return (
    <AddUsersListModal
      closeModal={onClose}
      name="Add Friends"
      excludedStatuses={excludedStatuses}
      confirmButtonLabel="Send Friend Requests"
      relationshipAction={relationshipActions.FRIEND}
    />
  );
}

export default AddFriendsModal;
