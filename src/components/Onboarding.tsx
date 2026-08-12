import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticLight, hapticSuccess } from '../utils/haptics';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: 'Philosophia Activa',
    body: 'Интерактивный дневник практик по книге Рим Рами. Не чек-лист — а размышления, которые сохраняются.',
    quote: '«Философия — это не музей. Это спортзал для разума.»',
  },
  {
    title: 'Как пользоваться',
    body: 'Утро, день и вечер — три коротких ритуала с полями ввода. Правила открываются постепенно: по одному каждые две недели.',
    quote: 'Пропущенный день — просто пустой день. Без осуждения.',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];

  const next = () => {
    hapticLight();
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      hapticSuccess();
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-cream-dark flex flex-col px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-2 mb-10">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-terracotta' : 'bg-paper dark:bg-paper-dark'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <p className="text-[13px] font-semibold uppercase tracking-wider text-terracotta mb-3">
            {step + 1} / {SLIDES.length}
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-graphite dark:text-graphite-dark">
            {slide.title}
          </h1>
          <p className="text-[16px] text-graphite-secondary dark:text-graphite-secondary-dark leading-relaxed mt-4">
            {slide.body}
          </p>
          <blockquote className="mt-8 text-[15px] italic text-graphite-secondary dark:text-graphite-secondary-dark border-l-[3px] border-terracotta/40 pl-4 py-1 font-display">
            {slide.quote}
          </blockquote>
        </motion.div>
      </AnimatePresence>

      <div className="space-y-3 mt-8">
        <button type="button" className="btn-primary w-full" onClick={next}>
          {step < SLIDES.length - 1 ? 'Далее' : 'Начать'}
        </button>
        {step > 0 && (
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => { hapticLight(); setStep(step - 1); }}
          >
            Назад
          </button>
        )}
      </div>
    </div>
  );
}
