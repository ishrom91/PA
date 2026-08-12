import { Link } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import { formatDateShort } from '../utils/date';

export default function NotesPage() {
  const { notes, removeNote } = useApp();

  if (notes.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">Мои пометки</h1>
        <p className="text-graphite/60 text-sm">
          Пока нет пометок. Откройте{' '}
          <Link to="/book" className="text-terracotta hover:underline">книгу</Link>
          , выделите фрагмент и добавьте заметку.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Мои пометки</h1>
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="card space-y-3">
            <blockquote className="border-l-2 border-terracotta/50 pl-3 text-sm italic text-graphite/80">
              «{note.highlightedText}»
            </blockquote>
            <p className="text-sm">{note.noteText}</p>
            <div className="flex items-center justify-between pt-2 border-t border-paper/50">
              <Link
                to={`/book?section=${note.sectionId}`}
                className="text-xs text-terracotta hover:underline"
              >
                {note.sectionTitle}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs text-graphite/40">
                  {formatDateShort(note.createdAt.slice(0, 10))}
                </span>
                <button
                  onClick={() => removeNote(note.id)}
                  className="text-xs text-graphite/40 hover:text-red-600/70"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
