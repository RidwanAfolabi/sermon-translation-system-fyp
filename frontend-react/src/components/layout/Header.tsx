import { ChevronDown, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#212529] mb-0">{title}</h1>
          {subtitle && <p className="text-[#6c757d] mt-1 mb-0">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#0d7377] flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <span className="font-medium">Admin</span>
            <ChevronDown size={16} className="text-[#6c757d]" />
          </button>
        </div>
      </div>
    </div>
  );
}
