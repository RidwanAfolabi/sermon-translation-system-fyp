import { HelpCircle, Book, Video, MessageCircle, FileText, Mail, Phone } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function Help() {
  return (
    <div className="flex-1 bg-[#f8f9fa] p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#0d7377] mb-2">Help & Documentation</h1>
          <p className="text-[#6c757d]">
            Learn how to use the Sermon Translation System effectively
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Start Guide */}
          <Card className="bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#0d7377]/10 rounded-lg flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-[#0d7377]" />
            </div>
            <h3 className="text-[#0d7377] mb-2">Quick Start Guide</h3>
            <p className="text-sm text-[#6c757d] mb-4">
              Learn the basics of uploading sermons, managing translations, and controlling live displays in 5 minutes
            </p>
            <button className="text-sm text-[#0d7377] font-medium hover:underline">
              Read Guide →
            </button>
          </Card>

          {/* Video Tutorials */}
          <Card className="bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#d4a03e]/10 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-[#d4a03e]" />
            </div>
            <h3 className="text-[#0d7377] mb-2">Video Tutorials</h3>
            <p className="text-sm text-[#6c757d] mb-4">
              Watch step-by-step video guides covering all features from upload to live delivery
            </p>
            <button className="text-sm text-[#0d7377] font-medium hover:underline">
              Watch Videos →
            </button>
          </Card>

          {/* FAQ */}
          <Card className="bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-[#0d7377] mb-2">Frequently Asked Questions</h3>
            <p className="text-sm text-[#6c757d] mb-4">
              Find answers to common questions about translation quality, vetting process, and system features
            </p>
            <button className="text-sm text-[#0d7377] font-medium hover:underline">
              View FAQs →
            </button>
          </Card>
        </div>

        {/* Common Topics */}
        <Card className="bg-white p-6 mb-8">
          <h2 className="text-[#0d7377] mb-6">Common Topics</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#0d7377] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base mb-1">How to Upload a Sermon</h3>
                  <p className="text-sm text-[#6c757d] mb-2">
                    Learn how to upload Arabic or Malay sermon scripts in PDF, DOCX, or TXT format
                  </p>
                  <button className="text-sm text-[#0d7377] hover:underline">Learn more</button>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#0d7377] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base mb-1">Understanding the Translation Process</h3>
                  <p className="text-sm text-[#6c757d] mb-2">
                    How AI generates translations and what the segment matching score means
                  </p>
                  <button className="text-sm text-[#0d7377] hover:underline">Learn more</button>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#0d7377] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base mb-1">Vetting & Approval Workflow</h3>
                  <p className="text-sm text-[#6c757d] mb-2">
                    How Islamic scholars review translations for theological accuracy
                  </p>
                  <button className="text-sm text-[#0d7377] hover:underline">Learn more</button>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#0d7377] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base mb-1">Using Live Subtitle Display</h3>
                  <p className="text-sm text-[#6c757d] mb-2">
                    Set up and control real-time English subtitles during sermon delivery
                  </p>
                  <button className="text-sm text-[#0d7377] hover:underline">Learn more</button>
                </div>
              </div>
            </div>

            <div className="pb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#0d7377] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base mb-1">Editing and Refining Translations</h3>
                  <p className="text-sm text-[#6c757d] mb-2">
                    How to manually edit segments and improve translation quality
                  </p>
                  <button className="text-sm text-[#0d7377] hover:underline">Learn more</button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-[#0d7377] to-[#0a5a5d] text-white p-8">
          <h2 className="text-white mb-2">Need More Help?</h2>
          <p className="text-white/90 mb-6">
            Our support team is here to help you with any questions or issues
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium mb-1">Email Support</div>
                <div className="text-sm text-white/80">support@mosque-system.com</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium mb-1">Phone Support</div>
                <div className="text-sm text-white/80">+60 3-1234-5678</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium mb-1">Live Chat</div>
                <div className="text-sm text-white/80">Available 9 AM - 6 PM</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
