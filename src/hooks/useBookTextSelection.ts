import { useCallback, useEffect, useRef, useState } from 'react';

export interface BookTextSelection {
  text: string;
  sectionId: string;
  sectionTitle: string;
  top: number;
  left: number;
}

export function useBookTextSelection(
  containerRef: React.RefObject<HTMLElement | null>,
  sectionTitles: Record<string, string>,
) {
  const [selection, setSelection] = useState<BookTextSelection | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const dismissToolbar = useCallback(() => setSelection(null), []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const readSelection = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const container = containerRef.current;
        const sel = window.getSelection();
        if (!container || !sel || sel.isCollapsed || sel.rangeCount === 0) {
          setSelection(null);
          return;
        }

        const range = sel.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) {
          setSelection(null);
          return;
        }

        const text = sel.toString().trim();
        if (text.length < 3) {
          setSelection(null);
          return;
        }

        let node: Node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode!;
        const sectionEl = (node as Element).closest('[data-section-id]');
        const sectionId = sectionEl?.getAttribute('data-section-id');
        if (!sectionId) {
          setSelection(null);
          return;
        }

        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          setSelection(null);
          return;
        }

        setSelection({
          text,
          sectionId,
          sectionTitle: sectionTitles[sectionId] ?? sectionId,
          top: rect.top,
          left: rect.left + rect.width / 2,
        });
      }, 120);
    };

    document.addEventListener('selectionchange', readSelection);
    return () => {
      document.removeEventListener('selectionchange', readSelection);
      window.clearTimeout(timerRef.current);
    };
  }, [containerRef, sectionTitles]);

  return { selection, dismissToolbar, clearSelection };
}
