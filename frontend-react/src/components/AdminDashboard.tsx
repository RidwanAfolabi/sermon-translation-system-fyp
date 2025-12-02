import { Sidebar } from './Sidebar';
import { User, Upload, Radio, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Total Sermons', value: '12', icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { label: 'Pending Review', value: '3', icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Vetted Ready', value: '8', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { label: 'Live Sessions', value: '1', icon: Radio, color: 'bg-red-50 text-red-600' },
];

const recentSermons = [
  { id: 1, title: 'Friday Khutbah - Nov 22', status: 'active', vetted: 85, indicator: '🟢' },
  { id: 2, title: 'Tafsir Session - Nov 20', status: 'pending', vetted: 40, indicator: '🟡' },
  { id: 3, title: 'Jumaat Khutbah - Nov 15', status: 'complete', vetted: 100, indicator: '✅' },
];

const systemStatus = [
  { name: 'API', status: 'Online', indicator: '🟢' },
  { name: 'Database', status: 'OK', indicator: '🟢' },
  { name: 'Whisper', status: 'Ready', indicator: '🟢' },
];

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E0E0E0] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-1">Dashboard Overview</h1>
              <p className="text-[#6C757D]">Welcome back to the Sermon Translation System</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E0E0E0] hover:bg-[#F8F9FA] transition-all">
              <User className="w-5 h-5 text-[#6C757D]" />
              <span className="text-[#212529]">Admin</span>
              <span className="text-[#6C757D]">▼</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[#6C757D] text-sm mb-1">{stat.label}</p>
                  <p className="text-[32px] font-bold text-[#212529]">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Sermons */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between mb-6">
                <h3>Recent Sermons</h3>
                <button 
                  onClick={() => navigate('/admin/library')}
                  className="text-[#0D7377] text-sm hover:underline"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentSermons.map((sermon) => (
                  <div 
                    key={sermon.id}
                    className="border border-[#E0E0E0] rounded-lg p-4 hover:border-[#0D7377] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-xl">{sermon.indicator}</span>
                        <div className="flex-1">
                          <h4 className="text-[#212529] mb-1">{sermon.title}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#F8F9FA] rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full ${
                                  sermon.vetted === 100 ? 'bg-[#28A745]' : 
                                  sermon.vetted >= 60 ? 'bg-[#FFC107]' : 
                                  'bg-[#DC3545]'
                                }`}
                                style={{ width: `${sermon.vetted}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-[#6C757D] min-w-[60px]">
                              {sermon.vetted}% vetted
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                <h3 className="mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/admin/upload')}
                    className="w-full bg-[#0D7377] text-white px-4 py-3 rounded-lg hover:bg-[#14919B] transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Sermon
                  </button>
                  <button 
                    onClick={() => navigate('/live/control')}
                    className="w-full border border-[#0D7377] text-[#0D7377] px-4 py-3 rounded-lg hover:bg-[#F8F9FA] transition-all flex items-center justify-center gap-2"
                  >
                    <Radio className="w-5 h-5" />
                    Start Live
                  </button>
                  <button 
                    onClick={() => navigate('/vetting')}
                    className="w-full border border-[#0D7377] text-[#0D7377] px-4 py-3 rounded-lg hover:bg-[#F8F9FA] transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Review Queue
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                <h3 className="mb-4">System Status</h3>
                <div className="space-y-3">
                  {systemStatus.map((system, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{system.indicator}</span>
                        <span className="text-[#212529]">{system.name}</span>
                      </div>
                      <span className="text-sm text-[#6C757D]">{system.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
