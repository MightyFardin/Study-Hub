import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, X, Trash2 } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function Timetable() {
 const { activeCourses, timetable, setTimetable } = useAuth();
 
 const [showAdd, setShowAdd] = useState(false);
 const [newEntry, setNewEntry] = useState({ day: 'Monday', courseId: '', time: '', room: '' });
 const [classToDelete, setClassToDelete] = useState(null);

 const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
 const dayOptions = DAYS.map(d => ({ value: d, label: d }));
 const courseOptions = activeCourses.map(c => ({ value: c.id, label: c.name }));

 const handleAdd = (e) => {
 e.preventDefault();
 if (!newEntry.courseId || !newEntry.time) return;
 
 setTimetable([...timetable, {
 id: Date.now().toString(),
 ...newEntry
 }]);
 
 setNewEntry({ day: newEntry.day, courseId: '', time: '', room: '' });
 setShowAdd(false);
 };

 const handleDelete = (id) => {
 setTimetable(timetable.filter(t => t.id !== id));
 setClassToDelete(null);
 };

 const getCourseName = (id) => activeCourses.find(c => c.id === id)?.name || 'Unknown Course';
 
 const activeTimetable = timetable.filter(t => activeCourses.some(c => c.id === t.courseId));

 return (
 <div className="max-w-5xl mx-auto relative">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-in fade-in slide-in-from-bottom-4">
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Timetable</h1>
 <button onClick={() => setShowAdd(true)} className="btn-primary text-sm shrink-0">
 <Plus size={16} /> Add Class
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {DAYS.map(day => {
 const classes = activeTimetable.filter(t => t.day === day).sort((a, b) => a.time.localeCompare(b.time));
 
 return (
 <div key={day} className="card-minimal bg-white dark:bg-[#111] p-4 flex flex-col h-full min-h-[200px]">
 <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">{day}</h2>
 
 <div className="flex-1 flex flex-col gap-3">
 {classes.length === 0 ? (
 <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-medium">No classes</div>
 ) : (
 classes.map(cls => (
 <div key={cls.id} className="group relative bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
 <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{getCourseName(cls.courseId)}</h3>
 <div className="flex justify-between items-center text-xs font-medium text-slate-500">
 <span className="text-indigo-500">{cls.time}</span>
 {cls.room && <span>Room: {cls.room}</span>}
 </div>
 <button onClick={() => setClassToDelete(cls.id)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white dark:bg-[#1a1a1a] rounded-md shadow-sm sm:shadow-none sm:bg-transparent">
 <Trash2 size={14} />
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 );
 })}
 </div>

 {showAdd && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-6 animate-in zoom-in-95">
 <div className="flex justify-between items-center mb-5">
 <h2 className="text-xl font-bold">Add Class to Timetable</h2>
 <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
 </div>

 <form onSubmit={handleAdd} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Day</label>
 <CustomSelect value={newEntry.day} onChange={val => setNewEntry({...newEntry, day: val})} options={dayOptions} className="py-2.5 bg-slate-50 dark:bg-slate-900/50" />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1">Course</label>
 <CustomSelect value={newEntry.courseId} onChange={val => setNewEntry({...newEntry, courseId: val})} options={courseOptions} className="py-2.5 bg-slate-50 dark:bg-slate-900/50" />
 </div>

 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-sm font-medium mb-1">Time</label>
 <input required type="time" value={newEntry.time} onChange={e => setNewEntry({...newEntry, time: e.target.value})} className="input-field" />
 </div>
 <div className="flex-1">
 <label className="block text-sm font-medium mb-1">Room (Optional)</label>
 <input type="text" value={newEntry.room} onChange={e => setNewEntry({...newEntry, room: e.target.value})} className="input-field" placeholder="e.g. 101" />
 </div>
 </div>

 <button type="submit" className="btn-primary w-full mt-2" disabled={!newEntry.courseId}>Save Class</button>
 </form>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {classToDelete && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-6 animate-in zoom-in-95 bg-white dark:bg-[#111]">
 <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Delete Class?</h2>
 <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove this class from your timetable?</p>
 <div className="flex gap-3">
 <button onClick={() => setClassToDelete(null)} className="btn-secondary flex-1">Cancel</button>
 <button onClick={() => handleDelete(classToDelete)} className="btn-primary flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 border-transparent text-white">Delete</button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
