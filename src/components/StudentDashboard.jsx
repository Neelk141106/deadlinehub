import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DeadlineCard } from './DeadlineCard';
import { AnnouncementCard } from './AnnouncementCard';
import { SectionHeader } from './ui/SectionHeader';
import { useDeadlines } from '../context/DeadlineContext';
import { useAnnouncements } from '../context/AnnouncementContext';
import { useClasses } from '../context/ClassContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { JoinClass } from './JoinClass';
import { ClassDetailView } from './ClassDetailView';
import { joinRequestApi } from '../api/api';
import { getDeadlineStatus } from '../utils/deadlineStatus';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function StudentDashboard() {
  const { user } = useAuth();
  const { deadlines } = useDeadlines();
  const { announcements } = useAnnouncements();
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    leaveClass,
    fetchClasses,
    openedClassId,
    openedClassTab,
    openClassWorkspace,
    closeClassWorkspace,
    setOpenedClassTab,
  } = useClasses();
  const { socket } = useSocket();

  const [greeting, setGreeting] = useState(getGreeting());
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Modals / Actions
  const [classToLeave, setClassToLeave] = useState(null);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const displayName = user?.name || 'Student';

  const fetchPendingRequests = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    try {
      const res = await joinRequestApi.getPending();
      if (res && res.success) {
        setPendingRequests(res.requests || []);
      }
    } catch (err) {
      console.warn('Could not load student pending requests:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleRequestsChanged = () => {
      fetchPendingRequests();
      fetchClasses();
    };

    socket.on('join-request:created', handleRequestsChanged);
    socket.on('join-request:approved', handleRequestsChanged);
    socket.on('join-request:rejected', handleRequestsChanged);
    socket.on('join-request:updated', handleRequestsChanged);
    socket.on('class:student-joined', handleRequestsChanged);
    socket.on('class:student-removed', handleRequestsChanged);
    socket.on('class:left', handleRequestsChanged);
    socket.on('class:deleted', handleRequestsChanged);

    return () => {
      socket.off('join-request:created', handleRequestsChanged);
      socket.off('join-request:approved', handleRequestsChanged);
      socket.off('join-request:rejected', handleRequestsChanged);
      socket.off('join-request:updated', handleRequestsChanged);
      socket.off('class:student-joined', handleRequestsChanged);
      socket.off('class:student-removed', handleRequestsChanged);
      socket.off('class:left', handleRequestsChanged);
      socket.off('class:deleted', handleRequestsChanged);
    };
  }, [socket, user, fetchPendingRequests, fetchClasses]);

  useEffect(() => {
    setGreeting(getGreeting());

    const urgentCount = deadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow';
    }).length;

    document.title = urgentCount > 0
      ? `(${urgentCount}) Urgent — DeadlineHub`
      : 'DeadlineHub';

    return () => {
      document.title = 'DeadlineHub';
    };
  }, [deadlines]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showJoinModal) {
          setShowJoinModal(false);
          fetchPendingRequests();
        } else if (classToLeave) {
          setClassToLeave(null);
        } else if (requestToCancel) {
          setRequestToCancel(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showJoinModal, classToLeave, requestToCancel, fetchPendingRequests]);

  // Selected class object
  const activeClass = useMemo(() => {
    return classes.find((c) => c._id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Filter deadlines by selected class if filter is active, with strict targeting and canonical deduplication
  const filteredDeadlines = useMemo(() => {
    if (!selectedClassId) {
      const seen = new Set();
      return deadlines.filter((d) => {
        const id = (d._id || d.id)?.toString();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    const teacherOwnerId = (activeClass?.teacherId?._id || activeClass?.teacherId)?.toString();

    return deadlines.filter((d) => {
      const directMatch =
        (d.classId?._id || d.classId)?.toString() === selectedClassId.toString();
      if (directMatch) return true;

      const targetMatch =
        Array.isArray(d.targetClassIds) &&
        d.targetClassIds.some((c) => (c._id || c).toString() === selectedClassId.toString());
      if (targetMatch) return true;

      const creatorId = (d.createdBy?._id || d.createdBy)?.toString();
      if (d.targetType === 'all_classes' && teacherOwnerId && creatorId && teacherOwnerId === creatorId) {
        return true;
      }

      return false;
    });
  }, [deadlines, selectedClassId, activeClass]);

  // Filter announcements by selected class if filter is active, with strict targeting and canonical deduplication
  const filteredAnnouncements = useMemo(() => {
    if (!selectedClassId) {
      const seen = new Set();
      return announcements.filter((a) => {
        const id = (a._id || a.id)?.toString();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    const teacherOwnerId = (activeClass?.teacherId?._id || activeClass?.teacherId)?.toString();

    return announcements.filter((a) => {
      const directMatch =
        (a.classId?._id || a.classId)?.toString() === selectedClassId.toString();
      if (directMatch) return true;

      const targetMatch =
        Array.isArray(a.targetClassIds) &&
        a.targetClassIds.some((c) => (c._id || c).toString() === selectedClassId.toString());
      if (targetMatch) return true;

      const creatorId = (a.createdBy?._id || a.createdBy)?.toString();
      if (a.targetType === 'all_classes' && teacherOwnerId && creatorId && teacherOwnerId === creatorId) {
        return true;
      }

      return false;
    });
  }, [announcements, selectedClassId, activeClass]);

  // Helper to determine the target class label(s) for a deadline
  const getDeadlineClassLabel = useCallback(
    (d) => {
      if (activeClass) {
        return `${activeClass.className} (${activeClass.classCode})`;
      }
      const matched = [];
      if (d.classId?._id || d.classId) {
        const cid = (d.classId._id || d.classId).toString();
        const found = classes.find((c) => c._id.toString() === cid);
        if (found) matched.push(found);
      }
      if (Array.isArray(d.targetClassIds)) {
        for (const tc of d.targetClassIds) {
          const tcid = (tc._id || tc).toString();
          const found = classes.find((c) => c._id.toString() === tcid);
          if (found && !matched.some((m) => m._id.toString() === tcid)) {
            matched.push(found);
          }
        }
      }
      if (d.targetType === 'all_classes') {
        const creatorId = (d.createdBy?._id || d.createdBy)?.toString();
        const tClasses = classes.filter((c) => {
          const tid = (c.teacherId?._id || c.teacherId)?.toString();
          return tid && creatorId && tid === creatorId;
        });
        for (const tc of tClasses) {
          if (!matched.some((m) => m._id.toString() === tc._id.toString())) {
            matched.push(tc);
          }
        }
      }
      if (matched.length === 0) return null;
      if (matched.length === 1) return `${matched[0].className} (${matched[0].classCode})`;
      return matched.map((m) => m.className).join(', ');
    },
    [activeClass, classes]
  );

  // Helper to determine the target class label(s) for an announcement
  const getAnnouncementClassLabel = useCallback(
    (a) => {
      if (activeClass) {
        return `${activeClass.className} (${activeClass.classCode})`;
      }
      const matched = [];
      if (a.classId?._id || a.classId) {
        const cid = (a.classId._id || a.classId).toString();
        const found = classes.find((c) => c._id.toString() === cid);
        if (found) matched.push(found);
      }
      if (Array.isArray(a.targetClassIds)) {
        for (const tc of a.targetClassIds) {
          const tcid = (tc._id || tc).toString();
          const found = classes.find((c) => c._id.toString() === tcid);
          if (found && !matched.some((m) => m._id.toString() === tcid)) {
            matched.push(found);
          }
        }
      }
      if (a.targetType === 'all_classes') {
        const creatorId = (a.createdBy?._id || a.createdBy)?.toString();
        const tClasses = classes.filter((c) => {
          const tid = (c.teacherId?._id || c.teacherId)?.toString();
          return tid && creatorId && tid === creatorId;
        });
        for (const tc of tClasses) {
          if (!matched.some((m) => m._id.toString() === tc._id.toString())) {
            matched.push(tc);
          }
        }
      }
      if (matched.length === 0) return null;
      if (matched.length === 1) return `${matched[0].className} (${matched[0].classCode})`;
      return matched.map((m) => m.className).join(', ');
    },
    [activeClass, classes]
  );

  // Derived stats from filtered deadlines
  const deadlineStats = useMemo(() => {
    const dueSoon = filteredDeadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow';
    });

    const thisWeek = filteredDeadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow' || s === 'this-week';
    });

    const needsAttention = filteredDeadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      if (s === 'past') return false;
      if (s === 'today' || s === 'tomorrow') return true;
      if (s === 'this-week' && (d.priority === 'High' || d.priority === 'Important')) return true;
      return false;
    });

    const upcoming = [...filteredDeadlines]
      .filter((d) => getDeadlineStatus(d.dueDate) !== 'past')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return { dueSoonCount: dueSoon.length, thisWeekCount: thisWeek.length, needsAttention, upcoming };
  }, [filteredDeadlines]);

  const latestAnnouncements = useMemo(() => {
    return [...filteredAnnouncements]
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const timeA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const timeB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 3);
  }, [filteredAnnouncements]);

  if (openedClassId) {
    return (
      <ClassDetailView
        classId={openedClassId}
        initialTab={openedClassTab || 'overview'}
        onTabChange={setOpenedClassTab}
        onBack={closeClassWorkspace}
      />
    );
  }

  const handleLeaveClass = async () => {
    if (!classToLeave) return;
    setActionLoading(true);
    setActionError('');
    try {
      await leaveClass(classToLeave._id);
      setActionSuccess(`Successfully left ${classToLeave.className}`);
      setClassToLeave(null);
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      setActionError(err.message || 'Failed to leave class');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestToCancel) return;
    setActionLoading(true);
    setActionError('');
    try {
      await joinRequestApi.cancel(requestToCancel._id);
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestToCancel._id));
      setActionSuccess('Join request cancelled successfully');
      setRequestToCancel(null);
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      setActionError(err.message || 'Failed to cancel join request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Action Success Alert Banner */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess('')}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer ml-3 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Greeting and Class Info */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {greeting}, {displayName} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-normal">
            Here's what you need to know today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(!user || user.role === 'student') && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 cursor-pointer shadow-sm hover:shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Join Class
            </button>
          )}

          <div className="bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-900/50 px-3.5 py-1.5 rounded-xl font-semibold text-xs tracking-wide shadow-xs inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            {classes.length} {classes.length === 1 ? 'Class Enrolled' : 'Classes Enrolled'}
          </div>
        </div>
      </header>

      {/* ── Class Selector / Filter Pills (Google Classroom style) ────────────────── */}
      {classes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-b border-slate-200/60 dark:border-slate-800/60">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedClassId(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              !selectedClassId
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Classes ({classes.length})
          </button>
          {classes.map((cls) => {
            const isSelected = selectedClassId === cls._id;
            return (
              <button
                key={cls._id}
                type="button"
                onClick={() => setSelectedClassId(isSelected ? null : cls._id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cls.className}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {cls.classCode}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── My Classes Section ────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              My Classes
            </h2>
            {selectedClassId && (
              <button
                onClick={() => setSelectedClassId(null)}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                (Show All Classes)
              </button>
            )}
          </div>

          <button
            onClick={() => setShowJoinModal(true)}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 cursor-pointer"
          >
            + Join another class
          </button>
        </div>

        {/* Pending Requests Banner if student has requests awaiting approval */}
        {pendingRequests.length > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Join Requests ({pendingRequests.length})
              </span>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400 font-medium">
                Waiting for teacher approval
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pendingRequests.map((req) => (
                <div key={req._id} className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {req.classId?.className || 'Class'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Code: {req.classId?.classCode || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-semibold text-[10px]">
                      Pending Review
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError('');
                        setRequestToCancel(req);
                      }}
                      className="text-[10px] font-semibold text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="p-6 bg-white dark:bg-[#151C2C] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">You haven't joined any classes yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Enter the unique Class Code provided by your teacher to access assignments, quizzes, and class announcements.
            </p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-primary text-xs font-semibold py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              Enter Class Code to Join
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const isSelected = selectedClassId === cls._id;
              const teacherName = cls.teacherId?.name || 'Instructor';

              return (
                <div
                  key={cls._id}
                  onClick={() => setSelectedClassId(isSelected ? null : cls._id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-500 dark:border-primary-600 shadow-sm ring-1 ring-primary-500'
                      : 'bg-white dark:bg-[#151C2C] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {cls.division || 'All'} • {cls.semester || 'Sem'}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-900/40 px-2 py-0.5 rounded">
                        {cls.classCode}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                      {cls.className}
                    </h3>

                    {cls.subject && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {cls.subject}
                      </p>
                    )}

                    {(cls.department || cls.academicYear) && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {[cls.department, cls.academicYear].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      👨‍🏫 {teacherName}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionError('');
                          setClassToLeave(cls);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-slate-400 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Leave Class"
                        aria-label={`Leave ${cls.className}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openClassWorkspace(cls._id, 'overview');
                        }}
                        className="btn-primary py-1 px-3 text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Class</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3 Summary overview cards balanced across the content width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover p-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-tight">
              {deadlineStats.dueSoonCount}
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Due Soon</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>

        <div className="card-hover p-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
              {deadlineStats.thisWeekCount}
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">This Week</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </div>
        </div>

        <div className="card-hover p-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">
              {filteredAnnouncements.length}
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Announcements</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Deadlines ~ 2/3 width, Announcements ~ 1/3 width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width on desktop): Needs Attention & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Filter Banner if filtered by a specific class */}
          {activeClass && (
            <div className="p-3.5 bg-primary-50/90 dark:bg-primary-950/50 border border-primary-200/80 dark:border-primary-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-primary-900 dark:text-primary-100 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span>
                  Filtering view by: <strong className="font-bold">{activeClass.className}</strong> <span className="font-mono text-[11px] opacity-75">({activeClass.classCode})</span>
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openClassWorkspace(activeClass._id, 'overview')}
                  className="font-bold text-primary-700 dark:text-primary-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Open Full Class Page</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <span className="text-primary-300 dark:text-primary-700">|</span>
                <button
                  onClick={() => setSelectedClassId(null)}
                  className="font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline hover:no-underline cursor-pointer"
                >
                  Return to All Classes
                </button>
              </div>
            </div>
          )}

          {/* Needs Attention section */}
          {deadlineStats.needsAttention.length > 0 && (
            <section>
              <SectionHeader title={`Needs Attention (${deadlineStats.needsAttention.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deadlineStats.needsAttention.map((d) => (
                  <DeadlineCard
                    key={d.id || d._id}
                    dueDate={d.dueDate}
                    subject={d.subject}
                    title={d.title}
                    priority={d.priority}
                    classLabel={getDeadlineClassLabel(d)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Deadlines section */}
          <section>
            <SectionHeader title="Upcoming Deadlines" />
            {deadlineStats.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deadlineStats.upcoming.map((d) => (
                  <DeadlineCard
                    key={d.id || d._id}
                    dueDate={d.dueDate}
                    subject={d.subject}
                    title={d.title}
                    priority={d.priority}
                    classLabel={getDeadlineClassLabel(d)}
                  />
                ))}
              </div>
            ) : (
              <div className="card p-8 sm:p-10 text-center border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                    <path d="m9 16 2 2 4-4"/>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No upcoming deadlines</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">You're all caught up.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column (1/3 width on desktop): Latest Announcements */}
        <div className="lg:col-span-1 space-y-4">
          <SectionHeader title="Latest Announcements" />
          <div className="flex flex-col gap-4">
            {latestAnnouncements.length > 0 ? (
              latestAnnouncements.map((a) => (
                <AnnouncementCard
                  key={a.id || a._id}
                  priorityVariant={a.priorityVariant || (a.priority ? a.priority.toLowerCase() : 'normal')}
                  priorityText={a.priorityText || (a.priority ? a.priority.toUpperCase() : (a.category ? a.category.toUpperCase() : 'GENERAL'))}
                  isPinned={a.isPinned}
                  title={a.title}
                  message={a.message}
                  postedBy={a.postedBy || 'Teacher / Admin'}
                  postedTime={a.postedTime || a.time || 'Just now'}
                  classLabel={getAnnouncementClassLabel(a)}
                />
              ))
            ) : (
              <div className="card p-6 text-center border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300">No announcements posted yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Join Class */}
      {showJoinModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowJoinModal(false);
              fetchPendingRequests();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setShowJoinModal(false);
                fetchPendingRequests();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <JoinClass
              isModal={true}
              onClose={() => {
                setShowJoinModal(false);
                fetchPendingRequests();
              }}
              onSuccess={() => {
                setShowJoinModal(false);
                fetchClasses();
                fetchPendingRequests();
              }}
              onRequestSubmitted={(newReq) => {
                if (newReq) {
                  setPendingRequests((prev) => [newReq, ...prev.filter((r) => r._id !== newReq._id)]);
                }
                fetchPendingRequests();
              }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal: Leave Class from Dashboard Card */}
      {classToLeave && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionLoading) setClassToLeave(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Leave &ldquo;{classToLeave.className}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You will lose access to all deadlines, announcements, and materials for this class. You will need to request access again or enter the class code to re-join.
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
                onClick={() => setClassToLeave(null)}
                disabled={actionLoading}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveClass}
                disabled={actionLoading}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading ? 'Leaving...' : 'Confirm Leave Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Cancel Join Request */}
      {requestToCancel && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionLoading) setRequestToCancel(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Cancel Join Request?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cancel your pending request to join &ldquo;{requestToCancel.classId?.className || 'this class'}&rdquo;?
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
                onClick={() => setRequestToCancel(null)}
                disabled={actionLoading}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={actionLoading}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
