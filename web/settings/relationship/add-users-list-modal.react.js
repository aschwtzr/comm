// @flow

import * as React from 'react';

import type {
  UserRelationshipStatus,
  RelationshipAction,
} from 'lib/types/relationship-types.js';

import SearchModal from '../../modals/search-modal.react';
import AddUsersList from './add-users-list.react.js';

type Props = {
  +closeModal: () => void,
  +name: string,
  +excludedStatuses: $ReadOnlySet<UserRelationshipStatus>,
  +confirmButtonLabel: string,
  +relationshipAction: RelationshipAction,
};

function AddUsersListModal(props: Props): React.Node {
  const {
    closeModal,
    name,
    excludedStatuses,
    confirmButtonLabel,
    relationshipAction,
  } = props;

  const addUsersListChildGenerator = React.useCallback(
    (searchText: string) => (
      <AddUsersList
        searchText={searchText}
        excludedStatuses={excludedStatuses}
        confirmButtonLabel={confirmButtonLabel}
        relationshipAction={relationshipAction}
        closeModal={closeModal}
      />
    ),
    [confirmButtonLabel, excludedStatuses, closeModal, relationshipAction],
  );

  return (
    <SearchModal
      name={name}
      onClose={closeModal}
      size="large"
      searchPlaceholder="Search by name"
    >
      {addUsersListChildGenerator}
    </SearchModal>
  );
}

export default AddUsersListModal;
