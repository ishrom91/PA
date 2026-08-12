import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const fromDocx = args.includes('--from-docx');
const docxArg = args.find((a) => a.endsWith('.docx'));
const docxPath =
  docxArg ||
  path.join(root, 'philosophia-activa-ridero.docx') ||
  'c:\\Users\\User\\Downloads\\philosophia-activa-ridero.docx';

const mdPath = path.join(root, 'philosophia-activa-epub-v3.md');
const outPath = path.join(root, 'src', 'data', 'bookData.ts');

function normalizePandocMd(raw) {
  let md = raw.replace(/\r\n/g, '\n');

  // Footnote references and definitions: \[^1\] -> [^1]
  md = md.replace(/\\(\[\^\d+\])/g, '$1');

  // Escaped emphasis / strong markers
  md = md.replace(/\\([*_])/g, '$1');

  // Escaped ordered-list numbers: 1\. -> 1.
  md = md.replace(/^(\d+)\\\. /gm, '$1. ');

  // Ridero / pandoc separator lines
  md = md.replace(/^─+$/gm, '***');

  // Escaped TOC brackets: \[title\](#id) -> [title](#id)
  md = md.replace(/\\([\[\]])/g, '$1');

  return md;
}

function convertDocxToMarkdown(docx) {
  if (!fs.existsSync(docx)) {
    throw new Error(`DOCX not found: ${docx}`);
  }
  const tmp = path.join(root, '.tmp-ridero.md');
  execSync(`pandoc "${docx}" -t gfm -o "${tmp}" --wrap=none`, {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  const normalized = normalizePandocMd(fs.readFileSync(tmp, 'utf8'));
  fs.writeFileSync(mdPath, normalized, 'utf8');
  fs.unlinkSync(tmp);
  console.log(`Converted ${docx} -> ${mdPath}`);
  return normalized;
}

let md;
if (fromDocx) {
  md = convertDocxToMarkdown(docxPath);
} else if (fs.existsSync(mdPath)) {
  md = normalizePandocMd(fs.readFileSync(mdPath, 'utf8'));
} else {
  md = convertDocxToMarkdown(docxPath);
}

// Footnotes
const footnotes = {};
for (const line of md.split('\n')) {
  const m = line.match(/^\[\^(\d+)\]:\s*(.+)$/);
  if (m) footnotes[m[1]] = m[2].trim();
}

// Anchor map from TOC (before first part)
const partStart = md.indexOf('# ЧАСТЬ I.');
const tocBlock = partStart > 0 ? md.slice(0, partStart) : '';
const anchorMap = new Map();
for (const m of tocBlock.matchAll(/\[([^\]]+)\]\(#([^)]+)\)/g)) {
  anchorMap.set(m[1].trim(), m[2]);
}

const contentStart = md.indexOf('# PHILOSOPHIA ACTIVA');
const body = md.slice(contentStart);
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

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'section'
  );
}

for (const line of lines) {
  const heading = line.match(/^(#{1,3})\s+(.+?)(?:\s+\{#([^}]+)\})?\s*$/);
  if (heading) {
    const level = heading[1].length;
    const title = heading[2].trim();
    const id = heading[3] || anchorMap.get(title) || slugify(title);

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
    current = {
      id,
      title,
      type: inferType(title, level),
      level,
      contentLines: [],
    };
    continue;
  }

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

const subtitleMatch = md.match(/\*(.+?)\*/);
const subtitle = subtitleMatch ? subtitleMatch[1] : '';
const traditionsMatch = md.match(/\*\*Синтез традиций:\*\*\s*\n\n([\s\S]+?)\n\nЭта книга/);
const traditions = traditionsMatch
  ? traditionsMatch[1]
      .split('·')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

const disclaimerMatch = md.match(/Дисклеймер\.\s*([\s\S]+?)Начните завтра утром\./);
const disclaimer = disclaimerMatch
  ? `Дисклеймер. ${disclaimerMatch[1].trim()} Начните завтра утром.`
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

const ts = `// Auto-generated from philosophia-activa-epub-v3.md (Ridero source)
// Run: node scripts/generate-bookData.mjs --from-docx

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

const ruleIds = sections.filter((s) => s.type === 'rule').map((s) => s.id);
console.log(`Rules: ${ruleIds.join(', ')}`);
