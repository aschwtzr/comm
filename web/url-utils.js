// @flow

import invariant from 'invariant';

import {
  startDateForYearAndMonth,
  endDateForYearAndMonth,
} from 'lib/utils/date-utils';
import { infoFromURL } from 'lib/utils/url-utils';

import { yearExtractor, monthExtractor } from './selectors/nav-selectors';
import type { NavInfo } from './types/nav-types';

function canonicalURLFromReduxState(
  navInfo: NavInfo,
  currentURL: string,
  loggedIn: boolean,
): string {
  const urlInfo = infoFromURL(currentURL);
  const today = new Date();
  let newURL = `/`;

  if (loggedIn) {
    if (navInfo.tab === 'calendar') {
      newURL += `${navInfo.tab}/`;
      const { startDate, endDate } = navInfo;
      const year = yearExtractor(startDate, endDate);
      if (urlInfo.year !== undefined) {
        invariant(
          year !== null && year !== undefined,
          `${startDate} and ${endDate} aren't in the same year`,
        );
        newURL += `year/${year}/`;
      } else if (
        year !== null &&
        year !== undefined &&
        year !== today.getFullYear()
      ) {
        newURL += `year/${year}/`;
      }

      const month = monthExtractor(startDate, endDate);
      if (urlInfo.month !== undefined) {
        invariant(
          month !== null && month !== undefined,
          `${startDate} and ${endDate} aren't in the same month`,
        );
        newURL += `month/${month}/`;
      } else if (
        month !== null &&
        month !== undefined &&
        month !== today.getMonth() + 1
      ) {
        newURL += `month/${month}/`;
      }
    } else if (navInfo.tab === 'chat') {
      newURL += `${navInfo.tab}/`;
      const activeChatThreadID = navInfo.activeChatThreadID;
      if (activeChatThreadID) {
        newURL += `thread/${activeChatThreadID}/`;
      }
    } else if (navInfo.tab === 'chat-creation') {
      newURL += `chat/`;
      const users = navInfo.selectedUserList?.join(',') ?? '';
      newURL += `thread/new/${users}`;
      if (users.length) {
        newURL += `/`;
      }
    } else if (navInfo.tab === 'settings' && navInfo.settingsSection) {
      newURL += `${navInfo.tab}/`;
      newURL += `${navInfo.settingsSection}/`;
    } else {
      newURL += `${navInfo.tab}/`;
    }
  }

  return newURL;
}

// Given a URL, this function parses out a navInfo object, leaving values as
// default if they are unspecified.
function navInfoFromURL(
  url: string,
  backupInfo: { now?: Date, navInfo?: NavInfo },
): NavInfo {
  const urlInfo = infoFromURL(url);
  const { navInfo } = backupInfo;
  const now = backupInfo.now ? backupInfo.now : new Date();

  let year = urlInfo.year;
  if (!year && navInfo) {
    year = yearExtractor(navInfo.startDate, navInfo.endDate);
  }
  if (!year) {
    year = now.getFullYear();
  }

  let month = urlInfo.month;
  if (!month && navInfo) {
    month = monthExtractor(navInfo.startDate, navInfo.endDate);
  }
  if (!month) {
    month = now.getMonth() + 1;
  }

  let activeChatThreadID = null;
  if (urlInfo.thread) {
    activeChatThreadID = urlInfo.thread.toString();
  } else if (navInfo) {
    activeChatThreadID = navInfo.activeChatThreadID;
  }

  let tab = 'chat';
  if (urlInfo.calendar) {
    tab = 'calendar';
  } else if (urlInfo.apps) {
    tab = 'apps';
  } else if (urlInfo.settings) {
    tab = 'settings';
  } else if (urlInfo.threadCreation) {
    tab = 'chat-creation';
  }

  let newNavInfo = {
    tab,
    startDate: startDateForYearAndMonth(year, month),
    endDate: endDateForYearAndMonth(year, month),
    activeChatThreadID,
  };

  if (urlInfo.selectedUserList) {
    newNavInfo = {
      ...newNavInfo,
      selectedUserList: urlInfo.selectedUserList,
    };
  }

  if (!urlInfo.settings) {
    return newNavInfo;
  }

  return {
    ...newNavInfo,
    settingsSection: urlInfo.settings,
  };
}

export { canonicalURLFromReduxState, navInfoFromURL };
