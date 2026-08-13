import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { BOOSTY_URL, CLOUDTIPS_URL } from '../config/links';
import { shareAppLink } from '../utils/shareApp';

export default function SupportPage() {
  const [toast, setToast] = useState<string | null>(null);

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const result = await shareAppLink();
    if (result === 'copied') {
      setToast('Ссылка скопирована');
      window.setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      <PageHeader title="Поддержать проект" />

      <section className="card space-y-5">
        <p className="text-[15px] leading-relaxed text-graphite dark:text-graphite-dark">
          Philosophia Activa — это плот, а не бизнес. Книга и приложение создаются одним человеком
          и распространяются свободно. Если плот помог тебе переплыть свою реку — можешь оставить
          что-то на берегу для следующего путника. Это не плата. Это продолжение.
        </p>

        <div className="space-y-3">
          <button type="button" className="btn-primary w-full" onClick={() => openExternal(BOOSTY_URL)}>
            Поддержать на Boosty
          </button>
          <button type="button" className="btn-primary w-full" onClick={() => openExternal(CLOUDTIPS_URL)}>
            Разовый донат
          </button>
          <button type="button" className="btn-secondary w-full" onClick={handleShare}>
            Рассказать другу
          </button>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-medium text-olive">Внести вклад можно не только деньгами</h2>
        <Link
          to="/profile#share-patterns"
          className="block text-sm leading-relaxed text-muted hover:text-terracotta transition-colors"
        >
          Разрешить делиться анонимными паттернами практик — наставник становится мудрее для всех
        </Link>
        <button
          type="button"
          className="block text-sm text-muted hover:text-terracotta transition-colors text-left"
          onClick={handleShare}
        >
          Рассказать другу
        </button>
      </section>

      <p className="text-xs text-faint text-center leading-relaxed px-2">
        Проект существует на добровольной поддержке. Никаких платных функций не планируется.
      </p>

      <p className="text-center text-sm">
        <Link to="/profile" className="text-terracotta hover:underline">
          ← В профиль
        </Link>
      </p>

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-graphite dark:bg-surface-dark text-white dark:text-graphite-dark text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
