// @flow

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import {
  disableAppActionType,
  enableAppActionType,
} from 'lib/reducers/enabled-apps-reducer';
import type { SupportedApps } from 'lib/types/enabled-apps';

import SWMansionIcon from '../SWMansionIcon.react';
import css from './apps.css';

type Props = {
  +id: SupportedApps | 'chat',
  +readOnly: boolean,
  +enabled: boolean,
  +name: string,
  +icon: 'message-square' | 'calendar',
  +copy: string,
};

function AppListing(props: Props): React.Node {
  const { id, readOnly, enabled, name, icon, copy } = props;
  const dispatch = useDispatch();

  const enableApp = React.useCallback(
    () => dispatch({ type: enableAppActionType, payload: id }),
    [dispatch, id],
  );

  const disableApp = React.useCallback(() => {
    dispatch({ type: disableAppActionType, payload: id });
  }, [dispatch, id]);

  const actionButton = React.useMemo(() => {
    const switchIcon = enabled ? faCheckCircle : faPlusCircle;
    if (readOnly) {
      const readOnlyIconClasses = classnames(
        css.appListingIconState,
        css.iconReadOnly,
      );
      return (
        <div className={readOnlyIconClasses}>
          <FontAwesomeIcon icon={switchIcon} />
        </div>
      );
    }
    const iconClasses = classnames(css.appListingIconState, {
      [css.iconEnabled]: enabled,
      [css.iconDisabled]: !enabled,
    });
    return (
      <div className={iconClasses} onClick={enabled ? disableApp : enableApp}>
        <FontAwesomeIcon icon={enabled ? faCheckCircle : faPlusCircle} />
      </div>
    );
  }, [readOnly, disableApp, enableApp, enabled]);
  return (
    <div className={css.appListingContainer}>
      <div className={css.appListingIcon}>
        <SWMansionIcon icon={icon} size={20} />
      </div>
      <div className={css.appListingTextContainer}>
        <h5 className={css.appName}>{name}</h5>
        <small className={css.appCopy}>{copy}</small>
      </div>
      {actionButton}
    </div>
  );
}

export default AppListing;
