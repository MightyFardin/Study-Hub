import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

export default function AttendanceAnalytics({ course, attendanceHistory, onUpdateHistory }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  // Filter history for this course
  const courseHistory = useMemo(() => {
    return (attendanceHistory || []).filter(h => h.courseId === course.id);
  }, [attendanceHistory, course.id]);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Pad beginning of month to start on Sunday
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // Pad end of month to end on Saturday
  const endDate = new Date(monthEnd);
  if (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  }

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Toggle attendance for a day
  const handleDayClick = (day) => {
    // Prevent future marking if it's beyond today
    if (day > new Date()) return;

    const existingRecord = courseHistory.find(h => isSameDay(parseISO(h.date), day));
    let newStatus = 'present';
    
    if (existingRecord) {
      if (existingRecord.status === 'present') newStatus = 'absent';
      else if (existingRecord.status === 'absent') newStatus = null; // Remove record
    }

    onUpdateHistory(course.id, day.toISOString(), newStatus, existingRecord?.id);
  };

  // Graph logic - Cumulative Attendance % over time
  const graphData = useMemo(() => {
    // Sort all history chronologically
    const sorted = [...courseHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let totalClasses = 0;
    let totalPresent = 0;
    const data = [];

    sorted.forEach(record => {
      totalClasses += 1;
      if (record.status === 'present') totalPresent += 1;
      
      data.push({
        date: format(parseISO(record.date), 'MMM dd'),
        percentage: Math.round((totalPresent / totalClasses) * 100),
        present: totalPresent,
        total: totalClasses
      });
    });

    // If no history, add a dummy starting point
    if (data.length === 0) {
      data.push({ date: 'No Data', percentage: 100, present: 0, total: 0 });
    }

    return data;
  }, [courseHistory]);

  const currentPercent = course.totalClasses === 0 ? 100 : Math.round(((courseHistory.filter(h => h.status === 'present').length || 0) / (courseHistory.length || 1)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Total Classes</p>
          <p className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{courseHistory.length}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Attended</p>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{courseHistory.filter(h=>h.status==='present').length}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800/50">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Missed</p>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-100">{courseHistory.filter(h=>h.status==='absent').length}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Current Avg</p>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{currentPercent}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Interactive Calendar */}
        <div className="card-minimal p-5 flex flex-col bg-white dark:bg-[#111]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-500" /> Class Calendar
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"><ChevronLeft size={18} /></button>
              <span className="text-sm font-bold w-24 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"><ChevronRight size={18} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-slate-400">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1 flex-1 content-start">
            {calendarDays.map((day, idx) => {
              const record = courseHistory.find(h => isSameDay(parseISO(h.date), day));
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const isFuture = day > new Date();
              
              let bgClass = "bg-slate-50 hover:bg-slate-100 dark:bg-[#151515] dark:hover:bg-[#1a1a1a]";
              let textClass = "text-slate-700 dark:text-slate-300";
              let borderClass = "border-transparent";
              let indicator = null;

              if (!isCurrentMonth) {
                textClass = "text-slate-300 dark:text-slate-700";
                bgClass = "bg-transparent";
              }

              if (record) {
                if (record.status === 'present') {
                  bgClass = "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50";
                  textClass = "text-emerald-700 dark:text-emerald-400 font-bold";
                  borderClass = "border-emerald-200 dark:border-emerald-800/50";
                  indicator = <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>;
                } else if (record.status === 'absent') {
                  bgClass = "bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50";
                  textClass = "text-rose-700 dark:text-rose-400 font-bold";
                  borderClass = "border-rose-200 dark:border-rose-800/50";
                  indicator = <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500"></div>;
                }
              }

              if (isTodayDate) {
                borderClass = "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20";
              }

              return (
                <button
                  key={idx}
                  disabled={isFuture}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-lg border text-sm transition-all
                    ${bgClass} ${textClass} ${borderClass} ${isFuture ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-90'}
                  `}
                  title={isFuture ? 'Future date' : 'Click to toggle attendance'}
                >
                  {format(day, 'd')}
                  {indicator}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Present</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Absent</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-slate-300 dark:border-slate-700 rounded-sm"></div> No Class</div>
          </div>
        </div>

        {/* Graph */}
        <div className="card-minimal p-5 bg-white dark:bg-[#111] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-500" /> Trend Overview
            </h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            {courseHistory.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No attendance data yet.</p>
                <p className="text-xs">Click on the calendar to mark attendance.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-500" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-500" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="percentage" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
