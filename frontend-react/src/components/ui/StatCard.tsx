import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, color = 'primary', trend }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-blue-50 text-blue-600 border-blue-200',
    success: 'bg-green-50 text-green-600 border-green-200',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    info: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-4xl opacity-80">{icon}</div>}
      </div>
    </div>
  );
}