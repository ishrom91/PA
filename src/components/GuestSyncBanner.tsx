import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestSyncBanner() {
  const { user, isConfigured } = useAuth();

  if (!isConfigured || user) return null;

  return (
    <div className="card-glass !p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-terracotta-soft dark:bg-terracotta-soft-dark flex items-center justify-center text-terracotta shrink-0 text-lg">
        φ
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-graphite dark:text-graphite-dark">Сохранить прогресс в облаке</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">
          Создайте аккаунт, чтобы не потерять журнал и пометки при смене телефона.
        </p>
        <Link to="/register" className="inline-block text-sm text-terracotta font-medium mt-2 hover:underline">
          Создать аккаунт →
        </Link>
      </div>
    </div>
  );
}
