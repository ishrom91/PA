import { Link } from 'react-router-dom';
import PageHeader from './PageHeader';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card space-y-4">{children}</div>
      <p className="text-center text-sm text-muted">
        <Link to="/" className="text-terracotta hover:underline">
          ← На главную
        </Link>
      </p>
    </div>
  );
}

export function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <input
        type={type}
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
      {message}
    </p>
  );
}
