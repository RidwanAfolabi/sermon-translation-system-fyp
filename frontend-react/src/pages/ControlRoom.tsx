import { useState, useEffect } from 'react';
import { Mic, Monitor, Users, Activity, AlertCircle, Loader2, Radio, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { sermonApi, Sermon, Segment } from '../services/api';
import { useLiveStream } from '../contexts/LiveStreamContext';
import { toast } from 'sonner';

interface ControlRoomProps {
  sermonId?: number;
  onNavigate?: (page: string, sermonId?: number) => void;
}

export function ControlRoom({ sermonId: initialSermonId, onNavigate }: ControlRoomProps) {
  // Use shared live stream context
  const {
    connected,
    connecting,
    sermonId: streamSermonId,
    currentSubtitle,
    lastASR,
    currentSegmentId,
    matchScore,
    sessionTime,
    connect,
    disconnect,
  } = useLiveStream();

  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [selectedSermonId, setSelectedSermonId] = useState<number | undefined>(initialSermonId || streamSermonId || undefined);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientCount, setClientCount] = useState(1);

  useEffect(() => {
    loadAllSermons();
  }, []);

  // Sync selected sermon with stream sermon if stream is active
  useEffect(() => {
    if (streamSermonId && !selectedSermonId) {
      setSelectedSermonId(streamSermonId);
    }
  }, [streamSermonId]);

  useEffect(() => {
    if (selectedSermonId) {
      loadSermonData();
    } else {
      setSermon(null);
      setSegments([]);
    }
  }, [selectedSermonId]);

  const loadAllSermons = async () => {
    try {
      const sermons = await sermonApi.list();
      setAllSermons(sermons);
      
      // If no sermon selected but we have vetted sermons, suggest the first one
      if (!selectedSermonId && sermons.length > 0) {
        const vettedSermons = sermons.filter(s => s.status === 'vetted' || s.status === 'translated');
        // Don't auto-select, just load the list
      }
    } catch (err) {
      console.error('Failed to load sermons:', err);
      toast.error('Failed to load sermon list');
    } finally {
      setLoading(false);
    }
  };

  const loadSermonData = async () => {
    if (!selectedSermonId) return;
    setLoading(true);
    try {
      const segmentsData = await sermonApi.getSegments(selectedSermonId);
      
      const foundSermon = allSermons.find(s => s.sermon_id === selectedSermonId);
      setSermon(foundSermon || null);
      setSegments(segmentsData);
    } catch (err) {
      console.error('Failed to load sermon:', err);
      toast.error('Failed to load sermon data');
    } finally {
      setLoading(false);
    }
  };

  const connectToStream = () => {
    if (!selectedSermonId) {
      toast.error('Please select a sermon first');
      return;
    }
    connect(selectedSermonId, sermon?.title);
  };

  const disconnectFromStream = () => {
    disconnect();
  };

  const openLiveDisplay = () => {
    if (onNavigate) {
      onNavigate('liveDisplay', selectedSermonId);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSegment = segments.find(s => s.segment_id === currentSegmentId);
  const currentIndex = currentSegment ? segments.findIndex(s => s.segment_id === currentSegmentId) : -1;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0d7377] animate-spin mx-auto mb-4" />
          <p className="text-[#6c757d]">Loading control room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f8f9fa] flex flex-col">
      {/* Status Bar */}
      <div className={`bg-white border-b-4 ${connected ? 'border-[#00e676]' : 'border-gray-300'} px-8 py-3 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor size={24} className="text-[#0d7377]" />
            <span className="text-[#212529] font-medium">
              {sermon ? sermon.title : 'Select a sermon to start monitoring'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Sermon Selector */}
            {allSermons.length > 0 && (
              <select
                className="px-3 py-1.5 rounded-lg border-2 border-[#e0e0e0] focus:border-[#0d7377] focus:outline-none text-sm max-w-xs"
                value={selectedSermonId || ''}
                onChange={(e) => {
                  if (connected) {
                    disconnectFromStream();
                  }
                  setSelectedSermonId(e.target.value ? parseInt(e.target.value) : undefined);
                }}
                disabled={connecting}
              >
                <option value="">Select Sermon...</option>
                {allSermons.map(s => (
                  <option key={s.sermon_id} value={s.sermon_id}>
                    {s.title}
                  </option>
                ))}
              </select>
            )}
            {/* Open Live Display Button */}
            {connected && (
              <Button
                variant="secondary"
                icon={<ExternalLink size={16} />}
                onClick={openLiveDisplay}
                className="bg-[#00e676]/20 hover:bg-[#00e676]/30 text-[#00c853] border-[#00e676]/50"
              >
                Open Live Display
              </Button>
            )}
            {connected ? (
              <>
                <Badge status="live" icon={<div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />}>
                  LIVE
                </Badge>
                <span className="font-mono text-xl font-bold text-[#212529]">{formatTime(sessionTime)}</span>
              </>
            ) : (
              <Badge status="pending">OFFLINE</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {!sermon ? (
          <Card className="max-w-2xl mx-auto text-center py-12">
            <Radio size={48} className="mx-auto mb-4 text-[#0d7377]" />
            <h3 className="mb-2">Select a Sermon for Live Monitoring</h3>
            <p className="text-[#6c757d] mb-6">
              Choose a sermon from the list below to start live subtitle monitoring.
            </p>
            
            {allSermons.length === 0 ? (
              <div className="text-[#6c757d]">
                <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
                <p className="mb-4">No sermons available. Upload a sermon first.</p>
                {onNavigate && (
                  <Button onClick={() => onNavigate('upload')}>
                    Upload Sermon
                  </Button>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <select
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e0e0e0] focus:border-[#0d7377] focus:outline-none text-lg mb-4"
                  value={selectedSermonId || ''}
                  onChange={(e) => setSelectedSermonId(e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">-- Select a Sermon --</option>
                  {allSermons.map(s => (
                    <option key={s.sermon_id} value={s.sermon_id}>
                      {s.title} ({s.status}) - {s.speaker || 'Unknown'}
                    </option>
                  ))}
                </select>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#28a745]/10 p-3 rounded-lg">
                    <span className="text-[#28a745] font-medium">
                      {allSermons.filter(s => s.status === 'vetted').length} Vetted
                    </span>
                  </div>
                  <div className="bg-[#ffc107]/10 p-3 rounded-lg">
                    <span className="text-[#ffc107] font-medium">
                      {allSermons.filter(s => s.status === 'translated').length} Translated
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Connection Controls */}
              <Card>
                <h3 className="mb-4">Stream Control</h3>
                <div className="flex gap-4">
                  {!connected ? (
                    <Button
                      variant="primary"
                      icon={connecting ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                      onClick={connectToStream}
                      disabled={connecting}
                      className="flex-1"
                    >
                      {connecting ? 'Connecting...' : 'Start Monitoring'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="danger"
                        onClick={disconnectFromStream}
                        className="flex-1"
                      >
                        Stop Monitoring
                      </Button>
                      <Button
                        variant="secondary"
                        icon={<ExternalLink size={18} />}
                        onClick={openLiveDisplay}
                        className="bg-[#00e676]/20 hover:bg-[#00e676]/30 text-[#00c853] border-[#00e676]/50"
                      >
                        View Display
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-sm text-[#6c757d] mt-3">
                  {connected 
                    ? 'Stream is live! Click "View Display" to see the congregation view while keeping the stream running.'
                    : 'Note: This is a read-only monitoring view. The ASR and alignment run automatically when connected.'
                  }
                </p>
              </Card>

              {/* Subtitle Preview */}
              <Card>
                <h3 className="mb-4">Current Subtitle</h3>
                <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0d1b2a] rounded-lg p-8 mb-4 min-h-[120px] flex items-center justify-center">
                  <p className="text-white text-2xl text-center leading-relaxed">
                    {currentSubtitle || (connected ? 'Waiting for speech...' : 'Connect to see subtitles')}
                  </p>
                </div>
              </Card>

              {/* Speech Recognition */}
              <Card statusColor={connected ? 'success' : undefined}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="mb-0">Speech Recognition (ASR)</h3>
                  <div className="flex items-center gap-2">
                    {connected && <Activity size={18} className="text-[#00e676] animate-pulse" />}
                    <Badge status={connected ? 'live' : 'pending'}>
                      {connected ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#f8f9fa] rounded-lg border-2 border-[#0d7377]/20">
                    <p className="text-sm text-[#6c757d] mb-1">Last Detected:</p>
                    <p className="text-lg text-[#212529] font-medium mb-0">
                      {lastASR || 'No speech detected yet'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Match Score</span>
                      <div className="flex items-center gap-2">
                        <Badge status={matchScore >= 70 ? 'vetted' : matchScore >= 50 ? 'pending' : 'error'}>
                          {matchScore >= 70 ? 'High' : matchScore >= 50 ? 'Medium' : 'Low'} Confidence
                        </Badge>
                        <span className={`font-bold ${matchScore >= 70 ? 'text-[#28a745]' : matchScore >= 50 ? 'text-[#ffc107]' : 'text-[#dc3545]'}`}>
                          {matchScore}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar 
                      percentage={matchScore} 
                      showPercentage={false}
                      color={matchScore >= 70 ? 'success' : matchScore >= 50 ? 'warning' : 'error'}
                    />
                  </div>

                  {currentSegmentId && (
                    <div className="flex items-center justify-between p-3 bg-[#28a745]/10 rounded-lg">
                      <span className="text-sm font-medium text-[#28a745]">Matched Segment:</span>
                      <span className="font-bold text-[#28a745]">#{currentIndex + 1}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Live Output Preview */}
              <Card>
                <h3 className="mb-4">Live Display Preview</h3>
                <div className="aspect-video bg-gradient-to-b from-[#1a1a2e] to-[#0d1b2a] rounded-lg flex items-center justify-center mb-4 border-4 border-[#00e676]/30">
                  <div className="text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-[#00e676]/20 flex items-center justify-center mx-auto mb-4">
                      <Monitor size={32} className={connected ? 'text-[#00e676]' : 'text-gray-500'} />
                    </div>
                    <p className="text-white text-sm mb-2">
                      {connected ? 'Live Display Active' : 'Display Offline'}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[#00e676]">
                      <Users size={16} />
                      <span className="text-sm">Connected clients: {clientCount}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Segment Queue */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="mb-0">Segment Queue</h3>
                  <span className="text-sm font-medium text-[#6c757d]">
                    {segments.length} total segments
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {segments.slice(Math.max(0, currentIndex - 1), currentIndex + 4).map((segment, idx) => {
                    const isCurrentSegment = segment.segment_id === currentSegmentId;
                    const isPast = currentIndex > -1 && segments.indexOf(segment) < currentIndex;
                    
                    return (
                      <div
                        key={segment.segment_id}
                        className={`
                          p-4 rounded-lg border-2 transition-all
                          ${isCurrentSegment 
                            ? 'bg-[#0d7377]/10 border-[#0d7377] shadow-md' 
                            : isPast
                            ? 'bg-[#28a745]/5 border-[#28a745]/20 opacity-60'
                            : 'bg-gray-50 border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {isPast && (
                              <div className="w-6 h-6 rounded-full bg-[#28a745] flex items-center justify-center text-white text-xs">
                                ✓
                              </div>
                            )}
                            {isCurrentSegment && (
                              <div className="w-6 h-6 rounded-full bg-[#0d7377] flex items-center justify-center text-white text-xs animate-pulse">
                                ●
                              </div>
                            )}
                            {!isPast && !isCurrentSegment && (
                              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                                ○
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm">#{segment.segment_order}</span>
                              {isCurrentSegment && (
                                <Badge status="live">CURRENT</Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#212529] mb-0">
                              {segment.english_text || segment.malay_text}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
