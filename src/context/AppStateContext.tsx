import { createContext, useContext } from 'react';
import { useAppState, type AppState } from '../hooks/useAppState';

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  return (
    <AppStateContext.Provider value={state}>{children}</AppStateContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
}
