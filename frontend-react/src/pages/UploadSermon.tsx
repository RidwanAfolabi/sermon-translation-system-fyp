import { ArrowLeft, Upload, FileText, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Header } from '../components/layout/Header';
import { sermonApi } from '../services/api';
import { toast } from 'sonner';

interface UploadSermonProps {
  onNavigate: (page: string, sermonId?: number) => void;
}

export function UploadSermon({ onNavigate }: UploadSermonProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [segmentStrategy, setSegmentStrategy] = useState<'auto' | 'sentence' | 'paragraph'>('auto');
  const [autoSegment, setAutoSegment] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a sermon title');
      return;
    }

    setUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (speaker.trim()) {
        formData.append('speaker', speaker);
      }

      // Upload the sermon
      const result = await sermonApi.upload(formData);
      toast.success(`Uploaded successfully! ${result.inserted_segments} segments created.`);

      // Auto-segment if enabled
      if (autoSegment && result.inserted_segments === 0) {
        try {
          const segmentResult = await sermonApi.segmentNow(result.sermon_id, segmentStrategy);
          toast.success(`Segmented into ${segmentResult.count} segments`);
        } catch (err) {
          console.error('Segmentation failed:', err);
          toast.error('Auto-segmentation failed');
        }
      }

      // Auto-translate if enabled
      if (autoTranslate) {
        try {
          const translateResult = await sermonApi.translate(result.sermon_id, 'gemini', false);
          toast.success(`Translated ${translateResult.count} segments with ${translateResult.provider}`);
        } catch (err) {
          console.error('Translation failed:', err);
          toast.error('Auto-translation failed');
        }
      }

      // Navigate to the segment editor
      onNavigate('segments', result.sermon_id);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload sermon');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
      <Header 
        title="Upload New Sermon"
        subtitle="Add a new khutbah script for translation"
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            icon={<ArrowLeft size={18} />}
            onClick={() => onNavigate('library')}
            className="mb-6"
          >
            Back to Library
          </Button>

          <div className="space-y-6">
            {/* Sermon Details */}
            <Card>
              <h3 className="mb-6">Sermon Details</h3>
              
              <div className="space-y-6">
                <Input
                  label="Title"
                  placeholder="Khutbah Jumaat - Patience in Islam"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Input
                  label="Speaker / Khatib"
                  placeholder="Ustaz Ahmad bin Hassan"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                />
              </div>
            </Card>

            {/* Upload File */}
            <Card>
              <h3 className="mb-6">Upload File</h3>

              <div
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all
                  ${dragActive 
                    ? 'border-[#0d7377] bg-[#0d7377]/5' 
                    : 'border-gray-300 hover:border-[#0d7377] hover:bg-gray-50'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".txt,.docx,.pdf,.csv,.md"
                  onChange={handleFileChange}
                />
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText size={48} className="mx-auto mb-4 text-[#0d7377]" />
                  
                  {file ? (
                    <div>
                      <p className="font-medium text-[#212529] mb-1">{file.name}</p>
                      <p className="text-sm text-[#6c757d]">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-[#212529] mb-1">
                        Drag & drop your file
                      </p>
                      <p className="text-sm text-[#6c757d] mb-4">
                        or click to browse
                      </p>
                      <p className="text-xs text-[#6c757d]">
                        .txt .docx .pdf .csv .md
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoSegment}
                    onChange={(e) => setAutoSegment(e.target.checked)}
                    className="w-4 h-4 text-[#0d7377] rounded" 
                  />
                  <span className="text-sm">Auto-segment on upload</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoTranslate}
                    onChange={(e) => setAutoTranslate(e.target.checked)}
                    className="w-4 h-4 text-[#0d7377] rounded" 
                  />
                  <span className="text-sm">Auto-translate after segmentation (uses Gemini)</span>
                </label>
              </div>
            </Card>

            {/* Segmentation Options */}
            <Card>
              <h3 className="mb-6">Segmentation Options</h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#0d7377] transition-colors">
                  <input 
                    type="radio" 
                    name="segmentation" 
                    checked={segmentStrategy === 'auto'}
                    onChange={() => setSegmentStrategy('auto')}
                    className="mt-1" 
                  />
                  <div>
                    <div className="font-medium">Automatic (balanced) - Recommended</div>
                    <div className="text-sm text-[#6c757d]">AI optimizes segment length for readability</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#0d7377] transition-colors">
                  <input 
                    type="radio" 
                    name="segmentation" 
                    checked={segmentStrategy === 'sentence'}
                    onChange={() => setSegmentStrategy('sentence')}
                    className="mt-1" 
                  />
                  <div>
                    <div className="font-medium">Sentence-based</div>
                    <div className="text-sm text-[#6c757d]">Each sentence becomes a segment</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-[#0d7377] transition-colors">
                  <input 
                    type="radio" 
                    name="segmentation" 
                    checked={segmentStrategy === 'paragraph'}
                    onChange={() => setSegmentStrategy('paragraph')}
                    className="mt-1" 
                  />
                  <div>
                    <div className="font-medium">Paragraph-based</div>
                    <div className="text-sm text-[#6c757d]">Each paragraph becomes a segment</div>
                  </div>
                </label>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button variant="secondary" onClick={() => onNavigate('library')} disabled={uploading}>
                Cancel
              </Button>
              <Button 
                icon={uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                onClick={handleUpload}
                disabled={uploading || !file || !title.trim()}
              >
                {uploading ? 'Uploading...' : 'Upload & Process'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
