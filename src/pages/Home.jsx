import React, { useState, useEffect } from 'react';
import { 
 Search,
 BookOpen, 
 CalendarCheck,
 TrendingUp,
 ChevronRight,
 Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
 const [searchQuery, setSearchQuery] = useState('');
 
 const today = new Date().toLocaleDateString('en-US', { 
 day: 'numeric',
 month: 'short' 
 });

 return (
 <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 lg:pb-0">
 
 {/* Header matching UI */}
 <div className="flex justify-between items-start">
 <div className="animate-in slide-in-from-left-8 duration-700">
 <p className="text-indigo-500 dark:text-indigo-400 font-extrabold text-sm mb-2 tracking-widest uppercase">{today}</p>
 <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
 Hi, Alex
 </h1>
 </div>
 <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/60 dark:border-slate-700/60 shadow-lg shadow-indigo-500/10 hover:scale-105 transition-transform duration-300 cursor-pointer">
 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" className="w-full h-full object-cover bg-indigo-50" />
 </div>
 </div>

 {/* Search Bar */}
 <div className="relative group">
 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
 <div className="relative">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
 <input 
 type="text" 
 placeholder="Search for notes, courses..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-full py-5 pl-16 pr-8 shadow-sm border border-white/40 dark:border-slate-700/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-bold text-lg"
 />
 </div>
 </div>

 {/* Banner Card */}
 <div className="bg-gradient-to-br from-[#e6f2fb] to-[#d1e6f9] dark:from-blue-900/40 dark:to-indigo-900/40 rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-blue-500/10 border border-white/60 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 dark:bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
 
 <div className="relative z-10 max-w-[240px] sm:max-w-sm">
 <h2 className="text-3xl sm:text-4xl font-black text-blue-950 dark:text-blue-100 mb-8 leading-tight tracking-tight">
 What would you like to learn today?
 </h2>
 <Link to="/notes" className="bg-white/90 backdrop-blur text-blue-600 font-extrabold px-8 py-4 rounded-full text-base hover:bg-white hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all inline-block active:scale-95">
 Get started
 </Link>
 </div>
 
 {/* Decorative elements representing the illustration */}
 <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 shrink-0 perspective-1000">
 <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 rounded-[2.5rem] rotate-6 group-hover:rotate-12 group-hover:scale-105 shadow-2xl flex items-center justify-center text-white transition-all duration-700 ease-out relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
 <BookOpen size={80} className="relative z-10 drop-shadow-md" />
 </div>
 </div>
 </div>

 {/* For You Section */}
 <div className="space-y-6 pt-4">
 <div className="flex justify-between items-center px-2">
 <h2 className="text-2xl font-black text-slate-900 dark:text-white">For you</h2>
 <Link to="/notes" className="text-indigo-500 font-bold text-sm hover:text-indigo-600 flex items-center gap-1 group/link">
 See all <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
 </Link>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 {/* Green Card - Course Highlight */}
 <div className="bg-gradient-to-br from-[#56a36b] to-[#438a56] text-white rounded-[2.5rem] p-8 relative overflow-hidden group cursor-pointer h-[260px] flex flex-col justify-between shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-2 transition-all duration-500 border border-emerald-400/30">
 <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
 <div className="relative z-10">
 <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-3">Introduce</p>
 <h3 className="text-3xl font-black mb-4 leading-tight drop-shadow-sm">Basic what is PHP?</h3>
 <p className="text-emerald-50/90 text-sm line-clamp-2 pr-4 font-medium leading-relaxed">
 PHP is widely used program dynamic websites.
 </p>
 </div>
 <div className="flex items-center justify-between relative z-10">
 <span className="text-sm font-bold bg-black/10 px-3 py-1.5 rounded-lg ">30 min</span>
 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-xl group-hover:scale-110 group-active:scale-95 transition-all duration-300">
 <Play size={20} className="ml-1" fill="currentColor" />
 </div>
 </div>
 </div>

 <div className="space-y-6 flex flex-col">
 {/* Join Class Card */}
 <div className="glass-card p-8 flex-1 flex flex-col justify-center cursor-pointer group">
 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-indigo-600 transition-colors">Join your class –</h3>
 <div className="flex items-center -space-x-4">
 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=F1" className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-pink-100 shadow-md group-hover:-translate-y-1 transition-transform duration-300 delay-75" />
 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=M1" className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-blue-100 shadow-md group-hover:-translate-y-1 transition-transform duration-300 delay-150" />
 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=F2" className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-yellow-100 shadow-md group-hover:-translate-y-1 transition-transform duration-300 delay-200" />
 <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 shadow-md group-hover:-translate-y-1 transition-transform duration-300 delay-300">
 +12
 </div>
 </div>
 </div>

 {/* Article Card */}
 <div className="glass-card p-8 flex-1 flex flex-col justify-center cursor-pointer group">
 <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Article</p>
 <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
 Tips for better teamwork
 </h3>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
