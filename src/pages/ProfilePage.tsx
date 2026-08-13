import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppStateContext';
import { countIntegrated } from '../utils/rules';
import { formatSyncAgo } from '../utils/date';
import NotesSection from '../components/NotesSection';
import ProfileNavRow from '../components/ProfileNavRow';
import { IconJournal, IconSun } from '../components/Icons';

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading,
    isConfigured,
    signOut,
    updateDisplayName,
    updateShareForTraining,
    deleteAccount,
    syncNow,
    lastSyncedAt,
    syncing,
  } = useAuth();
  const { storage, journal, notes, ruleStatuses } = useApp();

  const [name, setName] = useState(profile?.display_name ?? '');
  const [share, setShare] = useState(profile?.share_for_training ?? false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [busy, setBusy] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    setName(profile?.display_name ?? '');
    setShare(profile?.share_for_training ?? false);
  }, [profile]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading]);

  useEffect(() => {
    if (!lastSyncedAt) return;
    const id = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, [lastSyncedAt]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const practiceDays = new Set(
    journal
      .filter((e) => e.morning || e.evening || (e.day && Object.keys(e.day).length) || e.mentorChat)
      .map((e) => e.date),
  ).size;

  const totalEntries = journal.reduce((acc, e) => {
    let n = 0;
    if (e.morning) n++;
    if (e.evening) n++;
    if (e.day) n += Object.keys(e.day).length;
    if (e.mentorChat) n++;
    return acc + n;
  }, 0);

  const integrated = countIntegrated(ruleStatuses);
  const displayName = name.trim() || profile?.display_name || 'Философ-практик';
  const initial = displayName.charAt(0).toUpperCase();

  const saveName = async (value: string) => {
    const trimmed = value.trim();
    if (!user || trimmed === (profile?.display_name ?? '')) return;
    setBusy(true);
    const { error } = await updateDisplayName(trimmed);
    setMessage(error ? error : 'Имя сохранено');
    setBusy(false);
  };

  const finishNameEdit = async () => {
    setEditingName(false);
    await saveName(name);
  };

  const toggleShare = async (v: boolean) => {
    setShare(v);
    await updateShareForTraining(v);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(storage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `philosophia-activa-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (confirmDelete !== 'УДАЛИТЬ') return;
    setBusy(true);
    const { error } = await deleteAccount();
    if (error) setMessage(error);
    else navigate('/');
    setBusy(false);
  };

  const handleSync = async () => {
    try {
      await syncNow(storage);
      setMessage(null);
    } catch {
      setMessage('Не удалось синхронизировать');
    }
  };

  if (loading) {
    return <p className="text-muted p-6">Загрузка…</p>;
  }

  return (
    <div className="space-y-5 animate-fade-in pb-4">
      <section className="card flex items-center gap-4 !p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta to-[#A0451A] text-white flex items-center justify-center text-xl font-display shrink-0">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          {editingName && user ? (
            <input
              ref={nameInputRef}
              className="input-field !py-2 text-lg font-semibold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => finishNameEdit()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  setName(profile?.display_name ?? '');
                  setEditingName(false);
                }
              }}
              disabled={busy}
            />
          ) : (
            <button
              type="button"
              className={`text-left w-full ${user ? 'group' : 'cursor-default'}`}
              onClick={() => user && setEditingName(true)}
              disabled={!user}
            >
              <h1 className="text-xl font-semibold tracking-tight truncate group-hover:text-terracotta transition-colors">
                {displayName}
              </h1>
              {user && (
                <p className="text-[11px] text-faint mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Нажмите, чтобы изменить
                </p>
              )}
            </button>
          )}
          <p className="text-sm text-muted truncate mt-0.5">
            {user?.email ?? (isConfigured ? 'Гостевой режим' : 'Локально на устройстве')}
          </p>
        </div>
      </section>

      {isConfigured && !user && (
        <section className="card-glass !p-4 space-y-3">
          <p className="text-sm text-muted leading-relaxed">
            Войдите, чтобы синхронизировать журнал и пометки между устройствами.
          </p>
          <div className="flex gap-2">
            <Link to="/login" className="btn-primary flex-1 text-center !py-2.5 text-sm">
              Войти
            </Link>
            <Link to="/register" className="btn-secondary flex-1 text-center !py-2.5 text-sm">
              Регистрация
            </Link>
          </div>
        </section>
      )}

      <section className="card grid grid-cols-3 gap-2 text-center !py-4">
        <Stat value={practiceDays} label="дней" sub="с практикой" />
        <Stat value={totalEntries} label="записей" sub="в журнале" />
        <Stat value={integrated} label="правил" sub="внедрено" />
      </section>

      <section className="card !p-0 overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="section-title">Мои записи</h2>
        </div>
        <ProfileNavRow
          to="/journal"
          label="Журнал"
          desc={practiceDays > 0 ? `${practiceDays} ${dayWord(practiceDays)} с записями` : 'Практики по дням'}
          Icon={IconJournal}
        />
        <div id="notes" className="scroll-mt-6 px-4 pb-4 pt-2 border-t border-paper dark:border-paper-dark">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-graphite dark:text-graphite-dark">
              Пометки к книге
            </h3>
            {notes.length > 0 && <span className="text-xs text-muted">{notes.length}</span>}
          </div>
          <NotesSection />
        </div>
      </section>

      {user && (
        <section className="card space-y-2">
          <h2 className="section-title">Синхронизация</h2>
          <p className="text-sm text-muted">
            {syncing ? 'Синхронизация…' : `Синхронизировано ${formatSyncAgo(lastSyncedAt).toLowerCase()}`}
          </p>
          <button
            type="button"
            className="btn-secondary w-full"
            disabled={busy || syncing}
            onClick={handleSync}
          >
            {syncing ? 'Синхронизация…' : 'Синхронизировать сейчас'}
          </button>
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="section-title">Данные</h2>
        <button type="button" className="btn-secondary w-full" onClick={exportJson}>
          Экспорт JSON
        </button>
        {user && (
          <label id="share-patterns" className="flex items-start gap-3 cursor-pointer scroll-mt-6">
            <input
              type="checkbox"
              className="mt-1 accent-terracotta"
              checked={share}
              onChange={(e) => toggleShare(e.target.checked)}
            />
            <span className="text-sm text-muted leading-relaxed">
              Обезличенный сбор данных для улучшения приложения (практики, навигация, диалоги,
              пометки). Без имени и email. Включён по умолчанию — снимите галочку, чтобы отключить.
            </span>
          </label>
        )}
      </section>

      <section className="card !p-0 overflow-hidden">
        <ProfileNavRow
          to="/support"
          label="Поддержать проект"
          desc="Помочь развитию приложения"
          Icon={IconSun}
        />
      </section>

      {message && (
        <p className="text-sm text-center text-muted bg-cream dark:bg-cream-dark rounded-xl px-3 py-2">
          {message}
        </p>
      )}

      {user && (
        <section className="space-y-2">
          <button type="button" className="btn-secondary w-full" onClick={() => signOut()}>
            Выйти
          </button>

          <button
            type="button"
            className="w-full text-sm text-muted py-2"
            onClick={() => setDangerOpen((v) => !v)}
          >
            {dangerOpen ? 'Скрыть опасную зону' : 'Удаление аккаунта…'}
          </button>

          {dangerOpen && (
            <div className="card space-y-3 border border-red-500/20">
              <p className="text-sm text-muted">
                Введите <strong className="text-graphite dark:text-graphite-dark">УДАЛИТЬ</strong>.
                Действие необратимо.
              </p>
              <input
                className="input-field"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="УДАЛИТЬ"
              />
              <button
                type="button"
                className="btn-primary w-full !bg-red-600 hover:!bg-red-700"
                disabled={busy || confirmDelete !== 'УДАЛИТЬ'}
                onClick={handleDelete}
              >
                Удалить аккаунт навсегда
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ value, label, sub }: { value: number; label: string; sub: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-terracotta leading-none">{value}</p>
      <p className="text-xs font-medium text-graphite dark:text-graphite-dark mt-1">{label}</p>
      <p className="text-[10px] text-faint mt-0.5">{sub}</p>
    </div>
  );
}

function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня';
  return 'дней';
}
