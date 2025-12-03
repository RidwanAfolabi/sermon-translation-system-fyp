import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { WS_BASE_URL } from '../config/api';
import { toast } from 'sonner';

// Message format from backend live_routes.py
export interface LiveMessage {
  // Connection status message
  status?: 'started';
  segments_loaded?: number;
  aligner?: string;
  sermon_id?: number;
  
  // ASR stream data
  spoken?: string;
  buffer_text?: string;
  buffer_chunks?: number;
  score?: number;
  matched?: boolean;
  threshold?: number;
  candidate?: {
    segment_id?: number;
    order?: number;
  };
  segment?: {
    segment_id: number;
    order: number;
    malay_text: string;
    english_text: string;
  } | null;
  
  // Error handling
  error?: string;
}

interface LiveStreamState {
  connected: boolean;
  connecting: boolean;
  sermonId: number | null;
  sermonTitle: string;
  currentSubtitle: string;
  previousSubtitles: string[]; // Last matched subtitles (newest first)
  lastASR: string;
  currentSegmentId: number | null;
  segmentOrder: number;
  totalSegments: number;
  matchScore: number;
  sessionTime: number;
}

interface LiveStreamContextType extends LiveStreamState {
  connect: (sermonId: number, sermonTitle?: string) => void;
  disconnect: () => void;
  isStreamActive: boolean;
}

const LiveStreamContext = createContext<LiveStreamContextType | null>(null);
const MAX_PREVIOUS_SUBTITLES = 5;

export function LiveStreamProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiveStreamState>({
    connected: false,
    connecting: false,
    sermonId: null,
    sermonTitle: 'Live Sermon',
    currentSubtitle: '',
    previousSubtitles: [], // Track last few subtitles for history view
    lastASR: '',
    currentSegmentId: null,
    segmentOrder: 0,
    totalSegments: 0,
    matchScore: 0,
    sessionTime: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback((sermonId: number, sermonTitle?: string) => {
    // Don't reconnect if already connected to same sermon
    if (wsRef.current && state.sermonId === sermonId && state.connected) {
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      connecting: true, 
      sermonId,
      sermonTitle: sermonTitle || prev.sermonTitle 
    }));

    const wsUrl = `${WS_BASE_URL}/live/stream?sermon_id=${sermonId}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          currentSubtitle: 'Waiting for sermon to begin...',
        }));
        toast.success('Connected to live stream');

        // Start session timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
          setState(prev => ({ ...prev, sessionTime: prev.sessionTime + 1 }));
        }, 1000);
      };

      ws.onmessage = (event) => {
        try {
          const data: LiveMessage = JSON.parse(event.data);

          // Handle connection status message
          if (data.status === 'started') {
            setState(prev => ({
              ...prev,
              totalSegments: data.segments_loaded || prev.totalSegments,
            }));
            toast.success(`Stream started - ${data.segments_loaded} segments loaded`);
            return;
          }

          // Handle ASR stream data
          if (data.spoken) {
            setState(prev => ({ ...prev, lastASR: data.spoken || '' }));
          }

          // Handle match score
          if (data.score !== undefined) {
            setState(prev => ({ ...prev, matchScore: Math.round(data.score! * 100) }));
          }

          // Handle matched segment
          if (data.matched && data.segment) {
            setState(prev => {
              const newSubtitle = data.segment!.english_text || data.segment!.malay_text;
              const shouldPushCurrent = prev.currentSubtitle && prev.currentSubtitle !== 'Waiting for sermon to begin...';
              const newPrevious = shouldPushCurrent
                ? [prev.currentSubtitle, ...prev.previousSubtitles].slice(0, MAX_PREVIOUS_SUBTITLES)
                : prev.previousSubtitles;

              return {
                ...prev,
                previousSubtitles: newPrevious,
                currentSubtitle: newSubtitle,
                currentSegmentId: data.segment!.segment_id,
                segmentOrder: data.segment!.order,
              };
            });
          }

          // Handle errors
          if (data.error) {
            toast.error(data.error);
          }
        } catch {
          console.error('Failed to parse WebSocket message');
        }
      };

      ws.onclose = () => {
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
        }));
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        toast.info('Disconnected from live stream');
      };

      ws.onerror = () => {
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
        }));
        toast.error('WebSocket connection error');
      };

      wsRef.current = ws;
    } catch (err) {
      setState(prev => ({ ...prev, connecting: false }));
      toast.error('Failed to connect to live stream');
    }
  }, [state.sermonId, state.connected]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState({
      connected: false,
      connecting: false,
      sermonId: null,
      sermonTitle: 'Live Sermon',
      currentSubtitle: '',
      previousSubtitles: [],
      lastASR: '',
      currentSegmentId: null,
      segmentOrder: 0,
      totalSegments: 0,
      matchScore: 0,
      sessionTime: 0,
    });
  }, []);

  const value: LiveStreamContextType = {
    ...state,
    connect,
    disconnect,
    isStreamActive: state.connected || state.connecting,
  };

  return (
    <LiveStreamContext.Provider value={value}>
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const context = useContext(LiveStreamContext);
  if (!context) {
    throw new Error('useLiveStream must be used within a LiveStreamProvider');
  }
  return context;
}
