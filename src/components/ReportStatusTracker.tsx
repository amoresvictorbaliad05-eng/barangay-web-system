import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, CheckCircle2, ShieldAlert, History, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { IncidentReport, ReportStatus } from '../types';

export function ReportStatusTracker() {
  const [reportId, setReportId] = useState('');
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!reportId.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch('/api/reports');
      const data: IncidentReport[] = await res.json();
      const found = data.find(r => r.id.toLowerCase() === reportId.toLowerCase().trim());
      if (found) {
        setReport(found);
      } else {
        setError('No report found with this ID. Please double-check and try again.');
      }
    } catch (err) {
      setError('An error occurred while tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Track Your Report</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Enter the unique Report ID provided after your submission to see the real-time progress of your concern.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text" 
              placeholder="Enter Report ID (e.g. REP-12345)" 
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-mono text-xl tracking-wider focus:outline-none focus:border-indigo-600 focus:bg-white transition-all uppercase placeholder:normal-case placeholder:tracking-normal"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading || !reportId.trim()}
            className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-bold text-lg hover:bg-slate-900 shadow-xl disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? "Searching..." : "Track Progress"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </div>
        
        {/* Background mesh */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-red-50 text-red-700 rounded-3xl flex gap-4 items-center border border-red-100"
          >
            <ShieldAlert size={24} />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {report && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Report Header Card */}
            <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[3rem] shadow-xl relative overflow-hidden">
               <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                 <div>
                    <div className="inline-block px-4 py-1.5 bg-indigo-500 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                      Official Record
                    </div>
                    <h3 className="text-5xl font-black mb-4 tracking-tighter uppercase font-mono">{report.id}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 opacity-80">
                        <MapPin size={18} className="text-indigo-400" />
                        <span className="font-medium">{report.location}</span>
                      </div>
                      <div className="flex items-center gap-3 opacity-80">
                        <Calendar size={18} className="text-indigo-400" />
                        <span className="font-medium">Submitted on {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                 </div>
                 <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center">
                    <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2 font-bold">Current Status</div>
                    <div className="text-4xl font-extrabold text-indigo-300 mb-4 capitalize">{report.status}</div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-indigo-400"
                          initial={{ width: 0 }}
                          animate={{ width: getStatusProgress(report.status) }}
                          transition={{ duration: 1, delay: 0.5 }}
                       />
                    </div>
                    <p className="text-xs mt-4 opacity-40">Last updated: {new Date(report.updatedAt).toLocaleTimeString()}</p>
                 </div>
               </div>
               
               {/* Abstract background */}
               <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            </div>

            {/* Timeline View */}
            <div className="grid md:grid-cols-3 gap-8">
               <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <History className="text-indigo-600" />
                       Action Timeline
                    </h4>
                    <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                       <TimelineStep 
                          title="Report Received" 
                          time={report.createdAt} 
                          desc="Your report has been successfully logged into the barangay system." 
                          isCompleted 
                       />
                       <TimelineStep 
                          title="Information Validated" 
                          time={report.updatedAt} 
                          desc="Barangay officials have reviewed and verified the details provided." 
                          isCompleted={['verifying', 'investigating', 'resolving', 'resolved'].includes(report.status)} 
                          isActive={report.status === 'verifying'}
                       />
                       <TimelineStep 
                          title="Response Team Assigned" 
                          desc="Personnel have been dispatched to address the situation." 
                          isCompleted={['investigating', 'resolving', 'resolved'].includes(report.status)} 
                          isActive={report.status === 'investigating'}
                       />
                       <TimelineStep 
                          title="Under Resolution" 
                          desc="Corrective measures are currently being taken." 
                          isCompleted={['resolving', 'resolved'].includes(report.status)} 
                          isActive={report.status === 'resolving'}
                       />
                       <TimelineStep 
                          title="Resolved" 
                          desc="The incident has been verified as closed and addressed." 
                          isCompleted={report.status === 'resolved'} 
                          isActive={report.status === 'resolved'}
                       />
                    </div>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <Clock size={18} /> What's Next?
                    </h4>
                    <p className="text-sm text-indigo-700 leading-relaxed mb-4">
                      {getNextStepText(report.status)}
                    </p>
                    <button className="text-indigo-600 font-bold text-sm hover:underline">
                      Contact Response Team →
                    </button>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 tracking-tight">Report Summary</h4>
                    <div className="space-y-4">
                       <div className="text-sm">
                         <div className="text-slate-400 uppercase text-[10px] tracking-widest font-bold mb-1">Description</div>
                         <div className="text-slate-700 line-clamp-3">{report.description}</div>
                       </div>
                       <div className="text-sm">
                         <div className="text-slate-400 uppercase text-[10px] tracking-widest font-bold mb-1">Priority Level</div>
                         <div className={cn(
                           "font-bold uppercase tracking-widest",
                           report.priority === 'critical' ? "text-red-500" : "text-indigo-500"
                         )}>
                           {report.priority}
                         </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineStep({ title, desc, time, isCompleted, isActive }: any) {
  return (
    <div className={cn(
      "relative pl-12 transition-all duration-500",
      isCompleted || isActive ? "opacity-100" : "opacity-30"
    )}>
      <div className={cn(
        "absolute left-0 top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500",
        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
        isActive ? "bg-white border-indigo-600 text-indigo-600 animate-pulse" : 
        "bg-white border-slate-200 text-slate-300"
      )}>
        {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <div>
        <div className="flex justify-between items-start mb-1">
          <h5 className="font-bold text-slate-800">{title}</h5>
          {time && <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">{new Date(time).toLocaleDateString()}</span>}
        </div>
        <p className="text-sm text-slate-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function getStatusProgress(status: ReportStatus) {
  const steps: Record<ReportStatus, string> = {
    pending: '20%',
    verifying: '40%',
    investigating: '60%',
    resolving: '80%',
    resolved: '100%',
    archived: '100%'
  };
  return steps[status] || '0%';
}

function getNextStepText(status: ReportStatus) {
  switch (status) {
    case 'pending': return 'Your report is in the queue. A barangay official will review it shortly to verify the details.';
    case 'verifying': return 'We are currently cross-referencing your report with other community data to ensure accuracy.';
    case 'investigating': return 'Formal investigation is underway. Technical or security teams may visit the location soon.';
    case 'resolving': return 'Active measures are being applied to resolve the issue. Thank you for your patience.';
    case 'resolved': return 'Task completed. This record is now closed. If the issue persists, please file a new report.';
    default: return 'No pending actions needed from your side.';
  }
}
