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

const FLOAT_CAPSULE =
  'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-[14px] font-medium whitespace-nowrap bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-xl text-graphite dark:text-graphite-dark shadow-float dark:shadow-float-dark ring-1 ring-black/[0.06] dark:ring-white/[0.08] transition-all active:scale-[0.98]';

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
      <header className="shrink-0 z-20 px-3 pt-2 pb-1 bg-transparent">
        <div className="flex items-center justify-center gap-2 max-w-full">
          <PracticeModePicker
            selectedId={selectedId}
            onSelect={selectPractice}
            grouped={grouped}
            todayEntry={todayEntry}
            buttonClassName={FLOAT_CAPSULE}
          />

          {showSave && (
            <button
              type="button"
              className={`${FLOAT_CAPSULE} shrink-0 disabled:opacity-40`}
              disabled={headerAction.disabled}
              onClick={headerAction.onClick}
            >
              {headerAction.label}
            </button>
          )}

          {doneToday && (
            <span className={`${FLOAT_CAPSULE} !px-3 shrink-0 text-olive`} aria-label="Сделано сегодня">
              <IconCheck className="w-4 h-4" />
            </span>
          )}
        </div>
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
