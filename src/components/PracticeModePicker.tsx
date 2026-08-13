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
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const pick = (id: PracticeId) => {
    onSelect(id);
    setOpen(false);
  };

  const free = getPracticeById('free')!;

  return (
    <>
      <div ref={rootRef} className="relative inline-flex max-w-full">
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 max-w-[min(100vw-7rem,16rem)] px-4 py-2 rounded-full text-[15px] font-medium transition-all active:scale-[0.98] ${
            open
              ? 'bg-paper dark:bg-paper-dark text-graphite dark:text-graphite-dark shadow-sm'
              : 'bg-paper/90 dark:bg-paper-dark/90 text-graphite dark:text-graphite-dark hover:bg-paper dark:hover:bg-paper-dark'
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate">{selected?.title ?? 'Практика'}</span>
          <IconChevron
            className={`w-4 h-4 shrink-0 opacity-50 transition-transform duration-200 ${
              open ? 'rotate-90' : '-rotate-90'
            }`}
          />
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.5rem)] z-[80] w-[min(100vw-2rem,20rem)] rounded-2xl bg-surface dark:bg-surface-dark shadow-float dark:shadow-float-dark ring-1 ring-black/[0.06] dark:ring-white/[0.08] overflow-hidden animate-slide-up"
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

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-graphite/10 dark:bg-black/30 md:hidden"
          aria-label="Закрыть"
          onClick={() => setOpen(false)}
        />
      )}
    </>
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
