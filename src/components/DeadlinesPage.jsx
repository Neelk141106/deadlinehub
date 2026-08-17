import React from 'react';
import { PageHeader } from './ui/PageHeader';
import { Input } from './ui/Input';
import { DeadlineCard } from './DeadlineCard';

export function DeadlinesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader 
        title="Deadlines" 
        description="Keep track of everything that's coming up." 
      />

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <Input 
            type="text" 
            placeholder="Search by title or subject..." 
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]">
            <option value="">Status: All</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <select className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]">
            <option value="">Subject: All</option>
            <option value="aoa">Analysis of Algorithms</option>
            <option value="fsd">Full Stack Development</option>
            <option value="dw">Data Warehousing</option>
            <option value="cc">Cloud Computing</option>
            <option value="mp">Mini Project</option>
          </select>
          <select className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]">
            <option value="">Type: All</option>
            <option value="assignment">Assignment</option>
            <option value="experiment">Experiment</option>
            <option value="practical">Practical</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
          </select>
          <select className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]">
            <option value="">Priority: All</option>
            <option value="high">High</option>
            <option value="important">Important</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Deadlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DeadlineCard
          urgency="DUE TODAY"
          urgencyVariant="urgent"
          subject="Mini Project"
          title="Project Review"
          dateTime="Today • 4:00 PM"
          priority="High"
        />
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
        <DeadlineCard
          urgency="UPCOMING"
          urgencyVariant="normal"
          subject="Data Warehousing"
          title="Practical Submission"
          dateTime="22 Aug • 11:59 PM"
          priority="Normal"
        />
        <DeadlineCard
          urgency="UPCOMING"
          urgencyVariant="normal"
          subject="Cloud Computing"
          title="Quiz"
          dateTime="24 Aug • 10:00 AM"
          priority="Normal"
        />
      </div>
    </div>
  );
}
