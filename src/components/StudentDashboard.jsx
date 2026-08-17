import React from 'react';
import { DeadlineCard } from './DeadlineCard';
import { AnnouncementCard } from './AnnouncementCard';
import { SectionHeader } from './ui/SectionHeader';

export function StudentDashboard() {
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
                urgency="DUE TOMORROW"
                urgencyVariant="urgent"
                subject="Analysis of Algorithms"
                title="Assignment 2"
                dateTime="18 Aug • 11:59 PM"
                priority="High"
              />
              <DeadlineCard
                urgency="DUE IN 3 DAYS"
                urgencyVariant="approaching"
                subject="Full Stack Development"
                title="Experiment 4"
                dateTime="20 Aug • 11:59 PM"
                priority="Important"
              />
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section>
            <SectionHeader title="Upcoming Deadlines" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DeadlineCard
                urgency="18 AUG"
                urgencyVariant="normal"
                subject="AOA"
                title="Assignment 2"
                dateTime="18 Aug • 11:59 PM"
                priority="High"
              />
              <DeadlineCard
                urgency="20 AUG"
                urgencyVariant="normal"
                subject="Full Stack Development"
                title="Experiment 4"
                dateTime="20 Aug • 11:59 PM"
                priority="Important"
              />
              <DeadlineCard
                urgency="22 AUG"
                urgencyVariant="normal"
                subject="Data Warehousing"
                title="Practical Submission"
                dateTime="22 Aug • 11:59 PM"
                priority="Normal"
              />
              <DeadlineCard
                urgency="24 AUG"
                urgencyVariant="normal"
                subject="Cloud Computing"
                title="Quiz"
                dateTime="24 Aug • 10:00 AM"
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
