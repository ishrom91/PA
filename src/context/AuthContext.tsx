import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { AppStorage } from '../types';
import { isSupabaseConfigured, supabase, type Profile } from '../lib/supabase';
import { mergeAppStorage } from '../lib/sync/merge';
import {
  fetchRemoteStorage,
  pushStorageToRemote,
  deleteAllUserData,
  pushTrainingSample,
} from '../lib/sync/remote';
import { anonymizeContent } from '../lib/anonymize';
import { createInitialStorage } from '../utils/rules';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error: string | null }>;
  updateShareForTraining: (value: boolean) => Promise<{ error: string | null }>;
  mergeLocalOnAuth: (local: AppStorage) => Promise<AppStorage>;
  scheduleSync: (storage: AppStorage) => void;
  syncNow: (storage: AppStorage) => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const syncTimer = useRef<number | undefined>(undefined);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const refreshProfile = useCallback(async () => {
    if (!user || !supabase) return;
    const p = await loadProfile(user.id);
    setProfile(p);
  }, [user]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    loadProfile(user.id)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase не настроен' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!supabase) return { error: 'Supabase не настроен' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName ?? email.split('@')[0] } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Supabase не настроен' };
    const redirectTo = `${window.location.origin}/login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error?.message ?? null };
  }, []);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!supabase || !user) return { error: 'Не авторизован' };
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: name.trim() })
        .eq('id', user.id);
      if (!error) await refreshProfile();
      return { error: error?.message ?? null };
    },
    [user, refreshProfile],
  );

  const updateShareForTraining = useCallback(
    async (value: boolean) => {
      if (!supabase || !user) return { error: 'Не авторизован' };
      const { error } = await supabase
        .from('profiles')
        .update({ share_for_training: value })
        .eq('id', user.id);
      if (!error) await refreshProfile();
      return { error: error?.message ?? null };
    },
    [user, refreshProfile],
  );

  const syncNow = useCallback(
    async (storage: AppStorage) => {
      if (!user) return;
      await pushStorageToRemote(user.id, storage);
    },
    [user],
  );

  const scheduleSync = useCallback(
    (storage: AppStorage) => {
      if (!user) return;
      window.clearTimeout(syncTimer.current);
      syncTimer.current = window.setTimeout(async () => {
        try {
          await pushStorageToRemote(user.id, storage);
        } catch {
          /* offline — local copy remains source of truth */
        }
      }, 800);
    },
    [user],
  );

  const mergeLocalOnAuth = useCallback(
    async (local: AppStorage) => {
      if (!user) return local;
      const base = { ...createInitialStorage(), ...local };
      const remote = await fetchRemoteStorage(user.id, base);
      const merged = mergeAppStorage(local, remote);
      await pushStorageToRemote(user.id, merged);
      return merged;
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    if (!user) return { error: 'Не авторизован' };
    try {
      await deleteAllUserData(user.id);
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Не удалось удалить аккаунт');
      }
      await signOut();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Ошибка удаления' };
    }
  }, [user, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
      updateDisplayName,
      updateShareForTraining,
      mergeLocalOnAuth,
      scheduleSync,
      syncNow,
      deleteAccount,
    }),
    [
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
      updateDisplayName,
      updateShareForTraining,
      mergeLocalOnAuth,
      scheduleSync,
      syncNow,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Called after journal save when share_for_training is on */
export async function maybePushTraining(
  practiceType: string,
  content: unknown,
  shareEnabled: boolean,
): Promise<void> {
  if (!shareEnabled) return;
  await pushTrainingSample(practiceType, anonymizeContent(content));
}
