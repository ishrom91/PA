import { useEffect, useRef, useState } from 'react';
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
}

export default function PracticeModePicker({
  selectedId,
  onSelect,
  grouped,
  todayEntry,
}: PracticeModePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = getPracticeById(selectedId);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [open]);

  const pick = (id: PracticeId) => {
    onSelect(id);
    setOpen(false);
  };

  const free = getPracticeById('free')!;

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        className="group flex items-center gap-2 max-w-full pl-1 pr-2.5 py-1 rounded-full hover:bg-cream/60 dark:hover:bg-cream-dark/60 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta to-terracotta/80 flex items-center justify-center shrink-0 shadow-sm">
          <span className="font-display text-[13px] font-bold text-white leading-none">Ф</span>
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-graphite dark:text-graphite-dark truncate">
          {selected?.title ?? 'Практика'}
        </span>
        <IconChevron
          className={`w-4 h-4 shrink-0 text-graphite-tertiary dark:text-graphite-tertiary-dark transition-transform duration-200 ${
            open ? '-rotate-90' : 'rotate-90'
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-3xl bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-2xl shadow-float dark:shadow-float-dark ring-1 ring-black/[0.04] dark:ring-white/[0.08] overflow-hidden animate-slide-up"
        >
          <div className="max-h-[min(58dvh,24rem)] overflow-y-auto py-2">
            <p className="px-4 pt-1 pb-1.5 text-[11px] font-medium text-faint">
              Наставник
            </p>
            <ModeOption
              practice={free}
              active={selectedId === 'free'}
              done={false}
              onPick={() => pick('free')}
            />

            {grouped.map(({ label, items }) => (
              <div key={label}>
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-medium text-faint">
                  {label}
                </p>
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
      className={`w-[calc(100%-1rem)] mx-2 flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
        active
          ? 'bg-terracotta-soft dark:bg-terracotta-soft-dark'
          : 'hover:bg-cream/80 dark:hover:bg-cream-dark/80'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-medium truncate tracking-tight ${
            active ? 'text-terracotta' : 'text-graphite dark:text-graphite-dark'
          }`}
        >
          {practice.title}
        </p>
        <p className="text-[13px] text-muted truncate mt-0.5">{practice.subtitle}</p>
      </div>
      {active ? (
        <IconCheck className="w-4 h-4 shrink-0 text-terracotta" />
      ) : done ? (
        <span className="w-5 h-5 rounded-full bg-olive-soft dark:bg-olive-soft-dark flex items-center justify-center shrink-0">
          <IconCheck className="w-3 h-3 text-olive" />
        </span>
      ) : null}
    </button>
  );
}
