import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
 BookOpen, 
 LayoutDashboard, 
 LogOut, 
 Menu,
 CheckSquare,
 Calendar,
 Calculator,
 Timer,
 Layers,
 Settings as SettingsIcon,
 Lock,
 ShieldAlert,
 Cloud,
 CloudOff,
 RefreshCw
} from 'lucide-react';
import CustomSelect from './components/CustomSelect';

import Login from './pages/Login';
import Courses from './pages/Courses';
import Notes from './pages/Notes';
import Assignments from './pages/Assignments';
import Timetable from './pages/Timetable';
import GradeCalculator from './pages/Calculator';
import Pomodoro from './pages/Pomodoro';
import Flashcards from './pages/Flashcards';
import Settings from './pages/Settings';

function DashboardLayout({ children }) {
 const { user, logout, globalYear, setGlobalYear, globalSemester, setGlobalSemester, syncStatus } = useAuth();
 const [sidebarOpen, setSidebarOpen] = React.useState(false);
 const location = useLocation();

 React.useEffect(() => {
 setSidebarOpen(false);
 }, [location]);

 const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
 const SEMESTERS = ['1st Semester', '2nd Semester'];
 const yearOptions = YEARS.map(y => ({ value: y, label: y }));
 const semesterOptions = SEMESTERS.map(s => ({ value: s, label: s }));

 const SyncIndicator = ({ status }) => {
    if (status === 'syncing') {
      return <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800/50"><RefreshCw size={12} className="animate-spin" /> Syncing...</div>;
    }
    if (status === 'error') {
      return <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-200 dark:border-red-800/50"><CloudOff size={12} /> Sync Error</div>;
    }
    return <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50"><Cloud size={12} /> Saved</div>;
 };

 const navItems = [
 { path: '/courses', label: 'Courses & Attendance', icon: <LayoutDashboard size={20} /> },
 { path: '/notes', label: 'Course Notes', icon: <BookOpen size={20} /> },
 { path: '/assignments', label: 'Assignments', icon: <CheckSquare size={20} /> },
 { path: '/timetable', label: 'Timetable', icon: <Calendar size={20} /> },
 { path: '/calculator', label: 'CGPA Calculator', icon: <Calculator size={20} /> },
 { path: '/pomodoro', label: 'Pomodoro Timer', icon: <Timer size={20} /> },
 { path: '/flashcards', label: 'Flashcards', icon: <Layers size={20} /> },
 { path: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
 ];

 return (
 <div className="flex h-[100dvh] overflow-hidden bg-[rgb(var(--bg-main))]">
 {/* Mobile overlay */}
 {sidebarOpen && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
 )}

 {/* Sidebar */}
 <aside className={`
 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111] border-r border-slate-200 dark:border-slate-800 
 transform transition-transform duration-200 lg:translate-x-0
 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
 flex flex-col
 `}>
 <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
 <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Study Hub</span>
 </div>

 <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
 
 <div className="mb-6 px-2 space-y-3">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Context</h3>
 <div className="space-y-2">
 <CustomSelect 
 value={globalYear} 
 onChange={setGlobalYear}
 options={yearOptions}
 className="py-2.5 text-sm font-bold bg-slate-50 dark:bg-[#1a1a1a]"
 />
 <CustomSelect 
 value={globalSemester} 
 onChange={setGlobalSemester}
 options={semesterOptions}
 className="py-2.5 text-sm font-bold bg-slate-50 dark:bg-[#1a1a1a]"
 />
 </div>
 </div>

 <div className="space-y-1">
 {navItems.map((item) => {
 const isActive = location.pathname.startsWith(item.path);
 return (
 <Link
 key={item.path}
 to={item.path}
 className={`
 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
 ${isActive 
 ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
 : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
 }
 `}
 >
 {item.icon}
 {item.label}
 </Link>
 );
 })}
 </div>
 </nav>

 <div className="p-4 border-t border-slate-200 dark:border-slate-800">
 <div className="flex justify-center mb-3">
  <SyncIndicator status={syncStatus} />
 </div>
 <div className="mb-4 px-4">
 <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Logged in as</p>
 <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
 </div>
 <button 
 onClick={logout}
 className="flex items-center gap-3 px-4 py-2 w-full text-left text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-lg"
 >
 <LogOut size={18} />
 <span>Logout</span>
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
 <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111]/80 z-10 shrink-0 lg:hidden">
 <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400">
 <Menu size={24} />
 </button>
 <span className="font-bold text-slate-900 dark:text-white">Study Hub</span>
 <div className="flex items-center">
  <SyncIndicator status={syncStatus} />
 </div>
 </header>

 <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col relative">
 <div className="flex-1">
 {children}
 </div>
 
 <footer className="mt-12 pt-6 pb-2 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
 <p className="text-sm text-slate-500 font-medium">Designed and Developed by <span className="font-bold text-slate-800 dark:text-slate-200">Ashadul Alam Fardin</span></p>
 <div className="text-xs text-slate-400 font-medium mt-2 flex items-center justify-center gap-3 flex-wrap">
 <a href="tel:01853108102" className="hover:text-indigo-500 transition-colors">📞 01853108102</a>
 <span className="hidden sm:inline">&bull;</span>
 <a href="mailto:mdfardin6118@gmail.com" className="hover:text-indigo-500 transition-colors">✉️ mdfardin6118@gmail.com</a>
 </div>
 </footer>
 </div>
 </main>
 </div>
 );
}

function App() {
 const { user, settings } = useAuth();
 const [isUnlocked, setIsUnlocked] = React.useState(() => {
 return sessionStorage.getItem('sh2_unlocked') === 'true';
 });
 const [pinInput, setPinInput] = React.useState('');
 const [pinError, setPinError] = React.useState('');

 if (user && settings?.twoFactor && !isUnlocked) {
 return (
 <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-8 text-center animate-in zoom-in-95 bg-white dark:bg-[#111]">
 <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
 <Lock size={32} className="text-indigo-600 dark:text-indigo-400" />
 </div>
 <h2 className="text-2xl font-bold mb-2">App Locked</h2>
 <p className="text-sm text-slate-500 mb-8">Enter your 4-digit PIN to continue</p>
 
 <input 
 type="password"
 maxLength="4"
 value={pinInput}
 onChange={(e) => {
 const val = e.target.value.replace(/[^0-9]/g, '');
 setPinInput(val);
 setPinError('');
 if (val.length === 4) {
 if (val === settings.pinCode) {
 sessionStorage.setItem('sh2_unlocked', 'true');
 setIsUnlocked(true);
 } else {
 setPinError('Incorrect PIN');
 setPinInput('');
 }
 }
 }}
 autoFocus
 className="input-field text-center text-3xl tracking-[0.5em] font-mono h-16 w-full mb-2" 
 placeholder="••••"
 />
 {pinError && <p className="text-xs font-bold text-red-500">{pinError}</p>}
 </div>
 </div>
 );
 }

 return (
 <Router>
 <Routes>
 <Route path="/" element={
 !user ? <Login /> : <Navigate to="/courses" replace />
 } />

 <Route path="/courses" element={
 user ? <DashboardLayout><Courses /></DashboardLayout> : <Navigate to="/" replace />
 } />

 <Route path="/notes" element={
 user ? <DashboardLayout><Notes /></DashboardLayout> : <Navigate to="/" replace />
 } />
 
 <Route path="/assignments" element={
 user ? <DashboardLayout><Assignments /></DashboardLayout> : <Navigate to="/" replace />
 } />

 <Route path="/timetable" element={
 user ? <DashboardLayout><Timetable /></DashboardLayout> : <Navigate to="/" replace />
 } />

 <Route path="/calculator" element={
 user ? <DashboardLayout><GradeCalculator /></DashboardLayout> : <Navigate to="/" replace />
 } />

 <Route path="/pomodoro" element={
 user ? <DashboardLayout><Pomodoro /></DashboardLayout> : <Navigate to="/" replace />
 } />

 <Route path="/flashcards" element={
 user ? <DashboardLayout><Flashcards /></DashboardLayout> : <Navigate to="/" replace />
 } />

 <Route path="/settings" element={
 user ? <DashboardLayout><Settings /></DashboardLayout> : <Navigate to="/" replace />
 } />
 
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </Router>
 );
}

export default App;
