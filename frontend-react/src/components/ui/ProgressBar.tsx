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
    primary: 'bg-[#0d7377]',
    success: 'bg-[#28a745]',
    warning: 'bg-[#ffc107]',
    error: 'bg-[#dc3545]',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-[#6c757d]">{label}</span>}
          {showPercentage && <span className="text-sm font-medium">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}
