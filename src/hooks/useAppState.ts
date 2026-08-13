import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  AppStorage,
  JournalEntry,
  Note,
  MorningEntry,
  EveningEntry,
  DayEntries,
} from '../types';
import {
  createInitialStorage,
  computeRuleStatuses,
  activateRule,
  integrateRule,
} from '../utils/rules';
import { todayKey } from '../utils/date';
import { hapticSuccess } from '../utils/haptics';

const STORAGE_KEY = 'philosophia-activa';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useAppState(options?: {
  onStorageChange?: (storage: AppStorage) => void;
}) {
  const onChange = options?.onStorageChange;
  const [storage, setStorage] = useLocalStorage<AppStorage>(
    STORAGE_KEY,
    { ...createInitialStorage(), onboardingCompleted: false },
  );

  const ruleStatuses = useMemo(
    () => computeRuleStatuses(storage.ruleStatuses),
    [storage.ruleStatuses],
  );

  const today = todayKey();

  const todayEntry = useMemo(
    () => storage.journal.find((e) => e.date === today),
    [storage.journal, today],
  );

  const persist = useCallback(
    (value: AppStorage | ((prev: AppStorage) => AppStorage)) => {
      setStorage((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        onChange?.(next);
        return next;
      });
    },
    [setStorage, onChange],
  );

  const upsertToday = useCallback(
    (patch: Partial<JournalEntry>) => {
      persist((prev) => {
        const idx = prev.journal.findIndex((e) => e.date === today);
        const existing = idx >= 0 ? prev.journal[idx] : { date: today };
        const updated = { ...existing, ...patch };
        const journal =
          idx >= 0
            ? prev.journal.map((e, i) => (i === idx ? updated : e))
            : [...prev.journal, updated];
        return { ...prev, journal };
      });
    },
    [persist, today],
  );

  const saveMorning = useCallback(
    (entry: MorningEntry) => {
      upsertToday({ morning: entry });
      hapticSuccess();
    },
    [upsertToday],
  );

  const saveDayPractice = useCallback(
    (key: keyof DayEntries, entry: DayEntries[keyof DayEntries]) => {
      persist((prev) => {
        const idx = prev.journal.findIndex((e) => e.date === today);
        const existing = idx >= 0 ? prev.journal[idx] : { date: today };
        const day = { ...existing.day, [key]: entry };
        const updated = { ...existing, day };
        const journal =
          idx >= 0
            ? prev.journal.map((e, i) => (i === idx ? updated : e))
            : [...prev.journal, updated];
        return { ...prev, journal };
      });
      hapticSuccess();
    },
    [persist, today],
  );

  const saveEvening = useCallback(
    (entry: EveningEntry) => {
      upsertToday({ evening: entry });
      hapticSuccess();
    },
    [upsertToday],
  );

  const saveVirtueIntention = useCallback(
    (intention: string) => {
      upsertToday({ virtueIntention: intention });
    },
    [upsertToday],
  );

  const saveMentorChat = useCallback(
    (transcript: string) => {
      upsertToday({ mentorChat: transcript });
      hapticSuccess();
    },
    [upsertToday],
  );

  const completeOnboarding = useCallback(() => {
    persist((prev) => ({ ...prev, onboardingCompleted: true }));
  }, [persist]);

  const activateRuleByNumber = useCallback(
    (n: number) => {
      persist((prev) => ({
        ...prev,
        ruleStatuses: activateRule(prev.ruleStatuses, n),
      }));
      hapticSuccess();
    },
    [persist],
  );

  const integrateRuleByNumber = useCallback(
    (n: number) => {
      persist((prev) => ({
        ...prev,
        ruleStatuses: integrateRule(prev.ruleStatuses, n),
      }));
      hapticSuccess();
    },
    [persist],
  );

  const addNote = useCallback(
    (note: Omit<Note, 'id' | 'createdAt'>) => {
      const newNote: Note = {
        ...note,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      persist((prev) => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));
      hapticSuccess();
      return newNote.id;
    },
    [persist],
  );

  const removeNote = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        notes: prev.notes.filter((n) => n.id !== id),
      }));
    },
    [persist],
  );

  const replaceStorage = useCallback(
    (next: AppStorage) => {
      setStorage(next);
      onChange?.(next);
    },
    [setStorage, onChange],
  );

  const getEntryByDate = useCallback(
    (date: string) => storage.journal.find((e) => e.date === date),
    [storage.journal],
  );

  const refreshJournal = useCallback(() => {
    persist((prev) => ({ ...prev, journal: [...prev.journal] }));
  }, [persist]);

  return {
    storage,
    ruleStatuses,
    today,
    todayEntry,
    saveMorning,
    saveDayPractice,
    saveEvening,
    saveVirtueIntention,
    saveMentorChat,
    completeOnboarding,
    activateRuleByNumber,
    integrateRuleByNumber,
    addNote,
    removeNote,
    getEntryByDate,
    refreshJournal,
    replaceStorage,
    journal: storage.journal,
    notes: storage.notes,
    onboardingCompleted: storage.onboardingCompleted ?? false,
  };
}

export type AppState = ReturnType<typeof useAppState>;
