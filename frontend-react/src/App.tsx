import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
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

type Page = 'login' | 'dashboard' | 'upload' | 'library' | 'segments' | 'translation' | 'live' | 'analytics' | 'vetting' | 'review' | 'liveDisplay' | 'controlRoom' | 'live-display' | 'control-room' | 'help' | 'settings';

interface AppState {
  selectedSermonId: number | null;
}

function AppContent() {
  const { isAuthenticated, login } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [appState, setAppState] = useState<AppState>({
    selectedSermonId: null,
  });

  const handleLogin = async (username: string, password: string) => {
    const success = await login(username, password);
    if (success) {
      setCurrentPage('dashboard');
    }
    return success;
  };

  const handleNavigate = (page: string, sermonId?: number) => {
    if (sermonId !== undefined) {
      setAppState(prev => ({ ...prev, selectedSermonId: sermonId }));
    }
    setCurrentPage(page as Page);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Full-screen pages (no navigation) - only LiveDisplay for congregation view
  if (currentPage === 'liveDisplay' || currentPage === 'live-display') {
    return (
      <LiveDisplay 
        sermonId={appState.selectedSermonId || undefined} 
        onNavigate={handleNavigate}
      />
    );
  }

  // Pages with TopNavBar (focused views with full navigation)
  const topNavPages = ['vetting', 'review'];
  
  if (topNavPages.includes(currentPage)) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <TopNavBar 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          title={
            currentPage === 'vetting' ? 'Vetting Dashboard' :
            currentPage === 'review' ? 'Segment Review' : undefined
          }
        />
        
        <div className="flex-1 overflow-auto">
          {currentPage === 'vetting' && <VettingQueue onNavigate={handleNavigate} />}
          {currentPage === 'review' && <SegmentReview onNavigate={handleNavigate} />}
        </div>
      </div>
    );
  }

  // ControlRoom has its own header with live status
  if (currentPage === 'controlRoom' || currentPage === 'control-room') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <TopNavBar 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          showBackButton={true}
          backTo="live"
        />
        <ControlRoom 
          sermonId={appState.selectedSermonId || undefined} 
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  // Regular pages with Sidebar layout
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeItem={currentPage} onItemClick={handleNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentPage === 'upload' && <UploadSermon onNavigate={handleNavigate} />}
        {currentPage === 'library' && <SermonLibrary onNavigate={handleNavigate} />}
        {currentPage === 'segments' && (
          <SegmentEditor 
            onNavigate={handleNavigate} 
            sermonId={appState.selectedSermonId || undefined}
          />
        )}
        
        {currentPage === 'translation' && (
          <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🌐</div>
              <h2 className="mb-2">Translation Settings</h2>
              <p className="text-[#6c757d] mb-6">Configure translation providers and models</p>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Gemini AI</span>
                    <span className="text-xs px-2 py-1 bg-[#28a745]/10 text-[#28a745] rounded">Active</span>
                  </div>
                  <p className="text-sm text-[#6c757d] mt-1">Primary translation provider</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Marian NMT</span>
                    <span className="text-xs px-2 py-1 bg-[#6c757d]/10 text-[#6c757d] rounded">Offline Backup</span>
                  </div>
                  <p className="text-sm text-[#6c757d] mt-1">Local neural machine translation</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'live' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] gap-6">
            <div className="text-center max-w-2xl">
              <div className="text-6xl mb-4">📡</div>
              <h2 className="mb-2">Live Subtitle System</h2>
              <p className="text-[#6c757d] mb-8">
                Choose how you want to interact with the live translation system
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleNavigate('controlRoom')}
                  className="p-8 rounded-xl bg-white border-2 border-gray-200 hover:border-[#0d7377] hover:shadow-lg transition-all text-left group"
                >
                  <div className="text-5xl mb-4">🎛️</div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#0d7377]">Control Room</h3>
                  <p className="text-sm text-[#6c757d]">
                    Operator dashboard with ASR monitoring, segment matching, and live controls.
                  </p>
                </button>
                <button
                  onClick={() => handleNavigate('liveDisplay')}
                  className="p-8 rounded-xl bg-white border-2 border-gray-200 hover:border-[#0d7377] hover:shadow-lg transition-all text-left group"
                >
                  <div className="text-5xl mb-4">📺</div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#0d7377]">Live Display</h3>
                  <p className="text-sm text-[#6c757d]">
                    Full-screen subtitle view for congregation displays and projectors.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'analytics' && <Analytics />}
        
        {currentPage === 'settings' && (
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
        )}
        
        {currentPage === 'help' && <Help />}
      </div>

      {/* Floating Vetting Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <button 
            onClick={() => handleNavigate('vetting')}
            className="w-14 h-14 rounded-full bg-[#d4a03e] text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
            title="Vetting Dashboard"
          >
            <span className="text-2xl">✓</span>
          </button>
          <div className="absolute bottom-full right-0 mb-2 bg-[#212529] text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Vetting Dashboard
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LiveStreamProvider>
        <AppContent />
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e0e0e0',
            },
          }}
        />
      </LiveStreamProvider>
    </AuthProvider>
  );
}