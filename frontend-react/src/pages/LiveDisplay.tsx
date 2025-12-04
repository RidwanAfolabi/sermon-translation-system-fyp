import { useState, useEffect, useRef } from 'react';
import { Radio, Settings } from 'lucide-react';

interface LiveDisplayProps {
  onNavigate?: (page: string) => void;
}

const LIVE_DISPLAY_STORAGE_KEY = 'liveDisplayContext';
const BROADCAST_CHANNEL_NAME = 'khutbah_subtitles';

export function LiveDisplay({ onNavigate }: LiveDisplayProps) {
  // Local state for subtitle display - populated via BroadcastChannel
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [previousSubtitles, setPreviousSubtitles] = useState<string[]>([]);
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
        // Update current subtitle
        setCurrentSubtitle(prev => {
          if (prev && prev !== msg.text) {
            // Push the old current to previous
            setPreviousSubtitles(prevSubs => {
              const newPrevious = [prev, ...prevSubs].slice(0, 5);
              return newPrevious;
            });
          }
          return msg.text;
        });

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
        // If we have stored context, assume we're connected until proven otherwise
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
    // Longer timeout to allow for BroadcastChannel connection
    connectionCheckTimeoutRef.current = setTimeout(() => {
      setConnecting(false);
      setNoControlRoom(true);
      // Only show "no control room" if we haven't received any data
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
      // If opened in new tab, navigate directly
      window.location.href = '/control-room';
    }
  };

  const showSelector = manualSelector || noControlRoom;

  // Display settings
  const historyDisplayCount = 5;
  const historyOpacity = ['text-white/80', 'text-white/70', 'text-white/60', 'text-white/50', 'text-white/40'];
  const orderedHistory = [...previousSubtitles.slice(0, historyDisplayCount)].reverse();

  return (
    <div className="h-screen flex flex-col text-white overflow-hidden" style={{ backgroundColor: '#0a0a14' }}>
      
      {/* No Control Room / Manual Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <div className="rounded-2xl p-8 max-w-lg w-full mx-4 border border-white/10" style={{ backgroundColor: '#12121a' }}>
            <div className="text-center mb-6">
              <Radio size={48} className="mx-auto mb-4 text-[#00e676]" />
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
                className="w-full px-6 py-3 bg-[#0d7377] text-white font-semibold rounded-lg hover:bg-[#0a5c5f] transition-colors"
              >
                Open Control Room
              </button>
              
              {!noControlRoom && (
                <button
                  onClick={() => setManualSelector(false)}
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
      <div className="flex-shrink-0 border-b border-white/10 px-4 py-2" style={{ backgroundColor: '#0d0d15' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio size={20} className="text-[#0d7377]" />
            <span className="text-white font-medium">Live Display</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-[#00e676] animate-pulse' : 
                connecting ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-500'
              }`} />
              <span className={`text-xs font-medium ${
                connected ? 'text-[#00e676]' : 
                connecting ? 'text-yellow-500' : 
                'text-gray-500'
              }`}>
                {connected ? 'LIVE' : connecting ? 'WAITING FOR STREAM' : 'OFFLINE'}
              </span>
            </div>
            <span className="text-white/50 text-sm">{sermonTitle || 'No sermon selected'}</span>
          </div>

          <button
            onClick={() => setManualSelector(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Display - Previous lines stack above current */}
      <div className="flex-1 flex flex-col justify-center px-8 py-4 overflow-y-auto scroll-smooth">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          {/* Previous Subtitles (oldest at top, newest closest to current line) */}
          {orderedHistory.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                {orderedHistory.map((subtitle, index) => {
                  const opacityIndex = orderedHistory.length - 1 - index;
                  const opacityClass = historyOpacity[opacityIndex] || 'text-white/30';
                  return (
                    <div key={`history-${index}-${subtitle.slice(0, 20)}`} className="text-center px-4 subtitle-fade">
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
            className="text-center px-6 py-8 rounded-2xl border border-[#0d7377]/40 shadow-[0_0_80px_rgba(13,115,119,0.25)] subtitle-fade"
            style={{ backgroundColor: 'rgba(13, 115, 119, 0.18)' }}
          >
            <p className="text-3xl md:text-4xl lg:text-5xl leading-relaxed font-semibold text-white">
              {currentSubtitle || (
                connected 
                  ? 'Waiting for sermon to begin...' 
                  : connecting 
                    ? 'Connecting to Control Room...'
                    : 'Start monitoring in Control Room'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 py-2" style={{ backgroundColor: '#0d0d15' }}>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Segment: {segmentOrder}/{totalSegments || '—'}</span>
          <span>Synced via BroadcastChannel</span>
          <span className="font-mono">{formatTime(sessionTime)}</span>
        </div>
      </div>
    </div>
  );
}
