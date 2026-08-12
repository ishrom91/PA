import { useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookData, getSectionById, type BookSection, type SectionType } from '../data/bookData';
import { useApp } from '../context/AppStateContext';
import { useBookTextSelection } from '../hooks/useBookTextSelection';
import MarkdownContent from '../components/MarkdownContent';
import Modal from '../components/Modal';
import SelectionToolbar from '../components/SelectionToolbar';

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

function findTocNode(id: string, nodes: TocNode[] = TOC): TocNode | null {
  for (const node of nodes) {
    if (node.section.id === id) return node;
    const found = findTocNode(id, node.children);
    if (found) return found;
  }
  return null;
}

function getChildSections(id: string): BookSection[] {
  const node = findTocNode(id);
  return node?.children.map((c) => c.section) ?? [];
}

const SECTION_TYPE_LABEL: Partial<Record<SectionType, string>> = {
  axiom: 'Аксиома',
  rule: 'Правило',
  extension: 'Расширение',
  chapter: 'Глава',
  part: 'Часть',
  appendix: 'Приложение',
  conclusion: 'Заключение',
};

export default function BookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionId = searchParams.get('section');
  const { notes, addNote } = useApp();

  const [noteModal, setNoteModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [noteSectionId, setNoteSectionId] = useState('');
  const [noteSectionTitle, setNoteSectionTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const activeSection = sectionId ? getSectionById(sectionId) : null;
  const childSections = activeSection ? getChildSections(activeSection.id) : [];

  const sectionTitles = useMemo(() => {
    const map: Record<string, string> = {};
    if (activeSection) map[activeSection.id] = activeSection.title;
    for (const child of childSections) map[child.id] = child.title;
    return map;
  }, [activeSection, childSections]);

  const { selection, dismissToolbar, clearSelection } = useBookTextSelection(
    contentRef,
    sectionTitles,
  );

  const sectionNotes = notes.filter((n) => n.sectionId === sectionId);

  const openNoteModal = () => {
    if (!selection) return;
    setSelectedText(selection.text);
    setNoteSectionId(selection.sectionId);
    setNoteSectionTitle(selection.sectionTitle);
    setNoteText('');
    setNoteModal(true);
    dismissToolbar();
  };

  const saveNote = () => {
    if (!noteSectionId || !selectedText || !noteText.trim()) return;
    addNote({
      sectionId: noteSectionId,
      sectionTitle: noteSectionTitle,
      highlightedText: selectedText,
      noteText: noteText.trim(),
    });
    setNoteModal(false);
    clearSelection();
  };

  if (activeSection) {
    const highlights = sectionNotes.map((n) => ({
      text: n.highlightedText,
      noteId: n.id,
    }));

    const typeLabel = SECTION_TYPE_LABEL[activeSection.type];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSearchParams({})}
          className="text-sm text-terracotta hover:underline"
        >
          ← Оглавление
        </button>

        <header>
          {typeLabel && (
            <p className="text-xs text-faint uppercase tracking-wide mb-1">{typeLabel}</p>
          )}
          <h1 className="font-display text-2xl leading-snug text-graphite dark:text-graphite-dark">
            {activeSection.title}
          </h1>
        </header>

        <div ref={contentRef} className="select-text space-y-10">
          {activeSection.content.length > 0 && (
            <div data-section-id={activeSection.id}>
              <MarkdownContent content={activeSection.content} noteHighlights={highlights} />
            </div>
          )}

          {childSections.map((child) => {
            const childHighlights = notes
              .filter((n) => n.sectionId === child.id)
              .map((n) => ({ text: n.highlightedText, noteId: n.id }));
            const childLabel = SECTION_TYPE_LABEL[child.type];

            return (
              <section
                key={child.id}
                id={child.id}
                data-section-id={child.id}
                className="scroll-mt-6 pt-8 border-t border-paper dark:border-paper-dark"
              >
                {childLabel && (
                  <p className="text-xs text-faint uppercase tracking-wide mb-1">{childLabel}</p>
                )}
                <h2 className="font-display text-xl leading-snug mb-4 text-graphite dark:text-graphite-dark">
                  {child.title}
                </h2>
                <MarkdownContent content={child.content} noteHighlights={childHighlights} />
              </section>
            );
          })}
        </div>

        {selection && !noteModal && (
          <SelectionToolbar
            top={selection.top}
            left={selection.left}
            onAddNote={openNoteModal}
          />
        )}

        <p className="text-xs text-faint italic border-t border-paper dark:border-paper-dark pt-4">
          Выделите фрагмент текста и нажмите «Пометка».
        </p>

        <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Пометка">
          <div className="space-y-4">
            <blockquote className="border-l-2 border-terracotta/40 pl-3 text-sm italic text-muted">
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
        <h1 className="font-display text-2xl text-graphite dark:text-graphite-dark">{bookData.title}</h1>
        <p className="text-muted mt-1 italic">{bookData.subtitle}</p>
        <p className="text-sm text-faint mt-2">{bookData.author}</p>
      </header>

      <nav className="space-y-2">
        {TOC.map((node) => (
          <TocItem key={node.section.id} node={node} onSelect={(id) => setSearchParams({ section: id })} />
        ))}
      </nav>
    </div>
  );
}

function hasNestedContent(node: TocNode): boolean {
  return node.children.some(
    (c) => c.section.type === 'axiom' || c.section.type === 'rule' || c.section.type === 'extension',
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
  const nested = hasNestedContent(node);
  const [open, setOpen] = useState(depth < 1 || nested);
  const hasChildren = node.children.length > 0;
  const hasContent = node.section.content.length > 0 || hasChildren;

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div className="flex items-center gap-1">
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="text-faint hover:text-graphite dark:hover:text-graphite-dark w-5 text-xs shrink-0"
            aria-label={open ? 'Свернуть' : 'Развернуть'}
          >
            {open ? '▾' : '▸'}
          </button>
        )}
        <button
          onClick={() => {
            if (hasContent) onSelect(node.section.id);
            else if (hasChildren) setOpen(true);
          }}
          className={`flex-1 text-left py-2 px-2 rounded-lg hover:bg-cream dark:hover:bg-cream-dark transition-colors text-sm text-graphite dark:text-graphite-dark ${
            depth === 0 ? 'font-display font-medium' : ''
          } ${node.section.type === 'axiom' ? 'text-[13px] pl-4' : ''}`}
        >
          {node.section.type === 'axiom' && (
            <span className="text-terracotta mr-1.5 text-[11px] font-semibold uppercase tracking-wide">
              ◆
            </span>
          )}
          {node.section.title}
          {hasChildren && !open && (
            <span className="text-faint ml-1">({node.children.length})</span>
          )}
        </button>
      </div>
      {open && hasChildren && (
        <div className="border-l border-paper dark:border-paper-dark ml-2">
          {node.children.map((child) => (
            <TocItem key={child.section.id} node={child} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
