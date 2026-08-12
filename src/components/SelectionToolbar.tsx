interface SelectionToolbarProps {
  top: number;
  left: number;
  onAddNote: () => void;
}

export default function SelectionToolbar({ top, left, onAddNote }: SelectionToolbarProps) {
  const toolbarTop = Math.max(top - 48, 12);

  return (
    <div
      className="fixed z-[90] -translate-x-1/2 animate-fade-in pointer-events-auto"
      style={{ top: toolbarTop, left }}
      role="toolbar"
      aria-label="Действия с выделением"
    >
      <button
        type="button"
        className="btn-primary !py-2.5 !px-5 text-sm shadow-float dark:shadow-float-dark whitespace-nowrap flex items-center gap-2"
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        onClick={onAddNote}
      >
        <span aria-hidden>✦</span>
        Пометка
      </button>
    </div>
  );
}
