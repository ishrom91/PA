import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import PageHeader from '../components/PageHeader';
import PracticeChatFlow from '../components/PracticeChatFlow';
import { IconCheck } from '../components/Icons';
import {
  PRACTICE_CATALOG,
  getGroupLabel,
  getPracticeById,
  isValidPracticeId,
  isPracticeDoneToday,
  savePracticeToJournal,
  type PracticeGroup,
  type PracticeId,
} from '../data/practice-catalog';

const GROUP_ORDER: PracticeGroup[] = ['morning', 'evening', 'day'];

export default function PracticesPage() {
  const [params, setParams] = useSearchParams();
  const { todayEntry, ...app } = useApp();
  const paramId = params.get('p');
  const [selectedId, setSelectedId] = useState<PracticeId | null>(() =>
    isValidPracticeId(paramId) ? paramId : null,
  );
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    if (isValidPracticeId(paramId)) {
      setSelectedId(paramId);
    }
  }, [paramId]);

  const selected = selectedId ? getPracticeById(selectedId) : null;

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      label: getGroupLabel(group),
      items: PRACTICE_CATALOG.filter((p) => p.group === group),
    }));
  }, []);

  const selectPractice = (id: PracticeId | null) => {
    setSelectedId(id);
    setChatKey((k) => k + 1);
    if (id) setParams({ p: id }, { replace: true });
    else setParams({}, { replace: true });
  };

  const handleSaved = (transcripts: string[]) => {
    if (!selectedId) return;
    savePracticeToJournal(selectedId, transcripts, app);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Практики"
        subtitle="Выбери инструмент — наставник проведёт в одном чате"
      />

      <div className="flex flex-col min-h-[calc(100dvh-11rem)] md:min-h-[560px] card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-paper dark:border-paper-dark bg-cream/50 dark:bg-cream-dark/50 shrink-0 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Инструмент
            </span>
            <select
              className="input-field w-full mt-1.5 !py-2.5 text-sm"
              value={selectedId ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                selectPractice(isValidPracticeId(value) ? value : null);
              }}
            >
              <option value="">Выберите практику…</option>
              {grouped.map(({ group, label, items }) => (
                <optgroup key={group} label={label}>
                  {items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                      {isPracticeDoneToday(p.id, todayEntry) ? ' ✓' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {selected && (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-graphite dark:text-graphite-dark">
                  {selected.title}
                </p>
                <p className="text-xs text-muted">{selected.subtitle}</p>
                <p className="text-xs text-faint mt-0.5">{selected.tradition}</p>
              </div>
              {isPracticeDoneToday(selected.id, todayEntry) && (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs text-terracotta bg-terracotta-soft px-2 py-1 rounded-lg">
                  <IconCheck className="w-3.5 h-3.5" />
                  Сегодня
                </span>
              )}
            </div>
          )}
        </div>

        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Утро, вечер или ситуативная практика — всё в одном чате с наставником.
            </p>
            <div className="mt-6 w-full max-w-sm space-y-4 text-left">
              {grouped.map(({ label, items }) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                    {label}
                  </p>
                  <div className="space-y-1.5">
                    {items.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPractice(p.id)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-cream dark:hover:bg-cream-dark transition-colors flex items-center gap-2"
                      >
                        <span className="flex-1 text-sm font-medium">{p.title}</span>
                        {isPracticeDoneToday(p.id, todayEntry) && (
                          <IconCheck className="w-4 h-4 text-terracotta shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <PracticeChatFlow
            key={`${selectedId}-${chatKey}`}
            embedded
            steps={selected.getSteps()}
            onComplete={handleSaved}
            savedHint={`${selected.title} записана в журнал`}
          />
        )}
      </div>
    </div>
  );
}
