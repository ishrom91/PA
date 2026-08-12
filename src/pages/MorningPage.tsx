import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppStateContext';
import { getVirtueForMonth } from '../data/virtues';
import type { MorningEntry } from '../types';
import PageHeader from '../components/PageHeader';
import StepProgress from '../components/StepProgress';
import StepPanel from '../components/StepPanel';
import { hapticLight } from '../utils/haptics';

type Step = 1 | 2 | 3 | 'summary';

export default function MorningPage() {
  const navigate = useNavigate();
  const { saveMorning, todayEntry } = useApp();
  const virtue = getVirtueForMonth();

  const existing = todayEntry?.morning;

  const [step, setStep] = useState<Step>(existing ? 'summary' : 1);
  const [decision, setDecision] = useState(existing?.dichotomy.decision ?? '');
  const [effort, setEffort] = useState(existing?.dichotomy.effort ?? '');
  const [attitude, setAttitude] = useState(existing?.dichotomy.attitude ?? '');
  const [person, setPerson] = useState(existing?.subjectiveValue.person ?? '');
  const [values, setValues] = useState(existing?.subjectiveValue.values ?? '');
  const [benefit, setBenefit] = useState(existing?.subjectiveValue.benefit ?? '');
  const [situation, setSituation] = useState(existing?.virtue.situation ?? '');

  const canNext1 = decision.trim() && effort.trim() && attitude.trim();
  const canNext2 = person.trim() && values.trim() && benefit.trim();
  const canNext3 = situation.trim();

  const goStep = (s: Step) => {
    hapticLight();
    setStep(s);
  };

  const handleSave = () => {
    const entry: MorningEntry = {
      dichotomy: { decision: decision.trim(), effort: effort.trim(), attitude: attitude.trim() },
      subjectiveValue: { person: person.trim(), values: values.trim(), benefit: benefit.trim() },
      virtue: { situation: situation.trim() },
      completedAt: new Date().toISOString(),
    };
    saveMorning(entry);
    setStep('summary');
  };

  if (step === 'summary') {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Утро записано" subtitle="Записи сохранены в журнал" />
        <div className="card space-y-5 text-sm">
          <SummaryBlock title="Дихотомия контроля">
            <p><span className="text-graphite/50">Решение:</span> {decision}</p>
            <p><span className="text-graphite/50">Усилие:</span> {effort}</p>
            <p><span className="text-graphite/50">Отношение:</span> {attitude}</p>
          </SummaryBlock>
          <SummaryBlock title="Субъективная ценность">
            <p><span className="text-graphite/50">Кто:</span> {person}</p>
            <p><span className="text-graphite/50">Ценит:</span> {values}</p>
            <p><span className="text-graphite/50">Выгода:</span> {benefit}</p>
          </SummaryBlock>
          <SummaryBlock title={`Добродетель: ${virtue.name}`}>
            <p>{situation}</p>
          </SummaryBlock>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => goStep(1)}>
            Изменить
          </button>
          <button className="btn-primary flex-1" onClick={() => navigate('/')}>
            На главную
          </button>
        </div>
      </div>
    );
  }

  const stepLabels = ['Контроль', 'Ценность', 'Добродетель'];

  return (
    <div className="space-y-6 animate-fade-in">
      {typeof step === 'number' && (
        <StepProgress current={step} total={3} labels={stepLabels} />
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepPanel stepKey={1}>
            <PageHeader eyebrow="Эпиктет" title="Что в твоей власти сегодня?" />
            <div className="space-y-4 mt-6">
              <Field label="Решение, которое я приму сегодня" value={decision} onChange={setDecision} />
              <Field label="Усилие, которое я приложу" value={effort} onChange={setEffort} />
              <Field label="Отношение, которое я выберу" value={attitude} onChange={setAttitude} />
            </div>
            <p className="hint-box mt-4">
              Рынок, мнения, погода, чужие поступки — вне твоей власти. Не трать на них энергию.
            </p>
            <button className="btn-primary w-full mt-6" disabled={!canNext1} onClick={() => goStep(2)}>
              Далее
            </button>
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel stepKey={2}>
            <PageHeader eyebrow="Мизес" title="Кому ты сегодня дашь ценность?" />
            <div className="space-y-4 mt-6">
              <Field label="Кто этот человек?" value={person} onChange={setPerson} />
              <Field label="Что он ценит?" value={values} onChange={setValues} />
              <Field label="Какую выгоду ты ему дашь?" value={benefit} onChange={setBenefit} />
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => goStep(1)}>Назад</button>
              <button className="btn-primary flex-1" disabled={!canNext2} onClick={() => goStep(3)}>Далее</button>
            </div>
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel stepKey={3}>
            <PageHeader eyebrow="Аристотель" title="Добродетель дня" subtitle={virtue.name} />
            <div className="mt-6">
              <Field
                label="В какой ситуации ты проявишь её сегодня?"
                value={situation}
                onChange={setSituation}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => goStep(2)}>Назад</button>
              <button className="btn-primary flex-1" disabled={!canNext3} onClick={handleSave}>
                Записать
              </button>
            </div>
          </StepPanel>
        )}
      </AnimatePresence>
    </div>
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
        className="input-field min-h-[80px] resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
      />
    </div>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="section-title mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
