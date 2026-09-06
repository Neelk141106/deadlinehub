import React, { useState, useEffect, useMemo } from 'react';
import { DeadlineCard } from './DeadlineCard';
import { AnnouncementCard } from './AnnouncementCard';
import { SectionHeader } from './ui/SectionHeader';
import { useDeadlines } from '../context/DeadlineContext';
import { useAnnouncements } from '../context/AnnouncementContext';
import { getDeadlineStatus } from '../utils/deadlineStatus';

// ── EH-009: greeting based on current hour ────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function StudentDashboard({ userName = 'Student' }) {
  const { deadlines } = useDeadlines();
  const { announcements } = useAnnouncements();

  // ── EH-009: useEffect — live greeting & document title ─────────────────────
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    // Update greeting and document title on mount or when deadlines change
    setGreeting(getGreeting());

    const urgentCount = deadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow';
    }).length;

    document.title = urgentCount > 0
      ? `(${urgentCount}) Urgent — DeadlineHub`
      : 'DeadlineHub';

    // Cleanup: restore default title when user leaves the dashboard
    return () => {
      document.title = 'DeadlineHub';
    };
  }, [deadlines]);

  // ── EH-008 & E3-003: derived deadline counts & sections from DeadlineContext ──────
  const deadlineStats = useMemo(() => {
    const dueSoon  = deadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow';
    });

    const thisWeek = deadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow' || s === 'this-week';
    });

    // Needs Attention: today, tomorrow, or high-priority approaching
    const needsAttention = deadlines.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      if (s === 'past') return false;
      if (s === 'today' || s === 'tomorrow') return true;
      if (s === 'this-week' && (d.priority === 'High' || d.priority === 'Important')) return true;
      return false;
    });

    // Upcoming: everything not past, sorted by dueDate ascending
    const upcoming = [...deadlines]
      .filter((d) => getDeadlineStatus(d.dueDate) !== 'past')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return { dueSoonCount: dueSoon.length, thisWeekCount: thisWeek.length, needsAttention, upcoming };
  }, [deadlines]);

  // ── EH-008 & E3-006: derived announcements from AnnouncementContext — latest 3 ─
  const latestAnnouncements = useMemo(() => {
    return [...announcements]
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const timeA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const timeB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 3);
  }, [announcements]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Greeting and Class Info */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          {/* Greeting dynamically adapts and supports user name prop */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {greeting}{userName ? `, ${userName}` : ''} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm font-normal">Here's what you need to know today.</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-900/50 px-3.5 py-1.5 rounded-xl font-semibold text-xs tracking-wide shadow-xs inline-flex items-center gap-1.5 w-fit">
          <span className="w-2 h-2 rounded-full bg-primary-500"></span>
          IT • Semester 5 • D15C
        </div>
      </header>

      {/* 3 Summary overview cards balanced across the content width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover p-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-tight">{deadlineStats.dueSoonCount}</span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Due Soon</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>

        <div className="card-hover p-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{deadlineStats.thisWeekCount}</span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">This Week</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </div>
        </div>

        <div className="card-hover p-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">{announcements.length}</span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 uppercase tracking-wider">Announcements</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Upcoming Deadlines ~ 2/3 width, Latest Announcements ~ 1/3 width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Column (2/3 width on desktop): Needs Attention & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">

          {/* Needs Attention section (only rendered when there are urgent items) */}
          {deadlineStats.needsAttention.length > 0 && (
            <section>
              <SectionHeader title={`Needs Attention (${deadlineStats.needsAttention.length})`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deadlineStats.needsAttention.map((d) => (
                  <DeadlineCard
                    key={d.id}
                    dueDate={d.dueDate}
                    subject={d.subject}
                    title={d.title}
                    priority={d.priority}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Deadlines section with polished compact empty state */}
          <section>
            <SectionHeader title="Upcoming Deadlines" />
            {deadlineStats.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deadlineStats.upcoming.map((d) => (
                  <DeadlineCard
                    key={d.id}
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
                  key={a.id}
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
    </div>
  );
}
