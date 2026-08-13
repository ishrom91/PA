import { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useAppState, type AppState } from '../hooks/useAppState';
import { useAuth } from './AuthContext';
import { recordAnonymousEvent, TrainingEvent } from '../lib/training-events';
import type { AppStorage } from '../types';
import { todayKey } from '../utils/date';

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, scheduleSync, mergeLocalOnAuth } = useAuth();
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const mergedForUser = useRef<string | null>(null);

  const shareEnabled = () => profileRef.current?.share_for_training ?? false;

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
      recordAnonymousEvent(TrainingEvent.MORNING, args[0], shareEnabled(), {
        entryDate: todayKey(),
      });
    },
    [state],
  );

  const saveEveningWithTraining = useCallback(
    (...args: Parameters<typeof state.saveEvening>) => {
      state.saveEvening(...args);
      recordAnonymousEvent(TrainingEvent.EVENING, args[0], shareEnabled(), {
        entryDate: todayKey(),
      });
    },
    [state],
  );

  const saveDayWithTraining = useCallback(
    (key: Parameters<typeof state.saveDayPractice>[0], entry: Parameters<typeof state.saveDayPractice>[1]) => {
      state.saveDayPractice(key, entry);
      recordAnonymousEvent(String(key), entry, shareEnabled(), { entryDate: todayKey() });
    },
    [state],
  );

  const saveMentorChatWithTraining = useCallback(
    (...args: Parameters<typeof state.saveMentorChat>) => {
      state.saveMentorChat(...args);
      recordAnonymousEvent(TrainingEvent.MENTOR_CHAT, { transcript: args[0] }, shareEnabled(), {
        entryDate: todayKey(),
      });
    },
    [state],
  );

  const saveVirtueIntentionWithTraining = useCallback(
    (...args: Parameters<typeof state.saveVirtueIntention>) => {
      state.saveVirtueIntention(...args);
      recordAnonymousEvent(TrainingEvent.VIRTUE_INTENTION, { intention: args[0] }, shareEnabled(), {
        entryDate: todayKey(),
      });
    },
    [state],
  );

  const addNoteWithTraining = useCallback(
    (...args: Parameters<typeof state.addNote>) => {
      const id = state.addNote(...args);
      recordAnonymousEvent(TrainingEvent.NOTE_ADDED, args[0], shareEnabled());
      return id;
    },
    [state],
  );

  const removeNoteWithTraining = useCallback(
    (...args: Parameters<typeof state.removeNote>) => {
      const note = state.notes.find((n) => n.id === args[0]);
      state.removeNote(...args);
      if (note) {
        recordAnonymousEvent(
          TrainingEvent.NOTE_REMOVED,
          { sectionId: note.sectionId, sectionTitle: note.sectionTitle },
          shareEnabled(),
        );
      }
    },
    [state],
  );

  const activateRuleWithTraining = useCallback(
    (...args: Parameters<typeof state.activateRuleByNumber>) => {
      state.activateRuleByNumber(...args);
      recordAnonymousEvent(
        TrainingEvent.RULE_ACTIVATED,
        { ruleNumber: args[0] },
        shareEnabled(),
      );
    },
    [state],
  );

  const integrateRuleWithTraining = useCallback(
    (...args: Parameters<typeof state.integrateRuleByNumber>) => {
      state.integrateRuleByNumber(...args);
      recordAnonymousEvent(
        TrainingEvent.RULE_INTEGRATED,
        { ruleNumber: args[0] },
        shareEnabled(),
      );
    },
    [state],
  );

  const completeOnboardingWithTraining = useCallback(() => {
    state.completeOnboarding();
    recordAnonymousEvent(TrainingEvent.ONBOARDING_COMPLETE, {}, shareEnabled());
  }, [state]);

  const value: AppState = {
    ...state,
    saveMorning: saveMorningWithTraining,
    saveEvening: saveEveningWithTraining,
    saveDayPractice: saveDayWithTraining,
    saveMentorChat: saveMentorChatWithTraining,
    saveVirtueIntention: saveVirtueIntentionWithTraining,
    addNote: addNoteWithTraining,
    removeNote: removeNoteWithTraining,
    activateRuleByNumber: activateRuleWithTraining,
    integrateRuleByNumber: integrateRuleWithTraining,
    completeOnboarding: completeOnboardingWithTraining,
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
