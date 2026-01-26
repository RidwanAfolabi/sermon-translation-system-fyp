import { ReactNode } from 'react';

interface BadgeProps {
  status: 'vetted' | 'pending' | 'error' | 'processing' | 'live' | 'ready';
  children: ReactNode;
  icon?: ReactNode;
}

export function Badge({ status, children, icon }: BadgeProps) {
  const styles = {
    vetted: 'bg-[#c5a24a]/15 text-[#8a6b1f] border-[#c5a24a]/30',
    pending: 'bg-[#c87f1a]/10 text-[#a06010] border-[#c87f1a]/30',
    error: 'bg-[#b42318]/10 text-[#b42318] border-[#b42318]/30',
    processing: 'bg-[#1f6f6d]/10 text-[#1f6f6d] border-[#1f6f6d]/30',
    live: 'bg-[#1f8f5f]/10 text-[#1f8f5f] border-[#1f8f5f]/30 animate-pulse',
    ready: 'bg-[#1f8f5f]/10 text-[#1f8f5f] border-[#1f8f5f]/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-semibold tracking-wide ${styles[status]}`}>
      {icon && <span className="text-xs">{icon}</span>}
      {children}
    </span>
  );
}
