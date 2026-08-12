import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'Philosophia Activa';
const BASE_URL = 'https://pa-mauve-iota.vercel.app';
const DEFAULT_DESC =
  'Интерактивный дневник практик по книге Рим Рами. 17 правил, утренние и вечерние ритуалы, читалка с пометками.';

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE} — дневник практик`,
    description: DEFAULT_DESC,
  },
  '/morning': {
    title: `Утренняя практика · ${SITE}`,
    description: 'Дихотомия контроля, субъективная ценность, добродетель дня — три шага утреннего ритуала.',
  },
  '/day': {
    title: `Дневные практики · ${SITE}`,
    description: 'Phronesis, три уточняющих вопроса, эмпатия, языковая игра — практики в момент события.',
  },
  '/evening': {
    title: `Вечерняя практика · ${SITE}`,
    description: 'Гармония дня, осознанность искажений, аутентичность — вечерний ритуал.',
  },
  '/rules': {
    title: `17 правил · ${SITE}`,
    description: 'Полный список правил Philosophia Activa с текстами из книги и поэтапным внедрением.',
  },
  '/book': {
    title: `Книга · ${SITE}`,
    description: 'Philosophia Activa — полный текст книги Рим Рами с оглавлением и пометками.',
  },
  '/notes': {
    title: `Пометки · ${SITE}`,
    description: 'Заметки к фрагментам книги Philosophia Activa.',
  },
  '/journal': {
    title: `Журнал · ${SITE}`,
    description: 'Записи утренних, дневных и вечерних практик по датам.',
  },
};

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export default function SeoHead() {
  const { pathname } = useLocation();
  const base = pathname.split('?')[0];
  const meta = ROUTE_META[base] ?? ROUTE_META['/'];
  const url = `${BASE_URL}${base === '/' ? '' : base}`;

  useEffect(() => {
    document.title = meta.title;
    setMeta('description', meta.description);
    setMeta('og:title', meta.title, 'property');
    setMeta('og:description', meta.description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:locale', 'ru_RU', 'property');
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);
  }, [meta.title, meta.description, url]);

  return null;
}
