interface StepActionsProps {
  children: React.ReactNode;
  className?: string;
  /** Stack buttons vertically (e.g. onboarding) */
  stack?: boolean;
}

/** Mobile: sticky above tab bar. Desktop: inline after content. */
export default function StepActions({ children, className = '', stack = false }: StepActionsProps) {
  return (
    <>
      <div
        className={`flex gap-3 mt-6 max-md:fixed max-md:z-[55] max-md:left-4 max-md:right-4 max-md:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] max-md:mt-0 max-md:p-2 max-md:rounded-2xl max-md:bg-surface/92 max-md:dark:bg-surface-dark/92 max-md:backdrop-blur-xl max-md:border max-md:border-white/60 max-md:dark:border-white/10 max-md:shadow-nav ${stack ? 'flex-col' : ''} ${className}`}
      >
        {children}
      </div>
      <div className={`${stack ? 'h-[7.5rem]' : 'h-[4.5rem]'} md:hidden shrink-0`} aria-hidden />
    </>
  );
}
