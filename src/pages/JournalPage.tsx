import { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { formatDateRu, formatDateShort } from '../utils/date';
import { LANGUAGE_GAMES } from '../data/practices';
import PageHeader from '../components/PageHeader';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { hapticLight } from '../utils/haptics';

export default function JournalPage() {
  const { journal, refreshJournal } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  const selected = selectedDate ? journal.find((e) => e.date === selectedDate) : null;

  const { pullDistance, refreshing, handlers } = usePullToRefresh({
    onRefresh: async () => {
      hapticLight();
      refreshJournal();
      setRefreshKey((k) => k + 1);
      await new Promise((r) => setTimeout(r, 500));
    },
  });

  if (selected) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          type="button"
          onClick={() => setSelectedDate(null)}
          className="btn-ghost !px-0"
        >
          ← Все записи
        </button>
        <PageHeader title={formatDateRu(selected.date)} />
        <DayDetail entry={selected} />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      {...handlers}
      key={refreshKey}
    >
      <div
        className="flex justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pullDistance > 0 ? pullDistance : refreshing ? 40 : 0 }}
      >
        <div className={`flex items-center gap-2 text-[13px] text-graphite-secondary dark:text-graphite-secondary-dark ${refreshing ? 'animate-pulse' : ''}`}>
          {refreshing ? (
            <>
              <span className="w-4 h-4 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
              Обновление…
            </>
          ) : pullDistance > 50 ? (
            'Отпустите для обновления'
          ) : pullDistance > 0 ? (
            'Потяните вниз'
          ) : null}
        </div>
      </div>

      <PageHeader
        title="Журнал"
        subtitle={
          sorted.length === 0
            ? 'Записей пока нет. Начните с утренней практики — без осуждения за пропуски.'
            : `${sorted.length} ${sorted.length === 1 ? 'день' : sorted.length < 5 ? 'дня' : 'дней'} с записями`
        }
      />

      {sorted.length === 0 ? null : (
        <div className="space-y-2">
          {sorted.map((entry) => {
            const parts = [
              entry.morning && 'утро',
              entry.day && Object.keys(entry.day).length > 0 && 'день',
              entry.evening && 'вечер',
              entry.mentorChat && 'разговор',
            ].filter(Boolean);

            return (
              <button
                key={entry.date}
                type="button"
                onClick={() => setSelectedDate(entry.date)}
                className="card w-full text-left !p-4 flex items-center justify-between hover:shadow-float active:scale-[0.99] transition-all"
              >
                <span className="font-medium text-[15px]">{formatDateShort(entry.date)}</span>
                <span className="text-[13px] text-graphite-secondary dark:text-graphite-secondary-dark">
                  {parts.length > 0 ? parts.join(' · ') : 'пустой день'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DayDetail({ entry }: { entry: import('../types').JournalEntry }) {
  return (
    <div className="space-y-4">
      {entry.virtueIntention && (
        <Section title="Намерение добродетели">
          <p>{entry.virtueIntention}</p>
        </Section>
      )}

      {entry.mentorChat && (
        <Section title="Разговор с наставником">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.mentorChat}</p>
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
                <p className="text-red-600 dark:text-red-400 text-sm italic">Предупреждение показано</p>
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
              {entry.day.languageGame.notes ? (
                <p className="whitespace-pre-wrap">{entry.day.languageGame.notes}</p>
              ) : (
                <p>
                  {LANGUAGE_GAMES.find((g) => g.id === entry.day!.languageGame!.game)?.label}
                </p>
              )}
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

      {!entry.morning && !entry.day && !entry.evening && !entry.virtueIntention && !entry.mentorChat && (
        <p className="text-graphite-secondary dark:text-graphite-secondary-dark text-sm italic">Пустой день.</p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-3">
      <h2 className="section-title">{title}</h2>
      {children}
    </div>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm space-y-1">
      <p className="label-text !mb-1">{title}</p>
      {children}
    </div>
  );
}
