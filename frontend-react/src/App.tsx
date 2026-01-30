import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LiveStreamProvider } from './contexts/LiveStreamContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UploadSermon } from './pages/UploadSermon';
import { SermonLibrary } from './pages/SermonLibrary';
import { SegmentEditor } from './pages/SegmentEditor';
import { VettingQueue } from './pages/VettingQueue';
import { SegmentReview } from './pages/SegmentReview';
import { LiveDisplay } from './pages/LiveDisplay';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavBar } from './components/layout/TopNavBar';
import { ControlRoom } from './pages/ControlRoom';
import { Analytics } from './pages/Analytics';
import { Help } from './pages/Help';

type PageKey =
  | 'dashboard'
  | 'upload'
  | 'library'
  | 'segments'
  | 'translation'
  | 'live'
  | 'analytics'
  | 'settings'
  | 'help'
  | 'vetting'
  | 'review'
  | 'controlRoom'
  | 'liveDisplay';

const PAGE_PATHS: Record<PageKey, string> = {
  dashboard: '/dashboard',
  upload: '/upload',
  library: '/library',
  segments: '/segments',
  translation: '/translation',
  live: '/live',
  analytics: '/analytics',
  settings: '/settings',
  help: '/help',
  vetting: '/vetting',
  review: '/review',
  controlRoom: '/control-room',
  liveDisplay: '/live-display',
};

const PAGE_ALIASES: Record<string, PageKey> = {
  'control-room': 'controlRoom',
  'live-display': 'liveDisplay',
};

const PATH_TO_PAGE: Record<string, PageKey> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/upload': 'upload',
  '/library': 'library',
  '/segments': 'segments',
  '/translation': 'translation',
  '/live': 'live',
  '/analytics': 'analytics',
  '/settings': 'settings',
  '/help': 'help',
  '/vetting': 'vetting',
  '/review': 'review',
  '/control-room': 'controlRoom',
  '/live-display': 'liveDisplay',
};

const DEFAULT_PATH = PAGE_PATHS.dashboard;

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LiveStreamProvider>
          <HashRouter>
            <AppRouter />
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: { background: '#fffbf3', border: '1px solid #e5ded0', color: '#101827' },
              }}
            />
          </HashRouter>
        </LiveStreamProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      {/* LiveDisplay can be accessed standalone (opened in new tab from ControlRoom) */}
      <Route path="/live-display" element={<StandaloneLiveDisplay />} />
      <Route path="/*" element={<RequireAuth><ProtectedApp /></RequireAuth>} />
    </Routes>
  );
}

// Standalone LiveDisplay wrapper - accessible without full auth for new tab usage
function StandaloneLiveDisplay() {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(`/${page === 'controlRoom' ? 'control-room' : page}`);
  };
  
  return <LiveDisplay onNavigate={handleNavigate} />;
}

function LoginRoute() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    const success = await login(username, password);
    if (success) {
      navigate(DEFAULT_PATH, { replace: true });
    }
    return success;
  };

  if (isAuthenticated) {
    return <Navigate to={DEFAULT_PATH} replace />;
  }

  return <Login onLogin={handleLogin} />;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function ProtectedApp() {
  const [selectedSermonId, setSelectedSermonId] = usePersistedSermonId();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = useMemo(
    () => getPageFromPath(location.pathname),
    [location.pathname]
  );

  const handleNavigate = useCallback((page: string, sermonId?: number) => {
    const normalized = normalizePageKey(page);
    const nextPath = PAGE_PATHS[normalized] ?? DEFAULT_PATH;
    if (sermonId !== undefined) {
      setSelectedSermonId(sermonId ?? null);
    }
    navigate(nextPath);
  }, [navigate, setSelectedSermonId]);

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <Dashboard onNavigate={handleNavigate} />
          </SidebarShell>
        )}
      />
      <Route
        path="/upload"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <UploadSermon onNavigate={handleNavigate} />
          </SidebarShell>
        )}
      />
      <Route
        path="/library"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <SermonLibrary onNavigate={handleNavigate} />
          </SidebarShell>
        )}
      />
      <Route
        path="/segments"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <SegmentEditor
              onNavigate={handleNavigate}
              sermonId={selectedSermonId ?? undefined}
            />
          </SidebarShell>
        )}
      />
      <Route
        path="/translation"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <TranslationSettingsPage />
          </SidebarShell>
        )}
      />
      <Route
        path="/live"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <LiveLanding onNavigate={handleNavigate} />
          </SidebarShell>
        )}
      />
      <Route
        path="/analytics"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <Analytics />
          </SidebarShell>
        )}
      />
      <Route
        path="/settings"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <SettingsPage />
          </SidebarShell>
        )}
      />
      <Route
        path="/help"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <Help />
          </SidebarShell>
        )}
      />
      <Route
        path="/vetting"
        element={(
          <SidebarShell currentPage={currentPage} onNavigate={handleNavigate}>
            <VettingQueue onNavigate={handleNavigate} />
          </SidebarShell>
        )}
      />
      <Route
        path="/review"
        element={(
          <TopNavShell
            currentPage={currentPage}
            onNavigate={handleNavigate}
            title="Segment Review"
          >
            <SegmentReview onNavigate={handleNavigate} />
          </TopNavShell>
        )}
      />
      <Route
        path="/control-room"
        element={(
          <TopNavShell
            currentPage={currentPage}
            onNavigate={handleNavigate}
            showBackButton
            backTo="live"
          >
            <ControlRoom
              sermonId={selectedSermonId ?? undefined}
              onNavigate={handleNavigate}
            />
          </TopNavShell>
        )}
      />
      <Route
        path="/live-display"
        element={(
          <LiveDisplay
            sermonId={selectedSermonId ?? undefined}
            onNavigate={handleNavigate}
          />
        )}
      />
      <Route path="/" element={<Navigate to={DEFAULT_PATH} replace />} />
      <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
    </Routes>
  );
}

function SidebarShell({
  currentPage,
  onNavigate,
  children,
}: {
  currentPage: string;
  onNavigate: (page: string, sermonId?: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeItem={currentPage} onItemClick={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
        <FloatingVettingButton onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function TopNavShell({
  currentPage,
  onNavigate,
  children,
  title,
  showBackButton,
  backTo,
}: {
  currentPage: string;
  onNavigate: (page: string, sermonId?: number) => void;
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
}) {
  return (
    <div className="min-h-screen app-shell flex flex-col">
      <TopNavBar
        currentPage={currentPage}
        onNavigate={onNavigate}
        title={title}
        showBackButton={showBackButton}
        backTo={backTo}
      />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

function FloatingVettingButton({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative group">
        <button
          onClick={() => onNavigate('vetting')}
          className="w-14 h-14 rounded-full bg-[#c5a24a] text-[#101827] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all hover:scale-105 flex items-center justify-center"
          title="Vetting Dashboard"
        >
          <span className="text-2xl">✓</span>
        </button>
        <div className="absolute bottom-full right-0 mb-2 bg-[#101827] text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Vetting Dashboard
        </div>
      </div>
    </div>
  );
}

function LiveLanding({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center app-shell gap-6">
      <div className="text-center max-w-2xl">
        <div className="section-kicker kicker-line justify-center">Live Operations</div>
        <h2 className="section-title">Live Subtitle System</h2>
        <p className="section-subtitle mx-auto mb-8">
          Select a control mode for synchronized translation and congregation display.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onNavigate('controlRoom')}
            className="p-8 rounded-2xl bg-[#fffbf3] border border-[#e5ded0] hover:border-[#c5a24a] hover:shadow-[var(--shadow-card)] transition-all text-left group"
          >
            <div className="text-5xl mb-4">🎛️</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-[#1f6f6d]">Control Room</h3>
            <p className="text-sm text-[#4b5563]">
              Operator dashboard with ASR monitoring, segment matching, and live controls.
            </p>
          </button>
          <button
            onClick={() => onNavigate('liveDisplay')}
            className="p-8 rounded-2xl bg-[#fffbf3] border border-[#e5ded0] hover:border-[#c5a24a] hover:shadow-[var(--shadow-card)] transition-all text-left group"
          >
            <div className="text-5xl mb-4">📺</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-[#1f6f6d]">Live Display</h3>
            <p className="text-sm text-[#4b5563]">
              Full-screen subtitle view for congregation displays and projectors.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

function TranslationSettingsPage() {
  return (
    <div className="flex-1 flex items-center justify-center app-shell">
      <div className="text-center max-w-md">
        <div className="section-kicker kicker-line justify-center">Translation</div>
        <h2 className="section-title">Translation Settings</h2>
        <p className="section-subtitle mx-auto mb-6">Configure translation providers and models</p>
        <div className="space-y-3 text-left">
          <div className="panel-strong p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Gemini AI</span>
              <span className="text-xs px-2 py-1 bg-[#c5a24a]/15 text-[#8a6b1f] rounded-full">Active</span>
            </div>
            <p className="text-sm text-[#4b5563] mt-1">Primary translation provider</p>
          </div>
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Marian NMT</span>
              <span className="text-xs px-2 py-1 bg-[#efe9dc] text-[#4b5563] rounded-full">Offline Backup</span>
            </div>
            <p className="text-sm text-[#4b5563] mt-1">Secondary translation model</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="mb-2">Settings</h2>
        <p className="text-[#6c757d] mb-6">System configuration and preferences</p>
        <div className="space-y-3 text-left">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="font-medium">API Configuration</div>
            <p className="text-sm text-[#6c757d]">Backend: localhost:8000</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="font-medium">Database</div>
            <p className="text-sm text-[#6c757d]">PostgreSQL connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function usePersistedSermonId() {
  const [value, setValue] = useState<number | null>(() => {
    try {
      const stored = sessionStorage.getItem('selectedSermonId');
      if (stored) {
        const parsed = Number(stored);
        return Number.isNaN(parsed) ? null : parsed;
      }
    } catch (err) {
      console.warn('Failed to read sermon id from sessionStorage', err);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (value === null) {
        sessionStorage.removeItem('selectedSermonId');
      } else {
        sessionStorage.setItem('selectedSermonId', String(value));
      }
    } catch (err) {
      console.warn('Failed to persist sermon id', err);
    }
  }, [value]);

  return [value, setValue] as const;
}

function normalizePageKey(page: string): PageKey {
  const normalized = (PAGE_ALIASES[page] ?? page) as PageKey;
  return PAGE_PATHS[normalized] ? normalized : 'dashboard';
}

function getPageFromPath(pathname: string): PageKey {
  const normalized = normalizePathname(pathname);
  return PATH_TO_PAGE[normalized] ?? 'dashboard';
}

function normalizePathname(pathname: string) {
  if (!pathname) {
    return '/';
  }
  if (pathname === '/') {
    return pathname;
  }
  return pathname.endsWith('/') ? pathname.replace(/\/+/g, '/').replace(/\/+$/, '') : pathname;
}