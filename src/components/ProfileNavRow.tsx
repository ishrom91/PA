import { Link } from 'react-router-dom';
import { IconChevron } from './Icons';

interface ProfileNavRowProps {
  to: string;
  label: string;
  desc?: string;
  Icon: React.ComponentType<{ className?: string; filled?: boolean }>;
}

export default function ProfileNavRow({ to, label, desc, Icon }: ProfileNavRowProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-cream dark:hover:bg-cream-dark transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-terracotta-soft dark:bg-terracotta-soft-dark flex items-center justify-center text-terracotta shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[15px] text-graphite dark:text-graphite-dark">{label}</p>
        {desc && <p className="text-[13px] text-muted truncate">{desc}</p>}
      </div>
      <IconChevron className="text-faint shrink-0" />
    </Link>
  );
}
