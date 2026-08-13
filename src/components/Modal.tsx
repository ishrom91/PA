import { IconClose } from './Icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-graphite/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full md:max-w-lg max-h-[92vh] overflow-y-auto bg-surface dark:bg-surface-dark rounded-t-4xl md:rounded-4xl shadow-float dark:shadow-float-dark animate-slide-up pb-[env(safe-area-inset-bottom)]">
        <div className="sticky top-0 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-xl z-10 px-5 pt-3 pb-4 border-b border-paper/50 dark:border-paper-dark/50 md:rounded-t-4xl">
          <div className="w-10 h-1 bg-paper dark:bg-paper-dark rounded-full mx-auto mb-4 md:hidden" />
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[20px] font-semibold tracking-tight pr-2 text-graphite dark:text-graphite-dark">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-cream dark:bg-cream-dark text-muted hover:text-graphite dark:hover:text-graphite-dark shrink-0 transition-colors"
              aria-label="Закрыть"
            >
              <IconClose />
            </button>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
