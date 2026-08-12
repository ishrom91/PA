export const VIRTUES = [
  { name: 'Справедливость', description: 'Поступать по заслугам, без favoritism и мести.' },
  { name: 'Мужество', description: 'Делать нужное, даже когда страшно или неудобно.' },
  { name: 'Щедрость', description: 'Давать время, внимание и ресурсы без расчёта на отдачу.' },
  { name: 'Правдивость', description: 'Говорить правду, включая правду о себе.' },
  { name: 'Благоразумие', description: 'Видеть последствия и выбирать меру.' },
] as const;

export function getVirtueForMonth(date = new Date()) {
  const index = date.getMonth() % VIRTUES.length;
  return { ...VIRTUES[index], monthIndex: index };
}
