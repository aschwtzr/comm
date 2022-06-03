// @flow

import * as React from 'react';

import Button from '../../components/button.react.js';
import { useModalContext } from '../../modals/modal-provider.react';
import Modal from '../modal.react';
import css from './invalid-upload.css';

function InvalidUploadModal(): React.Node {
  const modalContext = useModalContext();
  return (
    <Modal name="Invalid upload" onClose={modalContext.popModal}>
      <div className={css.modal_body}>
        <p>We don&apos;t support that file type yet :(</p>
        <Button
          onClick={modalContext.popModal}
          type="submit"
          variant="primary"
          className={css.ok_button}
        >
          OK
        </Button>
      </div>
    </Modal>
  );
}

export default InvalidUploadModal;
