import React, { useState, useEffect } from 'react';
import { 
 Plus, 
 CheckCircle2, 
 XCircle, 
 AlertTriangle,
 TrendingUp,
 X,
 BookOpen
} from 'lucide-react';

export default function Attendance() {
 const [subjects, setSubjects] = useState(() => {
 const saved = localStorage.getItem('attendance_subjects');
 return saved ? JSON.parse(saved) : [];
 });

 const [showAddModal, setShowAddModal] = useState(false);
 const [newSubject, setNewSubject] = useState({ course: '', name: '', minPercent: 75 });

 useEffect(() => {
 localStorage.setItem('attendance_subjects', JSON.stringify(subjects));
 }, [subjects]);

 const calculateStatus = (present, total, minPercent) => {
 const currentPercent = total === 0 ? 100 : (present / total) * 100;
 
 if (currentPercent >= minPercent) {
 const minFrac = minPercent / 100;
 const canSkip = total === 0 ? 0 : Math.floor(present / minFrac) - total;
 return {
 percent: Math.round(currentPercent),
 status: 'safe',
 canSkip: Math.max(0, canSkip),
 color: 'text-emerald-500',
 bg: 'bg-emerald-500',
 lightBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
 borderColor: 'border-emerald-500/20',
 };
 } else {
 const minFrac = minPercent / 100;
 const needAttend = Math.ceil((minFrac * total - present) / (1 - minFrac));
 return {
 percent: Math.round(currentPercent),
 status: 'danger',
 needAttend: Math.max(1, needAttend),
 color: 'text-rose-500',
 bg: 'bg-rose-500',
 lightBg: 'bg-rose-500/10 dark:bg-rose-500/20',
 borderColor: 'border-rose-500/20',
 };
 }
 };

 const handleAttend = (id) => {
 setSubjects(subjects.map(s => s.id === id ? { ...s, present: s.present + 1, total: s.total + 1 } : s));
 };

 const handleMiss = (id) => {
 setSubjects(subjects.map(s => s.id === id ? { ...s, total: s.total + 1 } : s));
 };

 const handleDelete = (id) => {
 setSubjects(subjects.filter(s => s.id !== id));
 };

 const handleAddSubject = (e) => {
 e.preventDefault();
 if (!newSubject.course || !newSubject.name) return;
 
 setSubjects([
 ...subjects, 
 { 
 id: Date.now(), 
 ...newSubject, 
 present: 0, 
 total: 0,
 minPercent: Number(newSubject.minPercent) 
 }
 ]);
 setNewSubject({ course: '', name: '', minPercent: 75 });
 setShowAddModal(false);
 };

 const totalPresent = subjects.reduce((acc, s) => acc + s.present, 0);
 const totalClasses = subjects.reduce((acc, s) => acc + s.total, 0);
 const overallPercent = totalClasses === 0 ? (subjects.length > 0 ? 100 : 0) : Math.round((totalPresent / totalClasses) * 100);

 return (
 <div className="space-y-10 pb-20 lg:pb-0 max-w-5xl mx-auto">
 
 {/* Modern Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 dark:from-indigo-900/20 dark:to-violet-900/20 p-8 rounded-[2rem] border border-white/40 dark:border-slate-700/50 animate-in fade-in slide-in-from-bottom-4">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-4 shadow-sm border border-white/50 dark:border-slate-700/50">
 <BookOpen size={14} /> My Courses
 </div>
 <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
 Attendance Tracker
 </h1>
 </div>
 <button 
 onClick={() => setShowAddModal(true)}
 className="btn-primary flex items-center gap-2"
 >
 <Plus size={18} /> Add New Course
 </button>
 </div>

 {subjects.length > 0 && (
 <div className="grid sm:grid-cols-3 gap-6">
 <div className="glass-card p-6 border-l-4 border-l-indigo-500">
 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
 <TrendingUp size={24} className="text-indigo-600 dark:text-indigo-400" />
 </div>
 <h3 className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-sm uppercase tracking-wider">Overall Avg</h3>
 <div className="text-4xl font-black text-slate-800 dark:text-slate-100">{overallPercent}%</div>
 </div>
 
 <div className="glass-card p-6 border-l-4 border-l-rose-500">
 <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
 <AlertTriangle size={24} className="text-rose-500" />
 </div>
 <h3 className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-sm uppercase tracking-wider">Needs Attention</h3>
 <div className="text-4xl font-black text-slate-800 dark:text-slate-100">
 {subjects.filter(s => (s.total > 0 ? (s.present/s.total)*100 : 100) < s.minPercent).length}
 </div>
 </div>
 
 <div className="glass-card p-6 border-l-4 border-l-emerald-500">
 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
 <CheckCircle2 size={24} className="text-emerald-500" />
 </div>
 <h3 className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-sm uppercase tracking-wider">Safe Courses</h3>
 <div className="text-4xl font-black text-slate-800 dark:text-slate-100">
 {subjects.filter(s => (s.total > 0 ? (s.present/s.total)*100 : 100) >= s.minPercent).length}
 </div>
 </div>
 </div>
 )}

 {/* Subject List */}
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
 {subjects.length === 0 ? (
 <div className="text-center py-20 glass-card flex flex-col items-center">
 <div className="w-24 h-24 bg-gradient-to-tr from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 rounded-full flex items-center justify-center mb-6 shadow-inner">
 <Plus size={40} className="text-indigo-400" />
 </div>
 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No courses assigned</h2>
 <p className="text-slate-500 mb-8 max-w-sm">Start tracking your attendance by manually assigning your first course.</p>
 <button onClick={() => setShowAddModal(true)} className="btn-primary shadow-xl shadow-indigo-500/20 text-lg px-8 py-4">
 Assign Course Now
 </button>
 </div>
 ) : (
 <div className="grid lg:grid-cols-2 gap-6">
 {subjects.map((subject) => {
 const stats = calculateStatus(subject.present, subject.total, subject.minPercent);
 
 return (
 <div key={subject.id} className="glass-card overflow-hidden group">
 <div className={`p-6 ${stats.lightBg} border-b ${stats.borderColor} flex justify-between items-start transition-colors`}>
 <div>
 <div className="flex items-center gap-2 mb-3">
 <span className="text-xs font-black uppercase tracking-wider bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full text-slate-800 dark:text-slate-200 shadow-sm">
 {subject.course}
 </span>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/20 dark:bg-black/40 px-3 py-1.5 rounded-full">Target: {subject.minPercent}%</span>
 </div>
 <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white line-clamp-1">{subject.name}</h3>
 </div>
 <div className="relative">
 <div className={`text-5xl font-black ${stats.color} tracking-tighter`}>
 {stats.percent}%
 </div>
 <button 
 onClick={() => handleDelete(subject.id)}
 className="absolute -top-4 -right-4 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-100 dark:border-slate-700"
 >
 <X size={14} />
 </button>
 </div>
 </div>
 
 <div className="p-6 bg-white/40 dark:bg-slate-800/40">
 <div className="flex justify-between items-end mb-4">
 <div>
 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance</p>
 <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{subject.present} / {subject.total} <span className="text-sm font-medium text-slate-500">classes</span></p>
 </div>
 <div className="text-right">
 {stats.status === 'safe' ? (
 <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800/50">
 Safe to skip: {stats.canSkip}
 </div>
 ) : (
 <div className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-rose-200 dark:border-rose-800/50 animate-pulse">
 Must attend next {stats.needAttend}
 </div>
 )}
 </div>
 </div>
 
 {/* Fluid Progress bar */}
 <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-4 mb-8 overflow-hidden shadow-inner">
 <div className={`h-full rounded-full ${stats.bg} transition-all duration-1000 ease-out relative`} style={{ width: `${Math.min(stats.percent, 100)}%` }}>
 <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]"></div>
 </div>
 </div>
 
 {/* Modern Action Buttons */}
 <div className="grid grid-cols-2 gap-4">
 <button 
 onClick={() => handleAttend(subject.id)}
 className="group/btn relative overflow-hidden flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] transition-all font-bold text-lg shadow-lg shadow-emerald-500/20 active:scale-95"
 >
 <span className="relative z-10 flex items-center gap-2"><CheckCircle2 size={20} /> Present</span>
 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform rounded-[1.5rem]"></div>
 </button>
 <button 
 onClick={() => handleMiss(subject.id)}
 className="group/btn relative overflow-hidden flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-[1.5rem] transition-all font-bold text-lg shadow-sm border-2 border-rose-100 dark:border-rose-900/50 active:scale-95"
 >
 <span className="relative z-10 flex items-center gap-2"><XCircle size={20} /> Absent</span>
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Modern Add Modal */}
 {showAddModal && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 dark: z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
 <div className="glass-card bg-white dark:bg-slate-800 w-full max-w-md p-8 animate-in zoom-in-95 duration-300 border border-white/60 dark:border-slate-700">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Assign Course</h2>
 <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-700 p-2.5 rounded-full transition-colors active:scale-90">
 <X size={20} />
 </button>
 </div>
 
 <form onSubmit={handleAddSubject} className="space-y-5">
 <div>
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Course Code</label>
 <input 
 required
 type="text" 
 placeholder="e.g. CS301" 
 value={newSubject.course}
 onChange={e => setNewSubject({...newSubject, course: e.target.value})}
 className="input-field shadow-inner"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Course Name</label>
 <input 
 required
 type="text" 
 placeholder="e.g. Data Structures" 
 value={newSubject.name}
 onChange={e => setNewSubject({...newSubject, name: e.target.value})}
 className="input-field shadow-inner"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Target Minimum (%)</label>
 <div className="relative">
 <input 
 required
 type="number" 
 min="1" 
 max="100"
 value={newSubject.minPercent}
 onChange={e => setNewSubject({...newSubject, minPercent: e.target.value})}
 className="input-field shadow-inner font-black text-lg"
 />
 <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
 </div>
 </div>
 
 <button type="submit" className="btn-primary w-full text-lg py-4 mt-6">
 Assign Subject
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
