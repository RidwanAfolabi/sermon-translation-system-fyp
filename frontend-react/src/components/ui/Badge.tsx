import { ReactNode } from 'react';

interface BadgeProps {
  status: 'vetted' | 'pending' | 'error' | 'processing' | 'live' | 'ready';
  children: ReactNode;
  icon?: ReactNode;
}

export function Badge({ status, children, icon }: BadgeProps) {
  const styles = {
    vetted: 'bg-[#28a745]/10 text-[#28a745] border-[#28a745]/20',
    pending: 'bg-[#ffc107]/10 text-[#a37800] border-[#ffc107]/20',
    error: 'bg-[#dc3545]/10 text-[#dc3545] border-[#dc3545]/20',
    processing: 'bg-[#007bff]/10 text-[#007bff] border-[#007bff]/20',
    live: 'bg-[#00e676]/10 text-[#00c853] border-[#00e676]/20 animate-pulse',
    ready: 'bg-[#28a745]/10 text-[#28a745] border-[#28a745]/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-medium ${styles[status]}`}>
      {icon && <span className="text-xs">{icon}</span>}
      {children}
    </span>
  );
}
