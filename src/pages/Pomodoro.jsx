import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings2, BookOpen, X, FileText, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Pomodoro() {
  const { notes } = useAuth();
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteDropdownOpen, setIsNoteDropdownOpen] = useState(false);
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

  {showFocusMode && (
   <div className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
     {/* Slim Top Timer Bar */}
     <div className="h-16 bg-slate-50 dark:bg-[#111] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 relative z-50 shadow-sm">
       <div className="flex items-center gap-3">
         <button onClick={() => setShowFocusMode(false)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-[#222] text-slate-500 transition-colors" title="Exit Focus Mode"><X size={20}/></button>
         <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Focus Mode</span>
       </div>
       
       <div className="flex items-center gap-4">
         <div className={`text-2xl sm:text-3xl font-black tabular-nums ${mode === 'work' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
           {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
         </div>
         <div className="flex items-center gap-2">
           <button onClick={toggleTimer} className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${mode === 'work' ? 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700' : 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700'} active:scale-95 transition-all`}>
             {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
           </button>
           <button onClick={resetTimer} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95">
             <RotateCcw size={16} />
           </button>
         </div>
       </div>
       
       <div className="w-10 sm:w-20"></div> {/* spacer for centering */}
     </div>
    
    {/* Note Reader Area */}
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <div className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 shrink-0 bg-slate-50/80 dark:bg-[#111]/80 backdrop-blur-md relative z-40">
        <div className="relative w-full max-w-md">
          <button 
            onClick={() => setIsNoteDropdownOpen(!isNoteDropdownOpen)}
            className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-bold p-3.5 flex justify-between items-center text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors focus:ring-4 focus:ring-indigo-500/10"
          >
            <span className="truncate pr-4">{selectedNote ? (selectedNote.title || selectedNote.fileName) : '-- Select a note to read --'}</span>
            <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${isNoteDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isNoteDropdownOpen && (
            <>
              <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-40" onClick={() => setIsNoteDropdownOpen(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                {(notes || []).length === 0 ? (
                  <div className="p-6 text-center text-sm font-medium text-slate-500">No notes available</div>
                ) : (
                  <div className="p-1.5 flex flex-col gap-1">
                    {(notes || []).map(n => (
                      <button
                        key={n.id}
                        onClick={() => { setSelectedNote(n); setIsNoteDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold rounded-lg transition-colors truncate ${selectedNote?.id === n.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222]'}`}
                      >
                        {n.title || n.fileName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-0 md:p-6 custom-scrollbar bg-white dark:bg-[#0a0a0a]">
        {selectedNote ? (
          selectedNote.content?.includes('drive.google.com/file/d/') ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-[#111] border border-slate-200 dark:border-slate-800 shadow-inner">
               <iframe 
                 src={selectedNote.content.replace('/view', '/preview')} 
                 className="w-full h-full border-none" 
                 title={selectedNote.title || "PDF Viewer"} 
                 allow="autoplay"
               />
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto prose-headings:font-black prose-a:text-indigo-500 prose-img:rounded-xl p-6 md:p-8 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50">
              <h1 className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">{selectedNote.title || selectedNote.fileName}</h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedNote.content}</ReactMarkdown>
            </div>
          )
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
