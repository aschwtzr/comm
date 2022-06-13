// @flow

import * as React from 'react';

import {
  relationshipActions,
  userRelationshipStatus,
} from 'lib/types/relationship-types.js';

import AddUsersListModal from './add-users-list-modal.react.js';

type Props = {
  +onClose: () => void,
};

const excludedStatuses = new Set([
  userRelationshipStatus.BOTH_BLOCKED,
  userRelationshipStatus.BLOCKED_BY_VIEWER,
]);

function BlockUsersModal(props: Props): React.Node {
  const { onClose } = props;

  return (
    <AddUsersListModal
      closeModal={onClose}
      name="Block Users"
      excludedStatuses={excludedStatuses}
      confirmButtonLabel="Block Users"
      relationshipAction={relationshipActions.BLOCK}
    />
  );
}

export default BlockUsersModal;
