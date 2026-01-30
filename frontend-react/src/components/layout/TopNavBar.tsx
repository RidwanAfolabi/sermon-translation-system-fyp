import { Home, FileText, Upload, Edit3, Radio, BarChart3, CheckCircle, Settings, HelpCircle, Menu, X, ArrowLeft, Globe } from 'lucide-react';
import { useState } from 'react';
import { MosqueLogo } from '../IslamicPattern';
import { useLanguage } from '../../context/LanguageContext';

interface TopNavBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
}

export function TopNavBar({ currentPage, onNavigate, title, showBackButton, backTo }: TopNavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
    { id: 'library', label: t('nav.library'), icon: FileText },
    { id: 'upload', label: t('nav.upload'), icon: Upload },
    { id: 'segments', label: t('nav.segments'), icon: Edit3 },
    { id: 'vetting', label: t('nav.vetting'), icon: CheckCircle },
    { id: 'live', label: t('nav.live'), icon: Radio },
    { id: 'analytics', label: t('nav.analytics'), icon: BarChart3 },
  ];

  const secondaryItems = [
    { id: 'settings', label: t('nav.settings'), icon: Settings },
    { id: 'help', label: t('nav.help'), icon: HelpCircle },
  ];

  return (
    <nav className="bg-[#fffbf3] border-b border-[#e5ded0] sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Back Button */}
          <div className="flex items-center gap-4">
            {showBackButton && backTo ? (
              <button
                onClick={() => onNavigate(backTo)}
                className="flex items-center gap-2 text-[#4b5563] hover:text-[#1f6f6d] transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">{t('common.back')}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2"
              >
                <MosqueLogo className="text-[#c5a24a]" size={32} />
                <span className="font-semibold text-[#101827] hidden sm:inline">{t('app.title')}</span>
              </button>
            )}
            
            {title && (
              <>
                <span className="text-[#d6cfc0] hidden sm:inline">|</span>
                <h1 className="text-lg font-semibold text-[#101827] hidden sm:inline">{title}</h1>
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
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all
                    ${isActive 
                      ? 'bg-[#101827] text-white' 
                      : 'text-[#4b5563] hover:bg-[#efe9dc] hover:text-[#101827]'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Language Toggle + Secondary Items + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Language Toggle (desktop) */}
            <button
              onClick={toggleLanguage}
              title={t('lang.switchTo')}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1f6f6d]/10 hover:bg-[#1f6f6d]/20 text-[#1f6f6d] font-semibold text-sm transition-all border border-[#1f6f6d]/20 hover:border-[#1f6f6d]/40"
            >
              <Globe size={18} />
              <span>{language === 'en' ? 'EN' : 'BM'}</span>
              <span className="text-xs opacity-70">→ {t('lang.toggle')}</span>
            </button>

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
                      p-2 rounded-md transition-all
                      ${isActive 
                        ? 'bg-[#101827] text-white' 
                        : 'text-[#4b5563] hover:bg-[#efe9dc]'
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
              className="lg:hidden p-2 rounded-md text-[#4b5563] hover:bg-[#efe9dc]"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e5ded0] bg-[#fffbf3]">
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
                    w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-all
                    ${isActive 
                      ? 'bg-[#101827] text-white' 
                      : 'text-[#4b5563] hover:bg-[#efe9dc]'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="border-t border-[#e5ded0] pt-2 mt-2">
              {/* Language Toggle (mobile) */}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-left text-[#1f6f6d] hover:bg-[#1f6f6d]/10 transition-all"
              >
                <Globe size={20} />
                <span>{language === 'en' ? 'English' : 'B. Melayu'}</span>
                <span className="text-xs opacity-70 ml-auto">→ {t('lang.toggle')}</span>
              </button>

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
                      w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-all
                      ${isActive 
                        ? 'bg-[#101827] text-white' 
                        : 'text-[#4b5563] hover:bg-[#efe9dc]'
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
