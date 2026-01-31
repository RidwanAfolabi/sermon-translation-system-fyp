import { BarChart3, FileText, Upload, RefreshCw, Radio, Settings, HelpCircle, Home, ChevronLeft, CheckCircle, LogOut } from 'lucide-react';
import { MosqueLogo } from '../IslamicPattern';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUtilityExpanded, setIsUtilityExpanded] = useState(true);
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Sermon', icon: Upload },
    { id: 'library', label: 'Sermon Library', icon: FileText },
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
        bg-[#101827] text-white h-screen border-r border-[#1f2a37] flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#1f2a37] flex items-center gap-3">
        <MosqueLogo className="text-[#c5a24a] flex-shrink-0" size={36} />
        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="font-semibold text-white whitespace-nowrap">Sermon Translation</div>
            <div className="text-xs text-white/50 uppercase tracking-[0.2em]">Control Suite</div>
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
                w-full flex items-center gap-3 px-4 py-3 rounded-md
                transition-all duration-150
                ${isActive 
                  ? 'bg-[#1b2430] text-white shadow-[inset_0_0_0_1px_rgba(197,162,74,0.4)]' 
                  : 'text-white/70 hover:bg-[#1b2430] hover:text-white'
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
      <div className="border-t border-[#1f2a37]" />

      {/* Bottom Menu (expandable panel) */}
      <div className="p-4">
        <button
          onClick={() => setIsUtilityExpanded((prev) => !prev)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} text-xs uppercase tracking-[0.24em] text-white/50 mb-3`}
          title={isUtilityExpanded ? 'Collapse utilities' : 'Expand utilities'}
        >
          {!isCollapsed && <span>Utilities</span>}
          <ChevronLeft
            size={16}
            className={`transition-transform ${isUtilityExpanded ? '-rotate-90' : 'rotate-90'}`}
          />
        </button>
        <div
          className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isUtilityExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}
        >
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-md
                transition-all duration-150
                ${isActive 
                  ? 'bg-[#1b2430] text-white' 
                  : 'text-white/70 hover:bg-[#1b2430] hover:text-white'
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-white/60 hover:bg-[#1b2430] hover:text-white transition-all duration-150"
          >
            <ChevronLeft size={20} className={`flex-shrink-0 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            {!isCollapsed && <span>Collapse</span>}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-[#f8b4b4] hover:bg-[#3b1a1a] transition-all duration-150"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-[#1f2a37]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c5a24a] flex items-center justify-center text-[#101827] text-sm font-semibold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <div className="text-xs text-white/50 uppercase tracking-[0.2em] truncate">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
