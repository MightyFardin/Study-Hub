import React from 'react';
import { BookOpen, CalendarCheck, ArrowRight, Shield, Zap, Layout as LayoutIcon } from 'lucide-react';

export default function Landing({ onLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-50 selection:bg-slate-900/30 dark:selection:bg-white/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg rotate-3">
            <BookOpen className="text-white dark:text-slate-900" size={24} />
          </div>
          <span className="font-bold text-2xl tracking-tight">Study Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2 hidden sm:block">
            Features
          </button>
          <button 
            onClick={onLogin}
            className="h-10 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg flex items-center gap-2 group hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md"
          >
            Log In
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#111] text-slate-800 dark:text-slate-200 font-medium text-sm mb-4 border border-slate-200 dark:border-slate-800">
            <Zap size={16} />
            <span>The ultimate student productivity platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Master your studies with <br className="hidden md:block" />
            <span className="text-slate-900 dark:text-white">
              Notes Chain & Attendance Save
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop worrying about missing classes or losing notes. Study Hub combines seamless note sharing with intelligent attendance tracking to keep you focused on what matters.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={onLogin}
              className="h-14 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex items-center justify-center w-full sm:w-auto shadow-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-lg"
            >
              Get Started for Free
            </button>
            <button className="h-14 px-8 bg-white dark:bg-[#111] text-slate-900 dark:text-white font-bold rounded-xl flex items-center justify-center w-full sm:w-auto border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors text-lg">
              View Demo
            </button>
          </div>
        </div>

        {/* Feature Cards Preview */}
        <div className="mt-32 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left relative z-10">
          {/* Notes Chain Card */}
          <div className="p-8 bg-white dark:bg-[#111] rounded-3xl shadow-2xl relative group hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800/50">
            <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl mb-6 flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-6 transition-transform">
              <BookOpen size={32} className="text-white dark:text-slate-900" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Notes Chain Module</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Access a chronological thread of lecture notes. Filter by date, upvotes, or "Gap Filler" tags to find exactly what you missed.
            </p>
            <ul className="space-y-3">
              {[
                'Organized course directory',
                'Upload files, images, and text',
                'Community upvoting and comments'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#222] flex items-center justify-center shrink-0">
                    <Shield size={12} className="text-slate-900 dark:text-white" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Attendance Save Card */}
          <div className="p-8 bg-white dark:bg-[#111] rounded-3xl shadow-2xl relative group hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800/50">
            <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl mb-6 flex items-center justify-center shadow-xl -rotate-3 group-hover:-rotate-6 transition-transform">
              <CalendarCheck size={32} className="text-white dark:text-slate-900" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Attendance Save Module</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Never fall below the minimum threshold. Smart algorithms calculate how many classes you can safely skip or need to recover.
            </p>
            <ul className="space-y-3">
              {[
                'Custom minimum percentage goals',
                'Safe-skip and recovery-streak formulas',
                'Color-coded risk indicators'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#222] flex items-center justify-center shrink-0">
                    <LayoutIcon size={12} className="text-slate-900 dark:text-white" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-slate-900/5 dark:bg-white/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      </main>
    </div>
  );
}
