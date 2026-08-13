import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import PracticeChatFlow, { type PracticeHeaderAction } from '../components/PracticeChatFlow';
import PracticeModePicker from '../components/PracticeModePicker';
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
  const [headerAction, setHeaderAction] = useState<PracticeHeaderAction | null>(null);

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

  const doneToday = selectedId !== 'free' && isPracticeDoneToday(selected.id, todayEntry);
  const showSave = headerAction && !headerAction.hidden;

  return (
    <div className="flex flex-col -mx-4 -mt-5 md:-mx-6 md:-mt-8 min-h-[calc(100dvh-5.5rem-env(safe-area-inset-bottom))] md:min-h-[calc(100vh-6rem)] animate-fade-in bg-surface dark:bg-surface-dark">
      <header className="relative z-[55] shrink-0 px-4 pt-3 pb-2.5 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2.5">
          <PracticeModePicker
            selectedId={selectedId}
            onSelect={selectPractice}
            grouped={grouped}
            todayEntry={todayEntry}
          />

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {showSave && (
              <button
                type="button"
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap bg-terracotta text-white shadow-sm hover:bg-terracotta/90 active:scale-[0.97] transition-all animate-message-in disabled:opacity-50 disabled:pointer-events-none"
                disabled={headerAction.disabled}
                onClick={headerAction.onClick}
              >
                {headerAction.label}
              </button>
            )}
            {doneToday && (
              <span className="chip-done !text-[11px] !py-1 !px-2.5 !gap-1">
                <IconCheck className="w-3 h-3" />
                Сегодня
              </span>
            )}
          </div>
        </div>

        {selectedId !== 'free' && (
          <p className="mt-2 text-[12px] text-muted leading-snug line-clamp-1">
            {selected.subtitle}
            <span className="text-faint"> · {selected.tradition}</span>
          </p>
        )}
      </header>

      <PracticeChatFlow
        key={`${selectedId}-${chatKey}`}
        embedded
        fillHeight
        saveInHeader
        onHeaderAction={setHeaderAction}
        steps={selected.getSteps()}
        onComplete={handleSaved}
        savedHint={
          selectedId === 'free'
            ? 'Разговор записан в журнал'
            : `${selected.title} записана в журнал`
        }
      />
    </div>
  );
}
