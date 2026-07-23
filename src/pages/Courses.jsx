import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Plus, Minus, X, Edit2, Trash2, BookOpen, Settings, Filter, Search, CloudLightning, Loader2, CheckCircle2, RefreshCw, BarChart, MoreVertical } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import AttendanceAnalytics from '../components/AttendanceAnalytics';
import GlobalAnalytics from '../components/GlobalAnalytics';
import GlobalAttendanceCalendar from '../components/GlobalAttendanceCalendar';

export default function Courses() {
 const { user, courses, setCourses, attendances, setAttendances, setActiveCourseId, globalYear, globalSemester, activeCourses, notes, setNotes, masterDriveLinks, setMasterDriveLinks, attendanceHistory, setAttendanceHistory } = useAuth();
 const navigate = useNavigate();
 
 // Global Min Attendance
 const [globalMinAttendance, setGlobalMinAttendance] = useState(() => {
 return Number(localStorage.getItem('sh2_min_attendance')) || 75;
 });
 
 const [showAddCourse, setShowAddCourse] = useState(false);
 const [showImport, setShowImport] = useState(false);
 const [driveUrl, setDriveUrl] = useState('');
 const [isImporting, setIsImporting] = useState(false);
 const [importStatus, setImportStatus] = useState('');
 const [importError, setImportError] = useState('');
 const [importReviewData, setImportReviewData] = useState(null);
 const [masterFolderIdToSave, setMasterFolderIdToSave] = useState('');
 
 const [recentImportIds, setRecentImportIds] = useState(() => {
 try { return JSON.parse(localStorage.getItem('sh2_recent_import')) || []; } catch { return []; }
 });
 const [showDeleteRecent, setShowDeleteRecent] = useState(false);
 const [deletePassword, setDeletePassword] = useState('');
 const [deleteError, setDeleteError] = useState('');
 const [isDeletingRecent, setIsDeletingRecent] = useState(false);
 
 const [newCourse, setNewCourse] = useState({ name: '', teacherName: '', totalClasses: 0 });
 const [searchQuery, setSearchQuery] = useState('');
 
 const [editingCourseId, setEditingCourseId] = useState(null);
 const [editCourseData, setEditCourseData] = useState(null);
 const [courseToDelete, setCourseToDelete] = useState(null);

 const [undoAction, setUndoAction] = useState(null);
 const [isEditingSettings, setIsEditingSettings] = useState(false);
 const [showDropdown, setShowDropdown] = useState(false);
 const [showDeleteCourseList, setShowDeleteCourseList] = useState(false);
 const [activeTab, setActiveTab] = useState('courses');
 const [analyticsCourse, setAnalyticsCourse] = useState(null);

 useEffect(() => {
 if (undoAction) {
 const timer = setTimeout(() => setUndoAction(null), 5000);
 return () => clearTimeout(timer);
 }
 }, [undoAction]);

 const handleUpdateGlobalSettings = () => {
 localStorage.setItem('sh2_min_attendance', globalMinAttendance);
 setIsEditingSettings(false);
 };

 const handleImportDrive = async (e) => {
 e.preventDefault();
 if (!driveUrl) return;

 let folderId = '';
 const match = driveUrl.match(/folders\/([a-zA-Z0-9-_]+)/);
 const matchIdParam = driveUrl.match(/id=([a-zA-Z0-9-_]+)/);
 
 if (match) folderId = match[1];
 else if (matchIdParam) folderId = matchIdParam[1];

 if (!folderId) {
 setImportError('Invalid Google Drive link. Please ensure it is a link to a folder.');
 return;
 }

 setIsImporting(true);
 setImportError('');
 setImportStatus('Connecting to Google Drive...');

 try {
 const apiKey = "AIzaSyAemNiOsk0-GRkhJPXQfTVzKdIhCvabmtM"; 
 
 setImportStatus('Fetching folder structure...');
 const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType)&key=${apiKey}`);
 
 if (!res.ok) {
 throw new Error('Could not read Drive. Make sure the folder is Public and the Drive API is enabled.');
 }
 
 const data = await res.json();
 const folders = data.files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
 
 if (folders.length === 0) {
 throw new Error('No folders found inside this Drive link.');
 }

 setImportStatus(`Found ${folders.length} courses! Extracting files...`);
 
 const parsedCourses = await Promise.all(folders.map(async folder => {
 let formattedName = folder.name;
 const match = folder.name.match(/([a-zA-Z]+)\s*(\d+)/);
 if (match) {
 formattedName = `${match[1].toUpperCase()}${match[2]}`;
 } else {
 formattedName = folder.name.trim().toUpperCase();
 }

 const existing = activeCourses.find(c => c.name.toLowerCase() === formattedName.toLowerCase());
 
 let driveFiles = [];
 try {
 const filesRes = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folder.id}'+in+parents+and+mimeType!='application/vnd.google-apps.folder'&fields=files(id,name,mimeType)&key=${apiKey}`);
 if (filesRes.ok) {
 const filesData = await filesRes.json();
 driveFiles = filesData.files || [];
 }
 } catch (e) {
 console.error("Failed to fetch files for folder", folder.name);
 }

 return {
 id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
 name: formattedName,
 teacherName: 'Imported from Drive',
 totalClasses: 0,
 year: globalYear,
 semester: globalSemester,
 conflictId: existing ? existing.id : null,
 action: existing ? 'skip' : 'add',
 driveFolderId: folder.id,
 driveFiles
 };
 }));

 setTimeout(() => {
 setIsImporting(false);
 setShowImport(false);
 setImportReviewData(parsedCourses);
 setMasterFolderIdToSave(folderId);
 setImportStatus('');
 }, 500);

 } catch (err) {
 setIsImporting(false);
 setImportError(err.message);
 }
 };

 const handleAddCourse = (e) => {
 e.preventDefault();
 if (!newCourse.name) return;
 
 setCourses([...courses, { 
 id: Date.now().toString(),
 name: newCourse.name, 
 teacherName: newCourse.teacherName,
 totalClasses: Number(newCourse.totalClasses),
 year: globalYear,
 semester: globalSemester
 }]);
 
 setNewCourse({ name: '', teacherName: '', totalClasses: 0 });
 setShowAddCourse(false);
 };

 const handleUpdateCourse = (e) => {
 e.preventDefault();
 setCourses(courses.map(c => c.id === editingCourseId ? { 
 ...c, 
 name: editCourseData.name, 
 teacherName: editCourseData.teacherName,
 } : c));
 setEditingCourseId(null);
 };

 const handleDeleteCourse = (courseId) => {
 setCourseToDelete(courseId);
 };

 const updateCourseClasses = (courseId, increment) => {
 setCourses(courses.map(c => {
 if (c.id === courseId) {
 return { ...c, totalClasses: Math.max(0, c.totalClasses + increment) };
 }
 return c;
 }));
 };

 const getStudentAttendance = (courseId) => {
 const record = attendances.find(a => a.courseId === courseId && a.studentId === user?.id);
 return record ? record.present : 0;
 };

 const updateStudentAttendance = (courseId, increment) => {
 const course = courses.find(c => c.id === courseId);
 const existing = attendances.find(a => a.courseId === courseId && a.studentId === user?.id);
 const currentPresent = existing ? existing.present : 0;
 
 let newPresent = currentPresent + increment;
 
 if (newPresent < 0) newPresent = 0;
 if (newPresent > course.totalClasses) {
 setUndoAction({ type: 'INFO', message: "You cannot have more attendance than the total classes held!" });
 return;
 }

 setUndoAction({
 courseId,
 previousPresent: currentPresent,
 message: `Attendance updated to ${newPresent}`
 });

 if (existing) {
 setAttendances(attendances.map(a => 
 a.id === existing.id 
 ? { ...a, present: newPresent } 
 : a
 ));
 } else {
 if (newPresent > 0) {
 setAttendances([...attendances, {
 id: Date.now().toString(),
 studentId: user?.id,
 studentName: user?.name,
 courseId: courseId,
 present: newPresent
 }]);
 }
 }
 };

  const handleBatchUpdateHistory = (updates) => {
    let newHistory = [...(attendanceHistory || [])];
    let courseUpdates = {};
    let attendanceUpdates = {};

    updates.forEach(update => {
      const { courseId, date, newStatus, existingRecordId } = update;
      
      // Remove existing record if present
      if (existingRecordId) {
        const oldRecord = newHistory.find(r => r.id === existingRecordId);
        if (oldRecord) {
          // decrement old status
          if (oldRecord.status === 'present' || oldRecord.status === 'absent') {
            courseUpdates[courseId] = (courseUpdates[courseId] || 0) - 1; // total classes decreased by 1
            if (oldRecord.status === 'present') {
              attendanceUpdates[courseId] = (attendanceUpdates[courseId] || 0) - 1; // present decreased by 1
            }
          }
        }
        newHistory = newHistory.filter(r => r.id !== existingRecordId);
      }

      // Add new record
      if (newStatus) { // 'present' or 'absent'
        newHistory.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          courseId,
          date,
          status: newStatus
        });
        
        if (newStatus === 'present' || newStatus === 'absent') {
          courseUpdates[courseId] = (courseUpdates[courseId] || 0) + 1; // total classes increased by 1
          if (newStatus === 'present') {
            attendanceUpdates[courseId] = (attendanceUpdates[courseId] || 0) + 1; // present increased by 1
          }
        }
      }
    });

    setAttendanceHistory(newHistory);
    
    // Update courses total classes
    if (Object.keys(courseUpdates).length > 0) {
      setCourses(courses.map(c => {
        if (courseUpdates[c.id] !== undefined) {
          return { ...c, totalClasses: Math.max(0, c.totalClasses + courseUpdates[c.id]) };
        }
        return c;
      }));
    }
    
    // Update aggregate attendance
    if (Object.keys(attendanceUpdates).length > 0) {
      let newAttendances = [...(attendances || [])];
      Object.keys(attendanceUpdates).forEach(courseId => {
        const diff = attendanceUpdates[courseId];
        if (diff === 0) return;
        
        let existing = newAttendances.find(a => a.courseId === courseId && a.studentId === user?.id);
        if (existing) {
          existing.present = Math.max(0, existing.present + diff);
        } else if (diff > 0) {
          newAttendances.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            studentId: user?.id,
            studentName: user?.name,
            courseId: courseId,
            present: diff
          });
        }
      });
      setAttendances(newAttendances);
    }
    
    setUndoAction({ type: 'INFO', message: "Attendance saved successfully!" });
  };


 const handleConfirmImport = () => {
 let newCourses = [...courses];
 let addedCourseIds = [];
 let replacedCoursesBackups = [];
 let newNotes = [...notes];

 importReviewData.forEach(item => {
 let finalCourseId = item.id;
 
 if (item.action === 'add') {
 newCourses.push({ id: item.id, name: item.name, teacherName: item.teacherName, totalClasses: item.totalClasses, year: item.year, semester: item.semester, driveFolderId: item.driveFolderId });
 addedCourseIds.push(item.id);
 } else if (item.action === 'replace') {
 const oldCourse = newCourses.find(c => c.id === item.conflictId);
 if (oldCourse) replacedCoursesBackups.push(oldCourse);
 
 newCourses = newCourses.filter(c => c.id !== item.conflictId);
 newCourses.push({ id: item.id, name: item.name, teacherName: item.teacherName, totalClasses: item.totalClasses, year: item.year, semester: item.semester, driveFolderId: item.driveFolderId });
 addedCourseIds.push(item.id);
 } else {
 return;
 }

 if (item.driveFiles && item.driveFiles.length > 0) {
 item.driveFiles.forEach(file => {
 newNotes.push({
 id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
 courseId: finalCourseId,
 title: file.name,
 fileType: 'link',
 content: `https://drive.google.com/file/d/${file.id}/view`,
 downloadUrl: `https://drive.usercontent.google.com/u/0/uc?id=${file.id}&export=download`,
 fileName: file.name,
 driveFileId: file.id,
 isBase64: false,
 date: new Date().toLocaleDateString()
 });
 });
 }
 });

 setCourses(newCourses);
 setNotes(newNotes);
 
 if (addedCourseIds.length > 0) {
 localStorage.setItem('sh2_recent_import', JSON.stringify(addedCourseIds));
 setRecentImportIds(addedCourseIds);
 }
 
 if (masterFolderIdToSave && (!masterDriveLinks || !masterDriveLinks.includes(masterFolderIdToSave))) {
 setMasterDriveLinks([...(masterDriveLinks || []), masterFolderIdToSave]);
 }
 setMasterFolderIdToSave('');
 
 setUndoAction({
 type: 'IMPORT',
 addedIds: addedCourseIds,
 replacedBackups: replacedCoursesBackups,
 message: `Successfully imported ${addedCourseIds.length} courses.`
 });

 setImportReviewData(null);
 setDriveUrl('');
 };

 const handleRefreshMasterDrive = async () => {
 if (!masterDriveLinks || masterDriveLinks.length === 0) {
 setUndoAction({ type: 'INFO', message: "You haven't imported any Google Drive folders yet!" });
 return;
 }

 const today = new Date().toDateString();
 let syncData = { count: 0, date: today };
 try {
 const stored = JSON.parse(localStorage.getItem('sh2_master_sync_limit'));
 if (stored && stored.date === today) {
 syncData = stored;
 }
 } catch(e) {}

 if (syncData.count >= 2) {
 setUndoAction({ type: 'INFO', message: "Daily limit reached! You can only refresh your Master Drive 2 times a day." });
 return;
 }

 setIsImporting(true);
 setImportStatus('Scanning Master Drive for new courses and files...');
 setShowImport(true); // Open modal just to show the loading state
 
 try {
 const apiKey = "AIzaSyAemNiOsk0-GRkhJPXQfTVzKdIhCvabmtM"; 
 let newCourses = [...courses];
 let newNotes = [...notes];
 let addedCourseCount = 0;
 let addedFilesCount = 0;

 for (const masterId of masterDriveLinks) {
 const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${masterId}'+in+parents&fields=files(id,name,mimeType)&key=${apiKey}`);
 if (!res.ok) continue;
 
 const data = await res.json();
 const folders = data.files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
 
 for (const folder of folders) {
 let formattedName = folder.name;
 const match = folder.name.match(/([a-zA-Z]+)\s*(\d+)/);
 if (match) formattedName = `${match[1].toUpperCase()}${match[2]}`;
 else formattedName = folder.name.trim().toUpperCase();

 let courseId;
 const existingCourse = newCourses.find(c => c.name.toLowerCase() === formattedName.toLowerCase());
 
 if (!existingCourse) {
 courseId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
 newCourses.push({
 id: courseId,
 name: formattedName,
 teacherName: 'Imported from Drive',
 totalClasses: 0,
 year: globalYear,
 semester: globalSemester,
 driveFolderId: folder.id
 });
 addedCourseCount++;
 } else {
 courseId = existingCourse.id;
 if (!existingCourse.driveFolderId) existingCourse.driveFolderId = folder.id;
 }

 const filesRes = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folder.id}'+in+parents+and+mimeType!='application/vnd.google-apps.folder'&fields=files(id,name,mimeType)&key=${apiKey}`);
 if (filesRes.ok) {
 const filesData = await filesRes.json();
 const existingFileIds = newNotes.filter(n => n.courseId === courseId).map(n => n.driveFileId);
 
 filesData.files.forEach(file => {
 if (!existingFileIds.includes(file.id)) {
 newNotes.push({
 id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
 courseId: courseId,
 title: file.name,
 fileType: 'link',
 content: `https://drive.google.com/file/d/${file.id}/view`,
 downloadUrl: `https://drive.usercontent.google.com/u/0/uc?id=${file.id}&export=download`,
 fileName: file.name,
 driveFileId: file.id,
 isBase64: false,
 date: new Date().toLocaleDateString()
 });
 addedFilesCount++;
 }
 });
 }
 }
 }

 setCourses(newCourses);
 setNotes(newNotes);

 syncData.count += 1;
 localStorage.setItem('sh2_master_sync_limit', JSON.stringify(syncData));
 
 setUndoAction({ type: 'INFO', message: `Master Sync Complete! Added ${addedCourseCount} new courses and ${addedFilesCount} new files.` });
 } catch (err) {
 setUndoAction({ type: 'INFO', message: "Failed to sync Master Drive." });
 } finally {
 setIsImporting(false);
 setImportStatus('');
 setShowImport(false);
 }
 };

 const handleDeleteRecentImport = async (e) => {
 e.preventDefault();
 if (!deletePassword || !user?.email) return;
 setIsDeletingRecent(true);
 setDeleteError('');
 try {
 await signInWithEmailAndPassword(auth, user.email, deletePassword);
 // Password correct, proceed to delete. Use functional update to avoid stale state.
 setCourses(prevCourses => prevCourses.filter(c => !recentImportIds.includes(c.id)));
 setNotes(prevNotes => prevNotes.filter(n => !recentImportIds.includes(n.courseId)));
 setRecentImportIds([]);
 localStorage.removeItem('sh2_recent_import');
 setShowDeleteRecent(false);
 setDeletePassword('');
 setUndoAction({ message: `Successfully deleted recent imports.` });
 } catch (err) {
 setDeleteError('Incorrect password. Please try again.');
 } finally {
 setIsDeletingRecent(false);
 }
 };

 const handleUndo = () => {
 if (!undoAction) return;
 
 if (undoAction.type === 'IMPORT') {
 let revertedCourses = courses.filter(c => !undoAction.addedIds.includes(c.id));
 revertedCourses = [...revertedCourses, ...undoAction.replacedBackups];
 setCourses(revertedCourses);
 setNotes(notes.filter(n => !undoAction.addedIds.includes(n.courseId)));
 } else {
 const { courseId, previousPresent } = undoAction;
 const existing = attendances.find(a => a.courseId === courseId && a.studentId === user?.id);
 
 if (existing) {
 setAttendances(attendances.map(a => 
 a.id === existing.id ? { ...a, present: previousPresent } : a
 ));
 }
 }
 setUndoAction(null);
 };

 const calculateStatus = (present, total) => {
 const minPercent = globalMinAttendance;
 if (total === 0) return { status: 'safe', canSkip: 0, percent: 100 };
 const currentPercent = (present / total) * 100;
 const minFrac = minPercent / 100;
 
 if (currentPercent >= minPercent) {
 const canSkip = Math.floor(present / minFrac) - total;
 return { status: 'safe', canSkip: Math.max(0, canSkip), percent: Math.round(currentPercent) };
 } else {
 const needAttend = Math.ceil((minFrac * total - present) / (1 - minFrac));
 return { status: 'danger', needAttend: Math.max(1, needAttend), percent: Math.round(currentPercent) };
 }
 };

 const openNotes = (courseId) => {
 setActiveCourseId(courseId);
 navigate('/notes');
 };
const filteredCourses = activeCourses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

 return (
 <div className="max-w-4xl mx-auto relative">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 relative z-40">
    <div className="flex items-center justify-between w-full sm:w-auto">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Attendance<span className="text-indigo-500">.</span></h1>
      
      {/* 3 dots menu button for Mobile (visible on small screens) */}
      <button onClick={() => setShowDropdown(!showDropdown)} className="sm:hidden p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-slate-500">
        <MoreVertical size={20} />
      </button>
    </div>

    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
        <button 
          onClick={() => setActiveTab('courses')}
          className={`flex-1 sm:w-32 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'courses' ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <BookOpen size={16} /> Track
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 sm:w-32 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <BarChart size={16} /> Stats
        </button>
      </div>

      {/* 3 dots menu button for Desktop */}
      <div className="hidden sm:block relative">
        <button onClick={() => setShowDropdown(!showDropdown)} className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-slate-500 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>

    {/* Dropdown Menu */}
    {showDropdown && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
        <div className="absolute top-14 sm:top-14 right-0 sm:right-0 mt-1 w-64 bg-white dark:bg-[#151515] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111]/50">
             <div className="text-xs font-bold text-slate-400 mb-2 px-1">Global Target</div>
             <div className="flex items-center gap-2">
               <input 
                 type="number" min="1" max="100" 
                 value={globalMinAttendance} 
                 onChange={e => setGlobalMinAttendance(e.target.value)}
                 className="w-16 bg-white dark:bg-black rounded-lg px-2 py-1.5 text-sm font-bold border border-slate-200 dark:border-slate-700 outline-none text-center shadow-sm"
               />
               <span className="text-sm font-bold text-slate-500">%</span>
               <button onClick={() => {handleUpdateGlobalSettings(); setShowDropdown(false);}} className="ml-auto text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Save</button>
             </div>
          </div>
          
          <div className="p-1.5">
            <button onClick={() => {setShowAddCourse(true); setShowDropdown(false);}} className="w-full text-left px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] rounded-lg flex items-center gap-2.5 transition-colors">
              <Plus size={16} /> Add Course
            </button>
            <button onClick={() => {setShowDeleteCourseList(true); setShowDropdown(false);}} className="w-full text-left px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] rounded-lg flex items-center gap-2.5 transition-colors">
              <Edit2 size={16} /> Manage Courses
            </button>
            
            <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>

            <button onClick={() => {setShowImport(true); setShowDropdown(false);}} className="w-full text-left px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] rounded-lg flex items-center gap-2.5 transition-colors">
              <CloudLightning size={16} /> Import from Drive
            </button>
            
            {(recentImportIds.length > 0 || (masterDriveLinks && masterDriveLinks.length > 0)) && (
              <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>
            )}
            
            {recentImportIds.length > 0 && (
              <button onClick={() => {setShowDeleteRecent(true); setShowDropdown(false);}} className="w-full text-left px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition-colors">
                <Trash2 size={16} /> Undo Recent Import
              </button>
            )}
            
            {masterDriveLinks && masterDriveLinks.length > 0 && (
              <button onClick={() => {handleRefreshMasterDrive(); setShowDropdown(false);}} disabled={isImporting} className="w-full text-left px-3 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg flex items-center gap-2.5 transition-colors">
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
                {isImporting ? 'Syncing...' : 'Refresh Master Drive'}
              </button>
            )}
          </div>
        </div>
      </>
    )}
  </div>

 {undoAction && (
 <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom-5 z-50">
 <span className="text-sm font-medium">{undoAction.message}</span>
 {undoAction.type !== 'INFO' ? (
 <button onClick={handleUndo} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold underline">Undo</button>
 ) : (
 <button onClick={() => setUndoAction(null)} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
 )}
 </div>
 )}

 {activeTab === 'analytics' ? (
    <GlobalAnalytics 
      activeCourses={activeCourses}
      attendanceHistory={attendanceHistory}
      globalMinAttendance={globalMinAttendance}
      onUpdateHistory={(courseId, dateStr, newStatus, existingRecordId) => handleBatchUpdateHistory([{ courseId, date: dateStr, newStatus, existingRecordId }])}
    />
  ) : (
    <>
      {activeCourses.length > 0 && (
        <GlobalAttendanceCalendar 
          activeCourses={activeCourses} 
          attendanceHistory={attendanceHistory} 
          onBatchUpdateHistory={handleBatchUpdateHistory} 
        />
      )}

      {activeCourses.length === 0 ? (
 <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
 <BookOpen size={48} className="text-slate-300 mb-4" />
 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Courses Yet</h3>
 <p className="text-sm text-slate-500">No courses added in {globalYear}, {globalSemester} yet.</p>
 </div>
 ) : null}
 </>
  )}

 {/* Add Course Modal */}
 {showAddCourse && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 ">
 <div className="card-minimal w-full max-w-sm p-0 animate-in zoom-in-95 bg-white dark:bg-[#111] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
 <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] shrink-0">
 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Course</h2>
 <button onClick={() => setShowAddCourse(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"><X size={20} /></button>
 </div>
 
 <form onSubmit={handleAddCourse} className="flex flex-col flex-1 min-h-0">
 <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
 <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
 <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Adding to</p>
 <p className="font-bold text-sm text-indigo-900 dark:text-indigo-200">{globalYear} &rarr; {globalSemester}</p>
 </div>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Course Name</label>
 <input required type="text" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value.toUpperCase()})} className="input-field" placeholder="e.g. ESD" />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Teacher's Name</label>
 <input required type="text" value={newCourse.teacherName} onChange={e => setNewCourse({...newCourse, teacherName: e.target.value})} className="input-field" />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Total Classes Held</label>
 <input required type="number" min="0" value={newCourse.totalClasses} onChange={e => setNewCourse({...newCourse, totalClasses: e.target.value})} className="input-field" />
 </div>
 </div>
 </div>
 <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] shrink-0">
 <button type="submit" className="btn-primary w-full h-12 text-sm font-bold">Save Course</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Edit Course Modal */}
 {editingCourseId && editCourseData && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-6 animate-in zoom-in-95">
 <div className="flex justify-between items-center mb-5">
 <h2 className="text-xl font-bold">Edit Course Details</h2>
 <button onClick={() => setEditingCourseId(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
 </div>
 <form onSubmit={handleUpdateCourse} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Course Name</label>
 <input required type="text" value={editCourseData.name} onChange={e => setEditCourseData({...editCourseData, name: e.target.value.toUpperCase()})} className="input-field" />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Teacher's Name</label>
 <input required type="text" value={editCourseData.teacherName} onChange={e => setEditCourseData({...editCourseData, teacherName: e.target.value})} className="input-field" />
 </div>
 <button type="submit" className="btn-primary w-full mt-2">Update Course</button>
 </form>
 </div>
 </div>
 )}

 {/* Manage Courses List Modal */}
 {showDeleteCourseList && (
 <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-0 animate-in zoom-in-95 bg-white dark:bg-[#111] max-h-[80vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
 <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] shrink-0">
 <div>
 <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Courses</h2>
 <p className="text-xs font-medium text-slate-500 mt-0.5">Edit or delete existing courses</p>
 </div>
 <button onClick={() => setShowDeleteCourseList(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"><X size={20} /></button>
 </div>
 
 <div className="p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 space-y-2">
 {activeCourses.length === 0 ? (
 <p className="text-center text-sm text-slate-500 py-8">No courses available.</p>
 ) : (
 activeCourses.map(course => (
 <div key={course.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
 <div className="flex-1 min-w-0 pr-3">
 <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{course.name}</h3>
 <p className="text-xs text-slate-500 truncate">{course.teacherName}</p>
 </div>
 <div className="flex items-center gap-1 shrink-0">
 <button 
 onClick={() => {
 setShowDeleteCourseList(false);
 setEditCourseData(course);
 setEditingCourseId(course.id);
 }} 
 className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
 title="Edit Course"
 >
 <Edit2 size={18} />
 </button>
 <button 
 onClick={() => {
 setShowDeleteCourseList(false);
 handleDeleteCourse(course.id);
 }} 
 className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
 title="Delete Course"
 >
 <Trash2 size={18} />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {courseToDelete && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-6 animate-in zoom-in-95 bg-white dark:bg-[#111]">
 <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Delete Course?</h2>
 <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this course? This action cannot be undone.</p>
 <div className="flex gap-3">
 <button onClick={() => setCourseToDelete(null)} className="btn-secondary flex-1">Cancel</button>
 <button onClick={() => {
 setCourses(courses.filter(c => c.id !== courseToDelete));
 setCourseToDelete(null);
 }} className="btn-primary flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 border-transparent text-white">Delete</button>
 </div>
 </div>
 </div>
 )}

 {/* Import from Drive Modal */}
 {showImport && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 ">
 <div className="card-minimal w-full max-w-md p-0 animate-in zoom-in-95 bg-white dark:bg-[#111] overflow-hidden rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
 
 {/* Header */}
 <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] flex justify-between items-center shrink-0">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
 <CloudLightning size={24} />
 </div>
 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Drive Import</h2>
 </div>
 <button onClick={() => { setShowImport(false); setImportError(''); }} disabled={isImporting} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"><X size={20} /></button>
 </div>

 <form onSubmit={handleImportDrive} className="flex flex-col flex-1 min-h-0">
 <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
 <p className="text-sm text-slate-500 font-medium leading-relaxed">
 Paste a public Google Drive folder link. We will extract all folders into courses and safely add them to <span className="font-bold text-slate-700 dark:text-slate-300">({globalYear}, {globalSemester})</span>.
 </p>
 
 <div className="space-y-1.5">
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Google Drive Folder URL</label>
 <input 
 required 
 type="url" 
 value={driveUrl} 
 onChange={e => setDriveUrl(e.target.value)} 
 className="input-field h-12 text-sm bg-white dark:bg-[#1a1a1a]" 
 placeholder="https://drive.google.com/drive/folders/..." 
 disabled={isImporting}
 />
 </div>

 {importError && (
 <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-2">
 <X size={16} className="shrink-0"/> {importError}
 </div>
 )}

 {importStatus && !importError && (
 <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2">
 {isImporting ? <Loader2 size={16} className="animate-spin shrink-0" /> : <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
 {importStatus}
 </div>
 )}
 </div>
 
 <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] shrink-0">
 <button type="submit" disabled={isImporting || !driveUrl.trim()} className="btn-primary w-full h-12 text-sm font-bold disabled:opacity-50">
 {isImporting ? 'Processing Drive Link...' : 'Scan Folder Now'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Import Review Modal */}
 {importReviewData && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 ">
 <div className="card-minimal w-full max-w-lg p-0 animate-in zoom-in-95 bg-white dark:bg-[#111] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
 
 {/* Header */}
 <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-[#151515]">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
 <CheckCircle2 size={24} />
 </div>
 <div>
 <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Review Import</h2>
 <p className="text-sm text-slate-500 font-medium">Select which courses to import from Drive.</p>
 </div>
 </div>
 </div>
 
 {/* Scrollable Content */}
 <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-white dark:bg-[#111] custom-scrollbar">
 {importReviewData.map((item, idx) => {
 const isSelected = item.action !== 'skip';
 
 return (
 <div 
 key={item.id} 
 onClick={() => {
 const nd = [...importReviewData];
 if (isSelected) {
 nd[idx].action = 'skip';
 } else {
 nd[idx].action = item.conflictId ? 'replace' : 'add';
 }
 setImportReviewData(nd);
 }}
 className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
 !isSelected 
 ? 'border-slate-100 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-[#151515] hover:bg-slate-100 dark:hover:bg-[#1a1a1a]' 
 : item.conflictId
 ? 'border-amber-400 bg-amber-50 shadow-sm shadow-amber-500/10 dark:border-amber-500/50 dark:bg-amber-900/20'
 : 'border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/50 dark:bg-emerald-900/20'
 }`}
 >
 <div className="flex justify-between items-center">
 <div>
 <h3 className={`font-bold transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 line-through'}`}>{item.name}</h3>
 {item.conflictId ? (
 <p className={`text-xs font-semibold flex items-center gap-1 mt-1 transition-colors ${isSelected ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400'}`}>
 <CloudLightning size={14}/> Conflict: {isSelected ? 'Will Replace' : 'Skipped'}
 </p>
 ) : (
 <p className={`text-xs mt-1 transition-colors ${isSelected ? 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}`}>
 <Plus size={14}/> New Course: {isSelected ? 'Will Add' : 'Skipped'}
 </p>
 )}
 </div>
 
 <div className="flex items-center justify-center shrink-0 ml-4">
 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
 isSelected 
 ? item.conflictId 
 ? 'bg-amber-500 border-amber-500 text-white' 
 : 'bg-emerald-500 border-emerald-500 text-white'
 : 'border-slate-300 bg-transparent dark:border-slate-700'
 }`}>
 {isSelected && <CheckCircle2 size={16} strokeWidth={3} />}
 </div>
 </div>
 </div>
 </div>
 )})}
 </div>
 
 {/* Footer */}
 <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-[#151515] flex gap-3">
 <button onClick={() => setImportReviewData(null)} className="btn-secondary flex-1 py-3 text-sm font-bold">Cancel</button>
 <button onClick={handleConfirmImport} className="btn-primary flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm font-bold shadow-lg shadow-indigo-500/20">Confirm Import</button>
 </div>
 </div>
 </div>
 )}

 {/* Delete Recent Import Modal */}
 {showDeleteRecent && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 ">
 <div className="card-minimal w-full max-w-sm p-6 animate-in zoom-in-95 bg-white dark:bg-[#111]">
 <div className="flex justify-between items-center mb-5">
 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Import?</h2>
 <button onClick={() => { setShowDeleteRecent(false); setDeletePassword(''); setDeleteError(''); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
 </div>
 
 <p className="text-sm text-slate-500 mb-4">
 This will delete the {recentImportIds.length} courses you recently imported. Please enter your password to confirm.
 </p>

 <form onSubmit={handleDeleteRecentImport} className="space-y-4">
 {deleteError && (
 <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/30">
 {deleteError}
 </div>
 )}
 <div>
 <label className="block text-sm font-medium mb-1">Password</label>
 <input 
 required 
 type="password" 
 value={deletePassword} 
 onChange={e => setDeletePassword(e.target.value)} 
 className="input-field bg-slate-50 dark:bg-slate-900/50" 
 placeholder="Enter your password" 
 />
 </div>
 <button type="submit" disabled={isDeletingRecent || !deletePassword} className="btn-primary w-full mt-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 border-transparent text-white flex justify-center items-center h-11">
 {isDeletingRecent ? <Loader2 size={16} className="animate-spin" /> : 'Delete Imports'}
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
