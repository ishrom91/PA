import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IconCheck, IconChevron } from './Icons';
import {
  getPracticeById,
  isPracticeDoneToday,
  type PracticeDefinition,
  type PracticeGroup,
  type PracticeId,
} from '../data/practice-catalog';
import type { JournalEntry } from '../types';

interface PracticeModePickerProps {
  selectedId: PracticeId;
  onSelect: (id: PracticeId) => void;
  grouped: { group: PracticeGroup; label: string; items: PracticeDefinition[] }[];
  todayEntry?: JournalEntry;
  buttonClassName?: string;
  className?: string;
  doneToday?: boolean;
  initialOpen?: boolean;
  onBeforeSelect?: (id: PracticeId) => boolean;
}

export default function PracticeModePicker({
  selectedId,
  onSelect,
  grouped,
  todayEntry,
  buttonClassName = '',
  className = '',
  doneToday = false,
  initialOpen = false,
  onBeforeSelect,
}: PracticeModePickerProps) {
  const location = useLocation();
  const [open, setOpen] = useState(initialOpen);
  const initialOpenHandled = useRef(false);

  const selected = getPracticeById(selectedId);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!initialOpen || initialOpenHandled.current) return;
    initialOpenHandled.current = true;
    setOpen(true);
  }, [initialOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const pick = (id: PracticeId) => {
    if (id === selectedId) {
      setOpen(false);
      return;
    }
    if (onBeforeSelect && !onBeforeSelect(id)) return;
    onSelect(id);
    setOpen(false);
  };

  const free = getPracticeById('free')!;

  return (
    <div className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        className={`relative w-full ${buttonClassName}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Выбрать практику"
        data-testid="practice-mode-picker"
      >
        <span className="truncate">{selected?.title ?? 'Практика'}</span>
        {doneToday && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-olive text-white flex items-center justify-center ring-2 ring-surface/95 dark:ring-surface-dark/95"
            aria-hidden
          >
            <IconCheck className="w-2.5 h-2.5" />
          </span>
        )}
        <IconChevron
          className={`w-4 h-4 shrink-0 opacity-45 transition-transform duration-200 ${
            open ? '-rotate-90' : 'rotate-90'
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80] rounded-2xl bg-surface dark:bg-surface-dark shadow-float dark:shadow-float-dark ring-1 ring-black/[0.06] dark:ring-white/[0.08] overflow-hidden animate-slide-up"
        >
          <div className="max-h-[min(52dvh,22rem)] overflow-y-auto py-1.5">
            <p className="px-3.5 pt-1 pb-1 text-[11px] font-medium text-faint">Наставник</p>
            <ModeOption
              practice={free}
              active={selectedId === 'free'}
              done={false}
              onPick={() => pick('free')}
            />

            {grouped.map(({ label, items }) => (
              <div key={label}>
                <p className="px-3.5 pt-2.5 pb-1 text-[11px] font-medium text-faint">{label}</p>
                {items.map((practice) => (
                  <ModeOption
                    key={practice.id}
                    practice={practice}
                    active={selectedId === practice.id}
                    done={isPracticeDoneToday(practice.id, todayEntry)}
                    onPick={() => pick(practice.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModeOption({
  practice,
  active,
  done,
  onPick,
}: {
  practice: PracticeDefinition;
  active: boolean;
  done: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onPick}
      className={`w-[calc(100%-0.75rem)] mx-1.5 flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
        active
          ? 'bg-terracotta-soft dark:bg-terracotta-soft-dark'
          : 'hover:bg-cream dark:hover:bg-cream-dark'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-medium truncate ${
            active ? 'text-terracotta' : 'text-graphite dark:text-graphite-dark'
          }`}
        >
          {practice.title}
        </p>
        <p className="text-[12px] text-muted truncate">{practice.subtitle}</p>
      </div>
      {active ? (
        <IconCheck className="w-4 h-4 shrink-0 text-terracotta" />
      ) : done ? (
        <IconCheck className="w-3.5 h-3.5 shrink-0 text-olive" />
      ) : null}
    </button>
  );
}
