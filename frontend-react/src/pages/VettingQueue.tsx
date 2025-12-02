import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { sermonApi, Sermon, Segment } from '../services/api';
import { toast } from 'sonner';

interface VettingQueueProps {
  onNavigate: (page: string, sermonId?: number) => void;
}

interface SermonWithPending extends Sermon {
  pending_count: number;
  low_confidence_count: number;
  total_segments: number;
  vetted_today: number;
}

export function VettingQueue({ onNavigate }: VettingQueueProps) {
  const [loading, setLoading] = useState(true);
  const [sermons, setSermons] = useState<SermonWithPending[]>([]);
  const [stats, setStats] = useState({
    pending_segments: 0,
    low_confidence: 0,
    reviewed_today: 0,
    total_vetted: 0,
  });

  useEffect(() => {
    loadVettingData();
  }, []);

  const loadVettingData = async () => {
    setLoading(true);
    try {
      const sermonsData = await sermonApi.list();
      
      let totalPending = 0;
      let totalLowConfidence = 0;
      let totalVetted = 0;
      
      const sermonsWithPending: SermonWithPending[] = [];
      
      for (const sermon of sermonsData) {
        try {
          const segments = await sermonApi.getSegments(sermon.sermon_id);
          const pendingSegments = segments.filter(s => s.english_text && !s.vetted);
          const lowConfidence = segments.filter(s => 
            s.confidence !== undefined && 
            s.confidence !== null && 
            s.confidence < 0.7
          );
          const vettedSegments = segments.filter(s => s.vetted);
          
          totalPending += pendingSegments.length;
          totalLowConfidence += lowConfidence.length;
          totalVetted += vettedSegments.length;
          
          if (pendingSegments.length > 0) {
            sermonsWithPending.push({
              ...sermon,
              pending_count: pendingSegments.length,
              low_confidence_count: lowConfidence.length,
              total_segments: segments.length,
              vetted_today: 0, // Would need timestamp comparison for real implementation
            });
          }
        } catch {
          // Sermon might not have segments
        }
      }
      
      setSermons(sermonsWithPending);
      setStats({
        pending_segments: totalPending,
        low_confidence: totalLowConfidence,
        reviewed_today: totalVetted, // Simplified - would need date filter
        total_vetted: totalVetted,
      });
    } catch (err) {
      console.error('Failed to load vetting data:', err);
      toast.error('Failed to load vetting queue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0d7377] animate-spin mx-auto mb-4" />
          <p className="text-[#6c757d]">Loading vetting queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-0">Vetting Dashboard</h1>
            <p className="text-[#6c757d] mt-1 mb-0">Review and approve AI translations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={<Filter size={18} />}>
              Filter: All
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Summary Stats */}
          <Card className="mb-8">
            <h3 className="mb-6">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffc107]/10 flex items-center justify-center mx-auto mb-3">
                  <Clock size={32} className="text-[#ffc107]" />
                </div>
                <p className="text-3xl font-bold text-[#212529] mb-1">{stats.pending_segments}</p>
                <p className="text-sm text-[#6c757d] mb-0">Pending segments</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#dc3545]/10 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={32} className="text-[#dc3545]" />
                </div>
                <p className="text-3xl font-bold text-[#212529] mb-1">{stats.low_confidence}</p>
                <p className="text-sm text-[#6c757d] mb-0">Low confidence</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#28a745]/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} className="text-[#28a745]" />
                </div>
                <p className="text-3xl font-bold text-[#212529] mb-1">{stats.total_vetted}</p>
                <p className="text-sm text-[#6c757d] mb-0">Total vetted</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#0d7377]/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} className="text-[#0d7377]" />
                </div>
                <p className="text-3xl font-bold text-[#212529] mb-1">{sermons.length}</p>
                <p className="text-sm text-[#6c757d] mb-0">Sermons need review</p>
              </div>
            </div>
          </Card>

          {/* Pending Review */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="mb-0">Pending Review</h3>
            </div>

            {sermons.length === 0 ? (
              <div className="text-center py-8 text-[#6c757d]">
                <CheckCircle size={48} className="mx-auto mb-4 text-[#28a745] opacity-50" />
                <p className="mb-0">All caught up! No segments pending review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sermons.map((sermon) => (
                  <div 
                    key={sermon.sermon_id}
                    className="p-5 bg-[#f8f9fa] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('segments', sermon.sermon_id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="mb-0">{sermon.title}</h4>
                      <Badge 
                        status={sermon.low_confidence_count > 0 ? 'error' : 'pending'} 
                        icon={sermon.low_confidence_count > 0 ? <AlertTriangle size={14} /> : <Clock size={14} />}
                      >
                        {sermon.pending_count} pending
                      </Badge>
                    </div>
                    <p className="text-sm text-[#6c757d] mb-3">
                      {sermon.speaker || 'Unknown speaker'} • {sermon.total_segments} total segments
                      {sermon.low_confidence_count > 0 && (
                        <span className="text-[#dc3545]"> • {sermon.low_confidence_count} low confidence</span>
                      )}
                    </p>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('segments', sermon.sermon_id);
                      }}
                    >
                      Review Now →
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
