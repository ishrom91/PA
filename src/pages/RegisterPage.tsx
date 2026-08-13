import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppStateContext';
import AuthLayout, { AuthField, AuthError } from '../components/AuthLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, isConfigured, mergeLocalOnAuth } = useAuth();
  const { replaceStorage, storage } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [consentData, setConsentData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isConfigured) {
    return (
      <AuthLayout title="Регистрация" subtitle="Supabase не настроен">
        <p className="text-sm text-muted">Гостевой режим доступен без регистрации.</p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentData) {
      setError('Для регистрации нужно согласие на обезличенный сбор данных');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await signUp(email.trim(), password, displayName.trim(), true);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    try {
      const merged = await mergeLocalOnAuth(storage);
      replaceStorage(merged);
      setDone(true);
    } catch {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <AuthLayout title="Аккаунт создан" subtitle="Локальные записи перенесены в облако">
        <button type="button" className="btn-primary w-full" onClick={() => navigate('/profile')}>
          В личный кабинет
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Регистрация" subtitle="Чтобы не потерять прогресс при смене устройства">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Имя" value={displayName} onChange={setDisplayName} autoComplete="name" />
        <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <AuthField label="Пароль" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-terracotta shrink-0"
            checked={consentData}
            onChange={(e) => setConsentData(e.target.checked)}
          />
          <span className="text-sm text-muted leading-relaxed">
            Соглашаюсь на обезличенный сбор записей практик, навигации по приложению, диалогов с
            наставником и пометок к книге — для улучшения Philosophia Activa. Персональные данные
            (имя, email) не сохраняются. Отключить можно в профиле.
          </span>
        </label>

        <AuthError message={error} />
        <button type="submit" className="btn-primary w-full" disabled={loading || !consentData}>
          {loading ? 'Создание…' : 'Создать аккаунт'}
        </button>
      </form>
      <p className="text-sm text-muted text-center pt-2">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-terracotta hover:underline">Войти</Link>
      </p>
    </AuthLayout>
  );
}
