import React from 'react';
import { BookOpen, CalendarCheck, ArrowRight, Shield, Zap, Layout as LayoutIcon } from 'lucide-react';

export default function Landing({ onLogin }) {
 return (
 <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 selection:bg-primary-500/30">
 {/* Navigation */}
 <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20">
 <BookOpen className="text-white" size={24} />
 </div>
 <span className="font-bold text-2xl tracking-tight">Study Hub</span>
 </div>
 <div className="flex items-center gap-4">
 <button className="text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2 hidden sm:block">
 Features
 </button>
 <button 
 onClick={onLogin}
 className="btn-primary flex items-center gap-2 group"
 >
 Log In
 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 </nav>

 {/* Hero Section */}
 <main className="container mx-auto px-6 pt-20 pb-32 text-center">
 <div className="max-w-4xl mx-auto space-y-8 relative z-10">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium text-sm mb-4 border border-primary-100 dark:border-primary-800/50">
 <Zap size={16} />
 <span>The ultimate student productivity platform</span>
 </div>
 
 <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
 Master your studies with <br className="hidden md:block" />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">
 Notes Chain & Attendance Save
 </span>
 </h1>
 
 <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
 Stop worrying about missing classes or losing notes. Study Hub combines seamless note sharing with intelligent attendance tracking to keep you focused on what matters.
 </p>
 
 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
 <button 
 onClick={onLogin}
 className="btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-xl shadow-primary-600/20"
 >
 Get Started for Free
 </button>
 <button className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
 View Demo
 </button>
 </div>
 </div>

 {/* Feature Cards Preview */}
 <div className="mt-32 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left relative z-10">
 {/* Notes Chain Card */}
 <div className="card p-8 group hover:-translate-y-1 transition-transform duration-300">
 <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800/50 group-hover:scale-110 transition-transform">
 <BookOpen className="text-blue-600 dark:text-blue-400" size={28} />
 </div>
 <h3 className="text-2xl font-bold mb-3">Notes Chain Module</h3>
 <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
 Access a chronological thread of lecture notes. Filter by date, upvotes, or "Gap Filler" tags to find exactly what you missed.
 </p>
 <ul className="space-y-3">
 {[
 'Organized course directory',
 'Upload files, images, and text',
 'Community upvoting and comments'
 ].map((feature, i) => (
 <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
 <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
 <Shield size={14} className="text-blue-600 dark:text-blue-400" />
 </div>
 {feature}
 </li>
 ))}
 </ul>
 </div>

 {/* Attendance Save Card */}
 <div className="card p-8 group hover:-translate-y-1 transition-transform duration-300">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-800/50 group-hover:scale-110 transition-transform">
 <CalendarCheck className="text-emerald-600 dark:text-emerald-400" size={28} />
 </div>
 <h3 className="text-2xl font-bold mb-3">Attendance Save Module</h3>
 <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
 Never fall below the minimum threshold. Smart algorithms calculate how many classes you can safely skip or need to recover.
 </p>
 <ul className="space-y-3">
 {[
 'Custom minimum percentage goals',
 'Safe-skip and recovery-streak formulas',
 'Color-coded risk indicators'
 ].map((feature, i) => (
 <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
 <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
 <LayoutIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
 </div>
 {feature}
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Background glow effects */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
 </main>
 </div>
 );
}
