import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  statusColor?: 'success' | 'warning' | 'error' | 'primary';
}

export function Card({ children, className = '', hover = false, statusColor }: CardProps) {
  const borderColors = {
    success: 'border-l-[#28a745]',
    warning: 'border-l-[#ffc107]',
    error: 'border-l-[#dc3545]',
    primary: 'border-l-[#0d7377]',
  };

  return (
    <div
      className={`
        bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        ${hover ? 'hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${statusColor ? `border-l-4 ${borderColors[statusColor]}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
