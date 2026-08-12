import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const mdPath = path.join(root, 'philosophia-activa-epub-v3.md');
const outPath = path.join(root, 'src', 'data', 'bookData.ts');

const md = fs.readFileSync(mdPath, 'utf8');

// Footnotes
const footnotes = {};
for (const line of md.split('\n')) {
  const m = line.match(/^\[\^(\d+)\]:\s*(.+)$/);
  if (m) footnotes[m[1]] = m[2].trim();
}

// Remove TOC block (between first *** after subtitle and first # ЧАСТЬ)
const tocEnd = md.indexOf('# ЧАСТЬ I.');
const contentStart = md.indexOf('# PHILOSOPHIA ACTIVA');
let body = md.slice(contentStart);

// Split into lines for parsing
const lines = body.split('\n');

const sections = [];
let current = null;
let skipUntilPart = false;

function inferType(title, level) {
  const t = title.toUpperCase();
  if (level === 1) {
    if (t.includes('ЗАКЛЮЧЕНИЕ')) return 'conclusion';
    if (t.startsWith('ЧАСТЬ')) return 'part';
    return 'title';
  }
  if (level === 2) {
    if (t.startsWith('ПРИЛОЖЕНИЕ') || title.startsWith('Приложение')) return 'appendix';
    if (title.startsWith('Глава')) return 'chapter';
    return 'chapter';
  }
  if (level === 3) {
    if (t.startsWith('АКСИОМА')) return 'axiom';
    if (t.startsWith('ПРАВИЛО')) return 'rule';
    if (title.startsWith('Расширение')) return 'extension';
    return 'section';
  }
  return 'section';
}

function flush() {
  if (!current) return;
  current.content = current.contentLines.join('\n').trim();
  delete current.contentLines;
  sections.push(current);
  current = null;
}

for (const line of lines) {
  const heading = line.match(/^(#{1,3})\s+(.+?)(?:\s+\{#([^}]+)\})?\s*$/);
  if (heading) {
    const level = heading[1].length;
    const title = heading[2].trim();
    const id = heading[3] || slugify(title);

    // Skip TOC-like duplicate title block content before parts
    if (title === 'PHILOSOPHIA ACTIVA' && !heading[3]) {
      flush();
      current = {
        id: 'title',
        title,
        type: 'title',
        level,
        contentLines: [],
      };
      skipUntilPart = true;
      continue;
    }

    skipUntilPart = false;
    flush();
    const sectionType = inferType(title, level);
    current = {
      id,
      title,
      type: sectionType,
      level,
      contentLines: [],
    };
    continue;
  }

  // Skip footnote definition lines from section content
  if (/^\[\^\d+\]:/.test(line)) continue;

  if (skipUntilPart) {
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('***')) {
      if (current) current.contentLines.push(line);
    }
    continue;
  }

  if (current) current.contentLines.push(line);
}

flush();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'section';
}

// Metadata from file
const subtitleMatch = md.match(/\*(.+?)\*/);
const subtitle = subtitleMatch ? subtitleMatch[1] : '';
const traditionsMatch = md.match(/\*\*Синтез традиций:\*\*\s*\n\n([\s\S]+?)\n\nЭта книга/);
const traditions = traditionsMatch
  ? traditionsMatch[1].split('·').map((s) => s.trim()).filter(Boolean)
  : [];

const disclaimerMatch = md.match(/Дисклеймер\.\s*([\s\S]+?)Начните завтра утром\./);
const disclaimer = disclaimerMatch
  ? 'Дисклеймер. ' + disclaimerMatch[1].trim() + ' Начните завтра утром.'
  : '';

const bookData = {
  title: 'PHILOSOPHIA ACTIVA',
  subtitle,
  author: 'Рим Рами',
  authorNote: '«Рим Рами» (Rim Rami) — псевдоним автора.',
  year: 2026,
  copyright: '© Рим Рами, 2026. Все права защищены.',
  disclaimer,
  tagline: 'Philosophia activa — философия в действии.',
  traditions,
  sections,
  footnotes,
};

const ts = `// Auto-generated from philosophia-activa-epub-v3.md
// Run: node scripts/generate-bookData.mjs

export type SectionType =
  | 'title'
  | 'part'
  | 'chapter'
  | 'axiom'
  | 'rule'
  | 'extension'
  | 'appendix'
  | 'conclusion'
  | 'section';

export interface BookSection {
  id: string;
  title: string;
  type: SectionType;
  level: 1 | 2 | 3;
  content: string;
}

export interface BookData {
  title: string;
  subtitle: string;
  author: string;
  authorNote: string;
  year: number;
  copyright: string;
  disclaimer: string;
  tagline: string;
  traditions: string[];
  sections: BookSection[];
  footnotes: Record<string, string>;
}

export const bookData: BookData = ${JSON.stringify(bookData, null, 2)};

export function getSectionById(id: string): BookSection | undefined {
  return bookData.sections.find((s) => s.id === id);
}

export function getSectionsByType(type: SectionType): BookSection[] {
  return bookData.sections.filter((s) => s.type === type);
}

export function getTableOfContents(): BookSection[] {
  return bookData.sections.filter((s) => s.type !== 'title');
}
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, ts, 'utf8');

console.log(`Generated ${outPath}`);
console.log(`Sections: ${sections.length}, Footnotes: ${Object.keys(footnotes).length}`);
