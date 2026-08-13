import { Link } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import { getVirtueForMonth } from '../data/virtues';
import { RULES } from '../data/rulesData';
import { countIntegrated, getActiveRules } from '../utils/rules';
import { IconCheck, IconChevron } from '../components/Icons';
import Onboarding from '../components/Onboarding';
import GuestSyncBanner from '../components/GuestSyncBanner';
import DailyQuote from '../components/DailyQuote';

export default function Dashboard() {
  const { ruleStatuses, todayEntry, saveVirtueIntention, onboardingCompleted, completeOnboarding } = useApp();
  const virtue = getVirtueForMonth();
  const activeRuleNumbers = getActiveRules(ruleStatuses);
  const integratedCount = countIntegrated(ruleStatuses);

  const morningDone = !!todayEntry?.morning;
  const eveningDone = !!todayEntry?.evening;
  const dayDone = !!(todayEntry?.day && Object.keys(todayEntry.day).length > 0);
  const todayCount = [morningDone, dayDone, eveningDone].filter(Boolean).length;

  const activeRules = RULES.filter((r) => activeRuleNumbers.includes(r.number));

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (!onboardingCompleted) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-[13px] font-medium text-muted capitalize">{today}</p>
        <h1 className="page-title">Philosophia Activa</h1>
      </header>

      <DailyQuote />

      <GuestSyncBanner />

      {/* Today ring + quick actions */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-5">
          <TodayRing done={todayCount} total={3} />
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <p className="section-title">Сегодня</p>
              <p className="text-[13px] text-muted mt-0.5">
                {todayCount === 0
                  ? 'День ещё пуст — это нормально'
                  : todayCount === 3
                    ? 'Все практики записаны'
                    : `${todayCount} из 3 практик`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PracticeChip done={morningDone} label="Утро" to="/practices?p=morning" />
              <PracticeChip done={dayDone} label="День" to="/practices" />
              <PracticeChip done={eveningDone} label="Вечер" to="/practices?p=evening" />
            </div>
          </div>
        </div>
      </section>

      {/* Virtue hero card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta to-[#A0451A] p-5 text-white shadow-float">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <p className="text-[12px] font-semibold uppercase tracking-wider opacity-80">
          Добродетель месяца
        </p>
        <p className="text-2xl font-semibold tracking-tight mt-1">{virtue.name}</p>
        <p className="text-[14px] opacity-85 mt-1 leading-relaxed">{virtue.description}</p>
        <div className="mt-4">
          <input
            type="text"
            className="w-full bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-[15px] text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            placeholder="Как проявишь сегодня?"
            defaultValue={todayEntry?.virtueIntention ?? ''}
            onBlur={(e) => {
              if (e.target.value.trim()) saveVirtueIntention(e.target.value.trim());
            }}
          />
        </div>
      </section>

      {activeRules.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="section-title">Активные правила</h2>
            <Link to="/rules" className="text-[13px] font-medium text-terracotta flex items-center gap-0.5">
              Все <IconChevron className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {activeRules.slice(0, 4).map((rule) => (
              <div key={rule.number} className="card !p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center text-[13px] font-bold shrink-0">
                  {rule.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] truncate">{rule.title}</p>
                  <p className="text-[12px] text-muted">{rule.tradition}</p>
                </div>
                {rule.practiceRoute && (
                  <Link
                    to={rule.practiceRoute}
                    className="shrink-0 text-[13px] font-medium text-terracotta bg-terracotta-soft px-3 py-1.5 rounded-xl"
                  >
                    Практика
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Внедрение</h2>
          <span className="text-[13px] font-semibold text-olive">
            {integratedCount}/17
          </span>
        </div>
        <div className="h-2 bg-cream dark:bg-cream-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-olive rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(integratedCount / 17) * 100}%` }}
          />
        </div>
        <p className="text-[12px] text-muted mt-2">
          Одно правило каждые две недели — принцип минимальной дозы
        </p>
      </section>
    </div>
  );
}

function TodayRing({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? done / total : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="relative w-[72px] h-[72px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(28,28,30,0.08)" strokeWidth="5" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={done === total && total > 0 ? '#5A7A52' : '#C05621'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold leading-none">{done}</span>
        <span className="text-[10px] text-muted">/{total}</span>
      </div>
    </div>
  );
}

function PracticeChip({
  done,
  label,
  to,
}: {
  done: boolean;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-95 ${
        done ? 'bg-olive-soft text-olive' : 'bg-cream dark:bg-cream-dark text-muted hover:bg-paper dark:hover:bg-paper-dark'
      }`}
    >
      {done && <IconCheck className="w-3.5 h-3.5" />}
      {label}
    </Link>
  );
}
