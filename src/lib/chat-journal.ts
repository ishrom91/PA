import type {
  MorningEntry,
  EveningEntry,
  PhronesisEntry,
  ThreeQuestionsEntry,
  EmpathyEntry,
  LanguageGameEntry,
} from '../types';

export function transcriptsToMorningEntry(transcripts: string[]): MorningEntry {
  const [dichotomy = '', subjective = '', virtue = ''] = transcripts;
  return {
    dichotomy: { decision: dichotomy, effort: '', attitude: '' },
    subjectiveValue: { person: subjective, values: '', benefit: '' },
    virtue: { situation: virtue },
    completedAt: new Date().toISOString(),
  };
}

export function transcriptsToEveningEntry(transcripts: string[]): EveningEntry {
  const [harmony = '', distortion = '', authenticity = ''] = transcripts;
  return {
    harmony: {
      actions: { score: 3, comment: harmony },
      body: { score: 3, comment: '' },
      mind: { score: 3, comment: '' },
    },
    distortion,
    authenticity: { mainAction: authenticity, wouldDoInPrivate: true },
    completedAt: new Date().toISOString(),
  };
}

export function transcriptToPhronesisEntry(transcript: string): PhronesisEntry {
  return {
    character: transcript,
    autonomy: '',
    publicity: '',
    warningShown: false,
    completedAt: new Date().toISOString(),
  };
}

export function transcriptToThreeQuestionsEntry(transcript: string): ThreeQuestionsEntry {
  return {
    meaning: transcript,
    source: '',
    consequence: '',
    completedAt: new Date().toISOString(),
  };
}

export function transcriptToEmpathyEntry(transcript: string): EmpathyEntry {
  return {
    thinks: transcript,
    feels: '',
    wants: '',
    completedAt: new Date().toISOString(),
  };
}

export function transcriptToLanguageGameEntry(transcript: string): LanguageGameEntry {
  return {
    game: 'business',
    notes: transcript,
    completedAt: new Date().toISOString(),
  };
}
