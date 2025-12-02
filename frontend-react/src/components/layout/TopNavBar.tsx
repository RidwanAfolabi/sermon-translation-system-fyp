import { Home, FileText, Upload, Edit3, Radio, BarChart3, CheckCircle, Settings, HelpCircle, Menu, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { MosqueLogo } from '../IslamicPattern';

interface TopNavBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
}

export function TopNavBar({ currentPage, onNavigate, title, showBackButton, backTo }: TopNavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'library', label: 'Library', icon: FileText },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'segments', label: 'Segments', icon: Edit3 },
    { id: 'vetting', label: 'Vetting', icon: CheckCircle },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const secondaryItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Back Button */}
          <div className="flex items-center gap-4">
            {showBackButton && backTo ? (
              <button
                onClick={() => onNavigate(backTo)}
                className="flex items-center gap-2 text-[#6c757d] hover:text-[#0d7377] transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2"
              >
                <MosqueLogo className="text-[#0d7377]" size={32} />
                <span className="font-semibold text-[#0d7377] hidden sm:inline">Sermon Translation</span>
              </button>
            )}
            
            {title && (
              <>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <h1 className="text-lg font-semibold text-[#212529] hidden sm:inline">{title}</h1>
              </>
            )}
          </div>

          {/* Center: Main Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-[#0d7377] text-white' 
                      : 'text-[#6c757d] hover:bg-gray-100 hover:text-[#212529]'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Secondary Items + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Secondary items (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      p-2 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-[#0d7377] text-white' 
                        : 'text-[#6c757d] hover:bg-gray-100'
                      }
                    `}
                    title={item.label}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#6c757d] hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all
                    ${isActive 
                      ? 'bg-[#0d7377] text-white' 
                      : 'text-[#6c757d] hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all
                      ${isActive 
                        ? 'bg-[#0d7377] text-white' 
                        : 'text-[#6c757d] hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
