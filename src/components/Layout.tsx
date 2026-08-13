import { Link, useLocation } from 'react-router-dom';
import InstallPrompt from './InstallPrompt';
import UpdatePrompt from './UpdatePrompt';
import NavigationTracker from './NavigationTracker';
import {
  IconHome,
  IconPractice,
  IconRules,
  IconBook,
  IconProfile,
} from './Icons';

const NAV_ITEMS = [
  { path: '/', label: 'Главная', Icon: IconHome },
  { path: '/rules', label: 'Правила', Icon: IconRules },
  { path: '/practices', label: 'Практики', Icon: IconPractice },
  { path: '/book', label: 'Книга', Icon: IconBook },
  { path: '/profile', label: 'Профиль', Icon: IconProfile },
] as const;

function isActive(pathname: string, path: string) {
  if (path === '/profile') {
    return pathname === '/profile' || pathname === '/notes';
  }
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPractices = location.pathname.startsWith('/practices');

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <NavigationTracker />
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <div className="flex flex-col h-full m-3 mr-0 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-2xl rounded-4xl shadow-card dark:shadow-card-dark border border-white/50 dark:border-white/10 overflow-hidden">
          <div className="p-6 pb-4">
            <Link to="/" className="block">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">
                Philosophia
              </span>
              <span className="block text-xl font-semibold tracking-tight mt-0.5">Activa</span>
            </Link>
          </div>
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ path, label, Icon }) => {
              const active = isActive(location.pathname, path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[15px] transition-all duration-150 ${
                    active
                      ? 'bg-terracotta-soft text-terracotta font-medium'
                      : 'text-graphite-secondary dark:text-graphite-secondary-dark hover:bg-cream dark:hover:bg-cream-dark hover:text-graphite dark:hover:text-graphite-dark'
                  }`}
                >
                  <Icon filled={active} className="w-5 h-5 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 mx-3 mb-3 rounded-2xl bg-cream/80 dark:bg-cream-dark/80">
            <p className="text-[12px] text-graphite-secondary dark:text-graphite-secondary-dark leading-relaxed">
              Дневник практик, не чек-лист. Пропуск — не провал.
            </p>
          </div>
        </div>
      </aside>

      <main
        className={`flex-1 md:ml-64 ${
          isPractices
            ? 'flex flex-col min-h-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8'
            : 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8'
        }`}
      >
        <div
          className={`max-w-lg mx-auto w-full ${
            isPractices
              ? 'flex flex-col flex-1 min-h-0 md:px-6 md:py-8'
              : 'px-4 py-5 md:py-8 md:px-6 animate-fade-in'
          }`}
        >
          {children}
        </div>
      </main>

      <UpdatePrompt />
      <InstallPrompt />

      {/* Mobile tab bar — always above page content */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        <div className="pointer-events-auto bg-surface/85 dark:bg-surface-dark/90 backdrop-blur-2xl rounded-3xl shadow-nav dark:shadow-nav-dark border border-white/60 dark:border-white/10 flex items-stretch px-0.5 py-1">
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const active = isActive(location.pathname, path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-all duration-150 min-w-0 ${
                  active ? 'text-terracotta' : 'text-graphite-tertiary dark:text-graphite-tertiary-dark'
                }`}
              >
                <Icon
                  filled={active}
                  className={`w-[21px] h-[21px] ${active ? 'scale-105' : ''} transition-transform`}
                />
                <span
                  className={`text-[9px] font-medium truncate w-full text-center leading-tight ${active ? 'opacity-100' : 'opacity-80'}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
