import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const due = new Date(dueDate);
      due.setHours(23, 59, 59, 999);
      const now = new Date();
      const diff = due - now;

      if (diff <= 0) {
        setTimeLeft('Overdue');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [dueDate]);

  if (timeLeft === 'Overdue') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold shadow-sm">
        <Clock size={12} className="animate-pulse" />
        Overdue
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-all w-32 justify-center">
      <Clock size={12} />
      {timeLeft}
    </span>
  );
};

export default function Assignments() {
  const { activeCourses, assignments, setAssignments } = useAuth();
  
  const [newAssignment, setNewAssignment] = useState({ title: '', courseId: '', dueDate: new Date().toISOString().split('T')[0] });
  const [animatingIds, setAnimatingIds] = useState([]);

  // Auto-select first course if none selected
  useEffect(() => {
    if (activeCourses.length > 0 && !newAssignment.courseId) {
      setNewAssignment(prev => ({ ...prev, courseId: activeCourses[0].id }));
    }
  }, [activeCourses]);

  const courseOptions = activeCourses.map(c => ({ value: c.id, label: c.name }));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.courseId || !newAssignment.dueDate) return;
    
    setAssignments([...assignments, {
      id: Date.now().toString(),
      title: newAssignment.title,
      courseId: newAssignment.courseId,
      dueDate: newAssignment.dueDate,
      type: 'Task',
      completed: false
    }]);
    
    setNewAssignment({ ...newAssignment, title: '' }); 
  };

  const toggleComplete = (id) => {
    setAnimatingIds(prev => [...prev, id]);
    setTimeout(() => {
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
      setAnimatingIds(prev => prev.filter(taskId => taskId !== id));
    }, 400); // 400ms delay before it moves
  };

  const handleDelete = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const filteredAssignments = assignments.filter(a => activeCourses.some(c => c.id === a.courseId));
  const sortedAssignments = [...filteredAssignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const pending = sortedAssignments.filter(a => !a.completed);
  const completed = sortedAssignments.filter(a => a.completed);

  const getCourseName = (id) => activeCourses.find(c => c.id === id)?.name || 'Unknown Course';

  const getUrgency = (dateStr) => {
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'text-red-500 font-bold';
    if (diff < 1) return 'text-orange-500 font-bold';
    if (diff < 3) return 'text-amber-500 font-bold';
    return 'text-slate-500';
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments & Tasks</h1>
      </div>

      {/* Simple Inline Add Form */}
      <form onSubmit={handleAdd} className="mb-8 card-minimal p-4 bg-white dark:bg-[#111] flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input 
            required 
            type="text" 
            value={newAssignment.title} 
            onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} 
            className="input-field h-11" 
            placeholder="Add a new task..." 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input required type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="input-field w-full sm:w-36 h-11" />
          <div className="w-full sm:w-40">
             <CustomSelect value={newAssignment.courseId} onChange={val => setNewAssignment({...newAssignment, courseId: val})} options={courseOptions} className="h-11 py-2.5 bg-slate-50 dark:bg-[#1a1a1a]" placeholder="Course" />
          </div>
          <button type="submit" disabled={!newAssignment.title || !newAssignment.courseId} className="btn-primary shrink-0 h-11 px-6 disabled:opacity-50">
            Add
          </button>
        </div>
      </form>

      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pending Tasks ({pending.length})</h2>
          {pending.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <p className="text-sm text-slate-500">You're all caught up! No pending tasks.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pending.map(task => {
                const urgency = getUrgency(task.dueDate);
                const isAnimating = animatingIds.includes(task.id);
                
                return (
                  <div key={task.id} className={`card-minimal flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#111] transition-all duration-300 gap-4 ${isAnimating ? 'scale-[0.98] opacity-50' : ''}`}>
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      <button onClick={() => toggleComplete(task.id)} className={`transition-colors shrink-0 ${isAnimating ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}>
                        {isAnimating ? <CheckCircle size={24} /> : <Circle size={24} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-slate-900 dark:text-white transition-all duration-300 ${isAnimating ? 'line-through text-slate-400' : ''}`}>{task.title}</h3>
                        <div className="flex items-center flex-wrap gap-3 text-xs font-medium mt-1.5">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{getCourseName(task.courseId)}</span>
                          <CountdownTimer dueDate={task.dueDate} />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors self-end sm:self-auto shrink-0">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Completed ({completed.length})</h2>
            <div className="grid gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
              {completed.map(task => {
                const isAnimating = animatingIds.includes(task.id);
                return (
                  <div key={task.id} className={`card-minimal flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#111] transition-all duration-300 gap-4 ${isAnimating ? 'scale-[0.98] opacity-50' : ''}`}>
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      <button onClick={() => toggleComplete(task.id)} className="text-emerald-500 hover:text-slate-400 transition-colors shrink-0">
                        <CheckCircle size={24} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-slate-900 dark:text-white transition-all duration-300 ${!isAnimating ? 'line-through text-slate-500' : ''}`}>{task.title}</h3>
                        <div className="flex items-center flex-wrap gap-3 text-xs font-medium text-slate-500 mt-1.5">
                          <span>{getCourseName(task.courseId)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors self-end sm:self-auto shrink-0">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
