import { useState } from 'react';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppStateContext';
import {
  LANGUAGE_GAMES,
  hasForbiddenWords,
  isPhronesisWarning,
} from '../data/practices';

type Practice = 'phronesis' | 'threeQuestions' | 'empathy' | 'languageGame' | null;

const PRACTICES = [
  {
    id: 'phronesis' as const,
    title: 'Phronesis',
    subtitle: 'Перед финансовым решением',
    tradition: 'Аристотель',
  },
  {
    id: 'threeQuestions' as const,
    title: 'Три уточняющих вопроса',
    subtitle: 'В споре',
    tradition: 'Сократ',
  },
  {
    id: 'empathy' as const,
    title: 'Эмпатия',
    subtitle: 'В конфликте',
    tradition: 'Штейн',
  },
  {
    id: 'languageGame' as const,
    title: 'Языковая игра',
    subtitle: 'Перед беседой',
    tradition: 'Витгенштейн',
  },
];

export default function DayPage() {
  const [active, setActive] = useState<Practice>(null);
  const { saveDayPractice } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Дневные практики"
        subtitle="Вызывай в момент события. Запиши — и вернись к делу."
      />

      <div className="space-y-2">
        {PRACTICES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className="card w-full text-left !p-4 flex items-center gap-4 hover:shadow-float active:scale-[0.99] transition-all duration-150"
          >
            <div className="w-11 h-11 rounded-2xl bg-terracotta-soft flex items-center justify-center text-terracotta text-lg font-semibold shrink-0">
              {p.title.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[15px]">{p.title}</p>
              <p className="text-[13px] text-graphite-secondary">{p.subtitle}</p>
            </div>
            <span className="text-graphite-tertiary text-lg">›</span>
          </button>
        ))}
      </div>

      <PhronesisModal
        open={active === 'phronesis'}
        onClose={() => setActive(null)}
        onSave={(entry) => {
          saveDayPractice('phronesis', entry);
          setActive(null);
        }}
      />

      <ThreeQuestionsModal
        open={active === 'threeQuestions'}
        onClose={() => setActive(null)}
        onSave={(entry) => {
          saveDayPractice('threeQuestions', entry);
          setActive(null);
        }}
      />

      <EmpathyModal
        open={active === 'empathy'}
        onClose={() => setActive(null)}
        onSave={(entry) => {
          saveDayPractice('empathy', entry);
          setActive(null);
        }}
      />

      <LanguageGameModal
        open={active === 'languageGame'}
        onClose={() => setActive(null)}
        onSave={(entry) => {
          saveDayPractice('languageGame', entry);
          setActive(null);
        }}
      />
    </div>
  );
}

function PhronesisModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (entry: {
    character: string;
    autonomy: string;
    publicity: string;
    warningShown: boolean;
    completedAt: string;
  }) => void;
}) {
  const [character, setCharacter] = useState('');
  const [autonomy, setAutonomy] = useState('');
  const [publicity, setPublicity] = useState('');
  const warning = isPhronesisWarning(character, autonomy, publicity);

  return (
    <Modal open={open} onClose={onClose} title="Phronesis перед расчётом">
      <div className="space-y-4">
        <Field
          label="Каким человеком я стану, если буду делать это 5 лет?"
          value={character}
          onChange={setCharacter}
        />
        <Field
          label="Это укрепляет или разрушает мою независимость?"
          value={autonomy}
          onChange={setAutonomy}
        />
        <Field
          label="Поступил бы я так же, если бы узнали все?"
          value={publicity}
          onChange={setPublicity}
        />
        {warning && character && autonomy && publicity && (
          <p className="text-[14px] text-red-700 bg-red-50 rounded-2xl p-4 leading-relaxed">
            Не делай. Потерянная прибыль — плата за сохранённый характер.
          </p>
        )}
        <button
          className="btn-primary w-full"
          disabled={!character.trim() || !autonomy.trim() || !publicity.trim()}
          onClick={() =>
            onSave({
              character: character.trim(),
              autonomy: autonomy.trim(),
              publicity: publicity.trim(),
              warningShown: warning,
              completedAt: new Date().toISOString(),
            })
          }
        >
          Записать
        </button>
      </div>
    </Modal>
  );
}

function ThreeQuestionsModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (entry: {
    meaning: string;
    source: string;
    consequence: string;
    completedAt: string;
  }) => void;
}) {
  const [meaning, setMeaning] = useState('');
  const [source, setSource] = useState('');
  const [consequence, setConsequence] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Три уточняющих вопроса">
      <div className="space-y-4">
        <Field label="Что вы имеете в виду под X?" value={meaning} onChange={setMeaning} />
        <Field label="Откуда у вас эта информация?" value={source} onChange={setSource} />
        <Field label="Что из этого следует?" value={consequence} onChange={setConsequence} />
        <button
          className="btn-primary w-full"
          disabled={!meaning.trim() || !source.trim() || !consequence.trim()}
          onClick={() =>
            onSave({
              meaning: meaning.trim(),
              source: source.trim(),
              consequence: consequence.trim(),
              completedAt: new Date().toISOString(),
            })
          }
        >
          Записать
        </button>
      </div>
    </Modal>
  );
}

function EmpathyModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (entry: {
    thinks: string;
    feels: string;
    wants: string;
    completedAt: string;
  }) => void;
}) {
  const [thinks, setThinks] = useState('');
  const [feels, setFeels] = useState('');
  const [wants, setWants] = useState('');
  const forbidden = hasForbiddenWords(thinks + feels + wants);

  return (
    <Modal open={open} onClose={onClose} title="Эмпатия как когнитивный акт">
      <div className="space-y-4">
        <Field label="Он думает, что…" value={thinks} onChange={setThinks} />
        <Field label="Он чувствует…" value={feels} onChange={setFeels} />
        <Field label="Он хочет…" value={wants} onChange={setWants} />
        <p className="text-xs text-graphite/40 italic">
          Без слов «правильно», «должен», «странно», «очевидно». Если хочешь их написать — начни заново.
        </p>
        {forbidden && (
          <p className="text-sm text-terracotta/80">Обнаружены оценочные слова. Попробуй переформулировать.</p>
        )}
        <button
          className="btn-primary w-full"
          disabled={!thinks.trim() || !feels.trim() || !wants.trim() || forbidden}
          onClick={() =>
            onSave({
              thinks: thinks.trim(),
              feels: feels.trim(),
              wants: wants.trim(),
              completedAt: new Date().toISOString(),
            })
          }
        >
          Записать
        </button>
      </div>
    </Modal>
  );
}

function LanguageGameModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (entry: {
    game: 'business' | 'emotional' | 'hierarchical' | 'friendly';
    completedAt: string;
  }) => void;
}) {
  const [selected, setSelected] = useState<(typeof LANGUAGE_GAMES)[number] | null>(null);

  return (
    <Modal open={open} onClose={onClose} title="Языковая игра">
      <div className="space-y-3">
        {LANGUAGE_GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => setSelected(game)}
            className={`w-full text-left p-4 rounded-2xl transition-all duration-150 ${
              selected?.id === game.id
                ? 'bg-terracotta-soft ring-2 ring-terracotta/30'
                : 'bg-cream hover:bg-paper/50'
            }`}
          >
            <p className="font-medium text-[15px]">{game.label}</p>
          </button>
        ))}
        {selected && (
          <div className="card mt-4 text-sm space-y-2">
            <p><span className="text-graphite/50">Тон:</span> {selected.tone}</p>
            <p><span className="text-graphite/50">Цель:</span> {selected.goal}</p>
          </div>
        )}
        <button
          className="btn-primary w-full mt-2"
          disabled={!selected}
          onClick={() =>
            onSave({
              game: selected!.id,
              completedAt: new Date().toISOString(),
            })
          }
        >
          Записать
        </button>
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <textarea
        className="input-field min-h-[72px] resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
