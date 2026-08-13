import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import { formatDateShort } from '../utils/date';

const PREVIEW_COUNT = 3;

export default function NotesSection() {
  const { notes, removeNote } = useApp();
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () => [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notes],
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted leading-relaxed">
        Пока нет пометок. Откройте{' '}
        <Link to="/book" className="text-terracotta hover:underline">
          книгу
        </Link>
        , выделите фрагмент и добавьте заметку.
      </p>
    );
  }

  const visible = expanded ? sorted : sorted.slice(0, PREVIEW_COUNT);
  const hiddenCount = sorted.length - PREVIEW_COUNT;

  return (
    <div className="space-y-3">
      {visible.map((note) => (
        <div key={note.id} className="rounded-2xl bg-cream/60 dark:bg-cream-dark/60 p-3 space-y-2">
          <blockquote className="border-l-2 border-terracotta/40 pl-3 text-sm italic text-muted leading-relaxed">
            «{note.highlightedText}»
          </blockquote>
          <p className="text-sm text-graphite dark:text-graphite-dark">{note.noteText}</p>
          <div className="flex items-center justify-between pt-1 gap-2">
            <Link
              to={`/book?section=${note.sectionId}`}
              className="text-xs text-terracotta hover:underline truncate min-w-0"
            >
              {note.sectionTitle}
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-faint">{formatDateShort(note.createdAt.slice(0, 10))}</span>
              <button
                type="button"
                onClick={() => removeNote(note.id)}
                className="text-xs text-faint hover:text-red-500 dark:hover:text-red-400"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      ))}

      {hiddenCount > 0 && (
        <button
          type="button"
          className="text-sm text-terracotta font-medium hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Свернуть' : `Показать все (${sorted.length})`}
        </button>
      )}
    </div>
  );
}
