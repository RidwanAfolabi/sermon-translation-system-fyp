import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  BookOpen, 
  FileText, 
  RefreshCw, 
  Radio, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  ChevronLeft,
  Mosque
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Upload, label: 'Upload Sermon', path: '/admin/upload' },
  { icon: BookOpen, label: 'Sermon Library', path: '/admin/library' },
  { icon: FileText, label: 'Segments', path: '/admin/segments/1' },
  { icon: RefreshCw, label: 'Translation', path: '/admin/translation' },
  { icon: Radio, label: 'Live Control', path: '/live/control' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

const bottomMenuItems = [
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: HelpCircle, label: 'Help', path: '/admin/help' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`bg-white border-r border-[#E0E0E0] flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0D7377] to-[#14919B] flex items-center justify-center flex-shrink-0">
            <Mosque className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h3 className="text-[#0D7377] truncate">Sermon System</h3>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#0D7377] text-white shadow-md'
                  : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#0D7377]'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-4">
        <div className="h-px bg-[#E0E0E0]"></div>
      </div>

      {/* Bottom Navigation */}
      <nav className="p-4 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#0D7377] text-white'
                  : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#0D7377]'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-[#E0E0E0]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#0D7377] rounded-lg transition-all"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
