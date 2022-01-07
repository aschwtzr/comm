// @flow

import classNames from 'classnames';
import invariant from 'invariant';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import {
  createEntryActionTypes,
  createEntry,
  saveEntryActionTypes,
  saveEntry,
  deleteEntryActionTypes,
  deleteEntry,
  concurrentModificationResetActionType,
} from 'lib/actions/entry-actions';
import { threadInfoSelector } from 'lib/selectors/thread-selectors';
import { entryKey } from 'lib/shared/entry-utils';
import { colorIsDark, threadHasPermission } from 'lib/shared/thread-utils';
import type { Shape } from 'lib/types/core';
import {
  type EntryInfo,
  type SaveEntryInfo,
  type CalendarQuery,
} from 'lib/types/entry-types';
import {
  type CreateEntryInfo,
  type SaveEntryResult,
  type SaveEntryPayload,
  type CreateEntryPayload,
  type DeleteEntryInfo,
  type DeleteEntryResult,
} from 'lib/types/entry-types-api';
import type { LoadingStatus } from 'lib/types/loading-types';
import type { Dispatch } from 'lib/types/redux-types';
import { threadPermissions } from 'lib/types/thread-types';
import type { ThreadInfo } from 'lib/types/thread-types';
import {
  type DispatchActionPromise,
  useServerCall,
  useDispatchActionPromise,
} from 'lib/utils/action-utils';
import { dateString } from 'lib/utils/date-utils';
import { ServerError } from 'lib/utils/errors';

import LoadingIndicator from '../loading-indicator.react';
import LogInFirstModal from '../modals/account/log-in-first-modal.react';
import ConcurrentModificationModal from '../modals/concurrent-modification-modal.react';
import HistoryModal from '../modals/history/history-modal.react';
import { useSelector } from '../redux/redux-utils';
import { nonThreadCalendarQuery } from '../selectors/nav-selectors';
import { HistoryVector, DeleteVector } from '../vectors.react';
import css from './calendar.css';

type BaseProps = {
  +innerRef: (key: string, me: Entry) => void,
  +entryInfo: EntryInfo,
  +focusOnFirstEntryNewerThan: (time: number) => void,
  +setModal: (modal: ?React.Node) => void,
  +tabIndex: number,
};
type Props = {
  ...BaseProps,
  +threadInfo: ThreadInfo,
  +loggedIn: boolean,
  +calendarQuery: () => CalendarQuery,
  +online: boolean,
  +dispatch: Dispatch,
  +dispatchActionPromise: DispatchActionPromise,
  +createEntry: (info: CreateEntryInfo) => Promise<CreateEntryPayload>,
  +saveEntry: (info: SaveEntryInfo) => Promise<SaveEntryResult>,
  +deleteEntry: (info: DeleteEntryInfo) => Promise<DeleteEntryResult>,
};
type State = {
  +focused: boolean,
  +loadingStatus: LoadingStatus,
  +text: string,
};
class Entry extends React.PureComponent<Props, State> {
  textarea: ?HTMLTextAreaElement;
  creating: boolean;
  needsUpdateAfterCreation: boolean;
  needsDeleteAfterCreation: boolean;
  nextSaveAttemptIndex: number;
  mounted: boolean;
  currentlySaving: ?string;

  constructor(props: Props) {
    super(props);
    this.state = {
      focused: false,
      loadingStatus: 'inactive',
      text: props.entryInfo.text,
    };
    this.creating = false;
    this.needsUpdateAfterCreation = false;
    this.needsDeleteAfterCreation = false;
    this.nextSaveAttemptIndex = 0;
  }

  guardedSetState(input: Shape<State>) {
    if (this.mounted) {
      this.setState(input);
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.props.innerRef(entryKey(this.props.entryInfo), this);
    this.updateHeight();
    // Whenever a new Entry is created, focus on it
    if (!this.props.entryInfo.id) {
      this.focus();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      !this.state.focused &&
      this.props.entryInfo.text !== this.state.text &&
      this.props.entryInfo.text !== prevProps.entryInfo.text
    ) {
      this.setState({ text: this.props.entryInfo.text });
      this.currentlySaving = null;
    }

    if (
      this.props.online &&
      !prevProps.online &&
      this.state.loadingStatus === 'error'
    ) {
      this.save();
    }
  }

  focus() {
    invariant(
      this.textarea instanceof HTMLTextAreaElement,
      'textarea ref not set',
    );
    this.textarea.focus();
  }

  onMouseDown: (event: SyntheticEvent<HTMLDivElement>) => void = event => {
    if (this.state.focused && event.target !== this.textarea) {
      // Don't lose focus when some non-textarea part is clicked
      event.preventDefault();
    }
  };

  componentWillUnmount() {
    this.mounted = false;
  }

  updateHeight() {
    invariant(
      this.textarea instanceof HTMLTextAreaElement,
      'textarea ref not set',
    );
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }

  render(): React.Node {
    let actionLinks = null;
    if (this.state.focused) {
      let historyButton = null;
      if (this.props.entryInfo.id) {
        historyButton = (
          <a href="#" onClick={this.onHistory}>
            <HistoryVector className={css.history} />
            <span className={css.actionLinksText}>History</span>
          </a>
        );
      }
      const rightActionLinksClassName = `${css.rightActionLinks} ${css.actionLinksText}`;
      actionLinks = (
        <div className={css.actionLinks}>
          <a href="#" onClick={this.onDelete}>
            <DeleteVector />
            <span className={css.actionLinksText}>Delete</span>
          </a>
          {historyButton}
          <span className={rightActionLinksClassName}>
            {this.props.threadInfo.uiName}
          </span>
          <div className={css.clear}></div>
        </div>
      );
    }

    const darkColor = colorIsDark(this.props.threadInfo.color);
    const entryClasses = classNames({
      [css.entry]: true,
      [css.darkEntry]: darkColor,
      [css.focusedEntry]: this.state.focused,
    });
    const style = { backgroundColor: '#' + this.props.threadInfo.color };
    const loadingIndicatorColor = darkColor ? 'white' : 'black';
    const canEditEntry = threadHasPermission(
      this.props.threadInfo,
      threadPermissions.EDIT_ENTRIES,
    );
    return (
      <div
        className={entryClasses}
        style={style}
        onMouseDown={this.onMouseDown}
      >
        <textarea
          rows="1"
          className={css.entryText}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          value={this.state.text}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          tabIndex={this.props.tabIndex}
          ref={this.textareaRef}
          disabled={!canEditEntry}
        />
        <LoadingIndicator
          status={this.state.loadingStatus}
          color={loadingIndicatorColor}
          loadingClassName={css.entryLoading}
          errorClassName={css.entryError}
        />
        {actionLinks}
      </div>
    );
  }

  textareaRef: (textarea: ?HTMLTextAreaElement) => void = textarea => {
    this.textarea = textarea;
  };

  onFocus: () => void = () => {
    if (!this.state.focused) {
      this.setState({ focused: true });
    }
  };

  onBlur: () => void = () => {
    this.setState({ focused: false });
    if (this.state.text.trim() === '') {
      this.delete();
    } else if (this.props.entryInfo.text !== this.state.text) {
      this.save();
    }
  };

  delete() {
    this.dispatchDelete(this.props.entryInfo.id, false);
  }

  save() {
    this.dispatchSave(this.props.entryInfo.id, this.state.text);
  }

  onChange: (event: SyntheticEvent<HTMLTextAreaElement>) => void = event => {
    if (!this.props.loggedIn) {
      this.props.setModal(
        <LogInFirstModal
          inOrderTo="edit this calendar"
          setModal={this.props.setModal}
        />,
      );
      return;
    }
    const target = event.target;
    invariant(target instanceof HTMLTextAreaElement, 'target not textarea');
    this.setState({ text: target.value }, this.updateHeight.bind(this));
  };

  onKeyDown: (
    event: SyntheticKeyboardEvent<HTMLTextAreaElement>,
  ) => void = event => {
    if (event.keyCode === 27) {
      invariant(
        this.textarea instanceof HTMLTextAreaElement,
        'textarea ref not set',
      );
      this.textarea.blur();
    }
  };

  dispatchSave(serverID: ?string, newText: string) {
    if (this.currentlySaving === newText) {
      return;
    }
    this.currentlySaving = newText;

    if (newText.trim() === '') {
      // We don't save the empty string, since as soon as the element loses
      // focus it'll get deleted
      return;
    }

    if (!serverID) {
      if (this.creating) {
        // We need the first save call to return so we know the ID of the entry
        // we're updating, so we'll need to handle this save later
        this.needsUpdateAfterCreation = true;
        return;
      } else {
        this.creating = true;
      }
    }

    if (!serverID) {
      this.props.dispatchActionPromise(
        createEntryActionTypes,
        this.createAction(newText),
      );
    } else {
      this.props.dispatchActionPromise(
        saveEntryActionTypes,
        this.saveAction(serverID, newText),
      );
    }
  }

  async createAction(text: string): Promise<CreateEntryPayload> {
    const localID = this.props.entryInfo.localID;
    invariant(localID, "if there's no serverID, there should be a localID");
    const curSaveAttempt = this.nextSaveAttemptIndex++;
    this.guardedSetState({ loadingStatus: 'loading' });
    try {
      const response = await this.props.createEntry({
        text,
        timestamp: this.props.entryInfo.creationTime,
        date: dateString(
          this.props.entryInfo.year,
          this.props.entryInfo.month,
          this.props.entryInfo.day,
        ),
        threadID: this.props.entryInfo.threadID,
        localID,
        calendarQuery: this.props.calendarQuery(),
      });
      if (curSaveAttempt + 1 === this.nextSaveAttemptIndex) {
        this.guardedSetState({ loadingStatus: 'inactive' });
      }
      this.creating = false;
      if (this.needsUpdateAfterCreation) {
        this.needsUpdateAfterCreation = false;
        this.dispatchSave(response.entryID, this.state.text);
      }
      if (this.needsDeleteAfterCreation) {
        this.needsDeleteAfterCreation = false;
        this.dispatchDelete(response.entryID, false);
      }
      return response;
    } catch (e) {
      if (curSaveAttempt + 1 === this.nextSaveAttemptIndex) {
        this.guardedSetState({ loadingStatus: 'error' });
      }
      this.currentlySaving = null;
      this.creating = false;
      throw e;
    }
  }

  async saveAction(
    entryID: string,
    newText: string,
  ): Promise<SaveEntryPayload> {
    const curSaveAttempt = this.nextSaveAttemptIndex++;
    this.guardedSetState({ loadingStatus: 'loading' });
    try {
      const response = await this.props.saveEntry({
        entryID,
        text: newText,
        prevText: this.props.entryInfo.text,
        timestamp: Date.now(),
        calendarQuery: this.props.calendarQuery(),
      });
      if (curSaveAttempt + 1 === this.nextSaveAttemptIndex) {
        this.guardedSetState({ loadingStatus: 'inactive' });
      }
      return { ...response, threadID: this.props.entryInfo.threadID };
    } catch (e) {
      if (curSaveAttempt + 1 === this.nextSaveAttemptIndex) {
        this.guardedSetState({ loadingStatus: 'error' });
      }
      this.currentlySaving = null;
      if (e instanceof ServerError && e.message === 'concurrent_modification') {
        const onRefresh = () => {
          this.setState(
            { loadingStatus: 'inactive' },
            this.updateHeight.bind(this),
          );
          this.props.dispatch({
            type: concurrentModificationResetActionType,
            payload: { id: entryID, dbText: e.payload.db },
          });
          this.clearModal();
        };
        this.props.setModal(
          <ConcurrentModificationModal
            onClose={this.clearModal}
            onRefresh={onRefresh}
          />,
        );
      }
      throw e;
    }
  }

  onDelete: (event: SyntheticEvent<HTMLAnchorElement>) => void = event => {
    event.preventDefault();
    if (!this.props.loggedIn) {
      this.props.setModal(
        <LogInFirstModal
          inOrderTo="edit this calendar"
          setModal={this.props.setModal}
        />,
      );
      return;
    }
    this.dispatchDelete(this.props.entryInfo.id, true);
  };

  dispatchDelete(serverID: ?string, focusOnNextEntry: boolean) {
    const { localID } = this.props.entryInfo;
    this.props.dispatchActionPromise(
      deleteEntryActionTypes,
      this.deleteAction(serverID, focusOnNextEntry),
      undefined,
      { localID, serverID },
    );
  }

  async deleteAction(
    serverID: ?string,
    focusOnNextEntry: boolean,
  ): Promise<?DeleteEntryResult> {
    invariant(
      this.props.loggedIn,
      'user should be logged in if delete triggered',
    );
    if (focusOnNextEntry) {
      this.props.focusOnFirstEntryNewerThan(this.props.entryInfo.creationTime);
    }
    if (serverID) {
      return await this.props.deleteEntry({
        entryID: serverID,
        prevText: this.props.entryInfo.text,
        calendarQuery: this.props.calendarQuery(),
      });
    } else if (this.creating) {
      this.needsDeleteAfterCreation = true;
    }
    return null;
  }

  onHistory: (event: SyntheticEvent<HTMLAnchorElement>) => void = event => {
    event.preventDefault();
    this.props.setModal(
      <HistoryModal
        mode="entry"
        dayString={dateString(
          this.props.entryInfo.year,
          this.props.entryInfo.month,
          this.props.entryInfo.day,
        )}
        onClose={this.clearModal}
        currentEntryID={this.props.entryInfo.id}
      />,
    );
  };

  clearModal: () => void = () => {
    this.props.setModal(null);
  };
}

export type InnerEntry = Entry;

const ConnectedEntry: React.ComponentType<BaseProps> = React.memo<BaseProps>(
  function ConnectedEntry(props) {
    const { threadID } = props.entryInfo;
    const threadInfo = useSelector(
      state => threadInfoSelector(state)[threadID],
    );
    const loggedIn = useSelector(
      state =>
        !!(state.currentUserInfo && !state.currentUserInfo.anonymous && true),
    );
    const calanderQuery = useSelector(nonThreadCalendarQuery);
    const online = useSelector(
      state => state.connection.status === 'connected',
    );
    const callCreateEntry = useServerCall(createEntry);
    const callSaveEntry = useServerCall(saveEntry);
    const callDeleteEntry = useServerCall(deleteEntry);
    const dispatchActionPromise = useDispatchActionPromise();
    const dispatch = useDispatch();

    return (
      <Entry
        {...props}
        threadInfo={threadInfo}
        loggedIn={loggedIn}
        calendarQuery={calanderQuery}
        online={online}
        createEntry={callCreateEntry}
        saveEntry={callSaveEntry}
        deleteEntry={callDeleteEntry}
        dispatchActionPromise={dispatchActionPromise}
        dispatch={dispatch}
      />
    );
  },
);

export default ConnectedEntry;
