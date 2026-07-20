import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';

export default function Pomodoro() {
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

 </div>
 );
}
