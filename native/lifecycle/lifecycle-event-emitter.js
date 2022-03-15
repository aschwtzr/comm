// @flow

import invariant from 'invariant';
import { Platform } from 'react-native';
import NativeEventEmitter from 'react-native/Libraries/EventEmitter/NativeEventEmitter';
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import * as TurboModuleRegistry from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

import type { LifecycleState } from 'lib/types/lifecycle-state-types';

import type { EventSubscription } from '../types/react-native';

interface Spec extends TurboModule {
  +getConstants: () => {
    initialStatus: string,
  };
  +addListener: (eventName: string) => void;
  +removeListeners: (count: number) => void;
}
const AndroidLifecycle = (TurboModuleRegistry.getEnforcing<Spec>(
  'AndroidLifecycle',
): Spec);

type LifecycleEventEmitterArgs = {
  +LIFECYCLE_CHANGE: [{ +status: ?LifecycleState }],
};
class LifecycleEventEmitter extends NativeEventEmitter<LifecycleEventEmitterArgs> {
  currentLifecycleStatus: ?string;

  constructor() {
    super(AndroidLifecycle);
    this.currentLifecycleStatus = AndroidLifecycle.getConstants().initialStatus;
    this.addLifecycleListener(state => {
      this.currentLifecycleStatus = state;
    });
  }

  addLifecycleListener: (
    listener: (state: ?LifecycleState) => void,
  ) => EventSubscription = listener => {
    return this.addListener('LIFECYCLE_CHANGE', event => {
      listener(event.status);
    });
  };
}

let lifecycleEventEmitter;
function getLifecycleEventEmitter(): LifecycleEventEmitter {
  if (lifecycleEventEmitter) {
    return lifecycleEventEmitter;
  }
  invariant(
    Platform.OS === 'android',
    'LifecycleEventEmitter only works on Android',
  );
  lifecycleEventEmitter = new LifecycleEventEmitter();
  return lifecycleEventEmitter;
}

export { getLifecycleEventEmitter };
