import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  MapPin, 
  Send, 
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  TreeDeciduous,
  HeartPulse,
  MoreHorizontal,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { IncidentType, Priority } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ReportFormProps {
  onBack: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const incidentTypes: { type: IncidentType; icon: any; color: string; desc: string }[] = [
  { type: 'Emergency', icon: <AlertTriangle />, color: 'bg-red-100 text-red-600', desc: 'Accidents, fires, medical emergencies' },
  { type: 'Infrastructure', icon: <Lightbulb />, color: 'bg-amber-100 text-amber-600', desc: 'Broken streetlights, potholes, leaks' },
  { type: 'Disturbance', icon: <ShieldAlert />, color: 'bg-indigo-100 text-indigo-600', desc: 'Noise, disputes, suspicious activity' },
  { type: 'Environmental', icon: <TreeDeciduous />, color: 'bg-emerald-100 text-emerald-600', desc: 'Illegal dumping, fallen trees, flooding' },
  { type: 'Health', icon: <HeartPulse />, color: 'bg-rose-100 text-rose-600', desc: 'Sanitation issues, disease outbreaks' },
  { type: 'Other', icon: <MoreHorizontal />, color: 'bg-slate-100 text-slate-600', desc: 'Any other community concerns' },
];

export function ReportForm({ onBack }: ReportFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '' as IncidentType | '',
    description: '',
    location: '',
    isAnonymous: false,
    reporterName: '',
    reporterContact: '',
    priority: 'medium' as Priority,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsAnalyzing(true);
    
    let priority: Priority = 'medium';
    
    try {
      // AI Triage
      if (formData.description) {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze this incident report and assign a priority level (low, medium, high, critical) based on urgency and risk. Return ONLY the priority word. 
          Report: ${formData.description}`,
        });
        const aiResponse = response.text?.toLowerCase().trim();
        if (aiResponse && ['low', 'medium', 'high', 'critical'].includes(aiResponse)) {
          priority = aiResponse as Priority;
        }
      }
    } catch (err) {
      console.warn("AI Triage failed, defaulting to medium priority");
    } finally {
      setIsAnalyzing(false);
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, priority }),
      });
      const data = await res.json();
      setSubmittedId(data.id);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Cancel and return</span>
        </button>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={cn(
                "h-2 w-8 rounded-full transition-all duration-500",
                step >= s ? "bg-indigo-600" : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 md:p-12 flex-1 flex flex-col"
          >
            <h2 className="text-3xl font-bold mb-2">What happened?</h2>
            <p className="text-slate-500 mb-8">Select the category that best describes the incident.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {incidentTypes.map((item) => (
                <button
                  key={item.type}
                  onClick={() => setFormData({ ...formData, type: item.type })}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all group",
                    formData.type === item.type 
                      ? "border-indigo-600 bg-indigo-50/50" 
                      : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                  )}
                >
                  <div className={cn("p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform", item.color)}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{item.type}</h3>
                  <p className="text-sm text-slate-500 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
              <button
                disabled={!formData.type}
                onClick={() => setStep(2)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
              >
                Next Step <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 md:p-12 flex-1 flex flex-col"
          >
            <h2 className="text-3xl font-bold mb-2">The Details</h2>
            <p className="text-slate-500 mb-8">Tell us where and what exactly occurred.</p>
            
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} /> Location / Address
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Purok 4, near the Basketball Court"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Describe the situation
                </label>
                <textarea 
                  rows={4}
                  placeholder="Provide as much detail as possible to help responders..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 group hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                <Camera size={32} className="group-hover:text-indigo-500" />
                <span className="font-medium group-hover:text-indigo-600">Upload Photo Evidence (Optional)</span>
                <span className="text-xs">Max 5MB • JPG, PNG</span>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
              <button 
                onClick={() => setStep(1)}
                className="text-slate-500 font-bold hover:text-slate-700"
              >
                Go Back
              </button>
              <button
                disabled={!formData.location || !formData.description}
                onClick={() => setStep(3)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
              >
                Next Step <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 md:p-12 flex-1 flex flex-col"
          >
            <h2 className="text-3xl font-bold mb-2">Reporter Info</h2>
            <p className="text-slate-500 mb-8">Choose how you want to identify yourself.</p>
            
            <div className="space-y-8 flex-1">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                  onClick={() => setFormData({ ...formData, isAnonymous: false })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    !formData.isAnonymous ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
                  )}
                >
                  Identified
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, isAnonymous: true })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    formData.isAnonymous ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
                  )}
                >
                  Anonymous
                </button>
              </div>

              {!formData.isAnonymous ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={formData.reporterName}
                      onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number / Contact</label>
                    <input 
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={formData.reporterContact}
                      onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="p-6 bg-indigo-50 text-indigo-700 rounded-2xl flex gap-4 border border-indigo-100">
                  <ShieldAlert className="shrink-0" size={24} />
                  <p className="text-sm">
                    <strong>Anonymous Reporting is enabled.</strong> Your name and contact will not be linked to this report in the public audit. However, officials may still use non-personal metadata to prioritize responses.
                  </p>
                </div>
              )}
              
              <div className="p-6 border border-slate-100 rounded-2xl space-y-4">
                <h4 className="font-bold flex items-center gap-2"><Send size={18} className="text-indigo-600" /> Review Summary</h4>
                <div className="text-sm space-y-2 text-slate-600">
                  <div className="flex justify-between"><span>Category:</span> <span className="font-bold text-slate-900">{formData.type}</span></div>
                  <div className="flex justify-between"><span>Location:</span> <span className="font-bold text-slate-900">{formData.location}</span></div>
                  <div className="flex justify-between"><span>Identity:</span> <span className="font-bold text-slate-900">{formData.isAnonymous ? "Secret" : "Verified"}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
              <button 
                onClick={() => setStep(2)}
                className="text-slate-500 font-bold hover:text-slate-700"
              >
                Go Back
              </button>
              <button
                disabled={isSubmitting || (!formData.isAnonymous && (!formData.reporterName || !formData.reporterContact))}
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95 min-w-[200px]"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles size={20} className="animate-pulse" />
                    Analyzing with AI...
                  </>
                ) : isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>Submit Report <CheckCircle2 size={20} /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Report Submitted Successfully</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Your report has been logged and assigned to the next available responder. 
              Please keep your Report ID for tracking.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-2xl w-full max-w-xs mb-10 border border-slate-100">
              <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Your Report ID</div>
              <div className="text-2xl font-black text-indigo-600 font-mono tracking-tighter uppercase">{submittedId}</div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={onBack}
                className="bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
              >
                Return to Home
              </button>
              <button className="text-indigo-600 font-bold py-2 hover:underline">
                Print/Share Report Receipt
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
