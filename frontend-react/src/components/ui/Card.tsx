import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  statusColor?: 'success' | 'warning' | 'error' | 'primary';
}

export function Card({ children, className = '', hover = false, statusColor }: CardProps) {
  const borderColors = {
    success: 'border-l-[#1f8f5f]',
    warning: 'border-l-[#c87f1a]',
    error: 'border-l-[#b42318]',
    primary: 'border-l-[#1f6f6d]',
  };

  return (
    <div
      className={`
        bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-line)] shadow-[var(--shadow-subtle)]
        ${hover ? 'hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${statusColor ? `border-l-4 ${borderColors[statusColor]}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
