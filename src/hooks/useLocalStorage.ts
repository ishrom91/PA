import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppStorage } from '../types';
import { createInitialStorage, computeRuleStatuses } from '../utils/rules';

export function migrateStorage(raw: AppStorage): AppStorage {
  const defaults = createInitialStorage();
  const base: AppStorage = {
    ...defaults,
    ...raw,
    ruleStatuses: raw.ruleStatuses ?? defaults.ruleStatuses,
    journal: raw.journal ?? [],
    notes: raw.notes ?? [],
  };

  if (base.onboardingCompleted == null) {
    base.onboardingCompleted = base.journal.length > 0;
  }

  return {
    ...base,
    ruleStatuses: computeRuleStatuses(base.ruleStatuses),
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const read = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item) as T;
      if (key === 'philosophia-activa') {
        return migrateStorage(parsed as AppStorage) as T;
      }
      return parsed;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(read);
  const migrated = useRef(false);

  useEffect(() => {
    if (key === 'philosophia-activa' && !migrated.current) {
      migrated.current = true;
      const item = window.localStorage.getItem(key);
      if (item) {
        try {
          const parsed = migrateStorage(JSON.parse(item) as AppStorage) as T;
          setStoredValue(parsed);
          window.localStorage.setItem(key, JSON.stringify(parsed));
        } catch {
          /* ignore */
        }
      }
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore quota errors */
        }
        return next;
      });
    },
    [key],
  );

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        const parsed = JSON.parse(e.newValue) as T;
        setStoredValue(
          key === 'philosophia-activa' ? (migrateStorage(parsed as AppStorage) as T) : parsed,
        );
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setValue] as const;
}
