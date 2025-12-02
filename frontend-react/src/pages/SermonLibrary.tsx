import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Plus, Eye, Edit, Globe, Trash2, Radio, Download, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Header } from '../components/layout/Header';
import { sermonApi, Sermon, Segment } from '../services/api';
import { toast } from 'sonner';

interface SermonLibraryProps {
  onNavigate: (page: string, sermonId?: number) => void;
}

interface SermonWithStats extends Sermon {
  segments_count: number;
  vetted_count: number;
  progress: number;
}

export function SermonLibrary({ onNavigate }: SermonLibraryProps) {
  const [loading, setLoading] = useState(true);
  const [sermons, setSermons] = useState<SermonWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [translating, setTranslating] = useState<number | null>(null);
  const [exporting, setExporting] = useState<number | null>(null);

  useEffect(() => {
    loadSermons();
  }, []);

  const loadSermons = async () => {
    setLoading(true);
    try {
      const sermonsData = await sermonApi.list();
      
      // Get segment counts for each sermon
      const sermonsWithStats: SermonWithStats[] = [];
      for (const sermon of sermonsData) {
        try {
          const segments = await sermonApi.getSegments(sermon.sermon_id);
          const vettedCount = segments.filter(s => s.vetted).length;
          const progress = segments.length > 0 
            ? Math.round((vettedCount / segments.length) * 100) 
            : 0;
          
          sermonsWithStats.push({
            ...sermon,
            segments_count: segments.length,
            vetted_count: vettedCount,
            progress,
          });
        } catch {
          sermonsWithStats.push({
            ...sermon,
            segments_count: 0,
            vetted_count: 0,
            progress: 0,
          });
        }
      }
      
      setSermons(sermonsWithStats);
    } catch (err) {
      console.error('Failed to load sermons:', err);
      toast.error('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sermonId: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    
    setDeleting(sermonId);
    try {
      await sermonApi.delete(sermonId);
      toast.success('Sermon deleted successfully');
      loadSermons();
    } catch (err) {
      console.error('Failed to delete sermon:', err);
      toast.error('Failed to delete sermon');
    } finally {
      setDeleting(null);
    }
  };

  const handleTranslate = async (sermonId: number) => {
    setTranslating(sermonId);
    try {
      const result = await sermonApi.translate(sermonId, 'gemini', true);
      toast.success(`Translated ${result.count} segments with ${result.provider}`);
      loadSermons();
    } catch (err) {
      console.error('Failed to translate:', err);
      toast.error('Translation failed');
    } finally {
      setTranslating(null);
    }
  };

  const handleExport = async (sermonId: number, format: 'csv' | 'txt' | 'pdf') => {
    setExporting(sermonId);
    try {
      const blob = await sermonApi.export(sermonId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sermon_${sermonId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to export:', err);
      toast.error('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const filteredSermons = sermons.filter(sermon => 
    sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sermon.speaker?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (sermon: SermonWithStats) => {
    if (sermon.status === 'vetted' || sermon.progress === 100) {
      return <Badge status="ready">Ready for Live</Badge>;
    }
    if (sermon.progress > 0) {
      return <Badge status="pending">{sermon.progress}% Vetted</Badge>;
    }
    if (sermon.status === 'translated') {
      return <Badge status="pending">Translated</Badge>;
    }
    if (sermon.status === 'segmented') {
      return <Badge status="pending">Segmented</Badge>;
    }
    return <Badge status="error">{sermon.status}</Badge>;
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
          <p className="text-[#6c757d]">Loading sermons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
      <Header 
        title="Sermon Library"
        subtitle={`${sermons.length} sermons • Manage all uploaded khutbah scripts`}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => onNavigate('upload')}>
            Upload New
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" size={20} />
              <input
                type="text"
                placeholder="Search sermons by title or speaker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-[#e0e0e0] focus:border-[#0d7377] focus:outline-none transition-all"
              />
            </div>
            <Button variant="secondary" icon={<Filter size={18} />}>
              Filter
            </Button>
            <Button variant="secondary" icon={<ArrowUpDown size={18} />}>
              Sort
            </Button>
          </div>
        </Card>

        {/* Empty State */}
        {filteredSermons.length === 0 ? (
          <Card className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-[#6c757d] opacity-50" />
            <h3 className="mb-2">No sermons found</h3>
            {searchQuery ? (
              <p className="text-[#6c757d] mb-4">Try adjusting your search query</p>
            ) : (
              <>
                <p className="text-[#6c757d] mb-4">Upload your first sermon to get started</p>
                <Button icon={<Plus size={18} />} onClick={() => onNavigate('upload')}>
                  Upload Sermon
                </Button>
              </>
            )}
          </Card>
        ) : (
          <>
            {/* Sermons List */}
            <div className="space-y-4">
              {filteredSermons.map((sermon) => (
                <Card key={sermon.sermon_id} hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="text-[#0d7377] mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <h3 className="mb-1">{sermon.title}</h3>
                          <p className="text-sm text-[#6c757d] mb-0">
                            {sermon.speaker || 'Unknown speaker'} • {formatDate(sermon.date_uploaded)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm text-[#6c757d]">
                            {sermon.segments_count} segments • {sermon.vetted_count} vetted
                          </span>
                          {getStatusBadge(sermon)}
                        </div>
                        <ProgressBar
                          percentage={sermon.progress}
                          showPercentage={false}
                          color={sermon.progress === 100 ? 'success' : sermon.progress > 50 ? 'warning' : 'error'}
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => onNavigate('segments', sermon.sermon_id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => onNavigate('segments', sermon.sermon_id)}
                        >
                          Edit
                        </Button>
                        {sermon.progress === 100 || sermon.status === 'vetted' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Radio size={16} />}
                              onClick={() => onNavigate('control', sermon.sermon_id)}
                            >
                              Go Live
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={exporting === sermon.sermon_id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                              onClick={() => handleExport(sermon.sermon_id, 'csv')}
                              disabled={exporting === sermon.sermon_id}
                            >
                              Export
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={translating === sermon.sermon_id ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                            onClick={() => handleTranslate(sermon.sermon_id)}
                            disabled={translating === sermon.sermon_id}
                          >
                            {translating === sermon.sermon_id ? 'Translating...' : 'Translate'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={deleting === sermon.sermon_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          className="text-[#dc3545] hover:bg-[#dc3545]/10"
                          onClick={() => handleDelete(sermon.sermon_id, sermon.title)}
                          disabled={deleting === sermon.sermon_id}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <p className="text-sm text-[#6c757d]">
                Showing {filteredSermons.length} of {sermons.length} sermons
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
