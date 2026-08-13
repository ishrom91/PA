import { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useAppState, type AppState } from '../hooks/useAppState';
import { useAuth, maybePushTraining } from './AuthContext';
import type { AppStorage } from '../types';

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, scheduleSync, mergeLocalOnAuth } = useAuth();
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const mergedForUser = useRef<string | null>(null);

  const onStorageChange = useCallback(
    (storage: AppStorage) => {
      if (user) scheduleSync(storage);
    },
    [user, scheduleSync],
  );

  const state = useAppState({ onStorageChange });

  useEffect(() => {
    if (!user) {
      mergedForUser.current = null;
      return;
    }
    if (mergedForUser.current === user.id) return;
    mergedForUser.current = user.id;
    mergeLocalOnAuth(state.storage)
      .then(state.replaceStorage)
      .catch(() => undefined);
  }, [user, mergeLocalOnAuth, state.replaceStorage, state.storage]);

  const saveMorningWithTraining = useCallback(
    (...args: Parameters<typeof state.saveMorning>) => {
      state.saveMorning(...args);
      maybePushTraining('morning', args[0], profileRef.current?.share_for_training ?? false);
    },
    [state],
  );

  const saveEveningWithTraining = useCallback(
    (...args: Parameters<typeof state.saveEvening>) => {
      state.saveEvening(...args);
      maybePushTraining('evening', args[0], profileRef.current?.share_for_training ?? false);
    },
    [state],
  );

  const saveDayWithTraining = useCallback(
    (key: Parameters<typeof state.saveDayPractice>[0], entry: Parameters<typeof state.saveDayPractice>[1]) => {
      state.saveDayPractice(key, entry);
      maybePushTraining(String(key), entry, profileRef.current?.share_for_training ?? false);
    },
    [state],
  );

  const value: AppState = {
    ...state,
    saveMorning: saveMorningWithTraining,
    saveEvening: saveEveningWithTraining,
    saveDayPractice: saveDayWithTraining,
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
}
