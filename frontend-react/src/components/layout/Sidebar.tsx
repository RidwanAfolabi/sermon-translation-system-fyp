import { BarChart3, FileText, Upload, Edit3, RefreshCw, Radio, Settings, HelpCircle, Home, ChevronLeft, CheckCircle, LogOut } from 'lucide-react';
import { MosqueLogo } from '../IslamicPattern';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Sermon', icon: Upload },
    { id: 'library', label: 'Sermon Library', icon: FileText },
    { id: 'segments', label: 'Segments', icon: Edit3 },
    { id: 'vetting', label: 'Vetting Queue', icon: CheckCircle },
    { id: 'translation', label: 'Translation', icon: RefreshCw },
    { id: 'live', label: 'Live Control', icon: Radio },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div
      className={`
        bg-white h-screen border-r border-gray-200 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-3">
        <MosqueLogo className="text-[#0d7377] flex-shrink-0" size={36} />
        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="font-semibold text-[#0d7377] whitespace-nowrap">Sermon Translation</div>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-150
                ${isActive 
                  ? 'bg-[#0d7377] text-white shadow-md' 
                  : 'text-[#6c757d] hover:bg-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Bottom Menu */}
      <div className="p-4 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-150
                ${isActive 
                  ? 'bg-[#0d7377] text-white' 
                  : 'text-[#6c757d] hover:bg-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#6c757d] hover:bg-gray-100 transition-all duration-150"
        >
          <ChevronLeft size={20} className={`flex-shrink-0 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && <span>Collapse</span>}
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#dc3545] hover:bg-[#dc3545]/10 transition-all duration-150"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0d7377] flex items-center justify-center text-white text-sm font-medium">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-[#212529] truncate">{user.name}</div>
              <div className="text-xs text-[#6c757d] truncate">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
