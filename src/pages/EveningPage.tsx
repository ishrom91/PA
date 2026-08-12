import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppStateContext';
import type { EveningEntry, HarmonyAxis } from '../types';
import PageHeader from '../components/PageHeader';
import StepProgress from '../components/StepProgress';
import StepPanel from '../components/StepPanel';
import { hapticLight } from '../utils/haptics';

type Step = 1 | 2 | 3 | 'summary';

const AXES = [
  { key: 'actions' as const, label: 'Действия' },
  { key: 'body' as const, label: 'Тело' },
  { key: 'mind' as const, label: 'Ум' },
];

const defaultAxis = (): HarmonyAxis => ({ score: 3, comment: '' });

export default function EveningPage() {
  const navigate = useNavigate();
  const { saveEvening, todayEntry } = useApp();
  const existing = todayEntry?.evening;

  const [step, setStep] = useState<Step>(existing ? 'summary' : 1);
  const [harmony, setHarmony] = useState(
    existing?.harmony ?? {
      actions: defaultAxis(),
      body: defaultAxis(),
      mind: defaultAxis(),
    },
  );
  const [distortion, setDistortion] = useState(existing?.distortion ?? '');
  const [mainAction, setMainAction] = useState(existing?.authenticity.mainAction ?? '');
  const [wouldDoInPrivate, setWouldDoInPrivate] = useState(
    existing?.authenticity.wouldDoInPrivate ?? true,
  );

  const updateAxis = (key: keyof EveningEntry['harmony'], field: Partial<HarmonyAxis>) => {
    setHarmony((h) => ({ ...h, [key]: { ...h[key], ...field } }));
  };

  const goStep = (s: Step) => {
    hapticLight();
    setStep(s);
  };

  const handleSave = () => {
    const entry: EveningEntry = {
      harmony,
      distortion: distortion.trim(),
      authenticity: { mainAction: mainAction.trim(), wouldDoInPrivate },
      completedAt: new Date().toISOString(),
    };
    saveEvening(entry);
    setStep('summary');
  };

  if (step === 'summary') {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Вечер записан" subtitle="Записи сохранены в журнал" />
        <div className="card space-y-5 text-sm">
          <div>
            <h3 className="font-display mb-2">Гармония дня</h3>
            {AXES.map(({ key, label }) => (
              <p key={key} className="mb-1">
                {label}: {harmony[key].score}/5
                {harmony[key].comment && ` — ${harmony[key].comment}`}
              </p>
            ))}
          </div>
          <div>
            <h3 className="font-display mb-2">Искажения</h3>
            <p>{distortion}</p>
          </div>
          <div>
            <h3 className="font-display mb-2">Аутентичность</h3>
            <p>{mainAction}</p>
            <p className="text-graphite/50 mt-1">
              {wouldDoInPrivate ? 'Сделал бы и без свидетелей' : 'Внешняя мотивация'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => goStep(1)}>Изменить</button>
          <button className="btn-primary flex-1" onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    );
  }

  const stepLabels = ['Гармония', 'Искажения', 'Аутентичность'];

  return (
    <div className="space-y-6 animate-fade-in">
      {typeof step === 'number' && (
        <StepProgress current={step} total={3} labels={stepLabels} />
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepPanel stepKey={1}>
            <PageHeader eyebrow="Платон" title="Гармония дня" subtitle="Три оси целостности" />
            <div className="space-y-6 mt-6">
              {AXES.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <label className="label-text">{label}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateAxis(key, { score: n })}
                        className={`flex-1 h-11 rounded-xl text-[15px] font-medium transition-all duration-150 ${
                          harmony[key].score === n
                            ? 'bg-terracotta text-white shadow-sm scale-[1.02]'
                            : 'bg-cream dark:bg-cream-dark text-graphite-secondary dark:text-graphite-secondary-dark'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <input
                    className="input-field"
                    placeholder="Комментарий..."
                    value={harmony[key].comment}
                    onChange={(e) => updateAxis(key, { comment: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <button type="button" className="btn-primary w-full mt-6" onClick={() => goStep(2)}>Далее</button>
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel stepKey={2}>
            <PageHeader eyebrow="Будда" title="Осознанность искажений" />
            <textarea
              className="input-field min-h-[120px] mt-6"
              placeholder="Сегодня я приукрасил ___, потому что ___"
              value={distortion}
              onChange={(e) => setDistortion(e.target.value)}
            />
            <p className="hint-box mt-4">
              Приукрашивание себя · обесценивание другого · предвзятость подтверждения
            </p>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-secondary flex-1" onClick={() => goStep(1)}>Назад</button>
              <button type="button" className="btn-primary flex-1" disabled={!distortion.trim()} onClick={() => goStep(3)}>
                Далее
              </button>
            </div>
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel stepKey={3}>
            <PageHeader eyebrow="Камю" title="Аутентичность" />
            <div className="space-y-4 mt-6">
              <div>
                <label className="label-text">Главный поступок дня</label>
                <textarea
                  className="input-field min-h-[80px]"
                  value={mainAction}
                  onChange={(e) => setMainAction(e.target.value)}
                />
              </div>
              <div>
                <label className="label-text">Сделал бы я его, если бы никто не узнал?</label>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setWouldDoInPrivate(true)}
                    className={`flex-1 py-3.5 rounded-2xl font-medium text-[15px] transition-all ${
                      wouldDoInPrivate ? 'bg-olive-soft dark:bg-olive-soft-dark text-olive ring-2 ring-olive/20' : 'bg-cream dark:bg-cream-dark text-graphite-secondary'
                    }`}
                  >
                    Да
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldDoInPrivate(false)}
                    className={`flex-1 py-3.5 rounded-2xl font-medium text-[15px] transition-all ${
                      !wouldDoInPrivate ? 'bg-cream dark:bg-cream-dark text-graphite ring-2 ring-paper' : 'bg-cream dark:bg-cream-dark text-graphite-secondary'
                    }`}
                  >
                    Нет
                  </button>
                </div>
                {!wouldDoInPrivate && (
                  <p className="hint-box mt-3">
                    Это внешняя мотивация. Заметь её. Не осуждай.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-secondary flex-1" onClick={() => goStep(2)}>Назад</button>
              <button type="button" className="btn-primary flex-1" disabled={!mainAction.trim()} onClick={handleSave}>
                Записать
              </button>
            </div>
          </StepPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
