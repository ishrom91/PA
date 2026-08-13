import type { PracticeChatStep } from '../components/PracticeChatFlow';
import type { JournalEntry } from '../types';
import { getVirtueForMonth } from './virtues';
import {
  transcriptsToMorningEntry,
  transcriptsToEveningEntry,
  transcriptToPhronesisEntry,
  transcriptToThreeQuestionsEntry,
  transcriptToEmpathyEntry,
  transcriptToLanguageGameEntry,
} from '../lib/chat-journal';
import type { AppState } from '../hooks/useAppState';

export type PracticeGroup = 'morning' | 'evening' | 'day';

export type PracticeId =
  | 'morning'
  | 'evening'
  | 'phronesis'
  | 'threeQuestions'
  | 'empathy'
  | 'languageGame';

export interface PracticeDefinition {
  id: PracticeId;
  group: PracticeGroup;
  title: string;
  subtitle: string;
  tradition: string;
  getSteps: () => PracticeChatStep[];
}

const GROUP_LABELS: Record<PracticeGroup, string> = {
  morning: 'Утро',
  evening: 'Вечер',
  day: 'В момент события',
};

export function getGroupLabel(group: PracticeGroup): string {
  return GROUP_LABELS[group];
}

export const PRACTICE_CATALOG: PracticeDefinition[] = [
  {
    id: 'morning',
    group: 'morning',
    title: 'Утренняя практика',
    subtitle: 'Три шага: контроль, ценность, добродетель',
    tradition: 'Эпиктет · Мизес · Аристотель',
    getSteps: () => {
      const virtue = getVirtueForMonth();
      return [
        { practice: 'dichotomy', title: 'Дихотомия контроля', eyebrow: 'Эпиктет' },
        { practice: 'subjective-value', title: 'Субъективная ценность', eyebrow: 'Мизес' },
        {
          practice: 'virtue-day',
          title: 'Добродетель дня',
          eyebrow: 'Аристотель',
          subtitle: virtue.name,
        },
      ];
    },
  },
  {
    id: 'evening',
    group: 'evening',
    title: 'Вечерняя практика',
    subtitle: 'Гармония, искажения, аутентичность',
    tradition: 'Аристотель',
    getSteps: () => [
      { practice: 'harmony', title: 'Гармония', eyebrow: 'Три оси' },
      { practice: 'distortion', title: 'Искажения', eyebrow: 'Честность с собой' },
      { practice: 'authenticity', title: 'Аутентичность', eyebrow: 'Главный поступок' },
    ],
  },
  {
    id: 'phronesis',
    group: 'day',
    title: 'Phronesis',
    subtitle: 'Перед финансовым решением',
    tradition: 'Аристотель',
    getSteps: () => [
      { practice: 'phronesis', title: 'Phronesis', eyebrow: 'Аристотель' },
    ],
  },
  {
    id: 'threeQuestions',
    group: 'day',
    title: 'Три уточняющих вопроса',
    subtitle: 'В споре или недопонимании',
    tradition: 'Сократ',
    getSteps: () => [
      { practice: 'three-questions', title: 'Три вопроса', eyebrow: 'Сократ' },
    ],
  },
  {
    id: 'empathy',
    group: 'day',
    title: 'Эмпатия',
    subtitle: 'В конфликте',
    tradition: 'Штейн',
    getSteps: () => [
      { practice: 'empathy', title: 'Эмпатия', eyebrow: 'Штейн' },
    ],
  },
  {
    id: 'languageGame',
    group: 'day',
    title: 'Языковая игра',
    subtitle: 'Перед важной беседой',
    tradition: 'Витгенштейн',
    getSteps: () => [
      { practice: 'language-game', title: 'Языковая игра', eyebrow: 'Витгенштейн' },
    ],
  },
];

export function getPracticeById(id: PracticeId): PracticeDefinition | undefined {
  return PRACTICE_CATALOG.find((p) => p.id === id);
}

export function isValidPracticeId(id: string | null): id is PracticeId {
  return PRACTICE_CATALOG.some((p) => p.id === id);
}

export function isPracticeDoneToday(id: PracticeId, entry?: JournalEntry): boolean {
  if (!entry) return false;
  switch (id) {
    case 'morning':
      return !!entry.morning;
    case 'evening':
      return !!entry.evening;
    case 'phronesis':
      return !!entry.day?.phronesis;
    case 'threeQuestions':
      return !!entry.day?.threeQuestions;
    case 'empathy':
      return !!entry.day?.empathy;
    case 'languageGame':
      return !!entry.day?.languageGame;
    default:
      return false;
  }
}

export function savePracticeToJournal(
  id: PracticeId,
  transcripts: string[],
  app: Pick<AppState, 'saveMorning' | 'saveEvening' | 'saveDayPractice'>,
): void {
  switch (id) {
    case 'morning':
      app.saveMorning(transcriptsToMorningEntry(transcripts));
      break;
    case 'evening':
      app.saveEvening(transcriptsToEveningEntry(transcripts));
      break;
    case 'phronesis':
      app.saveDayPractice('phronesis', transcriptToPhronesisEntry(transcripts[0]));
      break;
    case 'threeQuestions':
      app.saveDayPractice('threeQuestions', transcriptToThreeQuestionsEntry(transcripts[0]));
      break;
    case 'empathy':
      app.saveDayPractice('empathy', transcriptToEmpathyEntry(transcripts[0]));
      break;
    case 'languageGame':
      app.saveDayPractice('languageGame', transcriptToLanguageGameEntry(transcripts[0]));
      break;
  }
}
