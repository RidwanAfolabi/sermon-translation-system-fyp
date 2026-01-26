import { useState, useEffect, useRef } from 'react';
import { Radio, Settings } from 'lucide-react';
import { TypewriterText } from '../components/ui/TypewriterText';

interface LiveDisplayProps {
  onNavigate?: (page: string) => void;
}

const LIVE_DISPLAY_STORAGE_KEY = 'liveDisplayContext';
const BROADCAST_CHANNEL_NAME = 'khutbah_subtitles';

interface SubtitleEntry {
  text: string;
  isSkipped: boolean;
}

export function LiveDisplay({ onNavigate }: LiveDisplayProps) {
  // Local state for subtitle display - populated via BroadcastChannel
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleEntry>({ text: '', isSkipped: false });
  const [previousSubtitles, setPreviousSubtitles] = useState<SubtitleEntry[]>([]);
  const [sermonTitle, setSermonTitle] = useState<string>('');
  const [segmentOrder, setSegmentOrder] = useState<number>(0);
  const [totalSegments, setTotalSegments] = useState<number>(0);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(true);
  
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [noControlRoom, setNoControlRoom] = useState(false);
  
  const currentSubtitleRef = useRef<HTMLDivElement | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const connectionCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to display a subtitle (handles pushing to history)
  const displaySubtitle = (text: string, isSkipped: boolean = false) => {
    if (!text) return;
    setCurrentSubtitle(prev => {
      if (prev.text && prev.text !== text) {
        setPreviousSubtitles(prevSubs => {
          const newPrevious = [prev, ...prevSubs].slice(0, 5);
          return newPrevious;
        });
      }
      return { text, isSkipped };
    });
  };

  // Initialize BroadcastChannel to listen for subtitles from ControlRoom
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      setConnecting(false);
      setNoControlRoom(true);
      return;
    }

    broadcastChannelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    broadcastChannelRef.current.onmessage = (ev) => {
      const msg = ev.data;
      
      if (msg?.type === 'status') {
        setConnected(msg.connected || false);
        setConnecting(msg.connecting || false);
        if (msg.sermonTitle) setSermonTitle(msg.sermonTitle);
        if (msg.sessionTime !== undefined) setSessionTime(msg.sessionTime);
        setNoControlRoom(false);
        return;
      }

      if (msg?.type === 'subtitle' && msg.text) {
        console.log('[LiveDisplay] Received:', { text: msg.text.substring(0, 30), isSkipped: msg.isSkipped });
        
        // Display the subtitle with its skipped status
        displaySubtitle(msg.text, msg.isSkipped === true);

        // Update metadata
        if (msg.order) setSegmentOrder(msg.order);
        if (msg.sermonTitle) setSermonTitle(msg.sermonTitle);
        if (msg.totalSegments) setTotalSegments(msg.totalSegments);
        if (msg.sessionTime !== undefined) setSessionTime(msg.sessionTime);
        if (typeof msg.connected === 'boolean') setConnected(msg.connected);
        
        setConnecting(false);
        setNoControlRoom(false);
      }
    };

    // Load stored context for initial state
    try {
      const raw = sessionStorage.getItem(LIVE_DISPLAY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.sermonTitle) setSermonTitle(parsed.sermonTitle);
        if (parsed.sermonId) {
          setConnecting(true);
          setNoControlRoom(false);
        }
      }
    } catch (err) {
      console.warn('Failed to load stored context', err);
    }

    // Request sync from ControlRoom
    broadcastChannelRef.current.postMessage({
      type: 'request-sync',
    });

    // Set a timeout to check if we receive any messages
    connectionCheckTimeoutRef.current = setTimeout(() => {
      setConnecting(false);
      setNoControlRoom(true);
    }, 5000);

    return () => {
      broadcastChannelRef.current?.close();
      if (connectionCheckTimeoutRef.current) {
        clearTimeout(connectionCheckTimeoutRef.current);
      }
    };
  }, []);

  // Keep current subtitle visible
  useEffect(() => {
    if (currentSubtitleRef.current) {
      currentSubtitleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSubtitle]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToControlRoom = () => {
    if (onNavigate) {
      onNavigate('controlRoom');
    } else {
      window.location.href = '/control-room';
    }
  };

  const showSelector = showManualSelector || noControlRoom;

  // Display settings
  const historyDisplayCount = 5;
  const historyOpacity = ['opacity-80', 'opacity-70', 'opacity-60', 'opacity-50', 'opacity-40'];
  const orderedHistory = [...previousSubtitles.slice(0, historyDisplayCount)].reverse();

  return (
    <div className="h-screen flex flex-col text-white overflow-hidden live-display-background">
      
      {/* No Control Room / Manual Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 9, 17, 0.96)' }}>
          <div className="rounded-2xl p-8 max-w-lg w-full mx-4 border border-white/10" style={{ backgroundColor: '#111827' }}>
            <div className="text-center mb-6">
              <Radio size={48} className="mx-auto mb-4 text-[#c5a24a]" />
              <h2 className="text-2xl font-semibold mb-2">
                {noControlRoom ? 'Waiting for Control Room' : 'Live Display'}
              </h2>
              <p className="text-white/60">
                {noControlRoom 
                  ? 'Please start monitoring from the Control Room first. This display will automatically sync when the stream begins.'
                  : 'Connected to Control Room'
                }
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleBackToControlRoom}
                className="w-full px-6 py-3 bg-[#c5a24a] text-[#101827] font-semibold rounded-lg hover:bg-[#b89139] transition-colors"
              >
                Open Control Room
              </button>
              
              {!noControlRoom && (
                <button
                  onClick={() => setShowManualSelector(false)}
                  className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar - ALWAYS VISIBLE */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 py-2" style={{ backgroundColor: 'rgba(16, 24, 39, 0.82)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio size={20} className="text-[#c5a24a]" />
            <span className="text-white font-semibold tracking-wide">Live Display</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-[#1f8f5f] animate-pulse' : 
                connecting ? 'bg-[#c87f1a] animate-pulse' : 
                'bg-gray-500'
              }`} />
              <span className={`text-xs font-semibold tracking-wide ${
                connected ? 'text-[#1f8f5f]' : 
                connecting ? 'text-[#c87f1a]' : 
                'text-gray-400'
              }`}>
                {connected ? 'LIVE' : connecting ? 'WAITING FOR STREAM' : 'OFFLINE'}
              </span>
            </div>
            <span className="text-white/60 text-sm">{sermonTitle || 'No sermon selected'}</span>
          </div>

          <button
            onClick={() => setShowManualSelector(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Display - Previous lines stack above current */}
      <div className="flex-1 flex flex-col justify-center px-8 py-6 overflow-y-auto scroll-smooth">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          {/* Previous Subtitles (oldest at top, newest closest to current line) */}
          {orderedHistory.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                {orderedHistory.map((subtitle, index) => {
                  const opacityIndex = orderedHistory.length - 1 - index;
                  const opacity = [0.8, 0.7, 0.6, 0.5, 0.4][opacityIndex] || 0.3;
                  const isSkipped = subtitle.isSkipped === true;
                  const textColor = isSkipped ? '#ef4444' : '#ffffff'; // Red for skipped, white for normal
                  return (
                    <div key={`history-${index}-${subtitle.text.slice(0, 20)}`} className="text-center px-4 subtitle-fade">
                      <p 
                        className="text-2xl md:text-3xl lg:text-4xl leading-relaxed font-medium"
                        style={{ color: textColor, opacity: opacity }}
                      >
                        {subtitle.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Subtitle with Typewriter Animation */}
          <div
            key={currentSubtitle.text || 'waiting'}
            ref={currentSubtitleRef}
            className="text-center px-8 py-10 live-display-panel subtitle-fade"
          >
            <p 
              className="text-3xl md:text-4xl lg:text-5xl leading-relaxed font-semibold"
              style={{ color: currentSubtitle.isSkipped ? '#ef4444' : '#ffffff' }}
            >
              {currentSubtitle.text ? (
                <TypewriterText 
                  text={currentSubtitle.text} 
                  wordDelay={250}
                />
              ) : (
                <span>
                  {connected 
                    ? 'Waiting for sermon to begin...' 
                    : connecting 
                      ? 'Connecting to Control Room...'
                      : 'Start monitoring in Control Room'
                  }
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 py-2" style={{ backgroundColor: 'rgba(16, 24, 39, 0.82)' }}>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Segment: {segmentOrder}/{totalSegments || '—'}</span>
          <span className={currentSubtitle.isSkipped ? 'text-red-500 font-bold' : ''}>
            {currentSubtitle.isSkipped ? 'SKIPPED SEGMENT' : 'Synced via BroadcastChannel'}
          </span>
          <span className="font-mono">{formatTime(sessionTime)}</span>
        </div>
      </div>
    </div>
  );
}
