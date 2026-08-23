import React, { useState, useEffect, useMemo } from 'react';
import { DeadlineCard } from './DeadlineCard';
import { AnnouncementCard } from './AnnouncementCard';
import { SectionHeader } from './ui/SectionHeader';
import { MOCK_DEADLINES, MOCK_ANNOUNCEMENTS } from '../data/mockData';
import { getDeadlineStatus } from '../utils/deadlineStatus';

// ── EH-009: greeting based on current hour ────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function StudentDashboard() {
  // ── EH-009: useEffect — live greeting & document title ─────────────────────
  //
  // WHY useEffect?
  //   Reading the clock and setting document.title are SIDE EFFECTS: they
  //   interact with things outside React's render tree (the system clock and
  //   the browser tab). The correct place for side effects in React is
  //   useEffect.
  //
  // DEPENDENCY ARRAY: []
  //   Runs once on mount. We set the greeting and document title when the
  //   dashboard first loads. The cleanup resets the tab title when the user
  //   navigates away.
  //
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    // Update greeting and document title on mount
    setGreeting(getGreeting());

    const urgentCount = MOCK_DEADLINES.filter((d) => {
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
  }, []); // runs once on mount; greeting and title are time-of-day values

  // ── EH-008: derived deadline counts & sections ────────────────────────────
  const deadlineStats = useMemo(() => {
    const dueSoon  = MOCK_DEADLINES.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow';
    });

    const thisWeek = MOCK_DEADLINES.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      return s === 'today' || s === 'tomorrow' || s === 'this-week';
    });

    // Needs Attention: today, tomorrow, or high-priority approaching
    const needsAttention = MOCK_DEADLINES.filter((d) => {
      const s = getDeadlineStatus(d.dueDate);
      if (s === 'past') return false;
      if (s === 'today' || s === 'tomorrow') return true;
      if (s === 'this-week' && (d.priority === 'High' || d.priority === 'Important')) return true;
      return false;
    });

    // Upcoming: everything not past, sorted by dueDate ascending
    const upcoming = MOCK_DEADLINES
      .filter((d) => getDeadlineStatus(d.dueDate) !== 'past')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return { dueSoonCount: dueSoon.length, thisWeekCount: thisWeek.length, needsAttention, upcoming };
  }, []); // MOCK_DEADLINES is module-level constant; no deps change

  // ── EH-008: derived announcements — latest 3 (pinned first, then by time) ─
  const latestAnnouncements = useMemo(() => {
    return [...MOCK_ANNOUNCEMENTS]
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.postedAt - a.postedAt;
      })
      .slice(0, 3);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting and Class Info */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          {/* EH-009: greeting is derived from current time via useEffect + useState */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {greeting}, Neel 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what you need to know today.</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center w-fit">
          IT • Semester 5 • D15C
        </div>
      </header>

      {/* EH-008: Summary overview cards — counts are DERIVED, not hardcoded */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center">
          <span className="text-3xl font-bold text-red-500">{deadlineStats.dueSoonCount}</span>
          <span className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Due Soon</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center">
          <span className="text-3xl font-bold text-amber-500">{deadlineStats.thisWeekCount}</span>
          <span className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">This Week</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center col-span-2 sm:col-span-1">
          <span className="text-3xl font-bold text-primary-600">{MOCK_ANNOUNCEMENTS.length}</span>
          <span className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Announcements</span>
        </div>
      </div>

      {/* Main Grid Layout for Desktop/Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Needs Attention & Upcoming) */}
        <div className="lg:col-span-2 space-y-8">

          {/* EH-008: Needs Attention — derived from MOCK_DEADLINES */}
          <section>
            <SectionHeader title={`Needs Attention${deadlineStats.needsAttention.length > 0 ? ` (${deadlineStats.needsAttention.length})` : ''}`} />
            {deadlineStats.needsAttention.length > 0 ? (
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
            ) : (
              <p className="text-sm text-gray-500 py-4">Nothing urgent right now. You're all caught up!</p>
            )}
          </section>

          {/* EH-008: Upcoming Deadlines — derived & sorted from MOCK_DEADLINES */}
          <section>
            <SectionHeader title="Upcoming Deadlines" />
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
          </section>
        </div>

        {/* Right Column (Announcements) */}
        {/* EH-008: Latest Announcements — derived from MOCK_ANNOUNCEMENTS (pinned first, then recency) */}
        <div className="space-y-4">
          <SectionHeader title="Latest Announcements" />
          <div className="flex flex-col gap-4">
            {latestAnnouncements.map((a) => (
              <AnnouncementCard
                key={a.id}
                priorityText={a.priorityText}
                priorityVariant={a.priorityVariant}
                isPinned={a.isPinned}
                title={a.title}
                message={a.message}
                postedBy={a.postedBy}
                postedTime={a.postedTime}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
