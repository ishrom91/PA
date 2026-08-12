interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageHeader({ eyebrow, title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <header className={`animate-fade-in ${className}`}>
      {eyebrow && (
        <p className="text-[13px] font-medium text-terracotta uppercase tracking-wider mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}
