import React, { useState, useEffect, useMemo } from 'react';
import { DeadlineCard } from './DeadlineCard';
import { AnnouncementCard } from './AnnouncementCard';
import { SectionHeader } from './ui/SectionHeader';
import { useDeadlines } from '../context/DeadlineContext';
import { useAnnouncements } from '../context/AnnouncementContext';
import { useClasses } from '../context/ClassContext';
import { useAuth } from '../context/AuthContext';
import { JoinClass } from './JoinClass';
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
  const { classes, selectedClassId, setSelectedClassId } = useClasses();

  const [greeting, setGreeting] = useState(getGreeting());
  const [showJoinModal, setShowJoinModal] = useState(false);

  const displayName = user?.name || 'Student';

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

  // Selected class object
  const activeClass = useMemo(() => {
    return classes.find((c) => c._id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Filter deadlines by selected class if filter is active
  const filteredDeadlines = useMemo(() => {
    if (!selectedClassId) return deadlines;
    return deadlines.filter((d) => {
      if (d.classId === selectedClassId) return true;
      if (activeClass) {
        if (d.division && activeClass.division && d.division.toLowerCase() === activeClass.division.toLowerCase()) {
          return true;
        }
      }
      return false;
    });
  }, [deadlines, selectedClassId, activeClass]);

  // Filter announcements by selected class if filter is active
  const filteredAnnouncements = useMemo(() => {
    if (!selectedClassId) return announcements;
    return announcements.filter((a) => {
      if (a.classId === selectedClassId) return true;
      if (activeClass) {
        if (a.division && activeClass.division && a.division.toLowerCase() === activeClass.division.toLowerCase()) {
          return true;
        }
      }
      return false;
    });
  }, [announcements, selectedClassId, activeClass]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

          <div className="bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-900/50 px-3.5 py-1.5 rounded-xl font-semibold text-xs tracking-wide shadow-xs inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            {classes.length} {classes.length === 1 ? 'Class Enrolled' : 'Classes Enrolled'}
          </div>
        </div>
      </header>

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
              className="btn-primary text-xs font-semibold py-2 px-4 cursor-pointer inline-flex items-center gap-1.5"
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
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-500 dark:border-primary-600 shadow-sm ring-1 ring-primary-500'
                      : 'bg-white dark:bg-[#151C2C] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
                  }`}
                >
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

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">👨‍🏫 {teacherName}</span>
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                      {isSelected ? '✓ Filtering' : 'Click to filter'}
                    </span>
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
            <div className="p-3 bg-primary-50/80 dark:bg-primary-950/40 border border-primary-200/80 dark:border-primary-900/50 rounded-xl flex items-center justify-between text-xs text-primary-800 dark:text-primary-200">
              <span className="font-medium">
                Filtering by class: <span className="font-bold">{activeClass.className}</span> ({activeClass.classCode})
              </span>
              <button
                onClick={() => setSelectedClassId(null)}
                className="font-semibold underline hover:no-underline cursor-pointer"
              >
                Clear filter
              </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <JoinClass
              isModal={true}
              onClose={() => setShowJoinModal(false)}
              onSuccess={() => setShowJoinModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
