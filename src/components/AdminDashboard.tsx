import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  AlertCircle, 
  Eye, 
  MapPin, 
  User, 
  MoreVertical,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import type { IncidentReport, ReportStatus, Priority } from '../types';

export function AdminDashboard() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      const [reportsRes, summaryRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/analytics/summary')
      ]);
      const [reportsData, summaryData] = await Promise.all([
        reportsRes.json(),
        summaryRes.json()
      ]);
      setReports(reportsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: string, newStatus: ReportStatus) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const chartData = summary ? Object.entries(summary.byType).map(([name, value]) => ({ name, value })) : [];
  const COLORS = ['#818cf8', '#fbbf24', '#f87171', '#34d399', '#fb7185', '#94a3b8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Operational Command</h1>
          <p className="text-slate-500">Real-time oversight of barangay incidents and responses.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
          <Activity size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">System Active</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Reports" 
          value={summary?.total || 0} 
          icon={<BarChart3 className="text-indigo-600" />} 
          trend="+12% from last week"
        />
        <StatCard 
          label="Pending Action" 
          value={summary?.pending || 0} 
          icon={<Clock className="text-amber-500" />} 
          trend="-2 resolved recently"
          isWarning={summary?.pending > 5}
        />
        <StatCard 
          label="Resolution Rate" 
          value={`${summary?.total > 0 ? Math.round((summary?.resolved / summary?.total) * 100) : 0}%`} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          trend="+5% improvement"
        />
        <StatCard 
          label="Avg Status" 
          value="Healthy" 
          icon={<ShieldCheck className="text-blue-500" />} 
          trend="Resource Load: Low"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID, location, or keyword..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative inline-block w-full sm:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select 
                  className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <button 
                onClick={fetchReports}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
              >
                <Activity size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          {/* Table-like List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic font-serif">Report</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic font-serif">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic font-serif">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic font-serif">Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic font-serif"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-indigo-600">{report.id}</span>
                          <span className="font-medium text-slate-800 line-clamp-1">{report.description}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {report.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border",
                          getTypeStyles(report.type)
                        )}>
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => updateStatus(report.id, 'resolved')}
                             className="p-2 text-emerald-600 bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-emerald-100 transition-all"
                             title="Mark as Resolved"
                           >
                             <CheckCircle2 size={16} />
                           </button>
                           <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all">
                             <Eye size={18} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle size={40} className="opacity-20" />
                          <p>No reports match your current filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          {/* Pie Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Activity className="text-indigo-600" size={20} />
              Incident Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">{entry.name}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <h3 className="font-bold text-lg mb-6">Staff Shortcuts</h3>
            <div className="space-y-4">
              <button className="w-full p-4 bg-white/10 rounded-2xl flex items-center justify-between hover:bg-white/20 transition-all group">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} />
                  <span className="font-medium">Duty Roster</span>
                </div>
                <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full p-4 bg-white/10 rounded-2xl flex items-center justify-between hover:bg-white/20 transition-all group">
                <div className="flex items-center gap-3">
                  <User size={20} />
                  <span className="font-medium">Verify Volunteers</span>
                </div>
                <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="pt-6 border-t border-white/10 mt-6 overflow-hidden">
                <div className="text-xs uppercase tracking-widest opacity-40 mb-4 font-bold">Recent Updates</div>
                <div className="space-y-4">
                   <div className="text-sm border-l-2 border-emerald-500 pl-4 py-1">
                      <div className="opacity-60 text-xs">2 mins ago</div>
                      <div>REP-17203: Resolved by Admin</div>
                   </div>
                   <div className="text-sm border-l-2 border-indigo-500 pl-4 py-1">
                      <div className="opacity-60 text-xs">15 mins ago</div>
                      <div>System Heatmap Updated</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, isWarning = false }: any) {
  return (
    <div className={cn(
      "p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all",
      isWarning ? "ring-2 ring-amber-500/20 bg-amber-50/10" : ""
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          {icon}
        </div>
        <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={12} className="inline mr-1" />
          {trend}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest italic font-serif">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    verifying: "bg-blue-100 text-blue-700 border-blue-200",
    investigating: "bg-indigo-100 text-indigo-700 border-indigo-200",
    resolving: "bg-emerald-100 text-emerald-700 border-emerald-200",
    resolved: "bg-emerald-600 text-emerald-50 border-emerald-700",
    archived: "bg-slate-100 text-slate-600 border-slate-200"
  };
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 w-fit",
      styles[status]
    )}>
      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
}

function getTypeStyles(type: string) {
  const styles: any = {
    'Emergency': 'border-red-200 text-red-600 bg-red-50',
    'Infrastructure': 'border-amber-200 text-amber-600 bg-amber-50',
    'Disturbance': 'border-indigo-200 text-indigo-600 bg-indigo-50',
    'Environmental': 'border-emerald-200 text-emerald-600 bg-emerald-50',
    'Health': 'border-rose-200 text-rose-600 bg-rose-50',
    'Other': 'border-slate-200 text-slate-600 bg-slate-50',
  };
  return styles[type] || styles['Other'];
}
