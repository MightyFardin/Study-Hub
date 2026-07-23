import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings2, BookOpen, X, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Pomodoro() {
  const { notes } = useAuth();
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
 const [mode, setMode] = useState('work'); // work, break
 const [timeLeft, setTimeLeft] = useState(25 * 60);
 const [isRunning, setIsRunning] = useState(false);

 const [settings, setSettings] = useState({ work: 25, break: 5 });
 const [showSettings, setShowSettings] = useState(false);

 useEffect(() => {
 let interval = null;
 if (isRunning && timeLeft > 0) {
 interval = setInterval(() => {
 setTimeLeft(prev => prev - 1);
 }, 1000);
 } else if (timeLeft === 0) {
 // Switch modes
 if (mode === 'work') {
 setMode('break');
 setTimeLeft(settings.break * 60);
 } else {
 setMode('work');
 setTimeLeft(settings.work * 60);
 }
 setIsRunning(false); // require manual start for next session
 // Optional: Play a sound here
 const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
 audio.play().catch(e => console.log("Audio play failed"));
 }
 return () => clearInterval(interval);
 }, [isRunning, timeLeft, mode, settings]);

 const toggleTimer = () => setIsRunning(!isRunning);

 const resetTimer = () => {
 setIsRunning(false);
 setTimeLeft(settings[mode] * 60);
 };

 const handleSettingsSave = (e) => {
 e.preventDefault();
 setShowSettings(false);
 if (!isRunning) {
 setTimeLeft(settings[mode] * 60);
 }
 };

 const minutes = Math.floor(timeLeft / 60);
 const seconds = timeLeft % 60;

 const progress = mode === 'work' 
 ? ((settings.work * 60 - timeLeft) / (settings.work * 60)) * 100 
 : ((settings.break * 60 - timeLeft) / (settings.break * 60)) * 100;

 return (
 <div className="max-w-xl mx-auto animate-in fade-in flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
 
 <div className="w-full card-minimal p-8 bg-white dark:bg-[#111] relative overflow-hidden">
 
 {/* Progress Background */}
 <div 
 className={`absolute bottom-0 left-0 right-0 opacity-10 dark:opacity-20 transition-all duration-1000 ease-linear ${mode === 'work' ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
 style={{ height: `${progress}%` }}
 />

 <div className="relative z-10 flex flex-col items-center">
 <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8 w-full max-w-xs">
 <button 
 onClick={() => { setMode('work'); setIsRunning(false); setTimeLeft(settings.work * 60); }}
 className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'work' ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
 >
 Focus
 </button>
 <button 
 onClick={() => { setMode('break'); setIsRunning(false); setTimeLeft(settings.break * 60); }}
 className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'break' ? 'bg-white dark:bg-[#222] text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
 >
 Break
 </button>
 </div>

 <div className={`text-8xl font-black mb-10 tracking-tighter tabular-nums ${mode === 'work' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
 {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
 </div>

 <div className="flex items-center gap-4">
 <button onClick={toggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all ${mode === 'work' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'}`}>
 {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
 </button>
 <button onClick={resetTimer} className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95">
 <RotateCcw size={20} />
 </button>
 <button onClick={() => setShowSettings(!showSettings)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors active:scale-95 ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
 <Settings2 size={20} />
 </button>
 <button onClick={() => setShowFocusMode(true)} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors active:scale-95 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400" title="Focus Mode (Read Notes)">
 <BookOpen size={20} />
 </button>
 </div>
 </div>
 </div>

 {showSettings && (
 <div className="w-full card-minimal p-6 bg-white dark:bg-[#111] mt-4 animate-in slide-in-from-top-2">
 <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Timer Settings (Minutes)</h3>
 <form onSubmit={handleSettingsSave} className="flex gap-4 items-end">
 <div className="flex-1">
 <label className="block text-xs font-medium mb-1">Focus Time</label>
 <input type="number" min="1" max="90" value={settings.work} onChange={e => setSettings({...settings, work: Number(e.target.value)})} className="input-field" />
 </div>
 <div className="flex-1">
 <label className="block text-xs font-medium mb-1">Break Time</label>
 <input type="number" min="1" max="30" value={settings.break} onChange={e => setSettings({...settings, break: Number(e.target.value)})} className="input-field" />
 </div>
 <button type="submit" className="btn-primary py-2.5 shrink-0">Save</button>
 </form>
 </div>
 )}

 {/* Focus Mode Modal overlay */}
 {showFocusMode && (
  <div className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95">
    {/* Minimal Timer Sidebar */}
    <div className="w-full md:w-64 bg-slate-50 dark:bg-[#111] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center shrink-0 relative">
      <button onClick={() => setShowFocusMode(false)} className="absolute top-4 left-4 p-2 bg-white dark:bg-[#222] rounded-full shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20}/></button>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Focus Timer</h3>
      <div className={`text-5xl font-black mb-6 tracking-tighter tabular-nums ${mode === 'work' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTimer} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${mode === 'work' ? 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700' : 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700'} active:scale-95 transition-all`}>
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
    
    {/* Note Reader Area */}
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 shrink-0 bg-white dark:bg-[#111]">
        <select 
          className="w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-lg border-none text-sm font-bold p-2.5 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
          value={selectedNote?.id || ''}
          onChange={e => setSelectedNote(notes.find(n => n.id === e.target.value) || null)}
        >
          <option value="">-- Select a note to read --</option>
          {(notes || []).map(n => <option key={n.id} value={n.id}>{n.title || n.fileName}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-white dark:bg-[#0a0a0a]">
        {selectedNote ? (
          <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto prose-headings:font-black prose-a:text-indigo-500 prose-img:rounded-xl">
            <h1 className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">{selectedNote.title || selectedNote.fileName}</h1>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedNote.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <FileText size={48} className="mb-4 opacity-30" />
            <p className="font-medium text-sm">Select a note from the dropdown to start reading.</p>
          </div>
        )}
      </div>
    </div>
  </div>
  )}

  </div>
  );
}
