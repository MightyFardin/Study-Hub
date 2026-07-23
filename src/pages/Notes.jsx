import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { FileText, Download, Upload, ExternalLink, X, File, Loader2, AlignLeft, BookOpen, Maximize2, Trash2, Edit2, CloudLightning, Plus, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const SyncLimitTimer = () => {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      if (diff <= 0) {
        setTimeLeft('You can sync now! Please refresh.');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setTimeLeft(`Available in ${h}:${m}:${s}`);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="font-mono text-[13px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg mt-1 tracking-wider shadow-sm border border-amber-200 dark:border-amber-800/50 flex items-center justify-center w-full">{timeLeft}</span>;
};

export default function Notes() {
 const { activeCourses, notes, setNotes, activeCourseId, setActiveCourseId } = useAuth();
 
 const [showUpload, setShowUpload] = useState(false);
 const [newNote, setNewNote] = useState({ title: '', sourceType: 'file', fileType: 'pdf', content: '', fileName: '' });
 const [uploadError, setUploadError] = useState('');

 const [editingNote, setEditingNote] = useState(null);
 const [editError, setEditError] = useState('');

 const [downloadingId, setDownloadingId] = useState(null);
 const [downloadProgress, setDownloadProgress] = useState(0);

 const [viewingNote, setViewingNote] = useState(null);
 const [noteToDelete, setNoteToDelete] = useState(null);

 const [isProcessingLink, setIsProcessingLink] = useState(false);
 const [linkProcessError, setLinkProcessError] = useState('');

 const [newDriveFiles, setNewDriveFiles] = useState([]);
 const [isCheckingDrive, setIsCheckingDrive] = useState(false);
 const [customAlert, setCustomAlert] = useState(null);

 // Ensure activeCourseId is valid for the current global context
 if (!activeCourseId && activeCourses.length > 0) {
 setActiveCourseId(activeCourses[0].id);
 } else if (activeCourseId && !activeCourses.find(c => c.id === activeCourseId)) {
 if (activeCourses.length > 0) setActiveCourseId(activeCourses[0].id);
 else setActiveCourseId(null);
 }

 // Preprocess text to handle AI-style LaTeX delimiters \( \) and \[ \] 
 // and auto-detect raw math equations!
 const preprocessMath = (text) => {
 if (!text) return '';
 
 // 1. Convert Gemini/ChatGPT style delimiters
 let processed = text
 .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
 .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

 // 2. Auto-detect raw LaTeX on a line-by-line basis
 const mathKeywords = [
 '\\frac', '\\sqrt', '\\sum', '\\int', '\\times', '\\div', 
 '\\pm', '\\alpha', '\\beta', '\\theta', '\\pi', '\\mu', 
 '\\sigma', '\\begin{', '\\text{', '\\infty', '\\approx', '\\neq'
 ];
 
 const lines = processed.split('\n');
 const autoWrappedLines = lines.map(line => {
 if (line.includes('$')) return line; // Already formatted
 
 const hasMath = mathKeywords.some(keyword => line.includes(keyword));
 if (hasMath) {
 return `\n$$\n${line.trim()}\n$$\n`;
 }
 return line;
 });
 
 return autoWrappedLines.join('\n');
 };

 const processDriveLink = async (url) => {
 if (!url || !url.includes('drive.google.com')) return;
 
 let folderId = '';
 let fileId = '';
 
 const folderMatch = url.match(/folders\/([a-zA-Z0-9-_]+)/);
 const folderIdParam = url.match(/id=([a-zA-Z0-9-_]+)/);
 const fileMatch = url.match(/file\/d\/([a-zA-Z0-9-_]+)/);
 
 if (folderMatch) folderId = folderMatch[1];
 else if (folderIdParam && !url.includes('uc?export')) folderId = folderIdParam[1];
 else if (fileMatch) fileId = fileMatch[1];

 if (!folderId && !fileId) return;

 setIsProcessingLink(true);
 setLinkProcessError('');

 try {
 const apiKey = "AIzaSyAemNiOsk0-GRkhJPXQfTVzKdIhCvabmtM"; 
 
 if (folderId) {
 const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType!='application/vnd.google-apps.folder'&fields=files(id,name,mimeType)&key=${apiKey}`);
 if (res.ok) {
 const data = await res.json();
 if (data.files && data.files.length > 0) {
 const file = data.files[0];
 const viewLink = `https://drive.google.com/file/d/${file.id}/view`;
 const downloadLink = `https://drive.usercontent.google.com/u/0/uc?id=${file.id}&export=download`;
 setNewNote(prev => ({
 ...prev,
 title: prev.title || file.name,
 content: viewLink,
 downloadUrl: downloadLink,
 fileName: file.name
 }));
 } else {
 setLinkProcessError('No files found in folder.');
 }
 }
 } else if (fileId) {
 const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType&key=${apiKey}`);
 if (res.ok) {
 const file = await res.json();
 const viewLink = `https://drive.google.com/file/d/${file.id}/view`;
 const downloadLink = `https://drive.usercontent.google.com/u/0/uc?id=${file.id}&export=download`;
 setNewNote(prev => ({
 ...prev,
 title: prev.title || file.name,
 content: viewLink,
 downloadUrl: downloadLink,
 fileName: file.name
 }));
 }
 }
 } catch (err) {
 console.error(err);
 setLinkProcessError('Failed to fetch Drive details.');
 } finally {
 setIsProcessingLink(false);
 }
 };

 const activeNotes = notes.filter(n => n.courseId === activeCourseId);
 const activeCourse = activeCourses.find(c => c.id === activeCourseId);

 const handleManualSync = () => {
 if (!activeCourse?.driveFolderId) return;
 
 const today = new Date().toDateString();
 let syncData = { count: 0, date: today };
 try {
 const stored = JSON.parse(localStorage.getItem('sh2_drive_sync_limit'));
 if (stored && stored.date === today) {
 syncData = stored;
 }
 } catch(e) {}

 if (syncData.count >= 2) {
 setCustomAlert({
 type: 'limit',
 title: 'Daily Limit Reached',
 message: 'You can only sync with Google Drive 2 times a day to prevent API restrictions.',
 subMessage: 'You can sync again tomorrow at 12:00 AM.'
 });
 return;
 }

 syncData.count += 1;
 localStorage.setItem('sh2_drive_sync_limit', JSON.stringify(syncData));
 
 checkNewDriveFiles(activeCourse.driveFolderId, activeCourseId);
 };

  const checkNewDriveFiles = async (folderId, currentCourseId) => {
    try {
      setIsCheckingDrive(true);
      const apiKey = "AIzaSyAemNiOsk0-GRkhJPXQfTVzKdIhCvabmtM"; 
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType!='application/vnd.google-apps.folder'&fields=files(id,name,mimeType)&key=${apiKey}`);
      if (!res.ok) throw new Error("Fetch failed");
      
      const data = await res.json();
      
      let hasRenamedFiles = false;
      const updatedNotes = notes.map(note => {
        if (note.courseId === currentCourseId && note.driveFileId) {
          const driveFile = data.files.find(f => f.id === note.driveFileId);
          if (driveFile && (driveFile.name !== note.title || driveFile.name !== note.fileName)) {
            hasRenamedFiles = true;
            return { ...note, title: driveFile.name, fileName: driveFile.name };
          }
        }
        return note;
      });
      
      if (hasRenamedFiles) {
        setNotes(updatedNotes);
      }

      // Re-filter notes to ensure we get the latest state for this course
      const existingFileIds = updatedNotes.filter(n => n.courseId === currentCourseId).map(n => n.driveFileId).filter(Boolean);
      const newFiles = data.files.filter(f => !existingFileIds.includes(f.id));
      
      if (newFiles.length > 0) {
        setNewDriveFiles(newFiles);
      } else {
        setNewDriveFiles([]);
        setTimeout(() => {
          if (hasRenamedFiles) {
            setCustomAlert({ type: 'success', title: 'Sync Complete', message: 'Files synced! Some existing files were renamed to match Google Drive.' });
          } else {
            setCustomAlert({ type: 'info', title: 'Up to Date', message: 'All files are up to date! No new files found in Google Drive.' });
          }
        }, 100);
      }
    } catch (err) {
      console.error("Drive sync error:", err);
      setCustomAlert({ type: 'error', title: 'Sync Failed', message: 'Failed to sync with Google Drive.' });
    } finally {
      setIsCheckingDrive(false);
    }
  };

 const handleAddNewDriveFiles = () => {
 const additionalNotes = newDriveFiles.map(file => ({
 id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
 courseId: activeCourseId,
 title: file.name,
 fileType: 'link',
 content: `https://drive.google.com/file/d/${file.id}/view`,
 downloadUrl: `https://drive.usercontent.google.com/u/0/uc?id=${file.id}&export=download`,
 fileName: file.name,
 driveFileId: file.id,
 isBase64: false,
 date: new Date().toLocaleDateString()
 }));
 
 setNotes(prev => [...prev, ...additionalNotes]);
 setNewDriveFiles([]);
 };

 const handleUpload = (e) => {
 e.preventDefault();
 if (!newNote.title || !newNote.content || !activeCourseId) return;
 
 setNotes([...notes, {
 id: Date.now().toString(),
 courseId: activeCourseId,
 title: newNote.title,
 fileType: newNote.fileType || 'file',
 content: newNote.content,
 downloadUrl: newNote.downloadUrl || '',
 fileName: newNote.fileName || newNote.title,
 isBase64: newNote.sourceType === 'file',
 date: new Date().toLocaleDateString()
 }]);
 
 setNewNote({ title: '', sourceType: 'file', fileType: 'pdf', content: '', fileName: '' });
 setShowUpload(false);
 setUploadError('');
 };

 const handleFileChange = (e, isEditing = false) => {
 const file = e.target.files[0];
 if (!file) return;

 if (file.size > 500 * 1024) {
 const msg = 'File is too large! Max 500KB allowed. For larger files, please use Google Drive and paste the link.';
 isEditing ? setEditError(msg) : setUploadError(msg);
 return;
 }
 
 isEditing ? setEditError('') : setUploadError('');
 const ext = file.name.split('.').pop().toLowerCase();
 
 const reader = new FileReader();
 reader.onload = (event) => {
 if (isEditing) {
 setEditingNote({
 ...editingNote,
 content: event.target.result,
 fileName: file.name,
 fileType: ['pdf', 'docx', 'pptx', 'text'].includes(ext) ? ext : 'file'
 });
 } else {
 setNewNote({
 ...newNote,
 content: event.target.result,
 fileName: file.name,
 fileType: ['pdf', 'docx', 'pptx', 'text'].includes(ext) ? ext : 'file'
 });
 }
 };
 reader.readAsDataURL(file);
 };

 const handleEditSubmit = (e) => {
 e.preventDefault();
 if (!editingNote.title || !editingNote.content) return;

 setNotes(notes.map(n => n.id === editingNote.id ? {
 ...n,
 title: editingNote.title,
 fileType: editingNote.fileType || 'file',
 content: editingNote.content,
 downloadUrl: editingNote.downloadUrl || n.downloadUrl || '',
 fileName: editingNote.fileName || editingNote.title,
 isBase64: editingNote.sourceType === 'file',
 date: new Date().toLocaleDateString() // update date
 } : n));

 setEditingNote(null);
 setEditError('');
 };

 const getIcon = (type) => {
 switch(type) {
 case 'pdf': return <FileText className="text-red-500" />;
 case 'docx': return <File className="text-blue-500" />;
 case 'pptx': return <File className="text-orange-500" />;
 case 'text': return <AlignLeft className="text-slate-500" />;
 default: return <FileText />;
 }
 };

 const handleOpen = (note) => {
 if (note.fileType === 'text') {
 setViewingNote(note);
 return;
 }

 if (note.isBase64) {
 // It's a base64 string, we can open it in a new window or trigger download
 fetch(note.content)
 .then(res => res.blob())
 .then(blob => {
 const url = URL.createObjectURL(blob);
 window.open(url, '_blank');
 });
 } else if (note.content && (note.content.startsWith('http://') || note.content.startsWith('https://'))) {
 window.open(note.content, '_blank');
 } else {
 const blob = new Blob([note.content || "Empty content"], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 window.open(url, '_blank');
 }
 };

 const handleDownload = (note) => {
 if (downloadingId) return;

 if (note.fileType === 'link') {
 let finalDownloadUrl = note.downloadUrl;
 if (!finalDownloadUrl && note.content) {
 const fileMatch = note.content.match(/file\/d\/([a-zA-Z0-9-_]+)/);
 const idMatch = note.content.match(/id=([a-zA-Z0-9-_]+)/);
 let fileId = fileMatch ? fileMatch[1] : (idMatch ? idMatch[1] : null);
 if (fileId) {
 finalDownloadUrl = `https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`;
 } else {
 finalDownloadUrl = note.content;
 }
 }
 
 const a = document.createElement('a');
 a.href = finalDownloadUrl || note.content;
 a.target = '_blank';
 a.rel = 'noopener noreferrer';
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 return;
 }
 
 setDownloadingId(note.id);
 setDownloadProgress(0);

 const interval = setInterval(() => {
 setDownloadProgress(prev => {
 if (prev >= 100) {
 clearInterval(interval);
 
 if (note.isBase64) {
 const a = document.createElement('a');
 a.href = note.content;
 a.download = note.fileName || `${note.title}.${note.fileType}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 } else {
 const blob = new Blob([note.content || "Mock file content"], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = note.fileName || `${note.title}.${note.fileType}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 }
 
 setTimeout(() => setDownloadingId(null), 500); 
 return 100;
 }
 return prev + 25;
 });
 }, 400); 
 };

 if (activeCourses.length === 0) {
 return (
 <div className="max-w-4xl mx-auto pt-20 text-center relative">
 <p className="text-slate-500">No courses available yet in this project.</p>
 <p className="text-sm mt-2">Go to Courses to add one first.</p>
 </div>
 );
 }

 return (
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 h-[calc(100vh-6rem)] relative">
 
  {/* Sidebar Course List */}
  <div className="w-full md:w-72 shrink-0 flex flex-col">
    <div className="md:flex-1 md:overflow-y-auto md:pr-2 scrollbar-thin">
      <h2 className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 mt-2">Available Courses</h2>
      
      {/* Container: Wraps on mobile, Vertical on desktop */}
      <div className="flex flex-wrap md:flex-col gap-2 pb-3 md:pb-0">
        {activeCourses.map(course => (
          <button 
            key={course.id}
            onClick={() => setActiveCourseId(course.id)}
            className={`whitespace-normal text-left px-4 py-2.5 md:py-3 rounded-lg transition-colors duration-75 text-sm font-bold border grow sm:grow-0 md:grow-0 ${
              activeCourseId === course.id 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-transparent' 
              : 'bg-white dark:bg-[#111] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#151515]'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Auto-Sync Popup Modal */}
  {newDriveFiles.length > 0 && (
  <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
  <div className="bg-white dark:bg-[#111] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-lg shadow-blue-500/20">
  <CloudLightning size={32} />
  </div>
  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">New Files Detected!</h3>
  <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
  We found <span className="font-bold text-slate-900 dark:text-white">{newDriveFiles.length} new files</span> in the Google Drive folder for this course. Would you like to add them now?
  </p>
  <div className="w-full flex gap-3">
  <button onClick={() => setNewDriveFiles([])} className="btn-secondary flex-1 py-3">Ignore</button>
  <button onClick={handleAddNewDriveFiles} className="btn-primary flex-1 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30">Add Files</button>
  </div>
  </div>
  </div>
  )}

  {/* Empty State / Notes Area */}
  <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
    {!activeCourse ? (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
          <BookOpen size={24} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 font-medium">Select a course to view notes.</p>
      </div>
    ) : (
      <>
        {/* Simple & Clean Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <BookOpen size={20} className="text-indigo-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{activeCourse.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{activeNotes.length} Materials</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeCourse.driveFolderId && (
              <button onClick={handleManualSync} disabled={isCheckingDrive} className="btn-secondary text-sm py-2 px-4 shrink-0 flex-1 sm:flex-none flex items-center justify-center gap-1.5 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400 h-10">
                {isCheckingDrive ? <Loader2 size={16} className="animate-spin" /> : <CloudLightning size={16} />} 
                {isCheckingDrive ? 'Syncing...' : 'Sync Drive'}
              </button>
            )}
            <button onClick={() => setShowUpload(true)} className="btn-primary text-sm py-2 px-4 shrink-0 flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-10">
              <Upload size={16} /> Upload Note
            </button>
          </div>
        </div>

        {/* Clean, Scannable List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin">
          {activeNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">No notes uploaded for this course yet.</div>
          ) : (
            activeNotes.map(note => {
              const isDownloading = downloadingId === note.id;
              
              return (
                <div key={note.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:bg-slate-50 dark:hover:bg-[#151515] transition-all gap-4 shadow-sm hover:shadow-md cursor-default">
                  
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#111] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                      {getIcon(note.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate pr-2">{note.title}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-widest">{note.fileType}</span>
                        <span className="text-[11px] font-medium text-slate-400">• {note.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isDownloading ? (
                    <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                      <Loader2 size={16} className="animate-spin text-slate-500" />
                      <div className="w-24 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 dark:bg-white transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold w-8">{downloadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <button onClick={() => setEditingNote({...note, sourceType: note.isBase64 ? 'file' : (note.fileType === 'text' ? 'text' : 'link')})} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Edit Note">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setNoteToDelete(note.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Note">
                        <Trash2 size={16} />
                      </button>
                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                      <button onClick={() => handleDownload(note)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Download">
                        <Download size={18} />
                      </button>
                      <button onClick={() => handleOpen(note)} className="px-3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 rounded-lg transition-colors flex items-center gap-1.5 font-bold text-sm" title={note.fileType === 'text' ? 'View Note' : 'Open in browser'}>
                        {note.fileType === 'text' ? <Maximize2 size={16} /> : <ExternalLink size={16} />} 
                        <span className="hidden sm:inline">Open</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </>
    )}
  </div>

 {/* Upload Modal */}
 {showUpload && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 ">
 <div className="card-minimal w-full max-w-md p-0 animate-in zoom-in-95 bg-white dark:bg-[#111] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
 
 <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] flex justify-between items-center shrink-0">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
 <Upload size={24} />
 </div>
 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Material</h2>
 </div>
 <button onClick={() => { setShowUpload(false); setUploadError(''); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"><X size={20} /></button>
 </div>

 <form onSubmit={handleUpload} className="flex flex-col flex-1 min-h-0">
 <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
 <div className="space-y-1.5">
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Material Title</label>
 <input required type="text" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="input-field h-12" placeholder="e.g. Chapter 1 Summary" />
 </div>
 
 <div className="space-y-1.5">
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Source Type</label>
 <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
 {['file', 'link', 'text'].map(type => (
 <button
 key={type}
 type="button"
 onClick={() => { setNewNote({...newNote, sourceType: type, content: ''}); setUploadError(''); }}
 className={`py-2 text-xs font-bold rounded-lg transition-all uppercase ${
 newNote.sourceType === type 
 ? 'bg-white dark:bg-[#222] text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
 : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
 }`}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
 {newNote.sourceType === 'text' && 'Write Content'}
 {newNote.sourceType === 'link' && 'Paste Link (Drive supported)'}
 {newNote.sourceType === 'file' && 'Select Local File'}
 </label>
 
 {newNote.sourceType === 'text' && (
 <textarea 
 required 
 value={newNote.content} 
 onChange={e => setNewNote({...newNote, content: e.target.value, fileType: 'text'})} 
 className="input-field min-h-[140px] resize-y" 
 placeholder="Write your note directly here..."
 />
 )}
 
 {newNote.sourceType === 'link' && (
 <div>
 <input 
 required 
 type="url" 
 value={newNote.content} 
 onChange={e => {
 const val = e.target.value;
 setNewNote({...newNote, content: val, fileType: 'link'});
 }}
 onBlur={e => processDriveLink(e.target.value)}
 className="input-field h-12" 
 placeholder="https://..." 
 />
 {isProcessingLink && <p className="text-xs text-amber-500 mt-2 flex items-center gap-1 font-bold"><Loader2 size={14} className="animate-spin"/> Extracting from Drive...</p>}
 {linkProcessError && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><X size={14}/> {linkProcessError}</p>}
 {!isProcessingLink && !linkProcessError && newNote.fileName && newNote.content.includes('uc?export') && (
 <p className="text-xs text-emerald-500 mt-2 font-bold flex items-center gap-1"><CloudLightning size={14}/> Auto-selected: {newNote.fileName}</p>
 )}
 </div>
 )}

 {newNote.sourceType === 'file' && (
 <div>
 <input 
 required 
 type="file" 
 onChange={handleFileChange}
 className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#1a1a1a]" 
 />
 {uploadError && <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1"><X size={14}/> {uploadError}</p>}
 {!uploadError && newNote.fileName && <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle2 size={14}/> File ready: {newNote.fileName}</p>}
 </div>
 )}
 </div>
 </div>
 <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151515] shrink-0">
 <button type="submit" disabled={!!uploadError || isProcessingLink} className="btn-primary w-full h-12 text-sm font-bold disabled:opacity-50">
 Publish Material
 </button>
 </div>
 </form>
 </div>
 </div>
 )}



 {/* Markdown Note Viewer Modal */}
 {viewingNote && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 ">
 <div className="bg-white dark:bg-[#111] w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
 <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
 <div>
 <h2 className="text-xl font-bold text-slate-900 dark:text-white">{viewingNote.title}</h2>
 <p className="text-xs text-slate-500 font-medium uppercase mt-1">{viewingNote.date}</p>
 </div>
 <button onClick={() => setViewingNote(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
 </div>
 <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin">
 <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none">
 <ReactMarkdown 
 remarkPlugins={[remarkGfm, remarkMath]}
 rehypePlugins={[rehypeKatex]}
 >
 {preprocessMath(viewingNote.content) || '*No content*'}
 </ReactMarkdown>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {noteToDelete && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-sm p-6 animate-in zoom-in-95 bg-white dark:bg-[#111]">
 <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Delete Note?</h2>
 <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
 <div className="flex gap-3">
 <button onClick={() => setNoteToDelete(null)} className="btn-secondary flex-1">Cancel</button>
 <button onClick={() => {
 setNotes(notes.filter(n => n.id !== noteToDelete));
 setNoteToDelete(null);
 }} className="btn-primary flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 border-transparent text-white">Delete</button>
 </div>
 </div>
 </div>
 )}

 {/* Edit Note Modal */}
 {editingNote && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="card-minimal w-full max-w-md p-6 animate-in zoom-in-95">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Note</h2>
 <button onClick={() => { setEditingNote(null); setEditError(''); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
 </div>
 <form onSubmit={handleEditSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Note Title</label>
 <input required type="text" value={editingNote.title} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="input-field" placeholder="e.g. Chapter 1 Summary" />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1">Source Type</label>
 <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
 {['file', 'link', 'text'].map(type => (
 <button
 key={type}
 type="button"
 onClick={() => { setEditingNote({...editingNote, sourceType: type, content: ''}); setEditError(''); }}
 className={`py-2 text-xs font-bold rounded-md transition-all uppercase ${
 editingNote.sourceType === type 
 ? 'bg-white dark:bg-[#222] text-slate-900 dark:text-white shadow-sm' 
 : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
 }`}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">
 {editingNote.sourceType === 'text' && 'Write Text Content'}
 {editingNote.sourceType === 'link' && 'File Link (URL)'}
 {editingNote.sourceType === 'file' && 'Select File'}
 </label>
 
 {editingNote.sourceType === 'text' && (
 <textarea 
 required 
 value={editingNote.content} 
 onChange={e => setEditingNote({...editingNote, content: e.target.value, fileType: 'text'})} 
 className="input-field min-h-[120px] resize-y" 
 placeholder="Write your note directly here..."
 />
 )}
 
 {editingNote.sourceType === 'link' && (
 <input 
 required 
 type="url" 
 value={editingNote.content} 
 onChange={e => setEditingNote({...editingNote, content: e.target.value, fileType: 'link'})} 
 className="input-field" 
 placeholder="Paste link (http://...)" 
 />
 )}

 {editingNote.sourceType === 'file' && (
 <div>
 <input 
 type="file" 
 onChange={e => handleFileChange(e, true)}
 className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 cursor-pointer mb-2" 
 />
 {editingNote.fileName && <p className="text-emerald-500 text-xs font-medium">Current file: {editingNote.fileName}</p>}
 {editError && <p className="text-red-500 text-xs font-medium mt-1">{editError}</p>}
 </div>
 )}
 </div>
 <button type="submit" disabled={!!editError} className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
 </form>
 </div>
 </div>
 )}
 {/* Custom Alert Modal */}
 {customAlert && (
 <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
 <div className="bg-white dark:bg-[#111] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
 <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${
 customAlert.type === 'limit' ? 'bg-amber-100 text-amber-600 shadow-amber-500/20 dark:bg-amber-900/30 dark:text-amber-400' :
 customAlert.type === 'error' ? 'bg-red-100 text-red-600 shadow-red-500/20 dark:bg-red-900/30 dark:text-red-400' :
 customAlert.type === 'success' ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400' :
 'bg-blue-100 text-blue-600 shadow-blue-500/20 dark:bg-blue-900/30 dark:text-blue-400'
 }`}>
 {customAlert.type === 'limit' && <AlertCircle size={32} />}
 {customAlert.type === 'error' && <X size={32} />}
 {customAlert.type === 'success' && <CheckCircle2 size={32} />}
 {customAlert.type === 'info' && <Info size={32} />}
 </div>
 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{customAlert.title}</h3>
 <p className="text-sm font-medium text-slate-500 mb-2 leading-relaxed">
 {customAlert.message}
 </p>
 {customAlert.subMessage && (
 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 w-full mb-4">
 <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-1">
 <div className="flex items-center gap-1.5">
 <AlertCircle size={14} className="text-amber-500" />
 <span>{customAlert.subMessage}</span>
 </div>
 {customAlert.type === 'limit' && <SyncLimitTimer />}
 </div>
 </div>
 )}
 <div className="w-full mt-4">
 <button 
 onClick={() => setCustomAlert(null)} 
 className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
 customAlert.type === 'limit' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' :
 customAlert.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' :
 customAlert.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' :
 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
 }`}
 >
 Okay, got it
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
