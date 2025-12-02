import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface SegmentReviewProps {
  onNavigate: (page: string, sermonId?: number) => void;
}

export function SegmentReview({ onNavigate }: SegmentReviewProps) {
  // Simplified: SegmentReview now redirects to the main segment editor
  // The vetting functionality is integrated into SegmentEditor
  
  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={18} />}
          onClick={() => onNavigate('vetting')}
        >
          Back to Vetting Queue
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md text-center p-8">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="mb-2">Review Mode</h3>
          <p className="text-[#6c757d] mb-6">
            To review and approve segments, please select a sermon from the vetting queue. 
            This will open the segment editor where you can edit and approve translations.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={() => onNavigate('vetting')}>
              Go to Vetting Queue
            </Button>
            <Button onClick={() => onNavigate('library')}>
              Browse Library
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
