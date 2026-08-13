import { bookData, type BookSection } from '../data/bookData';
import { todayKey } from '../utils/date';

export interface DailyQuote {
  text: string;
  sectionId: string;
  sectionTitle: string;
}

const SKIP_TYPES = new Set<BookSection['type']>(['title', 'part']);

function stripMarkdown(text: string): string {
  return text
    .replace(/\[\^(\d+)\]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function isQuotable(text: string): boolean {
  const t = stripMarkdown(text);
  if (t.length < 35 || t.length > 280) return false;
  if (/^(пример|типичная ошибка|контрольный вопрос|утверждение|философский контекст)/i.test(t)) {
    return false;
  }
  return true;
}

function addQuote(
  out: DailyQuote[],
  seen: Set<string>,
  section: BookSection,
  raw: string,
) {
  const text = stripMarkdown(raw);
  if (!isQuotable(text)) return;
  const key = text.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  out.push({ text, sectionId: section.id, sectionTitle: section.title });
}

function extractFromSection(section: BookSection): DailyQuote[] {
  const out: DailyQuote[] = [];
  const seen = new Set<string>();
  const content = section.content;
  if (!content.trim()) return out;

  for (const m of content.matchAll(/^>\s*(.+)$/gm)) {
    addQuote(out, seen, section, m[1]);
  }

  for (const m of content.matchAll(/^\*([^*\n]+)\*\s*$/gm)) {
    addQuote(out, seen, section, m[1]);
  }

  const assertion = content.match(/\*\*Утверждение:\*\*\s*([^\n]+)/);
  if (assertion) addQuote(out, seen, section, assertion[1]);

  for (const m of content.matchAll(/«([^»]{20,220})»/g)) {
    addQuote(out, seen, section, m[1]);
  }

  return out;
}

let cachedQuotes: DailyQuote[] | null = null;

export function getBookQuotes(): DailyQuote[] {
  if (cachedQuotes) return cachedQuotes;

  const seen = new Set<string>();
  cachedQuotes = [];

  for (const section of bookData.sections) {
    if (SKIP_TYPES.has(section.type)) continue;
    for (const quote of extractFromSection(section)) {
      const key = quote.text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cachedQuotes.push(quote);
    }
  }

  if (cachedQuotes.length === 0) {
    cachedQuotes.push({
      text: stripMarkdown(bookData.tagline),
      sectionId: 'ch1',
      sectionTitle: bookData.title,
    });
  }

  return cachedQuotes;
}

function dateSeed(dateKey: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDailyQuote(forDate = new Date()): DailyQuote {
  const quotes = getBookQuotes();
  const dateKey = todayKey(forDate);
  const index = dateSeed(dateKey) % quotes.length;
  return quotes[index]!;
}
