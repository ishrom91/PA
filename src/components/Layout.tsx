import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import InstallPrompt from './InstallPrompt';
import {
  IconHome,
  IconSun,
  IconDay,
  IconMoon,
  IconMore,
  IconRules,
  IconBook,
  IconNotes,
  IconJournal,
  IconChevron,
} from './Icons';

const PRIMARY_TABS = [
  { path: '/', label: 'Главная', Icon: IconHome },
  { path: '/morning', label: 'Утро', Icon: IconSun },
  { path: '/day', label: 'День', Icon: IconDay },
  { path: '/evening', label: 'Вечер', Icon: IconMoon },
] as const;

const MORE_ITEMS = [
  { path: '/rules', label: 'Правила', Icon: IconRules, desc: '17 практик книги' },
  { path: '/book', label: 'Книга', Icon: IconBook, desc: 'Читалка с пометками' },
  { path: '/notes', label: 'Пометки', Icon: IconNotes, desc: 'Заметки к тексту' },
  { path: '/journal', label: 'Журнал', Icon: IconJournal, desc: 'Записи по дням' },
] as const;

const DESKTOP_NAV = [
  ...PRIMARY_TABS,
  ...MORE_ITEMS.map(({ path, label, Icon }) => ({ path, label, Icon })),
];

function isActive(pathname: string, path: string) {
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_ITEMS.some((i) => isActive(location.pathname, i.path));

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
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
            {DESKTOP_NAV.map(({ path, label, Icon }) => {
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

      <main className="flex-1 md:ml-64 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8">
        <div className="max-w-lg mx-auto px-4 py-5 md:py-8 md:px-6 animate-fade-in">
          {children}
        </div>
      </main>

      {/* PWA install banner (Chrome / Edge / Android) */}
      <InstallPrompt />

      {/* Mobile tab bar — iOS-style floating glass */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        <div className="pointer-events-auto bg-surface/85 dark:bg-surface-dark/90 backdrop-blur-2xl rounded-3xl shadow-nav dark:shadow-nav-dark border border-white/60 dark:border-white/10 flex items-stretch px-1 py-1">
          {PRIMARY_TABS.map(({ path, label, Icon }) => {
            const active = isActive(location.pathname, path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMoreOpen(false)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-all duration-150 min-w-0 ${
                  active ? 'text-terracotta' : 'text-graphite-tertiary dark:text-graphite-tertiary-dark'
                }`}
              >
                <Icon filled={active} className={`w-[22px] h-[22px] ${active ? 'scale-105' : ''} transition-transform`} />
                <span className={`text-[10px] font-medium truncate w-full text-center ${active ? 'opacity-100' : 'opacity-80'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-colors min-w-0 ${
              moreActive || moreOpen ? 'text-terracotta' : 'text-graphite-tertiary dark:text-graphite-tertiary-dark'
            }`}
          >
            <IconMore className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium">Ещё</span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-graphite/25 backdrop-blur-sm animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-surface dark:bg-surface-dark rounded-t-4xl shadow-float dark:shadow-float-dark animate-slide-up pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="w-10 h-1 bg-paper rounded-full mx-auto mt-3 mb-4" />
            <p className="px-5 text-[13px] font-semibold uppercase tracking-wider text-muted mb-3">
              Разделы
            </p>
            <div className="px-3 space-y-1">
              {MORE_ITEMS.map(({ path, label, Icon, desc }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-cream dark:hover:bg-cream-dark active:bg-cream dark:active:bg-cream-dark transition-colors"
                >
                  <div className="w-10 h-10 rounded-2xl bg-terracotta-soft dark:bg-terracotta-soft-dark flex items-center justify-center text-terracotta">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px] text-graphite dark:text-graphite-dark">{label}</p>
                    <p className="text-[13px] text-muted">{desc}</p>
                  </div>
                  <IconChevron className="text-faint shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
