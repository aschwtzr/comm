// @flow

import * as React from 'react';
import { useSelector } from 'react-redux';

import AppListing from './app-listing.react';
import css from './apps.css';

const APP_DIRECTORY_DATA = [
  {
    id: 'chat',
    defaultEnabled: true,
    readOnly: true,
    name: 'Chat',
    icon: 'message-square',
    copy: 'Keep in touch with your community',
  },
  {
    id: 'calendar',
    defaultEnabled: true,
    readOnly: false,
    name: 'Calendar',
    icon: 'calendar',
    copy: 'Shared calendar for your community',
  },
];

function AppsDirectory(): React.Node {
  const enabledApps = useSelector(state => state.enabledApps);

  const appData = React.useMemo(
    () =>
      APP_DIRECTORY_DATA.map(app => {
        const { defaultEnabled, ...result } = {
          ...app,
          enabled: enabledApps[app.id] ?? app.defaultEnabled,
        };
        return result;
      }),
    [enabledApps],
  );

  const appItems = React.useMemo(
    () => appData.map(item => <AppListing key={item.id} {...item} />),
    [appData],
  );

  return (
    <div className={css.appsDirectoryContainer}>
      <div className={css.appsHeader}>Choose Apps</div>
      <div className={css.appsDirectoryList}>{appItems}</div>
    </div>
  );
}

export default AppsDirectory;
