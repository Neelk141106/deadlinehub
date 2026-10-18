import React, { useState, useEffect, useCallback, useRef } from 'react';
import { classApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../context/ClassContext';
import { useSocket } from '../context/SocketContext';
import { DeadlineCard } from './DeadlineCard';
import { AnnouncementCard } from './AnnouncementCard';

export function ClassDetailView({ classId, onBack, onEditClass, initialTab = 'overview', onTabChange }) {
  const { user } = useAuth();
  const { leaveClass, removeStudent, deleteClass } = useClasses();
  const { socket } = useSocket();

  const [classData, setClassData] = useState(null);
  const classDataRef = useRef(null);
  useEffect(() => {
    classDataRef.current = classData;
  }, [classData]);

  const [deadlines, setDeadlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState((initialTab === 'members' ? 'students' : initialTab) || 'overview'); // 'overview' | 'deadlines' | 'announcements' | 'students'
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (initialTab && ['overview', 'deadlines', 'announcements', 'students', 'members'].includes(initialTab)) {
      setActiveTab(initialTab === 'members' ? 'students' : initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab) => {
    const target = tab === 'members' ? 'students' : tab;
    setActiveTab(target);
    if (onTabChange) {
      onTabChange(target);
    }
  };

  // Modals / Confirmations
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const isTeacher = user?.role === 'teacher';

  const fetchClassContent = useCallback(async () => {
    if (!classId) return;
    try {
      setLoading(true);
      setError('');
      setClassData(null);
      setDeadlines([]);
      setAnnouncements([]);
      const res = await classApi.getContent(classId);
      if (res && res.success) {
        setClassData(res.class);
        setDeadlines(res.deadlines || []);
        setAnnouncements(res.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load class content:', err);
      setError(err.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassContent();
  }, [fetchClassContent]);

  // Real-time Socket.IO synchronization within this class view
  useEffect(() => {
    if (!socket || !classId) return;

    const handleDeadlineCreated = (newD) => {
      const currentClass = classDataRef.current;
      const teacherOwnerId = (currentClass?.teacherId?._id || currentClass?.teacherId)?.toString();
      const isTargetingAll = newD.targetType === 'all_classes' && teacherOwnerId && (newD.createdBy?._id || newD.createdBy)?.toString() === teacherOwnerId;
      const match =
        isTargetingAll ||
        newD.classId === classId ||
        (newD.classId?._id && newD.classId._id === classId) ||
        (Array.isArray(newD.targetClassIds) && newD.targetClassIds.some((c) => (c._id || c).toString() === classId.toString()));
      if (match) {
        const newId = (newD._id || newD.id)?.toString();
        setDeadlines((prev) => [newD, ...prev.filter((d) => (d._id || d.id)?.toString() !== newId)]);
      }
    };

    const handleDeadlineUpdated = (updatedD) => {
      const updatedId = (updatedD._id || updatedD.id)?.toString();
      setDeadlines((prev) => prev.map((d) => (((d._id || d.id)?.toString() === updatedId) ? updatedD : d)));
    };

    const handleDeadlineDeleted = ({ _id }) => {
      const delId = (_id || '').toString();
      setDeadlines((prev) => prev.filter((d) => (d._id || d.id)?.toString() !== delId));
    };

    const handleAnnouncementCreated = (newA) => {
      const currentClass = classDataRef.current;
      const teacherOwnerId = (currentClass?.teacherId?._id || currentClass?.teacherId)?.toString();
      const isTargetingAll = newA.targetType === 'all_classes' && teacherOwnerId && (newA.createdBy?._id || newA.createdBy)?.toString() === teacherOwnerId;
      const match =
        isTargetingAll ||
        newA.classId === classId ||
        (newA.classId?._id && newA.classId._id === classId) ||
        (Array.isArray(newA.targetClassIds) && newA.targetClassIds.some((c) => (c._id || c).toString() === classId.toString()));
      if (match) {
        const newId = (newA._id || newA.id)?.toString();
        setAnnouncements((prev) => [newA, ...prev.filter((a) => (a._id || a.id)?.toString() !== newId)]);
      }
    };

    const handleAnnouncementUpdated = (updatedA) => {
      const updatedId = (updatedA._id || updatedA.id)?.toString();
      setAnnouncements((prev) => prev.map((a) => (((a._id || a.id)?.toString() === updatedId) ? updatedA : a)));
    };

    const handleAnnouncementDeleted = ({ _id }) => {
      const delId = (_id || '').toString();
      setAnnouncements((prev) => prev.filter((a) => (a._id || a.id)?.toString() !== delId));
    };

    const handleStudentJoined = ({ classId: joinedClassId, student }) => {
      if (joinedClassId === classId) {
        setClassData((prev) => {
          if (!prev) return prev;
          const currentStudents = prev.students || [];
          if (currentStudents.some((s) => (s._id || s) === (student._id || student))) return prev;
          return {
            ...prev,
            students: [...currentStudents, student],
          };
        });
      }
    };

    const handleStudentLeft = ({ classId: leftClassId, studentId }) => {
      if (leftClassId === classId) {
        const currentUserId = user?._id || user?.id;
        if (currentUserId && currentUserId.toString() === studentId.toString()) {
          // Current student left, navigate back
          onBack();
        } else {
          setClassData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              students: (prev.students || []).filter((s) => (s._id || s)?.toString() !== studentId.toString()),
            };
          });
        }
      }
    };

    const handleStudentRemoved = ({ classId: remClassId, studentId }) => {
      if (remClassId === classId) {
        const currentUserId = user?._id || user?.id;
        if (currentUserId && currentUserId.toString() === studentId.toString()) {
          // Current student was removed, navigate back
          onBack();
        } else {
          setClassData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              students: (prev.students || []).filter((s) => (s._id || s)?.toString() !== studentId.toString()),
            };
          });
        }
      }
    };

    socket.on('deadline:created', handleDeadlineCreated);
    socket.on('deadline:updated', handleDeadlineUpdated);
    socket.on('deadline:deleted', handleDeadlineDeleted);
    socket.on('announcement:created', handleAnnouncementCreated);
    socket.on('announcement:updated', handleAnnouncementUpdated);
    socket.on('announcement:deleted', handleAnnouncementDeleted);
    socket.on('class:student-joined', handleStudentJoined);
    socket.on('class:student-left', handleStudentLeft);
    socket.on('class:student-removed', handleStudentRemoved);

    return () => {
      socket.off('deadline:created', handleDeadlineCreated);
      socket.off('deadline:updated', handleDeadlineUpdated);
      socket.off('deadline:deleted', handleDeadlineDeleted);
      socket.off('announcement:created', handleAnnouncementCreated);
      socket.off('announcement:updated', handleAnnouncementUpdated);
      socket.off('announcement:deleted', handleAnnouncementDeleted);
      socket.off('class:student-joined', handleStudentJoined);
      socket.off('class:student-left', handleStudentLeft);
      socket.off('class:student-removed', handleStudentRemoved);
    };
  }, [socket, classId, user, onBack]);

  const formatAnnouncementTime = (a) => {
    if (a.postedTime) return a.postedTime;
    if (a.time) return a.time;
    const raw = a.postedAt || a.createdAt;
    if (!raw) return 'Recently';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return 'Recently';
    return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const handleCopyCode = () => {
    if (!classData?.classCode) return;
    navigator.clipboard.writeText(classData.classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeaveClass = async () => {
    setActionInProgress(true);
    setActionError('');
    try {
      await leaveClass(classId);
      setShowLeaveConfirm(false);
      onBack();
    } catch (err) {
      setActionError(err.message || 'Failed to leave class');
      setActionInProgress(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    setActionInProgress(true);
    setActionError('');
    try {
      await removeStudent(classId, studentToRemove._id || studentToRemove);
      const remId = (studentToRemove._id || studentToRemove)?.toString();
      setClassData((prev) => ({
        ...prev,
        students: (prev.students || []).filter((s) => (s._id || s)?.toString() !== remId),
      }));
      setStudentToRemove(null);
      setActionSuccess('Student removed successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to remove student');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteClass = async () => {
    setActionInProgress(true);
    setActionError('');
    try {
      await deleteClass(classId);
      setShowDeleteConfirm(false);
      onBack();
    } catch (err) {
      setActionError(err.message || 'Failed to delete class');
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading class details and content...</p>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to All Classes
        </button>

        <div className="p-8 bg-white dark:bg-[#151C2C] border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Class Workspace Unavailable
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {error || 'This class does not exist, has been removed, or you do not have permission to view its content.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onBack}
              className="btn-primary text-xs font-semibold py-2 px-5 cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              Return to All Classes
            </button>
            <button
              onClick={fetchClassContent}
              className="btn-secondary text-xs font-semibold py-2 px-4 cursor-pointer inline-flex items-center gap-1.5"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const teacher = classData.teacherId || {};
  const students = classData.students || [];
  const isOwner = isTeacher && ((classData.teacherId?._id || classData.teacherId)?.toString() === (user?._id || user?.id)?.toString());

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to All Classes
        </button>

        {/* Top-right action for students: Leave Class */}
        {!isTeacher && (
          <button
            type="button"
            onClick={() => {
              setActionError('');
              setShowLeaveConfirm(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Leave Class
          </button>
        )}

        {/* Top-right actions for teachers: Edit Class & Delete Class */}
        {isTeacher && (
          <div className="flex items-center gap-2">
            {isOwner && onEditClass && (
              <button
                type="button"
                onClick={() => onEditClass(classData)}
                className="btn-secondary text-xs font-semibold py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Class
              </button>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  setActionError('');
                  setShowDeleteConfirm(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Delete Class
              </button>
            )}
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between">
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Hero Class Banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-primary-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                {classData.division || 'Division'} • {classData.semester || 'Semester'}
              </span>
              {classData.department && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-black/20 text-white/90">
                  {classData.department}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {classData.className}
            </h1>

            {classData.subject && (
              <p className="text-white/80 font-medium text-sm sm:text-base">
                {classData.subject}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/80">
              {teacher.name && (
                <span className="inline-flex items-center gap-1.5">
                  <span>👨‍🏫 Instructor:</span>
                  <strong className="text-white">{teacher.name}</strong>
                  {teacher.email && <span className="opacity-75">({teacher.email})</span>}
                </span>
              )}
              <span>•</span>
              <span>
                👥 <strong className="text-white">{students.length}</strong> {students.length === 1 ? 'Student' : 'Students'} Enrolled
              </span>
            </div>
          </div>

          {/* Class Code Card */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center shrink-0 min-w-[200px] text-center">
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider block mb-1">
              Class Code
            </span>
            <span className="font-mono text-2xl font-black text-white tracking-widest block mb-2">
              {classData.classCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="w-full py-1.5 px-3 rounded-xl bg-white text-primary-700 hover:bg-white/90 text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedCode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          Overview
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('deadlines')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'deadlines'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Deadlines ({deadlines.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('announcements')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Announcements ({announcements.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('students')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {isTeacher ? 'Manage Students' : 'Class Members'} ({students.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => handleTabChange('deadlines')}
              className="card-hover p-5 flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">
                  {deadlines.length}
                </span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Class Deadlines</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>

            <div
              onClick={() => handleTabChange('announcements')}
              className="card-hover p-5 flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {announcements.length}
                </span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Announcements</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
            </div>

            <div
              onClick={() => handleTabChange('students')}
              className="card-hover p-5 flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {students.length}
                </span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Enrolled Students</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Upcoming Deadlines Preview & Latest Announcements Preview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#151C2C] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Upcoming Deadlines</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold">{deadlines.length}</span>
                  </h3>
                  {deadlines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleTabChange('deadlines')}
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                    >
                      View all deadlines →
                    </button>
                  )}
                </div>

                {deadlines.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">No deadlines scheduled for this class yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deadlines.slice(0, 2).map((d) => (
                      <DeadlineCard
                        key={d._id || d.id}
                        dueDate={d.dueDate}
                        subject={d.subject}
                        title={d.title}
                        priority={d.priority}
                        classLabel={`${classData.className} (${classData.classCode})`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-[#151C2C] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Recent Announcements</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">{announcements.length}</span>
                  </h3>
                  {announcements.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleTabChange('announcements')}
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                    >
                      View all announcements →
                    </button>
                  )}
                </div>

                {announcements.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">No announcements posted for this class yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {announcements.slice(0, 2).map((a) => (
                      <AnnouncementCard
                        key={a._id || a.id}
                        priorityVariant={a.priorityVariant || (a.priority ? a.priority.toLowerCase() : 'normal')}
                        priorityText={a.priorityText || (a.priority ? a.priority.toUpperCase() : (a.category ? a.category.toUpperCase() : 'GENERAL'))}
                        isPinned={a.isPinned}
                        title={a.title}
                        message={a.message}
                        postedBy={a.postedBy || a.author || teacher.name || 'Instructor'}
                        postedTime={formatAnnouncementTime(a)}
                        classLabel={`${classData.className} (${classData.classCode})`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Class Information & Teacher Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Teacher Details Card */}
              <div className="bg-white dark:bg-[#151C2C] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Instructor Details
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {(teacher.name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {teacher.name || 'Class Instructor'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {teacher.email || 'Email not available'}
                    </p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-900/50">
                      Faculty / Teacher
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Information Card */}
              <div className="bg-white dark:bg-[#151C2C] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Class Information
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Class Name</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">{classData.className}</span>
                  </div>
                  {classData.subject && (
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Subject</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">{classData.subject}</span>
                    </div>
                  )}
                  {classData.department && (
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Department</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">{classData.department}</span>
                    </div>
                  )}
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Division / Sem</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">{classData.division || 'All'} • {classData.semester || 'Sem'}</span>
                  </div>
                  {classData.academicYear && (
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Academic Year</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">{classData.academicYear}</span>
                    </div>
                  )}
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Class Code</span>
                    <span className="font-mono font-bold text-primary-600 dark:text-primary-400 text-right">{classData.classCode}</span>
                  </div>
                  <div className="py-2 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Join Policy</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${classData.requiresApproval !== false ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                      {classData.requiresApproval !== false ? 'Requires Approval' : 'Direct Join'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Deadlines */}
      {activeTab === 'deadlines' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{classData.className} — Class Deadlines</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Coursework and deadlines specifically assigned to this class workspace.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-900/40 w-fit">
              {deadlines.length} {deadlines.length === 1 ? 'Deadline' : 'Deadlines'}
            </span>
          </div>

          {deadlines.length === 0 ? (
            <div className="card p-12 text-center border-dashed">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No deadlines for this class
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                {isTeacher
                  ? 'Create assignments or deadlines targeted to this class from the Manage Deadlines page.'
                  : 'Your instructor has not posted any deadlines for this class yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deadlines.map((d) => (
                <DeadlineCard
                  key={d._id || d.id}
                  dueDate={d.dueDate}
                  subject={d.subject}
                  title={d.title}
                  priority={d.priority}
                  classLabel={`${classData.className} (${classData.classCode})`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{classData.className} — Announcements</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official notices and updates posted for this class workspace.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/40 w-fit">
              {announcements.length} {announcements.length === 1 ? 'Announcement' : 'Announcements'}
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="card p-12 text-center border-dashed">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No announcements posted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                {isTeacher
                  ? 'Post alerts or important updates for this class from the Manage Announcements page.'
                  : 'Your instructor has not posted any announcements for this class yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <AnnouncementCard
                  key={a._id || a.id}
                  title={a.title}
                  message={a.message}
                  postedBy={a.postedBy || a.author || teacher.name || 'Instructor'}
                  postedTime={formatAnnouncementTime(a)}
                  priorityVariant={a.priorityVariant || (a.priority || 'Normal').toLowerCase()}
                  priorityText={a.priorityText || (a.priority || 'Normal').toUpperCase()}
                  isPinned={a.isPinned}
                  classLabel={`${classData.className} (${classData.classCode})`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Students / Members */}
      {activeTab === 'students' && (
        <div className="card overflow-hidden">
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {classData.className} — {isTeacher ? 'Manage Enrolled Students' : 'Class Members'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTeacher ? 'View and manage student enrollments in this class.' : 'Classmates currently enrolled in this class.'}
              </p>
            </div>
            <span className="bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary-200/50 dark:border-primary-900/40">
              {students.length} Total
            </span>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No students enrolled yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Share code <strong className="font-mono text-primary-600 dark:text-primary-400">{classData.classCode}</strong> with students to allow them to join or request access.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student) => {
                const sName = student.name || 'Student';
                const sEmail = student.email || '—';
                const sCode = student.studentCode || '';

                return (
                  <div key={student._id || student} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {sName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {sName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {sEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {sCode && (
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {sCode}
                        </span>
                      )}

                      {/* Teacher Action: Remove student */}
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('');
                            setStudentToRemove(student);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal: Leave Class (Student) */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Leave &ldquo;{classData.className}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You will lose access to all deadlines, announcements, and materials for this class. You will need to request access or enter the class code again to re-join.
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium text-center">
                {actionError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={actionInProgress}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveClass}
                disabled={actionInProgress}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {actionInProgress ? 'Leaving...' : 'Confirm Leave Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Remove Student (Teacher) */}
      {studentToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Remove {studentToRemove.name || 'Student'}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This student will be unenrolled from &ldquo;{classData.className}&rdquo; and will immediately lose access to this class's content. Their account will not be deleted.
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium text-center">
                {actionError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStudentToRemove(null)}
                disabled={actionInProgress}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveStudent}
                disabled={actionInProgress}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {actionInProgress ? 'Removing...' : 'Confirm Remove Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Class (Teacher) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Delete &ldquo;{classData.className}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action is irreversible. All student memberships and pending join requests for this class will be removed.
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium text-center">
                {actionError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionInProgress}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClass}
                disabled={actionInProgress}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {actionInProgress ? 'Deleting...' : 'Confirm Delete Class'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassDetailView;
