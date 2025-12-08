import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Radio, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Header } from '../components/layout/Header';
import { sermonApi, Sermon, DashboardStats } from '../services/api';
import { toast } from 'sonner';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface SermonWithProgress extends Sermon {
  segments_count: number;
  vetted_count: number;
  progress: number;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total_sermons: 0,
    pending_review: 0,
    vetted_ready: 0,
    total_segments: 0,
    vetted_segments: 0,
  });
  const [recentSermons, setRecentSermons] = useState<SermonWithProgress[]>([]);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      setApiStatus('checking');
      const sermons = await sermonApi.list();
      setApiStatus('online');
      
      // Get recent sermons with their segment counts
      const sermonsWithProgress: SermonWithProgress[] = [];
      
      for (const sermon of sermons.slice(0, 5)) {
        try {
          const segments = await sermonApi.getSegments(sermon.sermon_id);
          const vettedCount = segments.filter(s => s.vetted).length;
          const progress = segments.length > 0 
            ? Math.round((vettedCount / segments.length) * 100) 
            : 0;
          
          sermonsWithProgress.push({
            ...sermon,
            segments_count: segments.length,
            vetted_count: vettedCount,
            progress,
          });
        } catch {
          sermonsWithProgress.push({
            ...sermon,
            segments_count: 0,
            vetted_count: 0,
            progress: 0,
          });
        }
      }
      
      setRecentSermons(sermonsWithProgress);
      const dashStats = await sermonApi.getStats();
      setStats(dashStats);
      
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setApiStatus('offline');
      setError('Failed to connect to backend. Make sure the server is running on port 8000.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (sermon: SermonWithProgress) => {
    if (sermon.status === 'vetted' || sermon.progress === 100) {
      return <Badge status="ready">Ready for Live</Badge>;
    }
    if (sermon.status === 'translated') {
      return <Badge status="pending">{sermon.progress}% vetted</Badge>;
    }
    if (sermon.status === 'segmented') {
      return <Badge status="pending">Needs Translation</Badge>;
    }
    return <Badge status="error">Draft</Badge>;
  };

  const getProgressColor = (progress: number): 'success' | 'warning' | 'error' => {
    if (progress === 100) return 'success';
    if (progress > 50) return 'warning';
    return 'error';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0d7377] animate-spin mx-auto mb-4" />
          <p className="text-[#6c757d]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
      <Header title="Dashboard Overview" subtitle="Manage your sermon translations" />
      
      <div className="flex-1 overflow-y-auto p-8">
        {error && (
          <Card className="mb-6 border-l-4 border-l-[#dc3545]">
            <div className="flex items-center gap-3 text-[#dc3545]">
              <AlertCircle size={20} />
              <span>{error}</span>
              <Button variant="secondary" size="sm" onClick={loadDashboard}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm mb-1">Total Sermons</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.total_sermons}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#0d7377]/10 flex items-center justify-center">
                <FileText className="text-[#0d7377]" size={24} />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.pending_review}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#ffc107]/10 flex items-center justify-center">
                <Clock className="text-[#ffc107]" size={24} />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm mb-1">Vetted Ready</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.vetted_ready}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#28a745]/10 flex items-center justify-center">
                <CheckCircle className="text-[#28a745]" size={24} />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6c757d] text-sm mb-1">Total Segments</p>
                <p className="text-3xl font-bold text-[#212529]">{stats.total_segments}</p>
                <p className="text-xs text-[#6c757d]">{stats.vetted_segments} vetted</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#00e676]/10 flex items-center justify-center">
                <Radio className="text-[#00c853]" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sermons */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="mb-0">Recent Sermons</h3>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('library')}>
                  View All
                </Button>
              </div>

              {recentSermons.length === 0 ? (
                <div className="text-center py-8 text-[#6c757d]">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No sermons uploaded yet</p>
                  <Button onClick={() => onNavigate('upload')}>
                    Upload Your First Sermon
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSermons.map((sermon) => (
                    <div
                      key={sermon.sermon_id}
                      className="p-4 bg-[#f8f9fa] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onNavigate('segments')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {sermon.progress === 100 ? (
                              <CheckCircle size={18} className="text-[#28a745]" />
                            ) : sermon.progress > 50 ? (
                              <Clock size={18} className="text-[#ffc107]" />
                            ) : (
                              <Clock size={18} className="text-[#dc3545]" />
                            )}
                            <h4 className="mb-0">{sermon.title}</h4>
                          </div>
                          <p className="text-sm text-[#6c757d] mt-1 mb-0">
                            {sermon.speaker || 'Unknown speaker'} • {formatDate(sermon.date_uploaded)}
                          </p>
                        </div>
                        {getStatusBadge(sermon)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6c757d] mb-2">
                        <span>{sermon.segments_count} segments</span>
                        <span>{sermon.vetted_count} vetted</span>
                      </div>
                      <ProgressBar 
                        percentage={sermon.progress} 
                        showPercentage={false}
                        color={getProgressColor(sermon.progress)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={() => onNavigate('upload')}
                  icon={<FileText size={18} />}
                >
                  Upload Sermon
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => onNavigate('control')}
                  icon={<Radio size={18} />}
                >
                  Live Monitor
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => onNavigate('vetting')}
                  icon={<CheckCircle size={18} />}
                >
                  Review Queue
                </Button>
              </div>
            </Card>

            {/* System Status */}
            <Card statusColor={apiStatus === 'online' ? 'success' : 'error'}>
              <h3 className="mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6c757d]">Backend API</span>
                  <div className="flex items-center gap-2">
                    {apiStatus === 'checking' ? (
                      <Loader2 size={12} className="animate-spin text-[#6c757d]" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${
                        apiStatus === 'online' ? 'bg-[#28a745] animate-pulse' : 'bg-[#dc3545]'
                      }`} />
                    )}
                    <span className={`text-sm font-medium ${
                      apiStatus === 'online' ? 'text-[#28a745]' : 'text-[#dc3545]'
                    }`}>
                      {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6c757d]">Database</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      apiStatus === 'online' ? 'bg-[#28a745] animate-pulse' : 'bg-[#6c757d]'
                    }`} />
                    <span className={`text-sm font-medium ${
                      apiStatus === 'online' ? 'text-[#28a745]' : 'text-[#6c757d]'
                    }`}>
                      {apiStatus === 'online' ? 'Connected' : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6c757d]">Translation</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#28a745] animate-pulse" />
                    <span className="text-sm font-medium text-[#28a745]">Gemini Ready</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
