import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Award, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

// Types for API responses
interface OverviewMetrics {
  avg_match_score: number;
  avg_match_score_change: number;
  sermons_delivered: number;
  sermons_delivered_change: number;
  total_segments: number;
  accuracy_rate: number;
  accuracy_rate_change: number;
}

interface PerformanceMetrics {
  translation_speed: number;
  theological_accuracy: number;
  vetting_approval_rate: number;
  live_delivery_success: number;
}

interface UsageStatistics {
  total_uploads: number;
  pending_review: number;
  approved: number;
  needs_revision: number;
}

interface ActivityItem {
  id: number;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface DashboardData {
  overview: OverviewMetrics;
  performance: PerformanceMetrics;
  usage: UsageStatistics;
  activity: ActivityItem[];
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Get icon and color for activity type
function getActivityStyle(type: string) {
  switch (type) {
    case 'sermon_approved':
    case 'segment_approved':
      return { bg: 'bg-green-100', icon: Award, iconColor: 'text-green-600' };
    case 'translation_completed':
    case 'segment_translated':
      return { bg: 'bg-blue-100', icon: TrendingUp, iconColor: 'text-blue-600' };
    case 'live_session_started':
    case 'live_session_completed':
      return { bg: 'bg-[#d4a03e]/10', icon: Users, iconColor: 'text-[#d4a03e]' };
    case 'vetting_completed':
    case 'segment_vetted':
      return { bg: 'bg-purple-100', icon: Clock, iconColor: 'text-purple-600' };
    case 'sermon_uploaded':
      return { bg: 'bg-[#0d7377]/10', icon: BarChart3, iconColor: 'text-[#0d7377]' };
    default:
      return { bg: 'bg-gray-100', icon: Clock, iconColor: 'text-gray-600' };
  }
}

export function Analytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ANALYTICS_DASHBOARD}?days=30`);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-[#f8f9fa] p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-[#0d7377] animate-spin" />
            <span className="ml-3 text-[#6c757d]">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state with fallback to demo data
  if (error || !data) {
    return (
      <div className="flex-1 bg-[#f8f9fa] p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">Could not load analytics data</p>
              <p className="text-yellow-700 text-sm mt-1">{error || 'Unknown error'}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-[#0d7377] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          </div>
          {/* Show placeholder content */}
          <AnalyticsContent data={getPlaceholderData()} isPlaceholder={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f8f9fa] p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header with refresh button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-[#0d7377] mb-2">Analytics & Insights</h1>
            <p className="text-[#6c757d]">
              View translation performance metrics, accuracy trends, and system usage statistics
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#0d7377] border border-[#0d7377] rounded-lg hover:bg-[#0d7377]/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <AnalyticsContent data={data} isPlaceholder={false} />
      </div>
    </div>
  );
}

// Separate component for the analytics content (reusable for placeholder)
function AnalyticsContent({ data, isPlaceholder }: { data: DashboardData; isPlaceholder: boolean }) {
  const { overview, performance, usage, activity } = data;

  return (
    <>
      {isPlaceholder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700">
          Showing placeholder data. Start a live session or add sermons to see real analytics.
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Average Match Score */}
        <Card className="bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#0d7377]/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-[#0d7377]" />
            </div>
            <Badge variant={overview.avg_match_score_change >= 0 ? 'success' : 'warning'}>
              {overview.avg_match_score_change >= 0 ? '+' : ''}{overview.avg_match_score_change.toFixed(1)}%
            </Badge>
          </div>
          <div className="text-3xl font-bold text-[#0d7377] mb-1">
            {overview.avg_match_score.toFixed(1)}%
          </div>
          <div className="text-sm text-[#6c757d]">Avg Match Score</div>
        </Card>

        {/* Sermons Delivered */}
        <Card className="bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#d4a03e]/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#d4a03e]" />
            </div>
            <Badge variant={overview.sermons_delivered_change >= 0 ? 'success' : 'warning'}>
              {overview.sermons_delivered_change >= 0 ? '+' : ''}{overview.sermons_delivered_change}
            </Badge>
          </div>
          <div className="text-3xl font-bold text-[#0d7377] mb-1">{overview.sermons_delivered}</div>
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
          <div className="text-3xl font-bold text-[#0d7377] mb-1">
            {overview.total_segments.toLocaleString()}
          </div>
          <div className="text-sm text-[#6c757d]">Total Segments</div>
        </Card>

        {/* Accuracy Rate */}
        <Card className="bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant={overview.accuracy_rate_change >= 0 ? 'success' : 'warning'}>
              {overview.accuracy_rate_change >= 0 ? '+' : ''}{overview.accuracy_rate_change.toFixed(1)}%
            </Badge>
          </div>
          <div className="text-3xl font-bold text-[#0d7377] mb-1">
            {overview.accuracy_rate.toFixed(1)}%
          </div>
          <div className="text-sm text-[#6c757d]">Accuracy Rate</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Translation Performance */}
        <Card className="bg-white p-6">
          <h3 className="text-[#0d7377] mb-4">Translation Performance</h3>
          <div className="space-y-4">
            <PerformanceBar label="Translation Speed" value={performance.translation_speed} color="bg-[#0d7377]" />
            <PerformanceBar label="Theological Accuracy" value={performance.theological_accuracy} color="bg-[#d4a03e]" />
            <PerformanceBar label="Vetting Approval Rate" value={performance.vetting_approval_rate} color="bg-green-600" />
            <PerformanceBar label="Live Delivery Success" value={performance.live_delivery_success} color="bg-[#0d7377]" />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white p-6">
          <h3 className="text-[#0d7377] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activity.length > 0 ? (
              activity.map((item, index) => {
                const style = getActivityStyle(item.activity_type);
                const IconComponent = style.icon;
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 pb-4 ${index < activity.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className={`w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-[#6c757d]">{item.description}</div>
                      )}
                      <div className="text-xs text-[#6c757d] mt-1">
                        {formatRelativeTime(item.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[#6c757d]">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">Activities will appear here as you use the system</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card className="bg-white p-6">
        <h3 className="text-[#0d7377] mb-6">Monthly Usage Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#0d7377] mb-1">{usage.total_uploads}</div>
            <div className="text-sm text-[#6c757d]">Total Uploads</div>
          </div>
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#0d7377] mb-1">{usage.pending_review}</div>
            <div className="text-sm text-[#6c757d]">Pending Review</div>
          </div>
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#0d7377] mb-1">{usage.approved}</div>
            <div className="text-sm text-[#6c757d]">Approved</div>
          </div>
          <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
            <div className="text-2xl font-bold text-[#0d7377] mb-1">{usage.needs_revision}</div>
            <div className="text-sm text-[#6c757d]">Needs Revision</div>
          </div>
        </div>
      </Card>
    </>
  );
}

// Performance bar component
function PerformanceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-[#6c757d]">{label}</span>
        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`} 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        ></div>
      </div>
    </div>
  );
}

// Placeholder data when API is unavailable
function getPlaceholderData(): DashboardData {
  return {
    overview: {
      avg_match_score: 0,
      avg_match_score_change: 0,
      sermons_delivered: 0,
      sermons_delivered_change: 0,
      total_segments: 0,
      accuracy_rate: 0,
      accuracy_rate_change: 0
    },
    performance: {
      translation_speed: 0,
      theological_accuracy: 0,
      vetting_approval_rate: 0,
      live_delivery_success: 0
    },
    usage: {
      total_uploads: 0,
      pending_review: 0,
      approved: 0,
      needs_revision: 0
    },
    activity: []
  };
}