export const LANGUAGE_GAMES = [
  {
    id: 'business' as const,
    label: 'Деловая',
    tone: 'Факты, сроки, ответственность.',
    goal: 'Достичь конкретного результата без лишних эмоций.',
  },
  {
    id: 'emotional' as const,
    label: 'Эмоциональная',
    tone: 'Чувства, поддержка, признание.',
    goal: 'Быть услышанным и понятым, не решая проблему сразу.',
  },
  {
    id: 'hierarchical' as const,
    label: 'Иерархическая',
    tone: 'Уважение к статусу, формальность, чёткие роли.',
    goal: 'Сохранить структуру и обязательства между сторонами.',
  },
  {
    id: 'friendly' as const,
    label: 'Дружеская',
    tone: 'Лёгкость, юмор, общие воспоминания.',
    goal: 'Поддержать связь, а не решить задачу.',
  },
];

export const FORBIDDEN_EMPATHY_WORDS = [
  'правильно', 'должен', 'странно', 'очевидно',
];

export function hasForbiddenWords(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_EMPATHY_WORDS.some((w) => lower.includes(w));
}

export function isPhronesisWarning(
  character: string,
  autonomy: string,
  publicity: string,
): boolean {
  const worry = (s: string) => {
    const l = s.toLowerCase();
    return (
      /\b(нет|не\s+бы|не\s+стал|разруш|завис|стыд|мошен|азарт|плох|опасн|риск)\b/.test(l) &&
      s.trim().length > 2
    );
  };
  return [character, autonomy, publicity].some(worry);
}
