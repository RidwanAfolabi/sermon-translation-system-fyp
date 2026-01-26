interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function ProgressBar({ 
  percentage, 
  label, 
  showPercentage = true, 
  size = 'md',
  color = 'primary'
}: ProgressBarProps) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    primary: 'bg-[#1f6f6d]',
    success: 'bg-[#1f8f5f]',
    warning: 'bg-[#c87f1a]',
    error: 'bg-[#b42318]',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
            {label && <span className="text-sm text-[#4b5563]">{label}</span>}
            {showPercentage && <span className="text-sm font-semibold text-[#101827]">{percentage}%</span>}
        </div>
      )}
          <div className={`w-full bg-[#efe9dc] rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}
