export type RuleStatus = 'locked' | 'available' | 'active' | 'integrated';

export interface RuleStatusRecord {
  status: RuleStatus;
  activatedAt?: string;
  integratedAt?: string;
}

export interface MorningEntry {
  dichotomy: {
    decision: string;
    effort: string;
    attitude: string;
  };
  subjectiveValue: {
    person: string;
    values: string;
    benefit: string;
  };
  virtue: {
    situation: string;
  };
  completedAt: string;
}

export interface PhronesisEntry {
  character: string;
  autonomy: string;
  publicity: string;
  warningShown: boolean;
  completedAt: string;
}

export interface ThreeQuestionsEntry {
  meaning: string;
  source: string;
  consequence: string;
  completedAt: string;
}

export interface EmpathyEntry {
  thinks: string;
  feels: string;
  wants: string;
  completedAt: string;
}

export interface LanguageGameEntry {
  game: 'business' | 'emotional' | 'hierarchical' | 'friendly';
  notes?: string;
  completedAt: string;
}

export interface DayEntries {
  phronesis?: PhronesisEntry;
  threeQuestions?: ThreeQuestionsEntry;
  empathy?: EmpathyEntry;
  languageGame?: LanguageGameEntry;
}

export interface HarmonyAxis {
  score: number;
  comment: string;
}

export interface EveningEntry {
  harmony: {
    actions: HarmonyAxis;
    body: HarmonyAxis;
    mind: HarmonyAxis;
  };
  distortion: string;
  authenticity: {
    mainAction: string;
    wouldDoInPrivate: boolean;
  };
  completedAt: string;
}

export interface JournalEntry {
  date: string;
  morning?: MorningEntry;
  day?: DayEntries;
  evening?: EveningEntry;
  virtueIntention?: string;
}

export interface Note {
  id: string;
  sectionId: string;
  sectionTitle: string;
  highlightedText: string;
  noteText: string;
  createdAt: string;
}

export interface VirtueOfTheMonth {
  name: string;
  description: string;
  monthIndex: number;
}

export interface YearTrait {
  trait: string;
  year: number;
  setAt: string;
}

export interface AppStorage {
  ruleStatuses: Record<number, RuleStatusRecord>;
  journal: JournalEntry[];
  notes: Note[];
  yearTrait?: YearTrait;
  initializedAt: string;
  onboardingCompleted?: boolean;
}
