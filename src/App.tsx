/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  BarChart3, 
  CheckCircle2, 
  ChevronRight, 
  ClipboardList, 
  Eye, 
  FileText, 
  History, 
  Home, 
  Info, 
  LayoutDashboard, 
  MapPin, 
  Menu, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  X,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { cn } from './lib/utils';
import type { IncidentReport, IncidentType, ReportStatus, Priority } from './types';

// Components
import { ReportForm } from './components/ReportForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportStatusTracker } from './components/ReportStatusTracker';

type Page = 'home' | 'report' | 'admin' | 'track';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setActivePage('home')}
            >
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
                <ShieldAlert size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Barangay<span className="text-indigo-600">Connect</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => setActivePage('home')}
                className={cn("text-sm font-medium transition-colors hover:text-indigo-600", activePage === 'home' ? "text-indigo-600" : "text-slate-600")}
              >
                Home
              </button>
              <button 
                onClick={() => setActivePage('track')}
                className={cn("text-sm font-medium transition-colors hover:text-indigo-600", activePage === 'track' ? "text-indigo-600" : "text-slate-600")}
              >
                Track Status
              </button>
              <button 
                onClick={() => setActivePage('admin')}
                className={cn("text-sm font-medium transition-colors hover:text-indigo-600", activePage === 'admin' ? "text-indigo-600" : "text-slate-600")}
              >
                Admin Panel
              </button>
              <button 
                onClick={() => setActivePage('report')}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                Report Incident
              </button>
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2 text-slate-600" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-bottom border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                <button 
                  onClick={() => { setActivePage('home'); setIsMenuOpen(false); }}
                  className="text-left py-2 font-medium text-slate-600"
                >
                  Home
                </button>
                <button 
                  onClick={() => { setActivePage('track'); setIsMenuOpen(false); }}
                  className="text-left py-2 font-medium text-slate-600"
                >
                  Track Status
                </button>
                <button 
                  onClick={() => { setActivePage('admin'); setIsMenuOpen(false); }}
                  className="text-left py-2 font-medium text-slate-600"
                >
                  Admin Panel
                </button>
                <button 
                  onClick={() => { setActivePage('report'); setIsMenuOpen(false); }}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-center"
                >
                  Report Incident
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {activePage === 'home' && <HomePage onReport={() => setActivePage('report')} />}
          {activePage === 'report' && <ReportForm onBack={() => setActivePage('home')} />}
          {activePage === 'admin' && <AdminDashboard />}
          {activePage === 'track' && <ReportStatusTracker />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-bottom border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-4 text-white">
                <ShieldAlert size={20} />
                <span className="font-bold text-lg">BarangayConnect</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering communities through digital accountability. 
                Report incidents safely and track responses in real-time.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setActivePage('home')} className="hover:text-white">Home</button></li>
                <li><button onClick={() => setActivePage('report')} className="hover:text-white">Report Incident</button></li>
                <li><button onClick={() => setActivePage('track')} className="hover:text-white">Track Progress</button></li>
                <li><button onClick={() => setActivePage('admin')} className="hover:text-white">Official Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Emergency Contacts</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><span className="text-white">Police:</span> 911</li>
                <li className="flex items-center gap-2"><span className="text-white">Fire:</span> 092-229-880</li>
                <li className="flex items-center gap-2"><span className="text-white">Barangay HQ:</span> (02) 888-0000</li>
              </ul>
            </div>
          </div>
          <p className="pt-8 text-center text-xs opacity-50">
            © 2024 Barangay Incident Response System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function HomePage({ onReport }: { onReport: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-20"
    >
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pt-10 pb-20 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Digital Safety for a <span className="text-indigo-600 italic">Stronger</span> Barangay.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl"
          >
            A streamlined platform for reporting community incidents, tracking response teams, 
            and ensuring every voice in the barangay is heard and addressed.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={onReport}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(79,70,229,0.6)] hover:-translate-y-1 active:scale-95"
            >
              Report an Incident
            </button>
            <button className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95">
              How it works
            </button>
          </motion.div>
        </div>
        
        {/* Background Decorative Gradient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <ShieldCheck className="text-emerald-500" size={32} />,
            title: "Verified Reports",
            desc: "Official verification process ensures authentic community concerns are prioritized."
          },
          {
            icon: <ClipboardList className="text-amber-500" size={32} />,
            title: "Live Tracking",
            desc: "Watch the status of your report move from 'Pending' to 'Resolved' in real-time."
          },
          {
            icon: <BarChart3 className="text-indigo-500" size={32} />,
            title: "Data Insights",
            desc: "Helping officials identify crime hotspots and infrastructure needs through analytics."
          }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">{feat.title}</h3>
            <p className="text-slate-500">{feat.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Trust Section */}
      <section className="bg-indigo-900 rounded-[3rem] p-12 md:p-20 text-white overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <CheckCircle2 size={16} /> 100% Transparent
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Your Identity, Your Privacy.</h2>
            <p className="text-indigo-100 text-lg mb-8 opacity-80 leading-relaxed">
              We take security seriously. You can report incidents anonymously if preferred. 
              Only verified barangay officials have access to sensitive records.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold">2.4k+</div>
                <div className="text-sm opacity-60 uppercase tracking-widest">Reports Resolved</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-3xl font-bold">15min</div>
                <div className="text-sm opacity-60 uppercase tracking-widest">Avg. Response</div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-white/10 rounded-2xl items-center">
                <div className="w-10 h-10 bg-emerald-400/20 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="font-bold">Incident Verified</div>
                  <div className="text-sm opacity-60">Verified by Officer Reyes</div>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl items-center border border-white/5 opacity-50">
                <div className="w-10 h-10 bg-amber-400/20 text-amber-400 rounded-full flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="font-bold">Pending Review</div>
                  <div className="text-sm opacity-60">Automatic status update...</div>
                </div>
              </div>
              <div className="pt-4 text-center">
                <button className="text-indigo-300 font-bold hover:text-white transition-colors">
                  View Public Audit Profile →
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-800/0 to-indigo-800/50 pointer-events-none" />
      </section>

      {/* CTA Layer */}
      <section className="text-center py-20 pb-0">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-800">Ready to make a difference?</h2>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Start your report now. It only takes 2 minutes to alert your local community leaders.
        </p>
        <button 
          onClick={onReport}
          className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-slate-900 transition-all shadow-xl active:scale-95"
        >
          Submit a New Report
        </button>
      </section>
    </motion.div>
  );
}

