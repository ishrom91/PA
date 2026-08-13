import type { AppStorage, JournalEntry, Note } from '../../types';
import type { RuleStatusRecord } from '../../types';
import { supabase } from '../supabase';

export type PracticeType =
  | 'morning'
  | 'evening'
  | 'virtue_intention'
  | 'phronesis'
  | 'threeQuestions'
  | 'empathy'
  | 'languageGame';

export function appStorageToRemoteRows(userId: string, storage: AppStorage) {
  const journalRows: {
    user_id: string;
    entry_date: string;
    practice_type: string;
    content: unknown;
  }[] = [];

  for (const entry of storage.journal) {
    if (entry.morning) {
      journalRows.push({
        user_id: userId,
        entry_date: entry.date,
        practice_type: 'morning',
        content: entry.morning,
      });
    }
    if (entry.evening) {
      journalRows.push({
        user_id: userId,
        entry_date: entry.date,
        practice_type: 'evening',
        content: entry.evening,
      });
    }
    if (entry.virtueIntention?.trim()) {
      journalRows.push({
        user_id: userId,
        entry_date: entry.date,
        practice_type: 'virtue_intention',
        content: { text: entry.virtueIntention },
      });
    }
    if (entry.day?.phronesis) {
      journalRows.push({
        user_id: userId,
        entry_date: entry.date,
        practice_type: 'phronesis',
        content: entry.day.phronesis,
      });
    }
    if (entry.day?.threeQuestions) {
      journalRows.push({
        user_id: userId,
        entry_date: entry.date,
        practice_type: 'threeQuestions',
        content: entry.day.threeQuestions,
      });
    }
    if (entry.day?.empathy) {
      journalRows.push({
        user_id: userId,
        entry_date: entry.date,
        practice_type: 'empathy',
        content: entry.day.empathy,
      });
    }
    if (entry.day?.languageGame) {
      journalRows.push({
        user_id: userId,
        entry_date: entry.date,
        practice_type: 'languageGame',
        content: entry.day.languageGame,
      });
    }
  }

  const ruleRows = Object.entries(storage.ruleStatuses).map(([n, r]) => ({
    user_id: userId,
    rule_id: String(n),
    status: r.status,
    activated_at: r.activatedAt ?? null,
    integrated_at: r.integratedAt ?? null,
  }));

  const noteRows = storage.notes.map((n) => ({
    id: n.id.length === 36 ? n.id : undefined,
    user_id: userId,
    section_id: n.sectionId,
    section_title: n.sectionTitle,
    anchor_text: n.highlightedText,
    note_text: n.noteText,
    created_at: n.createdAt,
  }));

  return { journalRows, ruleRows, noteRows };
}

export function remoteRowsToAppStorage(
  journalRows: { entry_date: string; practice_type: string; content: unknown }[],
  ruleRows: { rule_id: string; status: string; activated_at: string | null; integrated_at: string | null }[],
  noteRows: { id: string; section_id: string; section_title: string | null; anchor_text: string; note_text: string; created_at: string }[],
  base: AppStorage,
): AppStorage {
  const journalMap = new Map<string, JournalEntry>();

  for (const row of journalRows) {
    const entry = journalMap.get(row.entry_date) ?? { date: row.entry_date };
    const c = row.content as Record<string, unknown>;

    switch (row.practice_type) {
      case 'morning':
        entry.morning = c as unknown as JournalEntry['morning'];
        break;
      case 'evening':
        entry.evening = c as unknown as JournalEntry['evening'];
        break;
      case 'virtue_intention':
        entry.virtueIntention = (c as { text?: string }).text;
        break;
      case 'phronesis':
      case 'threeQuestions':
      case 'empathy':
      case 'languageGame':
        entry.day = entry.day ?? {};
        entry.day[row.practice_type as keyof NonNullable<JournalEntry['day']>] = c as never;
        break;
    }
    journalMap.set(row.entry_date, entry);
  }

  const ruleStatuses: Record<number, RuleStatusRecord> = { ...base.ruleStatuses };
  for (const r of ruleRows) {
    const n = Number(r.rule_id);
    ruleStatuses[n] = {
      status: r.status as RuleStatusRecord['status'],
      activatedAt: r.activated_at ?? undefined,
      integratedAt: r.integrated_at ?? undefined,
    };
  }

  const notes: Note[] = noteRows.map((n) => ({
    id: n.id,
    sectionId: n.section_id,
    sectionTitle: n.section_title ?? '',
    highlightedText: n.anchor_text,
    noteText: n.note_text,
    createdAt: n.created_at,
  }));

  return {
    ...base,
    journal: [...journalMap.values()].sort((a, b) => b.date.localeCompare(a.date)),
    ruleStatuses,
    notes,
  };
}

export async function fetchRemoteStorage(userId: string, base: AppStorage): Promise<AppStorage> {
  if (!supabase) return base;

  const [journalRes, rulesRes, notesRes] = await Promise.all([
    supabase.from('journal_entries').select('entry_date, practice_type, content').eq('user_id', userId),
    supabase.from('rule_progress').select('rule_id, status, activated_at, integrated_at').eq('user_id', userId),
    supabase.from('notes').select('id, section_id, section_title, anchor_text, note_text, created_at').eq('user_id', userId),
  ]);

  if (journalRes.error) throw journalRes.error;
  if (rulesRes.error) throw rulesRes.error;
  if (notesRes.error) throw notesRes.error;

  return remoteRowsToAppStorage(
    journalRes.data ?? [],
    rulesRes.data ?? [],
    notesRes.data ?? [],
    base,
  );
}

export async function pushStorageToRemote(userId: string, storage: AppStorage): Promise<void> {
  if (!supabase) return;

  const { journalRows, ruleRows, noteRows } = appStorageToRemoteRows(userId, storage);

  if (journalRows.length) {
    const { error } = await supabase.from('journal_entries').upsert(journalRows, {
      onConflict: 'user_id,entry_date,practice_type',
    });
    if (error) throw error;
  }

  if (ruleRows.length) {
    const { error } = await supabase.from('rule_progress').upsert(ruleRows, {
      onConflict: 'user_id,rule_id',
    });
    if (error) throw error;
  }

  if (noteRows.length) {
    const { error } = await supabase.from('notes').upsert(noteRows);
    if (error) throw error;
  }
}

export async function pushTrainingSample(
  practiceType: string,
  content: unknown,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('training_data').insert({
    practice_type: practiceType,
    content,
  });
  if (error) throw error;
}

export async function deleteAllUserData(userId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('notes').delete().eq('user_id', userId);
  await supabase.from('journal_entries').delete().eq('user_id', userId);
  await supabase.from('rule_progress').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);
}
