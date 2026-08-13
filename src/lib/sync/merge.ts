import type { AppStorage, JournalEntry, Note, RuleStatus, RuleStatusRecord } from '../../types';

const STATUS_RANK: Record<RuleStatus, number> = {
  locked: 0,
  available: 1,
  active: 2,
  integrated: 3,
};

function mergeRuleRecord(a: RuleStatusRecord, b: RuleStatusRecord): RuleStatusRecord {
  const rankA = STATUS_RANK[a.status];
  const rankB = STATUS_RANK[b.status];
  if (rankB > rankA) return { ...b };
  if (rankA > rankB) return { ...a };
  return {
    status: a.status,
    activatedAt: pickLater(a.activatedAt, b.activatedAt),
    integratedAt: pickLater(a.integratedAt, b.integratedAt),
  };
}

function pickLater(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function mergeJournalEntry(a: JournalEntry, b: JournalEntry): JournalEntry {
  return {
    date: a.date,
    virtueIntention: pickNewerString(a.virtueIntention, b.virtueIntention, a, b),
    mentorChat: pickNewerString(a.mentorChat, b.mentorChat, a, b),
    morning: pickNewerPractice(a.morning, b.morning),
    day: {
      ...a.day,
      ...b.day,
      phronesis: pickNewerPractice(a.day?.phronesis, b.day?.phronesis),
      threeQuestions: pickNewerPractice(a.day?.threeQuestions, b.day?.threeQuestions),
      empathy: pickNewerPractice(a.day?.empathy, b.day?.empathy),
      languageGame: pickNewerPractice(a.day?.languageGame, b.day?.languageGame),
    },
    evening: pickNewerPractice(a.evening, b.evening),
  };
}

function pickNewerPractice<T extends { completedAt?: string }>(
  a?: T,
  b?: T,
): T | undefined {
  if (!a) return b;
  if (!b) return a;
  const ca = a.completedAt ?? '';
  const cb = b.completedAt ?? '';
  return ca >= cb ? a : b;
}

function pickNewerString(
  a?: string,
  b?: string,
  entryA?: JournalEntry,
  entryB?: JournalEntry,
): string | undefined {
  if (!a?.trim()) return b;
  if (!b?.trim()) return a;
  const ta = entryA?.morning?.completedAt ?? entryA?.evening?.completedAt ?? '';
  const tb = entryB?.morning?.completedAt ?? entryB?.evening?.completedAt ?? '';
  return ta >= tb ? a : b;
}

function mergeNotes(a: Note[], b: Note[]): Note[] {
  const map = new Map<string, Note>();
  for (const n of [...a, ...b]) {
    const key = `${n.sectionId}::${n.highlightedText.slice(0, 80)}::${n.noteText.slice(0, 80)}`;
    const existing = map.get(key);
    if (!existing || n.createdAt > existing.createdAt) {
      map.set(key, n);
    }
  }
  return [...map.values()].sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

export function mergeAppStorage(local: AppStorage, remote: AppStorage): AppStorage {
  const journalMap = new Map<string, JournalEntry>();
  for (const e of [...local.journal, ...remote.journal]) {
    const prev = journalMap.get(e.date);
    journalMap.set(e.date, prev ? mergeJournalEntry(prev, e) : e);
  }

  const ruleStatuses = { ...local.ruleStatuses };
  for (const [key, remoteRule] of Object.entries(remote.ruleStatuses)) {
    const n = Number(key);
    const localRule = ruleStatuses[n];
    ruleStatuses[n] = localRule
      ? mergeRuleRecord(localRule, remoteRule)
      : remoteRule;
  }

  return {
    ...local,
    ruleStatuses,
    journal: [...journalMap.values()].sort((a, b) => b.date.localeCompare(a.date)),
    notes: mergeNotes(local.notes, remote.notes),
    onboardingCompleted: local.onboardingCompleted || remote.onboardingCompleted,
    initializedAt: local.initializedAt || remote.initializedAt,
  };
}
