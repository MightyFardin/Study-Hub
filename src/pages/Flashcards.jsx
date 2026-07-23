import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, X, Trash2, Rotate3D, ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function Flashcards() {
 const { activeCourses, flashcards, setFlashcards } = useAuth();
 
 const [showAdd, setShowAdd] = useState(false);
 const [newCard, setNewCard] = useState({ courseId: '', question: '', answer: '' });
 
 const [filterCourse, setFilterCourse] = useState('all');
 const [isFlipped, setIsFlipped] = useState(false);
 const [currentIndex, setCurrentIndex] = useState(0);

 const courseOptions = activeCourses.map(c => ({ value: c.id, label: c.name }));
 const filterOptions = [{ value: 'all', label: 'All Courses' }, ...courseOptions];

 const handleAdd = (e) => {
 e.preventDefault();
 if (!newCard.courseId || !newCard.question || !newCard.answer) return;
 
 setFlashcards([...flashcards, {
 id: Date.now().toString(),
 ...newCard
 }]);
 
 setNewCard({ courseId: newCard.courseId, question: '', answer: '' }); // keep course selected
 };

 const handleDelete = (id) => {
 setFlashcards(flashcards.filter(f => f.id !== id));
 if (currentIndex >= flashcards.length - 1) {
 setCurrentIndex(Math.max(0, currentIndex - 1));
 }
 };

 const activeCards = flashcards.filter(f => (filterCourse === 'all' || f.courseId === filterCourse) && activeCourses.some(c => c.id === f.courseId));

 const nextCard = () => {
 setIsFlipped(false);
 setCurrentIndex((prev) => (prev + 1) % activeCards.length);
 };

 const prevCard = () => {
 setIsFlipped(false);
 setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
 };

 return (
 <div className="max-w-4xl mx-auto animate-in fade-in flex flex-col md:flex-row gap-8">
 
 {/* Sidebar Manage */}
 <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
 <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Study Filter</h2>
 <CustomSelect 
 value={filterCourse} 
 onChange={val => { setFilterCourse(val); setCurrentIndex(0); setIsFlipped(false); }}
 options={filterOptions}
 className="py-2 text-sm font-bold bg-slate-50 dark:bg-slate-900/50"
 />
 
 <button onClick={() => setShowAdd(true)} className="btn-primary w-full mt-4 text-sm py-2">
 <Plus size={16} /> Create Flashcard
 </button>
 </div>

 <div className="card-minimal bg-white dark:bg-[#111] p-4 flex-1">
 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Card List ({activeCards.length})</h2>
 <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 scrollbar-thin">
 {activeCards.length === 0 ? (
 <p className="text-xs text-slate-500">No cards in this deck.</p>
 ) : (
 activeCards.map((card, i) => (
 <div key={card.id} className={`group flex items-start justify-between p-2 rounded-lg border transition-colors cursor-pointer ${currentIndex === i ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-slate-50 border-slate-100 dark:bg-[#1a1a1a] dark:border-slate-800 hover:border-slate-300'}`} onClick={() => { setCurrentIndex(i); setIsFlipped(false); }}>
 <div className="flex-1 min-w-0 pr-2">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{card.question}</p>
 </div>
 <button onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
 <Trash2 size={14} />
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* Main Study Area */}
 <div className="flex-1 flex flex-col">
 <div className="flex items-center justify-between mb-4">
 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Mode</h1>
 {activeCards.length > 0 && (
 <span className="text-sm font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
 {currentIndex + 1} / {activeCards.length}
 </span>
 )}
 </div>

 {activeCards.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center text-center p-12 card-minimal bg-white dark:bg-[#111] min-h-[400px]">
 <Layers size={48} className="text-slate-300 mb-4" />
 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Your deck is empty!</h3>
 <p className="text-sm text-slate-500 mt-2 max-w-sm">Select a course and create some flashcards to start testing your knowledge.</p>
 <button onClick={() => setShowAdd(true)} className="btn-primary mt-6">
 Create First Card
 </button>
 </div>
 ) : (
 <div className="flex-1 flex flex-col items-center">
 
 {/* The Card */}
 <div 
 className="w-full max-w-lg aspect-video card-minimal cursor-pointer perspective-1000 mt-4 relative"
 onClick={() => setIsFlipped(!isFlipped)}
 >
 <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
 
 {/* Front (Question) */}
 <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#111] rounded-xl border-2 border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center shadow-lg">
 <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Question</span>
 <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
 {activeCards[currentIndex].question}
 </h2>
 <div className="absolute bottom-4 text-xs font-medium text-slate-400 flex items-center gap-1">
 Tap to flip <Rotate3D size={14} />
 </div>
 </div>

 {/* Back (Answer) */}
 <div className="absolute inset-0 backface-hidden bg-indigo-600 dark:bg-indigo-600 rounded-xl p-8 flex flex-col items-center justify-center text-center rotate-y-180 shadow-lg shadow-indigo-600/20">
 <span className="absolute top-4 left-4 text-xs font-bold text-indigo-200 uppercase tracking-widest">Answer</span>
 <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
 {activeCards[currentIndex].answer}
 </h2>
 </div>

 </div>
 </div>

 {/* Controls */}
 <div className="flex items-center gap-6 mt-8">
 <button onClick={prevCard} className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#111] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors active:scale-95">
 <ArrowLeft size={20} />
 </button>
 <button onClick={() => setIsFlipped(!isFlipped)} className="px-6 py-3 rounded-full font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-black transition-colors shadow-lg active:scale-95 flex items-center gap-2">
 Flip Card <Rotate3D size={18} />
 </button>
 <button onClick={nextCard} className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#111] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors active:scale-95">
 <ArrowRight size={20} />
 </button>
 </div>
 
 </div>
 )}
 </div>

 {showAdd && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-6 animate-in zoom-in-95">
 <div className="flex justify-between items-center mb-5">
 <h2 className="text-xl font-bold">Add Flashcard</h2>
 <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
 </div>

 <form onSubmit={handleAdd} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Course</label>
 <CustomSelect value={newCard.courseId} onChange={val => setNewCard({...newCard, courseId: val})} options={courseOptions} className="py-2.5 bg-slate-50 dark:bg-slate-900/50" />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1">Question</label>
 <textarea required value={newCard.question} onChange={e => setNewCard({...newCard, question: e.target.value})} className="input-field min-h-[80px] resize-y" placeholder="What is..." />
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Answer</label>
 <textarea required value={newCard.answer} onChange={e => setNewCard({...newCard, answer: e.target.value})} className="input-field min-h-[80px] resize-y" placeholder="It is..." />
 </div>

 <div className="flex gap-2 pt-2">
 <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300">Close</button>
 <button type="submit" className="btn-primary flex-1 py-2" disabled={!newCard.courseId}>Save Card</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
