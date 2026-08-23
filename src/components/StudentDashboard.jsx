import React, { useMemo } from 'react';
import { DeadlineCard } from './DeadlineCard';
import { AnnouncementCard } from './AnnouncementCard';
import { SectionHeader } from './ui/SectionHeader';

export function StudentDashboard() {
  const dates = useMemo(() => {
    const today = new Date();
    const addDays = (d) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
    
    return {
      tomorrow: addDays(1).toISOString(),
      in3Days: addDays(3).toISOString(),
      past: addDays(-1).toISOString(),
      nextWeek: addDays(7).toISOString(),
    };
  }, []);
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting and Class Info */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Good Morning, Neel 👋</h1>
          <p className="text-gray-500 mt-1">Here's what you need to know today.</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center w-fit">
          IT • Semester 5 • D15C
        </div>
      </header>

      {/* Main Grid Layout for Desktop/Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Needs Attention & Upcoming) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Needs Attention */}
          <section>
            <SectionHeader title="Needs Attention" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DeadlineCard
                dueDate={dates.tomorrow}
                subject="Analysis of Algorithms"
                title="Assignment 2"
                priority="High"
              />
              <DeadlineCard
                dueDate={dates.in3Days}
                subject="Full Stack Development"
                title="Experiment 4"
                priority="Important"
              />
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section>
            <SectionHeader title="Upcoming Deadlines" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DeadlineCard
                dueDate={dates.tomorrow}
                subject="AOA"
                title="Assignment 2"
                priority="High"
              />
              <DeadlineCard
                dueDate={dates.in3Days}
                subject="Full Stack Development"
                title="Experiment 4"
                priority="Important"
              />
              <DeadlineCard
                dueDate={dates.nextWeek}
                subject="Data Warehousing"
                title="Practical Submission"
                priority="Normal"
              />
              <DeadlineCard
                dueDate={dates.past}
                subject="Cloud Computing"
                title="Quiz"
                priority="Normal"
              />
            </div>
          </section>
        </div>

        {/* Right Column (Announcements) */}
        <div className="space-y-4">
          <SectionHeader title="Latest Announcements" />
          <div className="flex flex-col gap-4">
            <AnnouncementCard
              priorityText="URGENT"
              priorityVariant="urgent"
              isPinned={false}
              title="DBMS Practical Room Changed"
              message="Tomorrow's practical will be conducted in Lab 405 instead of Lab 301."
              postedBy="CR"
              postedTime="2 hours ago"
            />
            <AnnouncementCard
              priorityText="IMPORTANT"
              priorityVariant="important"
              isPinned={true}
              title="Project Review Schedule Released"
              message="The project review schedule for this week has been published."
              postedBy="CR"
              postedTime="Yesterday"
            />
            <AnnouncementCard
              priorityText="GENERAL"
              priorityVariant="normal"
              isPinned={false}
              title="Library Books Renewal"
              message="Please renew your library books before the end of the month to avoid late fees."
              postedBy="Admin"
              postedTime="2 days ago"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
