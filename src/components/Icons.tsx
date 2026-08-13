type IconProps = { className?: string; filled?: boolean };

const cn = (base: string, className?: string) => (className ? `${base} ${className}` : base);

export function IconHome({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.75}>
      {filled ? (
        <path d="M12 3L4 10v11h5v-7h6v7h5V10L12 3z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
      )}
    </svg>
  );
}

export function IconSun({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="4" fill={filled ? 'currentColor' : 'none'} />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconDay({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M12 19v2M5 12H3M21 12h-2M7.05 7.05L5.64 5.64M18.36 18.36l-1.41-1.41M7.05 16.95l-1.41 1.41M18.36 5.64l-1.41 1.41" />
      <circle cx="12" cy="12" r="4" fill={filled ? 'currentColor' : 'none'} />
    </svg>
  );
}

export function IconMoon({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A8.5 8.5 0 1111.5 6a6.5 6.5 0 008.5 8.5z" fill={filled ? 'currentColor' : 'none'} />
    </svg>
  );
}

export function IconPractice({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" aria-hidden>
      {filled ? (
        <>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="currentColor" />
          <text
            x="12"
            y="16.75"
            textAnchor="middle"
            fill="#fff"
            fontSize="13.5"
            fontWeight="700"
            fontFamily="Georgia, 'Times New Roman', serif"
          >
            Ф
          </text>
        </>
      ) : (
        <>
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            x="12"
            y="16.25"
            textAnchor="middle"
            fill="currentColor"
            fontSize="13"
            fontWeight="600"
            fontFamily="Georgia, 'Times New Roman', serif"
          >
            Ф
          </text>
        </>
      )}
    </svg>
  );
}

export function IconRules({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      {filled && (
        <>
          <circle cx="3" cy="6" r="1.5" />
          <circle cx="3" cy="12" r="1.5" />
          <circle cx="3" cy="18" r="1.5" />
        </>
      )}
    </svg>
  );
}

export function IconBook({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h9a3 3 0 013 3v13H8a3 3 0 00-3 3V4z" fill={filled ? 'currentColor' : 'none'} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8a3 3 0 013 3v13" />
    </svg>
  );
}

export function IconNotes({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function IconJournal({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <rect x="4" y="3" width="16" height="18" rx="2" fill={filled ? 'currentColor' : 'none'} />
      <path strokeLinecap="round" d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}

export function IconMore({ className }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="6" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="18" cy="12" r="1.75" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconSend({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconProfile({ className, filled }: IconProps) {
  return (
    <svg className={cn('w-6 h-6', className)} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="8" r="4" fill={filled ? 'currentColor' : 'none'} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" fill={filled ? 'currentColor' : 'none'} />
    </svg>
  );
}
