import { useState, useEffect, useRef } from 'react';
import { sermonApi, Sermon } from '../services/api';
import { Radio, ArrowLeft, Settings } from 'lucide-react';
import { useLiveStream } from '../contexts/LiveStreamContext';

interface LiveDisplayProps {
  sermonId?: number;
  onNavigate?: (page: string) => void;
}

export function LiveDisplay({ sermonId: initialSermonId, onNavigate }: LiveDisplayProps) {
  const {
    connected,
    connecting,
    sermonId: streamSermonId,
    sermonTitle,
    currentSubtitle,
    previousSubtitles,
    segmentOrder,
    totalSegments,
    sessionTime,
    connect,
  } = useLiveStream();

  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [userOpenedSelector, setUserOpenedSelector] = useState(false);
  const currentSubtitleRef = useRef<HTMLDivElement | null>(null);
  
  // Show selector ONLY if user explicitly opened it OR there's no active stream at all
  const hasActiveStream = connected || connecting || !!streamSermonId;
  const showSelector = userOpenedSelector || (!hasActiveStream && !initialSermonId);
  const historyDisplayCount = 5;
  const historyOpacity = ['text-white/80', 'text-white/70', 'text-white/60', 'text-white/50', 'text-white/40'];
  const historySubtitles = previousSubtitles.slice(0, historyDisplayCount);
  const orderedHistory = [...historySubtitles].reverse();

  // Auto-close selector when stream becomes active
  useEffect(() => {
    if (hasActiveStream) {
      setUserOpenedSelector(false);
    }
  }, [hasActiveStream]);

  useEffect(() => {
    loadSermons();
  }, []);

  // Don't auto-connect - only connect when user explicitly selects
  // The context already maintains the connection

  // Keep current subtitle centered when it changes
  useEffect(() => {
    if (currentSubtitleRef.current) {
      currentSubtitleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSubtitle]);

  const loadSermons = async () => {
    try {
      const sermons = await sermonApi.list();
      setAllSermons(sermons);
    } catch (err) {
      console.error('Failed to load sermons:', err);
    }
  };

  const handleSermonSelect = (id: number) => {
    const sermon = allSermons.find(s => s.sermon_id === id);
    connect(id, sermon?.title);
    setUserOpenedSelector(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToControlRoom = () => {
    console.log('Back button clicked, onNavigate:', !!onNavigate);
    if (onNavigate) {
      onNavigate('controlRoom');
    }
  };

  return (
    <div className="h-screen flex flex-col text-white overflow-hidden" style={{ backgroundColor: '#0a0a14' }}>
      
      {/* Sermon Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <div className="rounded-2xl p-8 max-w-lg w-full mx-4 border border-white/10" style={{ backgroundColor: '#12121a' }}>
            <div className="text-center mb-6">
              <Radio size={48} className="mx-auto mb-4 text-[#00e676]" />
              <h2 className="text-2xl font-semibold mb-2">Select Sermon</h2>
              <p className="text-white/60">Choose a sermon for live display</p>
            </div>
            
            {allSermons.length === 0 ? (
              <p className="text-center text-white/60">No sermons available</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allSermons.map(sermon => (
                  <button
                    key={sermon.sermon_id}
                    onClick={() => handleSermonSelect(sermon.sermon_id)}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors border border-white/10"
                  >
                    <div className="font-semibold">{sermon.title}</div>
                    <div className="text-sm text-white/60">{sermon.speaker || 'Unknown'} • {sermon.status}</div>
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={handleBackToControlRoom}
              className="w-full mt-4 px-6 py-3 bg-[#0d7377] text-white font-semibold rounded-lg hover:bg-[#0a5c5f] transition-colors"
            >
              Go to Control Room
            </button>
          </div>
        </div>
      )}

      {/* Top Bar - ALWAYS VISIBLE */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 py-2" style={{ backgroundColor: '#0d0d15' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToControlRoom}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d7377] hover:bg-[#0a5c5f] rounded-lg transition-colors text-white font-medium text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Control Room</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#00e676] animate-pulse' : connecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className={`text-xs font-medium ${connected ? 'text-[#00e676]' : connecting ? 'text-yellow-500' : 'text-gray-500'}`}>
                {connected ? 'LIVE' : connecting ? 'CONNECTING' : 'OFFLINE'}
              </span>
            </div>
            <span className="text-white/50 text-sm">{sermonTitle}</span>
          </div>

          <button
            onClick={() => setUserOpenedSelector(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
          >
            <Settings size={14} />
            <span>Change</span>
          </button>
        </div>
      </div>

      {/* Main Display - Previous lines stack above current */}
      <div className="flex-1 flex flex-col px-8 py-4 overflow-y-auto scroll-smooth">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
          {/* Previous Subtitles (oldest at top, newest closest to current line) */}
          {orderedHistory.length > 0 && (
            <div className="space-y-3">
              <div className="text-center text-white/40 text-xs md:text-sm tracking-[0.4em] uppercase">Previous Lines</div>
              <div className="space-y-2">
                {orderedHistory.map((subtitle, index) => {
                  const opacityIndex = orderedHistory.length - 1 - index;
                  const opacityClass = historyOpacity[opacityIndex] || 'text-white/30';
                  return (
                    <div key={index} className="text-center px-4 subtitle-fade">
                      <p className={`text-2xl md:text-3xl lg:text-4xl leading-relaxed font-medium ${opacityClass}`}>
                        {subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Subtitle */}
          <div
            key={currentSubtitle || 'waiting'}
            ref={currentSubtitleRef}
            className="text-center px-6 py-9 rounded-2xl border border-[#0d7377]/40 shadow-[0_0_80px_rgba(13,115,119,0.25)] subtitle-fade"
            style={{ backgroundColor: 'rgba(13, 115, 119, 0.18)' }}
          >
            <p className="text-3xl md:text-4xl lg:text-5xl leading-relaxed font-semibold text-white">
              {currentSubtitle || (connected ? 'Waiting for sermon to begin...' : 'Select a sermon to start')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 py-2" style={{ backgroundColor: '#0d0d15' }}>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Segment: {segmentOrder}/{totalSegments || '—'}</span>
          <span className="font-mono">{formatTime(sessionTime)}</span>
        </div>
      </div>
    </div>
  );
}
