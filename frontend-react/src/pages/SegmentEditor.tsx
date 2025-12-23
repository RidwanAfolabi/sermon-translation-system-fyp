import { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Download, Check, Clock, RefreshCw, Loader2, Save, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/layout/Header';
import { sermonApi, Sermon, Segment } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface SegmentEditorProps {
  onNavigate: (page: string, sermonId?: number) => void;
  sermonId?: number;
}

export function SegmentEditor({ onNavigate, sermonId }: SegmentEditorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [translating, setTranslating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingSegment, setEditingSegment] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');
  const [savingSegment, setSavingSegment] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'marian'>('gemini');

  useEffect(() => {
    if (sermonId) {
      loadSermonData();
    }
  }, [sermonId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (bulkActionsOpen && !target.closest('.bulk-actions-dropdown')) {
        setBulkActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bulkActionsOpen]);

  const loadSermonData = async () => {
    if (!sermonId) return;
    setLoading(true);
    try {
      const [sermonsData, segmentsData] = await Promise.all([
        sermonApi.list(),
        sermonApi.getSegments(sermonId)
      ]);
      
      const foundSermon = sermonsData.find(s => s.sermon_id === sermonId);
      setSermon(foundSermon || null);
      setSegments(segmentsData);
    } catch (err) {
      console.error('Failed to load sermon:', err);
      toast.error('Failed to load sermon data');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateAll = async () => {
    if (!sermonId) return;
    setTranslating(true);
    try {
      const result = await sermonApi.translate(sermonId, selectedProvider, false);
      toast.success(`Translated ${result.count} segments with ${result.provider}`);
      loadSermonData();
    } catch (err) {
      console.error('Translation failed:', err);
      toast.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateEmpty = async () => {
    if (!sermonId) return;
    setTranslating(true);
    try {
      const result = await sermonApi.translate(sermonId, selectedProvider, true);
      toast.success(`Translated ${result.count} empty segments with ${result.provider}`);
      loadSermonData();
    } catch (err) {
      console.error('Translation failed:', err);
      toast.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  const handleExport = async (format: 'csv' | 'txt' | 'pdf') => {
    if (!sermonId) return;
    setExporting(true);
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
      console.error('Export failed:', err);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleEditSegment = (segment: Segment) => {
    setEditingSegment(segment.segment_id);
    setEditedText(segment.english_text || '');
  };

  const handleSaveSegment = async (segment: Segment) => {
    if (!sermonId) return;
    setSavingSegment(segment.segment_id);
    try {
      await sermonApi.updateSegment(segment.segment_id, {
        english_text: editedText,
        vetted: true,
      });
      toast.success('Segment saved and marked as vetted');
      setEditingSegment(null);
      loadSermonData();
    } catch (err) {
      console.error('Failed to save segment:', err);
      toast.error('Failed to save segment');
    } finally {
      setSavingSegment(null);
    }
  };

  const handleApproveSegment = async (segment: Segment) => {
    if (!sermonId) return;
    setSavingSegment(segment.segment_id);
    try {
      await sermonApi.updateSegment(segment.segment_id, {
        vetted: true,
      });
      toast.success('Segment approved');
      loadSermonData();
    } catch (err) {
      console.error('Failed to approve segment:', err);
      toast.error('Failed to approve segment');
    } finally {
      setSavingSegment(null);
    }
  };

  const getStatusIcon = (segment: Segment) => {
    if (segment.vetted) return <Check size={16} className="text-[#28a745]" />;
    if (segment.english_text) return <Clock size={16} className="text-[#ffc107]" />;
    return <RefreshCw size={16} className="text-[#6c757d]" />;
  };

  const vettedCount = segments.filter(s => s.vetted).length;
  const vettedPercent = segments.length > 0 ? Math.round((vettedCount / segments.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0d7377] animate-spin mx-auto mb-4" />
          <p className="text-[#6c757d]">Loading sermon...</p>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
        <Card className="text-center p-8">
          <p className="text-[#6c757d] mb-4">Sermon not found</p>
          <Button onClick={() => onNavigate('library')}>Back to Library</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
      <Header 
        title={sermon.title}
        subtitle={`${sermon.speaker || 'Unknown speaker'} • ${segments.length} segments • ${vettedPercent}% vetted`}
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            icon={<ArrowLeft size={18} />}
            onClick={() => onNavigate('library')}
            className="mb-6"
          >
            Back to Library
          </Button>

          {/* Actions Bar */}
          <Card className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {/* Bulk Actions Dropdown */}
                <div className="relative bulk-actions-dropdown">
                  <Button
                    variant="secondary"
                    icon={<ChevronDown size={18} />}
                    onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
                    disabled={savingSegment === -1}
                    className="min-w-[140px] justify-between"
                  >
                    Bulk Actions {selectedSegments.size > 0 && `(${selectedSegments.size})`}
                  </Button>
                  {bulkActionsOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleApproveSelected}
                        disabled={selectedSegments.size === 0}
                      >
                        <Check size={16} className="text-[#28a745]" />
                        Approve Selected
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={handleApproveAllTranslated}
                      >
                        <Check size={16} className="text-[#0d7377]" />
                        Approve All Translated
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                        onClick={() => { setSelectedSegments(new Set()); setBulkActionsOpen(false); }}
                      >
                        <RefreshCw size={16} className="text-[#6c757d]" />
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
                <Button 
                  icon={translating ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                  onClick={handleTranslateAll}
                  disabled={translating}
                >
                  {translating ? 'Translating...' : 'Translate All'}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleTranslateEmpty}
                  disabled={translating}
                >
                  Translate Empty Only
                </Button>
                <Button 
                  variant="secondary" 
                  icon={exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                >
                  Export CSV
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6c757d]">Provider:</span>
                <select 
                  className="px-3 py-1.5 rounded-lg border-2 border-[#e0e0e0] focus:border-[#0d7377] focus:outline-none text-sm"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as 'gemini' | 'marian')}
                >
                  <option value="gemini">Gemini AI</option>
                  <option value="marian">Marian NMT (Offline)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Segments Table */}
          <Card>
            {segments.length === 0 ? (
              <div className="text-center py-8 text-[#6c757d]">
                <p className="mb-4">No segments found. The sermon may need to be segmented first.</p>
                <Button onClick={() => sermonId && sermonApi.segmentNow(sermonId, 'auto').then(() => loadSermonData())}>
                  Segment Now
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-sm w-12">
                        <input
                          type="checkbox"
                          checked={selectedSegments.size > 0 && selectedSegments.size === segments.filter(s => s.english_text && !s.vetted).length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-[#0d7377] border-gray-300 rounded focus:ring-[#0d7377] cursor-pointer"
                          title="Select all pending segments"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm w-16">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">MALAY (Original)</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">ENGLISH (Translation)</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((segment) => (
                      <tr
                        key={segment.segment_id}
                        className={`border-b border-gray-100 hover:bg-[#f8f9fa] transition-colors ${selectedSegments.has(segment.segment_id) ? 'bg-[#e8f4f4]' : ''}`}
                      >
                        <td className="py-4 px-4 align-top">
                          {segment.english_text && !segment.vetted ? (
                            <input
                              type="checkbox"
                              checked={selectedSegments.has(segment.segment_id)}
                              onChange={() => handleToggleSegment(segment.segment_id)}
                              className="w-4 h-4 text-[#0d7377] border-gray-300 rounded focus:ring-[#0d7377] cursor-pointer"
                            />
                          ) : (
                            <span className="w-4 h-4 inline-block" />
                          )}
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col items-center gap-2">
                            <span className="font-medium">{segment.segment_order}</span>
                            {getStatusIcon(segment)}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <p className="text-[#212529] mb-0 leading-relaxed">
                            {segment.malay_text}
                          </p>
                        </td>
                        <td className="py-4 px-4 align-top">
                          {editingSegment === segment.segment_id ? (
                            <div>
                              <textarea
                                className="w-full p-2 border-2 border-[#0d7377] rounded-lg focus:outline-none resize-none"
                                rows={3}
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                              />
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  icon={savingSegment === segment.segment_id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                  onClick={() => handleSaveSegment(segment)}
                                  disabled={savingSegment === segment.segment_id}
                                >
                                  Save & Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => setEditingSegment(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : segment.english_text ? (
                            <div>
                              <p className="text-[#212529] mb-2 leading-relaxed">
                                {segment.english_text}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge status={segment.vetted ? 'vetted' : 'pending'}>
                                  {segment.vetted ? 'Vetted' : segment.confidence ? `${Math.round(segment.confidence * 100)}%` : 'Pending'}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-[#6c757d] italic">
                              Not translated yet
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSegment(segment)}
                            >
                              Edit
                            </Button>
                            {segment.english_text && !segment.vetted && (
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={savingSegment === segment.segment_id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                onClick={() => handleApproveSegment(segment)}
                                disabled={savingSegment === segment.segment_id}
                                className="text-[#28a745]"
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Summary */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-[#6c757d]">
            <span>{segments.length} total segments</span>
            <span>•</span>
            <span>{vettedCount} vetted</span>
            <span>•</span>
            <span>{segments.filter(s => !s.english_text).length} need translation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
