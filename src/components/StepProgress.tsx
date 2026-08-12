interface StepProgressProps {
  current: number;
  total: number;
  labels?: string[];
}

export default function StepProgress({ current, total, labels }: StepProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                done ? 'bg-olive' : active ? 'bg-terracotta' : 'bg-paper'
              }`}
            />
          );
        })}
      </div>
      {labels && (
        <p className="text-[13px] text-graphite-secondary">
          Шаг {current} из {total}
          {labels[current - 1] ? ` · ${labels[current - 1]}` : ''}
        </p>
      )}
    </div>
  );
}
