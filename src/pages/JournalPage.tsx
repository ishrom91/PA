import { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { formatDateRu, formatDateShort } from '../utils/date';
import { LANGUAGE_GAMES } from '../data/practices';

export default function JournalPage() {
  const { journal } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  const selected = selectedDate ? journal.find((e) => e.date === selectedDate) : null;

  if (selected) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedDate(null)}
          className="text-sm text-terracotta hover:underline"
        >
          ← Все записи
        </button>
        <h1 className="font-display text-2xl">{formatDateRu(selected.date)}</h1>
        <DayDetail entry={selected} />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">Журнал</h1>
        <p className="text-graphite/60 text-sm">
          Записей пока нет. Начните с утренней практики — без осуждения за пропуски.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Журнал</h1>
      <div className="space-y-2">
        {sorted.map((entry) => {
          const parts = [
            entry.morning && 'утро',
            entry.day && Object.keys(entry.day).length > 0 && 'день',
            entry.evening && 'вечер',
          ].filter(Boolean);

          return (
            <button
              key={entry.date}
              onClick={() => setSelectedDate(entry.date)}
              className="card w-full text-left hover:border-terracotta/30 transition-colors flex items-center justify-between"
            >
              <span className="font-medium">{formatDateShort(entry.date)}</span>
              <span className="text-xs text-graphite/50">
                {parts.length > 0 ? parts.join(' · ') : 'пустой день'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayDetail({ entry }: { entry: import('../types').JournalEntry }) {
  return (
    <div className="space-y-6">
      {entry.virtueIntention && (
        <Section title="Намерение добродетели">
          <p>{entry.virtueIntention}</p>
        </Section>
      )}

      {entry.morning && (
        <Section title="Утро">
          <Sub title="Дихотомия контроля">
            <p>Решение: {entry.morning.dichotomy.decision}</p>
            <p>Усилие: {entry.morning.dichotomy.effort}</p>
            <p>Отношение: {entry.morning.dichotomy.attitude}</p>
          </Sub>
          <Sub title="Субъективная ценность">
            <p>{entry.morning.subjectiveValue.person} — {entry.morning.subjectiveValue.benefit}</p>
          </Sub>
          <Sub title="Добродетель">
            <p>{entry.morning.virtue.situation}</p>
          </Sub>
        </Section>
      )}

      {entry.day && (
        <Section title="День">
          {entry.day.phronesis && (
            <Sub title="Phronesis">
              <p>{entry.day.phronesis.character}</p>
              {entry.day.phronesis.warningShown && (
                <p className="text-red-700/70 text-sm italic">Предупреждение показано</p>
              )}
            </Sub>
          )}
          {entry.day.threeQuestions && (
            <Sub title="Три вопроса">
              <p>{entry.day.threeQuestions.meaning}</p>
            </Sub>
          )}
          {entry.day.empathy && (
            <Sub title="Эмпатия">
              <p>Думает: {entry.day.empathy.thinks}</p>
              <p>Чувствует: {entry.day.empathy.feels}</p>
              <p>Хочет: {entry.day.empathy.wants}</p>
            </Sub>
          )}
          {entry.day.languageGame && (
            <Sub title="Языковая игра">
              <p>
                {LANGUAGE_GAMES.find((g) => g.id === entry.day!.languageGame!.game)?.label}
              </p>
            </Sub>
          )}
        </Section>
      )}

      {entry.evening && (
        <Section title="Вечер">
          <Sub title="Гармония">
            <p>Действия: {entry.evening.harmony.actions.score}/5</p>
            <p>Тело: {entry.evening.harmony.body.score}/5</p>
            <p>Ум: {entry.evening.harmony.mind.score}/5</p>
          </Sub>
          <Sub title="Искажения">
            <p>{entry.evening.distortion}</p>
          </Sub>
          <Sub title="Аутентичность">
            <p>{entry.evening.authenticity.mainAction}</p>
          </Sub>
        </Section>
      )}

      {!entry.morning && !entry.day && !entry.evening && !entry.virtueIntention && (
        <p className="text-graphite/50 text-sm italic">Пустой день.</p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-3">
      <h2 className="font-display text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm space-y-1">
      <p className="text-graphite/50 text-xs uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}
