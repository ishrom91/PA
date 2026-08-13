import { Link } from 'react-router-dom';
import { getDailyQuote } from '../lib/daily-quote';

export default function DailyQuote() {
  const quote = getDailyQuote();

  return (
    <section className="card-glass !p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-terracotta mb-3">
        Цитата дня
      </p>
      <blockquote className="text-[15px] font-display italic leading-relaxed text-graphite dark:text-graphite-dark border-l-[3px] border-terracotta/40 pl-4 py-0.5">
        «{quote.text}»
      </blockquote>
      <Link
        to={`/book?section=${quote.sectionId}`}
        className="inline-block mt-3 text-[13px] font-medium text-terracotta hover:underline"
      >
        {quote.sectionTitle} →
      </Link>
    </section>
  );
}
