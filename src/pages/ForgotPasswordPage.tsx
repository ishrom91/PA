import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { AuthField, AuthError } from '../components/AuthLayout';

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isConfigured) {
    return (
      <AuthLayout title="Сброс пароля" subtitle="Supabase не настроен">
        <p className="text-sm text-muted">Функция недоступна без облачной авторизации.</p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await resetPassword(email.trim());
    if (err) setError(err);
    else setSent(true);
    setLoading(false);
  };

  return (
    <AuthLayout title="Сброс пароля" subtitle="Ссылка придёт на email">
      {sent ? (
        <p className="text-sm text-muted">Проверьте почту — мы отправили ссылку для сброса пароля.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
          <AuthError message={error} />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Отправка…' : 'Отправить ссылку'}
          </button>
        </form>
      )}
      <p className="text-sm text-muted text-center pt-2">
        <Link to="/login" className="text-terracotta hover:underline">← К входу</Link>
      </p>
    </AuthLayout>
  );
}
