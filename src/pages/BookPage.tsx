import { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookData, getSectionById, type BookSection } from '../data/bookData';
import { useApp } from '../context/AppStateContext';
import MarkdownContent from '../components/MarkdownContent';
import Modal from '../components/Modal';

interface TocNode {
  section: BookSection;
  children: TocNode[];
}

function buildToc(): TocNode[] {
  const sections = bookData.sections.filter((s) => s.type !== 'title');
  const roots: TocNode[] = [];
  let currentPart: TocNode | null = null;
  let currentChapter: TocNode | null = null;

  for (const section of sections) {
    const node: TocNode = { section, children: [] };

    if (section.type === 'part' || section.type === 'conclusion') {
      roots.push(node);
      currentPart = node;
      currentChapter = null;
    } else if (section.type === 'chapter' || section.type === 'appendix') {
      if (currentPart) {
        currentPart.children.push(node);
        currentChapter = node;
      } else {
        roots.push(node);
        currentChapter = node;
      }
    } else if (
      section.type === 'axiom' ||
      section.type === 'rule' ||
      section.type === 'extension' ||
      section.type === 'section'
    ) {
      if (currentChapter) {
        currentChapter.children.push(node);
      } else if (currentPart) {
        currentPart.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}

const TOC = buildToc();

export default function BookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionId = searchParams.get('section');
  const { notes, addNote } = useApp();

  const [noteModal, setNoteModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [noteText, setNoteText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const activeSection = sectionId ? getSectionById(sectionId) : null;

  const sectionNotes = notes.filter((n) => n.sectionId === sectionId);

  const handleTextSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !activeSection) return;
    const text = sel.toString().trim();
    if (text.length < 3) return;
    setSelectedText(text);
    setNoteText('');
    setNoteModal(true);
  }, [activeSection]);

  const saveNote = () => {
    if (!activeSection || !selectedText || !noteText.trim()) return;
    addNote({
      sectionId: activeSection.id,
      sectionTitle: activeSection.title,
      highlightedText: selectedText,
      noteText: noteText.trim(),
    });
    setNoteModal(false);
    window.getSelection()?.removeAllRanges();
  };

  if (activeSection) {
    const highlights = sectionNotes.map((n) => ({
      text: n.highlightedText,
      noteId: n.id,
    }));

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSearchParams({})}
          className="text-sm text-terracotta hover:underline"
        >
          ← Оглавление
        </button>

        <header>
          <p className="text-xs text-graphite/40 uppercase tracking-wide mb-1">
            {activeSection.type}
          </p>
          <h1 className="font-display text-2xl leading-snug">{activeSection.title}</h1>
        </header>

        <div
          ref={contentRef}
          onMouseUp={handleTextSelection}
          className="select-text"
        >
          <MarkdownContent
            content={activeSection.content}
            noteHighlights={highlights}
          />
        </div>

        <p className="text-xs text-graphite/40 italic border-t border-paper pt-4">
          Выделите фрагмент текста, чтобы добавить пометку.
        </p>

        <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Пометка">
          <div className="space-y-4">
            <blockquote className="border-l-2 border-terracotta/40 pl-3 text-sm italic text-graphite/70">
              «{selectedText.slice(0, 120)}{selectedText.length > 120 ? '…' : ''}»
            </blockquote>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Ваша заметка..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
            />
            <button
              className="btn-primary w-full"
              disabled={!noteText.trim()}
              onClick={saveNote}
            >
              Сохранить пометку
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl">{bookData.title}</h1>
        <p className="text-graphite/60 mt-1 italic">{bookData.subtitle}</p>
        <p className="text-sm text-graphite/40 mt-2">{bookData.author}</p>
      </header>

      <nav className="space-y-2">
        {TOC.map((node) => (
          <TocItem key={node.section.id} node={node} onSelect={(id) => setSearchParams({ section: id })} />
        ))}
      </nav>
    </div>
  );
}

function TocItem({
  node,
  onSelect,
  depth = 0,
}: {
  node: TocNode;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const hasContent = node.section.content.length > 0;

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div className="flex items-center gap-1">
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="text-graphite/30 hover:text-graphite w-5 text-xs shrink-0"
          >
            {open ? '▾' : '▸'}
          </button>
        )}
        <button
          onClick={() => hasContent || !hasChildren ? onSelect(node.section.id) : setOpen(true)}
          className={`flex-1 text-left py-2 px-2 rounded-lg hover:bg-white/50 transition-colors text-sm ${
            depth === 0 ? 'font-display font-medium' : ''
          }`}
        >
          {node.section.title}
        </button>
      </div>
      {open && hasChildren && (
        <div className="border-l border-paper ml-2">
          {node.children.map((child) => (
            <TocItem key={child.section.id} node={child} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
