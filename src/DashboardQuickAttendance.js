export const handleQuickAttendance = (courseId, status, attendanceHistory, setAttendanceHistory) => {
  const today = new Date().toISOString().split('T')[0];
  const existingRecord = attendanceHistory.find(h => h.courseId === courseId && h.date.startsWith(today));
  
  let newHistory = [...attendanceHistory];
  if (existingRecord) {
    if (existingRecord.status === status) return; 
    newHistory = newHistory.filter(h => h.id !== existingRecord.id);
  }
  
  newHistory.push({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    courseId,
    date: new Date().toISOString(),
    status
  });
  
  setAttendanceHistory(newHistory);
};
