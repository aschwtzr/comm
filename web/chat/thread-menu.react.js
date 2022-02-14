// @flow

import {
  faArrowRight,
  faBell,
  faCog,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import * as React from 'react';

import { childThreadInfos } from 'lib/selectors/thread-selectors';
import { type ThreadInfo, threadTypes } from 'lib/types/thread-types';

import { useSelector } from '../redux/redux-utils';
import SWMansionIcon from '../SWMansionIcon.react';
import ThreadMenuItem from './thread-menu-item.react';
import css from './thread-menu.css';

type ThreadMenuProps = {
  +threadInfo: ThreadInfo,
};

function ThreadMenu(props: ThreadMenuProps): React.Node {
  const [isOpen, setIsOpen] = React.useState(false);

  const { threadInfo } = props;

  const settingsItem = React.useMemo(
    () => <ThreadMenuItem key="settings" text="Settings" icon={faCog} />,
    [],
  );

  const notificatiosItem = React.useMemo(
    () => (
      <ThreadMenuItem key="notifications" text="Notifications" icon={faBell} />
    ),
    [],
  );

  const childThreads = useSelector(
    state => childThreadInfos(state)[threadInfo.id],
  );

  const membersItem = React.useMemo(() => {
    if (threadInfo.type === threadTypes.PERSONAL) {
      return null;
    }
    return <ThreadMenuItem key="members" text="Members" icon={faUserFriends} />;
  }, [threadInfo.type]);

  const hasSidebars = React.useMemo(() => {
    const sidebars =
      childThreads?.filter(
        childThreadInfo => childThreadInfo.type === threadTypes.SIDEBAR,
      ) ?? [];
    return sidebars.length > 0;
  }, [childThreads]);

  const sidebarItem = React.useMemo(() => {
    if (!hasSidebars) {
      return null;
    }
    return (
      <ThreadMenuItem key="sidebars" text="Sidebars" icon={faArrowRight} />
    );
  }, [hasSidebars]);

  const menuItems = React.useMemo(() => {
    const items = [settingsItem, notificatiosItem, membersItem, sidebarItem];
    return items.filter(Boolean);
  }, [notificatiosItem, settingsItem, membersItem, sidebarItem]);

  const menuActionListClasses = classNames(css.topBarMenuActionList, {
    [css.disabled]: !isOpen,
  });

  const closeMenuCallback = React.useCallback(() => {
    document.removeEventListener('click', closeMenuCallback);
    if (isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!document || !isOpen) {
      return undefined;
    }
    document.addEventListener('click', closeMenuCallback);
    return () => document.removeEventListener('click', closeMenuCallback);
  }, [closeMenuCallback, isOpen]);

  const switchMenuCallback = React.useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div>
      <button className={css.topBarMenuButton} onClick={switchMenuCallback}>
        <SWMansionIcon icon="menu-vertical" size={20} />
      </button>
      <div className={menuActionListClasses}>{menuItems}</div>
    </div>
  );
}

export default ThreadMenu;
