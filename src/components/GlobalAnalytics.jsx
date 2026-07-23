import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingDown, TrendingUp, CheckCircle2, LayoutDashboard, ChevronDown, Flame } from 'lucide-react';
import AttendanceAnalytics from './AttendanceAnalytics';
import CustomSelect from './CustomSelect';

export default function GlobalAnalytics({ activeCourses, attendanceHistory, globalMinAttendance, onUpdateHistory }) {
  const [selectedCourseId, setSelectedCourseId] = useState('all');

  const overallStats = useMemo(() => {
    let totalClasses = 0;
    let present = 0;
    let absent = 0;
    
    // Calculate global stats from attendanceHistory mapped to activeCourses
    const activeCourseIds = activeCourses.map(c => c.id);
    const validHistory = (attendanceHistory || []).filter(h => activeCourseIds.includes(h.courseId));
    
    validHistory.forEach(record => {
      totalClasses++;
      if (record.status === 'present') present++;
      else if (record.status === 'absent') absent++;
    });

    const percent = totalClasses === 0 ? 100 : Math.round((present / totalClasses) * 100);

    // Calculate at-risk courses
    const courseStats = activeCourses.map(course => {
      const courseHist = validHistory.filter(h => h.courseId === course.id);
      const cTotal = courseHist.length;
      const cPresent = courseHist.filter(h => h.status === 'present').length;
      const cPercent = cTotal === 0 ? 100 : Math.round((cPresent / cTotal) * 100);
      return { ...course, percent: cPercent, cTotal };
    });

    const atRisk = courseStats.filter(c => c.percent < globalMinAttendance && c.cTotal > 0);

    return { totalClasses, present, absent, percent, atRisk };
  }, [activeCourses, attendanceHistory, globalMinAttendance]);

  const currentStreak = useMemo(() => {
     if (!attendanceHistory || attendanceHistory.length === 0) return 0;
     const dates = [...new Set(attendanceHistory.map(h => new Date(h.date).toDateString()))];
     dates.sort((a, b) => new Date(b) - new Date(a));
     
     let streak = 0;
     let currentDate = new Date();
     currentDate.setHours(0,0,0,0);
     
     const latestDate = new Date(dates[0]);
     latestDate.setHours(0,0,0,0);
     const diffDays = Math.round((currentDate - latestDate) / (1000 * 60 * 60 * 24));
     
     if (diffDays > 1) return 0; 
     
     streak = 1;
     for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i-1]);
        const curr = new Date(dates[i]);
        prev.setHours(0,0,0,0);
        curr.setHours(0,0,0,0);
        if (Math.round((prev - curr) / (1000 * 60 * 60 * 24)) === 1) {
           streak++;
        } else {
           break;
        }
     }
     return streak;
  }, [attendanceHistory]);

  const pieData = [
    { name: 'Present', value: overallStats.present, color: '#10b981' },
    { name: 'Absent', value: overallStats.absent, color: '#f43f5e' }
  ];

  const courseOptions = [
    { value: 'all', label: 'Overview (All Courses)' },
    ...activeCourses.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Selector */}
      <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="text-indigo-500" /> Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-500">Track your attendance performance</p>
        </div>
        <div className="w-full sm:w-64">
          <CustomSelect 
            options={courseOptions}
            value={selectedCourseId}
            onChange={setSelectedCourseId}
            placeholder="Select a view..."
          />
        </div>
      </div>

      {selectedCourseId === 'all' ? (
        <div className="space-y-6">
          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card-minimal p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/50">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Flame size={14} /> Streak</p>
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{currentStreak} <span className="text-sm font-bold text-orange-500/70">Days</span></p>
            </div>
            <div className="card-minimal p-4 bg-indigo-50/50 dark:bg-indigo-900/10">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Total Classes</p>
              <p className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{overallStats.totalClasses}</p>
            </div>
            <div className="card-minimal p-4 bg-emerald-50/50 dark:bg-emerald-900/10">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Total Present</p>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{overallStats.present}</p>
            </div>
            <div className="card-minimal p-4 bg-rose-50/50 dark:bg-rose-900/10">
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Total Absent</p>
              <p className="text-2xl font-black text-rose-900 dark:text-rose-100">{overallStats.absent}</p>
            </div>
            <div className={`card-minimal p-4 ${overallStats.percent >= globalMinAttendance ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${overallStats.percent >= globalMinAttendance ? 'text-amber-500' : 'text-red-500'}`}>Overall Avg</p>
              <p className={`text-2xl font-black ${overallStats.percent >= globalMinAttendance ? 'text-amber-900 dark:text-amber-100' : 'text-red-600 dark:text-red-400'}`}>{overallStats.percent}%</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="card-minimal p-5 bg-white dark:bg-[#111] lg:col-span-1 flex flex-col">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Attendance Ratio</h3>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                {overallStats.totalClasses > 0 ? (
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </div>
              {overallStats.totalClasses > 0 && (
                <div className="flex justify-center gap-6 mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Absent</div>
                </div>
              )}
            </div>

            {/* At Risk Courses */}
            <div className="card-minimal p-5 bg-white dark:bg-[#111] lg:col-span-2 flex flex-col">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <TrendingDown className="text-rose-500" size={18} /> Courses at Risk (Below {globalMinAttendance}%)
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {overallStats.atRisk.length > 0 ? (
                  <div className="space-y-3">
                    {overallStats.atRisk.map(course => (
                      <div key={course.id} className="p-3 sm:p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200">{course.name}</h4>
                          <p className="text-xs text-slate-500">Target: {globalMinAttendance}%</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs font-bold text-rose-500">Current</p>
                            <p className="text-lg font-black text-rose-600 dark:text-rose-400">{course.percent}%</p>
                          </div>
                          <button 
                            onClick={() => setSelectedCourseId(course.id)}
                            className="p-2 bg-white dark:bg-rose-900/40 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors shadow-sm border border-rose-100 dark:border-rose-800"
                          >
                            <TrendingUp size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-emerald-500 py-10">
                    <CheckCircle2 size={32} className="mb-3 opacity-80" />
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">All Good!</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-500">No courses are below the {globalMinAttendance}% target.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 sm:p-6 pb-2 sm:pb-2">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">
              Course Details: <span className="text-indigo-600 dark:text-indigo-400">{activeCourses.find(c => c.id === selectedCourseId)?.name}</span>
            </h3>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <AttendanceAnalytics 
              course={activeCourses.find(c => c.id === selectedCourseId)} 
              attendanceHistory={attendanceHistory}
              onUpdateHistory={onUpdateHistory}
            />
          </div>
        </div>
      )}
    </div>
  );
}
