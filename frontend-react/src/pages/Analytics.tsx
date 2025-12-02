import { BarChart3, TrendingUp, Users, Clock, Award } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function Analytics() {
  return (
    <div className="flex-1 bg-[#f8f9fa] p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#0d7377] mb-2">Analytics & Insights</h1>
          <p className="text-[#6c757d]">
            View translation performance metrics, accuracy trends, and system usage statistics
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Match Score */}
          <Card className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#0d7377]/10 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-[#0d7377]" />
              </div>
              <Badge variant="success">+5.2%</Badge>
            </div>
            <div className="text-3xl font-bold text-[#0d7377] mb-1">87.3%</div>
            <div className="text-sm text-[#6c757d]">Avg Match Score</div>
          </Card>

          {/* Sermons Delivered */}
          <Card className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#d4a03e]/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[#d4a03e]" />
              </div>
              <Badge variant="success">+3</Badge>
            </div>
            <div className="text-3xl font-bold text-[#0d7377] mb-1">24</div>
            <div className="text-sm text-[#6c757d]">Sermons Delivered</div>
          </Card>

          {/* Total Segments */}
          <Card className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#0d7377]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#0d7377]" />
              </div>
              <Badge variant="info">This month</Badge>
            </div>
            <div className="text-3xl font-bold text-[#0d7377] mb-1">1,247</div>
            <div className="text-sm text-[#6c757d]">Total Segments</div>
          </Card>

          {/* Accuracy Rate */}
          <Card className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <Badge variant="success">+2.1%</Badge>
            </div>
            <div className="text-3xl font-bold text-[#0d7377] mb-1">94.2%</div>
            <div className="text-sm text-[#6c757d]">Accuracy Rate</div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Translation Performance */}
          <Card className="bg-white p-6">
            <h3 className="text-[#0d7377] mb-4">Translation Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#6c757d]">Translation Speed</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#0d7377] h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#6c757d]">Theological Accuracy</span>
                  <span className="text-sm font-medium">96%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#d4a03e] h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#6c757d]">Vetting Approval Rate</span>
                  <span className="text-sm font-medium">89%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#6c757d]">Live Delivery Success</span>
                  <span className="text-sm font-medium">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#0d7377] h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white p-6">
            <h3 className="text-[#0d7377] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Sermon Approved</div>
                  <div className="text-xs text-[#6c757d]">Friday Khutbah - Week 47</div>
                  <div className="text-xs text-[#6c757d] mt-1">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Translation Completed</div>
                  <div className="text-xs text-[#6c757d]">124 segments processed</div>
                  <div className="text-xs text-[#6c757d] mt-1">5 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-[#d4a03e]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-[#d4a03e]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Live Session</div>
                  <div className="text-xs text-[#6c757d]">340 congregation members</div>
                  <div className="text-xs text-[#6c757d] mt-1">Yesterday</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Vetting Completed</div>
                  <div className="text-xs text-[#6c757d]">Scholar review finished</div>
                  <div className="text-xs text-[#6c757d] mt-1">2 days ago</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Usage Statistics */}
        <Card className="bg-white p-6">
          <h3 className="text-[#0d7377] mb-6">Monthly Usage Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#0d7377] mb-1">156</div>
              <div className="text-sm text-[#6c757d]">Total Uploads</div>
            </div>
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#0d7377] mb-1">89</div>
              <div className="text-sm text-[#6c757d]">Pending Review</div>
            </div>
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#0d7377] mb-1">67</div>
              <div className="text-sm text-[#6c757d]">Approved</div>
            </div>
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#0d7377] mb-1">12</div>
              <div className="text-sm text-[#6c757d]">Needs Revision</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}