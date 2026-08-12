import { getSectionById } from './bookData';

export interface RuleDefinition {
  number: number;
  id: string;
  title: string;
  tradition: string;
  shortDescription: string;
  bookSectionId: string;
  practiceRoute?: string;
}

export const RULES: RuleDefinition[] = [
  {
    number: 1,
    id: 'rule-1',
    title: 'Phronesis перед расчётом',
    tradition: 'Аристотель',
    shortDescription: 'Перед финансовым шагом спроси: каким человеком это делает меня?',
    bookSectionId: 'rule-1',
    practiceRoute: '/day',
  },
  {
    number: 2,
    id: 'rule-2',
    title: 'Premeditatio malorum',
    tradition: 'Сенека',
    shortDescription: 'Заранее представь потери и составь план действий.',
    bookSectionId: 'rule-2',
  },
  {
    number: 3,
    id: 'rule-3',
    title: 'Прагматический аудит',
    tradition: 'Пирс, Джеймс, Дьюи',
    shortDescription: 'Проверяй убеждения не чтением, а наблюдением на практике.',
    bookSectionId: 'rule-3',
  },
  {
    number: 4,
    id: 'rule-4',
    title: 'Инвестиции в невидимые активы',
    tradition: 'Конфуций',
    shortDescription: '10% времени и 5% дохода — на связи без просьбы.',
    bookSectionId: 'rule-4',
  },
  {
    number: 5,
    id: 'rule-5',
    title: 'Субъективная ценность в каждой сделке',
    tradition: 'Мизес',
    shortDescription: 'Продавай не продукт, а субъективную выгоду для клиента.',
    bookSectionId: 'rule-5',
    practiceRoute: '/morning',
  },
  {
    number: 6,
    id: 'rule-6',
    title: 'Три уточняющих вопроса',
    tradition: 'Сократ',
    shortDescription: 'В споре — три вопроса, прежде чем ответить.',
    bookSectionId: 'rule-6',
    practiceRoute: '/day',
  },
  {
    number: 7,
    id: 'rule-7',
    title: 'Языковая игра',
    tradition: 'Витгенштейн',
    shortDescription: 'Перед беседой определи, какую игру вы играете.',
    bookSectionId: 'rule-7',
    practiceRoute: '/day',
  },
  {
    number: 8,
    id: 'rule-8',
    title: 'Эмпатия как когнитивный акт',
    tradition: 'Штейн',
    shortDescription: 'Опиши ситуацию глазами оппонента — без оценок.',
    bookSectionId: 'rule-8',
    practiceRoute: '/day',
  },
  {
    number: 9,
    id: 'rule-9',
    title: 'Ритуал уважения',
    tradition: 'Конфуций',
    shortDescription: 'Ма — пауза, внимание, перефразирование.',
    bookSectionId: 'rule-9',
  },
  {
    number: 10,
    id: 'rule-10',
    title: 'Аудит отношений',
    tradition: 'Эпикур',
    shortDescription: 'Раз в год — 15 ближайших людей: энергия или опустошение?',
    bookSectionId: 'rule-10',
  },
  {
    number: 11,
    id: 'rule-11',
    title: 'Гармония дня',
    tradition: 'Платон',
    shortDescription: 'Три оси: действия, тело, ум — были ли они целостны?',
    bookSectionId: 'rule-11',
    practiceRoute: '/evening',
  },
  {
    number: 12,
    id: 'rule-12',
    title: 'Одна добродетель в месяц',
    tradition: 'Аристотель',
    shortDescription: 'Каждый месяц — одна добродетель, каждый день — одно проявление.',
    bookSectionId: 'rule-12',
    practiceRoute: '/morning',
  },
  {
    number: 13,
    id: 'rule-13',
    title: 'Преодоление одной черты в год',
    tradition: 'Ницше',
    shortDescription: 'Одна черта характера — фоновая тема года.',
    bookSectionId: 'rule-13',
  },
  {
    number: 14,
    id: 'rule-14',
    title: 'Осознанность искажений',
    tradition: 'Будда',
    shortDescription: 'Что я приукрасил сегодня — и почему?',
    bookSectionId: 'rule-14',
    practiceRoute: '/evening',
  },
  {
    number: 15,
    id: 'rule-15',
    title: 'Аутентичный фильтр',
    tradition: 'Камю',
    shortDescription: 'Сделал бы я это, если бы никто не узнал?',
    bookSectionId: 'rule-15',
    practiceRoute: '/evening',
  },
  {
    number: 16,
    id: 'rule-16',
    title: 'Тело как инструмент разума',
    tradition: 'Аристотель',
    shortDescription: 'Физическая форма — не эстетика, а когнитивная инфраструктура.',
    bookSectionId: 'rule-16',
  },
  {
    number: 17,
    id: 'rule-17',
    title: 'Катабасис',
    tradition: 'Ницше · Камю · Будда · Деррида',
    shortDescription: 'Спуск в собственную тьму — не наказание, а источник силы.',
    bookSectionId: 'rule-17',
  },
];

export function getRuleFullText(bookSectionId: string): string {
  const section = getSectionById(bookSectionId);
  return section?.content ?? '';
}

export function getRuleByNumber(n: number): RuleDefinition | undefined {
  return RULES.find((r) => r.number === n);
}
