import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppStateContext';
import { countIntegrated } from '../utils/rules';
import PageHeader from '../components/PageHeader';

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading,
    signOut,
    updateDisplayName,
    updateShareForTraining,
    deleteAccount,
    syncNow,
  } = useAuth();
  const { storage, journal, ruleStatuses } = useApp();

  const [name, setName] = useState(profile?.display_name ?? '');
  const [share, setShare] = useState(profile?.share_for_training ?? false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  useEffect(() => {
    setName(profile?.display_name ?? '');
    setShare(profile?.share_for_training ?? false);
  }, [profile]);

  useEffect(() => {
    if (window.location.hash !== '#share-patterns') return;
    document.getElementById('share-patterns')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [profile, loading]);

  if (loading || !user) {
    return <p className="text-muted p-6">Загрузка…</p>;
  }

  const practiceDays = new Set(
    journal.filter((e) => e.morning || e.evening || (e.day && Object.keys(e.day).length)).map((e) => e.date),
  ).size;

  const totalEntries = journal.reduce((acc, e) => {
    let n = 0;
    if (e.morning) n++;
    if (e.evening) n++;
    if (e.day) n += Object.keys(e.day).length;
    return acc + n;
  }, 0);

  const integrated = countIntegrated(ruleStatuses);

  const saveName = async () => {
    setBusy(true);
    const { error } = await updateDisplayName(name);
    setMessage(error ? error : 'Имя сохранено');
    setBusy(false);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Личный кабинет" subtitle={user.email ?? ''} />

      <section className="card space-y-3">
        <h2 className="section-title">Профиль</h2>
        <div>
          <label className="label-text">Имя</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button type="button" className="btn-secondary w-full" disabled={busy} onClick={saveName}>
          Сохранить имя
        </button>
      </section>

      <section className="card grid grid-cols-3 gap-3 text-center">
        <Stat value={practiceDays} label="дней практики" />
        <Stat value={totalEntries} label="записей" />
        <Stat value={integrated} label="правил внедрено" />
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">Настройки</h2>
        <Link to="/support" className="btn-secondary w-full block text-center">
          Поддержать проект
        </Link>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">Данные</h2>
        <button type="button" className="btn-secondary w-full" onClick={() => syncNow(storage)}>
          Синхронизировать сейчас
        </button>
        <button type="button" className="btn-secondary w-full" onClick={exportJson}>
          Экспорт JSON
        </button>
      </section>

      <section id="share-patterns" className="card space-y-3 scroll-mt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-terracotta"
            checked={share}
            onChange={(e) => toggleShare(e.target.checked)}
          />
          <span className="text-sm text-muted leading-relaxed">
            Разрешаю использовать мои анонимизированные диалоги для улучшения наставника
          </span>
        </label>
      </section>

      <section className="card space-y-3 border border-red-500/20">
        <h2 className="section-title text-red-600 dark:text-red-400">Удаление аккаунта</h2>
        <p className="text-sm text-muted">Введите УДАЛИТЬ для подтверждения. Действие необратимо.</p>
        <input
          className="input-field"
          value={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.value)}
          placeholder="УДАЛИТЬ"
        />
        <button type="button" className="btn-primary w-full !bg-red-600 hover:!bg-red-700" disabled={busy} onClick={handleDelete}>
          Удалить аккаунт
        </button>
      </section>

      {message && <p className="text-sm text-muted text-center">{message}</p>}

      <button type="button" className="btn-ghost w-full" onClick={() => signOut()}>
        Выйти
      </button>

      <p className="text-center text-sm">
        <Link to="/" className="text-terracotta hover:underline">← На главную</Link>
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-terracotta">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}
