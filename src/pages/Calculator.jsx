import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Trash2, Info } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function Calculator() {
 const { activeCourses, grades, setGrades } = useAuth();

 const [courseId, setCourseId] = useState('');
 const [credits, setCredits] = useState(3);
 const [grade, setGrade] = useState('4.0');

 const courseOptions = activeCourses.map(c => ({ value: c.id, label: c.name }));
 const gradeOptions = [
 { value: '4.0', label: 'A+ (80% or above)' },
 { value: '3.75', label: 'A (75% - 79%)' },
 { value: '3.5', label: 'A- (70% - 74%)' },
 { value: '3.25', label: 'B+ (65% - 69%)' },
 { value: '3.0', label: 'B (60% - 64%)' },
 { value: '2.75', label: 'B- (55% - 59%)' },
 { value: '2.5', label: 'C+ (50% - 54%)' },
 { value: '2.25', label: 'C (45% - 49%)' },
 { value: '2.0', label: 'D (40% - 44%)' },
 { value: '0.0', label: 'F / I (Below 40%)' }
 ];

 const handleAdd = (e) => {
 e.preventDefault();
 if (!courseId) return;

 // Check if course already has a grade entered
 const existing = grades.find(g => g.courseId === courseId);
 if (existing) {
 setGrades(grades.map(g => g.courseId === courseId ? { ...g, credits: Number(credits), grade: Number(grade) } : g));
 } else {
 setGrades([...grades, {
 id: Date.now().toString(),
 courseId,
 credits: Number(credits),
 grade: Number(grade)
 }]);
 }
 
 setCourseId('');
 setCredits(3);
 setGrade('4.0');
 };

 const handleDelete = (id) => {
 setGrades(grades.filter(g => g.id !== id));
 };

 const getCourseName = (id) => activeCourses.find(c => c.id === id)?.name || 'Unknown Course';

 // Calculate CGPA
 const activeGrades = grades.filter(g => activeCourses.some(c => c.id === g.courseId));
 const totalCredits = activeGrades.reduce((sum, g) => sum + g.credits, 0);
 const totalPoints = activeGrades.reduce((sum, g) => sum + (g.credits * g.grade), 0);
 const cgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);

 return (
 <div className="max-w-4xl mx-auto animate-in fade-in flex flex-col lg:flex-row gap-8">
 
 <div className="flex-1 space-y-6 relative z-20">
 <div>
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">CGPA Calculator</h1>
 <p className="text-sm text-slate-500">Calculate your semester GPA by entering your grades below.</p>
 </div>

 <div className="card-minimal p-6 bg-white dark:bg-[#111] relative z-30">
 <h2 className="text-lg font-bold mb-4">Add Course Grade</h2>
 <form onSubmit={handleAdd} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Select Course</label>
 <CustomSelect value={courseId} onChange={setCourseId} options={courseOptions} className="py-2.5 bg-slate-50 dark:bg-slate-900/50" />
 </div>
 
 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-sm font-medium mb-1">Credits</label>
 <input required type="number" min="1" max="10" step="0.5" value={credits} onChange={e => setCredits(e.target.value)} className="input-field" />
 </div>
 <div className="flex-1">
 <label className="block text-sm font-medium mb-1">Grade / GPA</label>
 <CustomSelect value={grade} onChange={setGrade} options={gradeOptions} className="py-2.5 bg-slate-50 dark:bg-slate-900/50" />
 </div>
 </div>

 <button type="submit" className="btn-primary w-full mt-2" disabled={!courseId}>
 {grades.find(g => g.courseId === courseId) ? 'Update Grade' : 'Add Grade'}
 </button>
 </form>
 </div>

 {activeGrades.length > 0 && (
 <div className="card-minimal p-6 bg-white dark:bg-[#111]">
 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Entered Grades</h2>
 <div className="space-y-3">
 {activeGrades.map(g => (
 <div key={g.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg border border-slate-100 dark:border-slate-800">
 <div>
 <h3 className="font-bold text-slate-900 dark:text-white text-sm">{getCourseName(g.courseId)}</h3>
 <p className="text-xs text-slate-500 mt-1">{g.credits} Credits</p>
 </div>
 <div className="flex items-center gap-4">
 <span className="font-black text-indigo-500">{g.grade.toFixed(2)}</span>
 <button onClick={() => handleDelete(g.id)} className="text-slate-400 hover:text-red-500 transition-colors">
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 <div className="w-full lg:w-80 shrink-0">
 <div className="sticky top-6">
 <div className="card-minimal p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 flex flex-col items-center justify-center text-center">
 <h2 className="text-indigo-200 font-bold uppercase tracking-wider text-sm mb-2">Total CGPA</h2>
 <div className="text-6xl font-black mb-4">{cgpa}</div>
 
 <div className="flex items-center gap-6 text-indigo-100 w-full justify-center pt-4 border-t border-indigo-500/50">
 <div className="text-center">
 <div className="text-xl font-bold">{totalCredits}</div>
 <div className="text-xs font-medium uppercase tracking-wider opacity-80">Credits</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold">{activeGrades.length}</div>
 <div className="text-xs font-medium uppercase tracking-wider opacity-80">Courses</div>
 </div>
 </div>
 </div>

 <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex gap-3 items-start">
 <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
 <p className="text-xs text-slate-500 font-medium leading-relaxed">
 Your CGPA is calculated by dividing your total grade points by total credit hours. Add all courses from this semester for an accurate result.
 </p>
 </div>
 </div>
 </div>
 
 </div>
 );
}
