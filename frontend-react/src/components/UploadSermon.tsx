import { Sidebar } from './Sidebar';
import { ArrowLeft, Upload, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function UploadSermon() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [autoSegment, setAutoSegment] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [strategy, setStrategy] = useState('automatic');

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
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock upload process
    setTimeout(() => {
      navigate('/admin/library');
    }, 1000);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E0E0E0] px-8 py-4">
          <button 
            onClick={() => navigate('/admin/library')}
            className="flex items-center gap-2 text-[#0D7377] hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </button>
          <h1 className="mb-1">Upload New Sermon</h1>
          <p className="text-[#6C757D]">Add a new khutbah script for translation</p>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            {/* Sermon Details */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <h3 className="mb-6 pb-4 border-b border-[#E0E0E0]">Sermon Details</h3>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm mb-2 text-[#212529]">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Khutbah Jumaat - Patience in Islam"
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="speaker" className="block text-sm mb-2 text-[#212529]">
                    Speaker / Khatib
                  </label>
                  <input
                    id="speaker"
                    type="text"
                    placeholder="Ustaz Ahmad bin Hassan"
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm mb-2 text-[#212529]">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
                      <input
                        id="date"
                        type="date"
                        defaultValue="2025-11-29"
                        className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm mb-2 text-[#212529]">
                      Category
                    </label>
                    <select
                      id="category"
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent bg-white"
                    >
                      <option>Jumaat</option>
                      <option>Tafsir</option>
                      <option>Special Event</option>
                      <option>Ramadan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload File */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <h3 className="mb-6 pb-4 border-b border-[#E0E0E0]">Upload File</h3>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-[#0D7377] bg-[#0D7377]/5' 
                    : 'border-[#E0E0E0] hover:border-[#0D7377]'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".txt,.docx,.pdf,.csv,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-[#6C757D] mx-auto mb-4" />
                  <p className="text-[#212529] mb-2">
                    {fileName || 'Drag & drop your file'}
                  </p>
                  <p className="text-sm text-[#6C757D] mb-2">or click to browse</p>
                  <p className="text-xs text-[#6C757D]">.txt .docx .pdf .csv .md</p>
                </label>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSegment}
                    onChange={(e) => setAutoSegment(e.target.checked)}
                    className="w-5 h-5 text-[#0D7377] border-[#E0E0E0] rounded focus:ring-[#0D7377]"
                  />
                  <span className="text-[#212529]">Auto-segment on upload</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTranslate}
                    onChange={(e) => setAutoTranslate(e.target.checked)}
                    className="w-5 h-5 text-[#0D7377] border-[#E0E0E0] rounded focus:ring-[#0D7377]"
                  />
                  <span className="text-[#212529]">Auto-translate after segmentation</span>
                </label>
              </div>
            </div>

            {/* Segmentation Options */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <h3 className="mb-6 pb-4 border-b border-[#E0E0E0]">Segmentation Options</h3>
              
              <div className="space-y-3">
                <p className="text-sm text-[#6C757D] mb-4">Strategy</p>
                
                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  strategy === 'automatic' 
                    ? 'border-[#0D7377] bg-[#0D7377]/5' 
                    : 'border-[#E0E0E0] hover:border-[#0D7377]'
                }`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="automatic"
                    checked={strategy === 'automatic'}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-5 h-5 text-[#0D7377]"
                  />
                  <div>
                    <p className="text-[#212529]">Automatic (balanced) - Recommended</p>
                    <p className="text-sm text-[#6C757D]">AI-powered segmentation for optimal readability</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  strategy === 'sentence' 
                    ? 'border-[#0D7377] bg-[#0D7377]/5' 
                    : 'border-[#E0E0E0] hover:border-[#0D7377]'
                }`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="sentence"
                    checked={strategy === 'sentence'}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-5 h-5 text-[#0D7377]"
                  />
                  <div>
                    <p className="text-[#212529]">Sentence-based</p>
                    <p className="text-sm text-[#6C757D]">Break text at sentence boundaries</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  strategy === 'paragraph' 
                    ? 'border-[#0D7377] bg-[#0D7377]/5' 
                    : 'border-[#E0E0E0] hover:border-[#0D7377]'
                }`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="paragraph"
                    checked={strategy === 'paragraph'}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-5 h-5 text-[#0D7377]"
                  />
                  <div>
                    <p className="text-[#212529]">Paragraph-based</p>
                    <p className="text-sm text-[#6C757D]">Keep full paragraphs together</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/library')}
                className="px-6 py-3 border border-[#E0E0E0] text-[#6C757D] rounded-lg hover:bg-[#F8F9FA] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#0D7377] text-white rounded-lg hover:bg-[#14919B] transition-all flex items-center gap-2"
              >
                Upload & Process
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
