import { Link, useLocation, useNavigate } from 'react-router-dom';
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

function navTestId(path: string) {
  return `nav-${path.replace(/\//g, '') || 'home'}`;
}

function isActive(pathname: string, path: string) {
  if (path === '/profile') {
    return pathname === '/profile' || pathname === '/notes';
  }
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

function NavItem({
  path,
  label,
  Icon,
  active,
  variant,
}: {
  path: string;
  label: string;
  Icon: (typeof NAV_ITEMS)[number]['Icon'];
  active: boolean;
  variant: 'mobile' | 'desktop';
}) {
  const navigate = useNavigate();

  const goTo = () => {
    window.dispatchEvent(new CustomEvent('pa:before-navigate'));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => navigate(path));
    });
  };

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        data-testid={navTestId(path)}
        aria-current={active ? 'page' : undefined}
        onClick={goTo}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-2xl transition-all duration-150 min-w-0 touch-manipulation ${
          active ? 'text-terracotta' : 'text-graphite-tertiary dark:text-graphite-tertiary-dark'
        }`}
      >
        <Icon
          filled={active}
          className={`w-[21px] h-[21px] ${active ? 'scale-105' : ''} transition-transform pointer-events-none`}
        />
        <span
          className={`text-[9px] font-medium truncate w-full text-center leading-tight pointer-events-none ${active ? 'opacity-100' : 'opacity-80'}`}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      data-testid={`sidebar-${navTestId(path)}`}
      aria-current={active ? 'page' : undefined}
      onClick={goTo}
      className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[15px] transition-all duration-150 text-left ${
        active
          ? 'bg-terracotta-soft text-terracotta font-medium'
          : 'text-graphite-secondary dark:text-graphite-secondary-dark hover:bg-cream dark:hover:bg-cream-dark hover:text-graphite dark:hover:text-graphite-dark'
      }`}
    >
      <Icon filled={active} className="w-5 h-5 shrink-0 pointer-events-none" />
      <span className="pointer-events-none">{label}</span>
    </button>
  );
}

function MobileTabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Основная навигация"
      className="relative z-50 isolate md:hidden shrink-0 px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-cream dark:bg-cream-dark"
    >
      <div className="bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-2xl rounded-3xl shadow-nav dark:shadow-nav-dark border border-white/60 dark:border-white/10 flex items-stretch px-0.5 py-1">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <NavItem
            key={path}
            path={path}
            label={label}
            Icon={Icon}
            active={isActive(pathname, path)}
            variant="mobile"
          />
        ))}
      </div>
    </nav>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPractices = location.pathname.startsWith('/practices');

  return (
    <div className="h-dvh max-h-dvh flex flex-col bg-cream dark:bg-cream-dark md:flex-row md:h-auto md:max-h-none md:min-h-screen overflow-hidden md:overflow-visible">
      <NavigationTracker />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[120]">
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
            {NAV_ITEMS.map(({ path, label, Icon }) => (
              <NavItem
                key={path}
                path={path}
                label={label}
                Icon={Icon}
                active={isActive(location.pathname, path)}
                variant="desktop"
              />
            ))}
          </nav>
          <div className="p-4 mx-3 mb-3 rounded-2xl bg-cream/80 dark:bg-cream-dark/80">
            <p className="text-[12px] text-graphite-secondary dark:text-graphite-secondary-dark leading-relaxed">
              Дневник практик, не чек-лист. Пропуск — не провал.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile: main + tab bar — CSS grid keeps nav out of content hit area */}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] md:contents">
        <main
          className={`min-h-0 md:ml-64 md:pb-8 ${
            isPractices ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          <div
            className={`mx-auto flex h-full w-full max-w-lg flex-col min-h-0 ${
              isPractices ? 'md:px-6 md:py-8' : 'px-4 py-5 md:py-8 md:px-6 animate-fade-in'
            }`}
          >
            {children}
          </div>
        </main>

        <MobileTabBar pathname={location.pathname} />
      </div>

      <UpdatePrompt />
      <InstallPrompt />
    </div>
  );
}
