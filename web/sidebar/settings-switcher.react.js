// @flow

import * as React from 'react';
import { useDispatch } from 'react-redux';

import type { AppState } from '../redux/redux-setup.js';
import { updateNavInfoActionType } from '../types/nav-types';
import css from './left-layout-aside.css';
import NavigationPanel from './navigation-panel.react';

function tabSelector(state: AppState) {
  return state.navInfo.settingsSection;
}

function SettingsSwitcher(): React.Node {
  const dispatch = useDispatch();
  const onClickAccountSettings = React.useCallback(
    (event: SyntheticEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      dispatch({
        type: updateNavInfoActionType,
        payload: { tab: 'settings', settingsSection: 'account' },
      });
    },
    [dispatch],
  );

  const accountSettingsNavigationItem = React.useMemo(
    () => (
      <div className={css.navigationPanelTab} onClick={onClickAccountSettings}>
        <p>My Account</p>
      </div>
    ),
    [onClickAccountSettings],
  );

  return (
    <NavigationPanel.Container tabSelector={tabSelector}>
      <NavigationPanel.Item tab="account">
        {accountSettingsNavigationItem}
      </NavigationPanel.Item>
    </NavigationPanel.Container>
  );
}

export default SettingsSwitcher;
