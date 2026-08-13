interface StepProgressProps {
  current: number;
  total: number;
  labels?: string[];
  compact?: boolean;
}

export default function StepProgress({ current, total, labels, compact = false }: StepProgressProps) {
  const bars = (
    <div className={`flex gap-1.5 ${compact ? '' : 'gap-2'}`}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div
            key={step}
            className={`${compact ? 'h-0.5' : 'h-1'} flex-1 rounded-full transition-all duration-300 ${
              done ? 'bg-olive' : active ? 'bg-terracotta' : 'bg-paper dark:bg-paper-dark'
            }`}
          />
        );
      })}
    </div>
  );

  if (compact) return bars;

  return (
    <div className="space-y-3">
      {bars}
      {labels && (
        <p className="text-[13px] text-muted">
          Шаг {current} из {total}
          {labels[current - 1] ? ` · ${labels[current - 1]}` : ''}
        </p>
      )}
    </div>
  );
}
