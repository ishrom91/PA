import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppStateContext';
import AuthLayout, { AuthField, AuthError } from '../components/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isConfigured, mergeLocalOnAuth } = useAuth();
  const { replaceStorage, storage } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isConfigured) {
    return (
      <AuthLayout title="Вход" subtitle="Supabase не настроен. Добавьте ключи в .env">
        <p className="text-sm text-muted">Приложение работает в гостевом режиме без облака.</p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    try {
      const merged = await mergeLocalOnAuth(storage);
      replaceStorage(merged);
    } catch {
      /* local data kept */
    }
    setLoading(false);
    navigate('/profile');
  };

  return (
    <AuthLayout title="Вход" subtitle="Синхронизация прогресса между устройствами">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <AuthField label="Пароль" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />
        <AuthError message={error} />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
      <p className="text-sm text-muted text-center pt-2">
        <Link to="/forgot-password" className="text-terracotta hover:underline">Забыли пароль?</Link>
        {' · '}
        <Link to="/register" className="text-terracotta hover:underline">Регистрация</Link>
      </p>
    </AuthLayout>
  );
}
