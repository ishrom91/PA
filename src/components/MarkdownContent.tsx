import { bookData } from '../data/bookData';

function renderInline(text: string, footnotes: Record<string, string>): string {
  let result = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  result = result.replace(/\[\^(\d+)\]/g, (_, n) => {
    const fn = footnotes[n];
    return fn
      ? `<sup class="text-terracotta/70 cursor-help" title="${fn.replace(/"/g, '&quot;')}">[${n}]</sup>`
      : `<sup>[${n}]</sup>`;
  });

  return result;
}

function parseMarkdown(content: string, footnotes: Record<string, string>): string {
  const lines = content.split('\n');
  const html: string[] = [];
  let inList = false;
  let inOl = false;
  let inBlockquote = false;
  let inPre = false;
  let preBuffer: string[] = [];

  const closeList = () => {
    if (inList) { html.push('</ul>'); inList = false; }
    if (inOl) { html.push('</ol>'); inOl = false; }
  };

  const closeBlockquote = () => {
    if (inBlockquote) { html.push('</blockquote>'); inBlockquote = false; }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inPre) {
        html.push(`<pre><code>${preBuffer.join('\n')}</code></pre>`);
        preBuffer = [];
        inPre = false;
      } else {
        closeList();
        closeBlockquote();
        inPre = true;
      }
      continue;
    }

    if (inPre) {
      preBuffer.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    if (line.startsWith('> ')) {
      closeList();
      if (!inBlockquote) {
        html.push('<blockquote>');
        inBlockquote = true;
      }
      html.push(`<p>${renderInline(line.slice(2), footnotes)}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    if (line.match(/^[-*] /)) {
      if (!inList) {
        closeList();
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${renderInline(line.slice(2), footnotes)}</li>`);
      continue;
    }

    if (line.match(/^\d+\. /)) {
      if (!inOl) {
        closeList();
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${renderInline(line.replace(/^\d+\. /, ''), footnotes)}</li>`);
      continue;
    }

    closeList();

    if (line.startsWith('### ')) {
      html.push(`<h3>${renderInline(line.slice(4), footnotes)}</h3>`);
      continue;
    }

    if (line.startsWith('|')) {
      const cells = line.split('|').filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => c.match(/^[-:]+$/))) continue;
      const tag = html.length > 0 && html[html.length - 1]?.includes('<table') ? 'td' : 'th';
      if (tag === 'th' && !html[html.length - 1]?.includes('<table')) {
        html.push('<table><thead><tr>');
        cells.forEach((c) => html.push(`<th>${renderInline(c, footnotes)}</th>`));
        html.push('</tr></thead><tbody>');
      } else if (tag === 'td') {
        html.push('<tr>');
        cells.forEach((c) => html.push(`<td>${renderInline(c, footnotes)}</td>`));
        html.push('</tr>');
      }
      continue;
    }

    if (line === '***' || line === '---') {
      html.push('<hr />');
      continue;
    }

    if (line.trim() === '') {
      continue;
    }

    html.push(`<p>${renderInline(line, footnotes)}</p>`);
  }

  closeList();
  closeBlockquote();
  if (inPre) {
    html.push(`<pre><code>${preBuffer.join('\n')}</code></pre>`);
  }

  let result = html.join('\n');
  if (result.includes('<tbody>') && !result.includes('</tbody>')) {
    result += '</tbody></table>';
  }

  return result;
}

interface MarkdownContentProps {
  content: string;
  noteHighlights?: { text: string; noteId: string }[];
  onHighlightClick?: (noteId: string) => void;
}

export default function MarkdownContent({
  content,
  noteHighlights = [],
  onHighlightClick,
}: MarkdownContentProps) {
  let html = parseMarkdown(content, bookData.footnotes);

  for (const hl of noteHighlights) {
    const escaped = hl.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(
      new RegExp(escaped.slice(0, 40), 'i'),
      (match) =>
        `<mark class="highlight-note" data-note-id="${hl.noteId}">${match}</mark>`,
    );
  }

  return (
    <div
      className="markdown-body leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(e) => {
        const target = (e.target as HTMLElement).closest('[data-note-id]');
        if (target && onHighlightClick) {
          onHighlightClick(target.getAttribute('data-note-id')!);
        }
      }}
    />
  );
}
