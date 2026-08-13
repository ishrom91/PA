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
    setLoading(true);
    setError(null);
    const { error: err } = await signUp(email.trim(), password, displayName.trim());
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
        <AuthError message={error} />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
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
