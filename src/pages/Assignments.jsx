import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, X, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function Assignments() {
 const { activeCourses, assignments, setAssignments } = useAuth();
 
 const [showAdd, setShowAdd] = useState(false);
 const [newAssignment, setNewAssignment] = useState({ title: '', courseId: '', dueDate: '', type: 'Homework', description: '' });

 const courseOptions = activeCourses.map(c => ({ value: c.id, label: c.name }));
 const typeOptions = [
 { value: 'Homework', label: 'Homework' },
 { value: 'Assignment', label: 'Assignment' },
 { value: 'Project', label: 'Project' },
 { value: 'Exam', label: 'Exam' }
 ];

 const handleAdd = (e) => {
 e.preventDefault();
 if (!newAssignment.title || !newAssignment.courseId || !newAssignment.dueDate) return;
 
 setAssignments([...assignments, {
 id: Date.now().toString(),
 ...newAssignment,
 completed: false
 }]);
 
 setNewAssignment({ title: '', courseId: '', dueDate: '', type: 'Homework', description: '' });
 setShowAdd(false);
 };

 const toggleComplete = (id) => {
 setAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
 };

 const handleDelete = (id) => {
 setAssignments(assignments.filter(a => a.id !== id));
 };

 const filteredAssignments = assignments.filter(a => activeCourses.some(c => c.id === a.courseId));
 const sortedAssignments = [...filteredAssignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
 const pending = sortedAssignments.filter(a => !a.completed);
 const completed = sortedAssignments.filter(a => a.completed);

 const getCourseName = (id) => activeCourses.find(c => c.id === id)?.name || 'Unknown Course';

 return (
 <div className="max-w-4xl mx-auto relative">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-in fade-in slide-in-from-bottom-4">
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments & Tasks</h1>
 <button onClick={() => setShowAdd(true)} className="btn-primary text-sm shrink-0">
 <Plus size={16} /> Add Task
 </button>
 </div>

 <div className="space-y-8">
 <div>
 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pending Tasks ({pending.length})</h2>
 {pending.length === 0 ? (
 <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
 <p className="text-sm text-slate-500">You're all caught up! No pending tasks.</p>
 </div>
 ) : (
 <div className="grid gap-3">
 {pending.map(task => (
 <div key={task.id} className="card-minimal flex items-center justify-between p-4 bg-white dark:bg-[#111]">
 <div className="flex items-center gap-4 flex-1">
 <button onClick={() => toggleComplete(task.id)} className="text-slate-300 hover:text-indigo-500 transition-colors">
 <Circle size={24} />
 </button>
 <div>
 <h3 className="font-bold text-slate-900 dark:text-white">{task.title}</h3>
 {task.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
 <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1.5">
 <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{getCourseName(task.courseId)}</span>
 <span className="text-indigo-500">{task.type}</span>
 <span className="flex items-center gap-1 text-orange-500"><Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}</span>
 </div>
 </div>
 </div>
 <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-4">
 <Trash2 size={18} />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 {completed.length > 0 && (
 <div>
 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Completed ({completed.length})</h2>
 <div className="grid gap-3 opacity-60">
 {completed.map(task => (
 <div key={task.id} className="card-minimal flex items-center justify-between p-4 bg-white dark:bg-[#111]">
 <div className="flex items-center gap-4 flex-1">
 <button onClick={() => toggleComplete(task.id)} className="text-emerald-500 hover:text-slate-400 transition-colors">
 <CheckCircle size={24} />
 </button>
 <div>
 <h3 className="font-bold text-slate-900 dark:text-white line-through">{task.title}</h3>
 {task.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{task.description}</p>}
 <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1.5">
 <span>{getCourseName(task.courseId)}</span>
 <span>{task.type}</span>
 </div>
 </div>
 </div>
 <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-4">
 <Trash2 size={18} />
 </button>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {showAdd && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-0 animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
 <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] shrink-0">
 <h2 className="text-xl font-bold">Add Task</h2>
 <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
 </div>

 <form onSubmit={handleAdd} className="flex flex-col flex-1 min-h-0">
 <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
 <div>
 <label className="block text-sm font-medium mb-1">Task Title</label>
 <input required type="text" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="input-field" placeholder="e.g. Chapter 4 Reading" />
 </div>
 
 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-sm font-medium mb-1">Course</label>
 <CustomSelect value={newAssignment.courseId} onChange={val => setNewAssignment({...newAssignment, courseId: val})} options={courseOptions} className="py-2.5 bg-slate-50 dark:bg-slate-900/50" />
 </div>
 <div className="flex-1">
 <label className="block text-sm font-medium mb-1">Type</label>
 <CustomSelect value={newAssignment.type} onChange={val => setNewAssignment({...newAssignment, type: val})} options={typeOptions} className="py-2.5 bg-slate-50 dark:bg-slate-900/50" />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Due Date</label>
 <input required type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="input-field" />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1">Description (Optional)</label>
 <textarea value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="input-field min-h-[80px] resize-y" placeholder="Add some details..." />
 </div>
 </div>
 <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] shrink-0">
 <button type="submit" className="btn-primary w-full h-12 text-sm font-bold" disabled={!newAssignment.courseId}>Save Task</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
