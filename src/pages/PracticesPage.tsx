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
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      <header className="shrink-0 px-4 pt-2 pb-2.5 border-b border-paper/50 dark:border-paper-dark/50">
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
