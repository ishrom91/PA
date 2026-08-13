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

const DEFAULT_PRACTICE_ID: PracticeId = 'free';

export default function PracticesPage() {
  const [params, setParams] = useSearchParams();
  const { todayEntry, ...app } = useApp();
  const paramId = params.get('p');
  const [selectedId, setSelectedId] = useState<PracticeId>(() =>
    isValidPracticeId(paramId) ? paramId : DEFAULT_PRACTICE_ID,
  );
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    if (isValidPracticeId(paramId)) {
      setSelectedId(paramId);
    }
  }, [paramId]);

  const selected = getPracticeById(selectedId) ?? getPracticeById(DEFAULT_PRACTICE_ID)!;

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      label: getGroupLabel(group),
      items: PRACTICE_CATALOG.filter((p) => p.group === group && p.id !== 'free'),
    }));
  }, []);

  const selectPractice = (id: PracticeId) => {
    setSelectedId(id);
    setChatKey((k) => k + 1);
    if (id === DEFAULT_PRACTICE_ID) setParams({}, { replace: true });
    else setParams({ p: id }, { replace: true });
  };

  const handleSaved = (transcripts: string[]) => {
    savePracticeToJournal(selectedId, transcripts, app);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Практики"
        subtitle="Наставник уже здесь — можно просто поговорить или выбрать упражнение"
      />

      <div className="flex flex-col min-h-[calc(100dvh-11rem)] md:min-h-[560px] card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-paper dark:border-paper-dark bg-cream/50 dark:bg-cream-dark/50 shrink-0 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Режим
            </span>
            <select
              className="input-field w-full mt-1.5 !py-2.5 text-sm"
              value={selectedId}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidPracticeId(value)) selectPractice(value);
              }}
            >
              <option value="free">Свободный разговор</option>
              {grouped.map(({ label, items }) => (
                <optgroup key={label} label={label}>
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

          {selectedId !== 'free' && (
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

        <PracticeChatFlow
          key={`${selectedId}-${chatKey}`}
          embedded
          steps={selected.getSteps()}
          onComplete={handleSaved}
          savedHint={
            selectedId === 'free'
              ? 'Разговор записан в журнал'
              : `${selected.title} записана в журнал`
          }
        />
      </div>
    </div>
  );
}
