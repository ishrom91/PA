import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import PracticeChatFlow, {
  type PracticeChatState,
  type PracticeHeaderAction,
} from '../components/PracticeChatFlow';
import PracticeModePicker from '../components/PracticeModePicker';
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
  'flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-[14px] font-medium whitespace-nowrap bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-xl text-graphite dark:text-graphite-dark shadow-float dark:shadow-float-dark ring-1 ring-black/[0.06] dark:ring-white/[0.08] transition-all active:scale-[0.98]';

export default function PracticesPage() {
  const [params, setParams] = useSearchParams();
  const { todayEntry, ...app } = useApp();
  const paramId = params.get('p');
  const openPicker = params.get('group') === 'day';
  const headerRowRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<PracticeId>(() =>
    isValidPracticeId(paramId) ? paramId : DEFAULT_PRACTICE_ID,
  );
  const [chatKey, setChatKey] = useState(0);
  const [headerAction, setHeaderAction] = useState<PracticeHeaderAction | null>(null);
  const [chatState, setChatState] = useState<PracticeChatState | null>(null);

  useEffect(() => {
    if (isValidPracticeId(paramId)) {
      setSelectedId(paramId);
    }
  }, [paramId]);

  useEffect(() => {
    if (!openPicker) return;
    const next = new URLSearchParams(params);
    next.delete('group');
    setParams(next, { replace: true });
  }, [openPicker, params, setParams]);

  const selected = getPracticeById(selectedId) ?? getPracticeById(DEFAULT_PRACTICE_ID)!;

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      label: getGroupLabel(group),
      items: PRACTICE_CATALOG.filter((p) => p.group === group && p.id !== 'free'),
    }));
  }, []);

  const applyPractice = (id: PracticeId) => {
    setSelectedId(id);
    setChatKey((k) => k + 1);
    if (id === DEFAULT_PRACTICE_ID) setParams({}, { replace: true });
    else setParams({ p: id }, { replace: true });
  };

  const trySelectPractice = (id: PracticeId) => {
    if (id === selectedId) return true;
    if (chatState?.hasUserReply && !chatState.saved) {
      return window.confirm('Незавершённый диалог не сохранится. Сменить практику?');
    }
    return true;
  };

  const handleSelectPractice = (id: PracticeId) => {
    applyPractice(id);
  };

  const handleSaved = (transcripts: string[]) => {
    savePracticeToJournal(selectedId, transcripts, app);
  };

  const handleRestart = () => {
    setChatKey((k) => k + 1);
  };

  const doneToday = selectedId !== 'free' && isPracticeDoneToday(selected.id, todayEntry);
  const showSave = headerAction && !headerAction.hidden;
  const showRestart = chatState?.saved;
  const showHint = chatState && !chatState.saved && !chatState.hasUserReply;

  const contextLine =
    chatState && chatState.stepCount > 1
      ? `Шаг ${chatState.stepIndex + 1} из ${chatState.stepCount} · ${chatState.currentStepTitle}`
      : selected.subtitle;

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      <header className="shrink-0 z-20 px-3 pt-2 pb-1 bg-gradient-to-b from-cream dark:from-cream-dark from-85% to-transparent">
        <div ref={headerRowRef} className="relative flex w-full items-stretch gap-2">
          <PracticeModePicker
            selectedId={selectedId}
            onSelect={handleSelectPractice}
            grouped={grouped}
            todayEntry={todayEntry}
            buttonClassName={FLOAT_CAPSULE}
            className="flex-1 min-w-0"
            doneToday={doneToday}
            dropdownAnchorRef={headerRowRef}
            initialOpen={openPicker}
            onBeforeSelect={trySelectPractice}
          />

          {showRestart && (
            <button
              type="button"
              className={`${FLOAT_CAPSULE} flex-1 min-w-0`}
              onClick={handleRestart}
            >
              Заново
            </button>
          )}

          {showSave && (
            <button
              type="button"
              className={`${FLOAT_CAPSULE} flex-1 min-w-0 disabled:opacity-40`}
              disabled={headerAction.disabled}
              onClick={headerAction.onClick}
            >
              <span className="truncate">{headerAction.label}</span>
            </button>
          )}
        </div>

        {contextLine && (
          <p className="mt-1.5 px-1 text-[12px] text-muted truncate">{contextLine}</p>
        )}

        {showHint && (
          <p className="mt-1 px-1 text-[11px] text-faint">
            Ответьте наставнику — кнопка «В журнал» появится сверху
          </p>
        )}
      </header>

      <PracticeChatFlow
        key={`${selectedId}-${chatKey}`}
        embedded
        fillHeight
        saveInHeader
        onHeaderAction={setHeaderAction}
        onChatStateChange={setChatState}
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
