import React from 'react';
import { PageHeader } from './ui/PageHeader';
import { Input } from './ui/Input';
import { AnnouncementCard } from './AnnouncementCard';

export function AnnouncementsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Announcements" 
        description="Stay updated with your class." 
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
            placeholder="Search announcements..." 
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]">
            <option value="">Category: All</option>
            <option value="academic">Academic</option>
            <option value="examination">Examination</option>
            <option value="lecture">Lecture</option>
            <option value="practical">Practical</option>
            <option value="department">Department</option>
            <option value="event">Event</option>
            <option value="general">General</option>
          </select>
          <select className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]">
            <option value="">Priority: All</option>
            <option value="urgent">Urgent</option>
            <option value="important">Important</option>
            <option value="normal">Normal</option>
          </select>
          <select className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]">
            <option value="">Date: Any time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="older">Older</option>
          </select>
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        <AnnouncementCard
          priorityVariant="urgent"
          priorityText="URGENT"
          isPinned={true}
          title="Exam Schedule Updated"
          message="The final examination schedule for Semester 5 has been updated. Please review the new timetable on the university portal immediately."
          postedBy="HOD IT"
          postedTime="1 hour ago"
        />
        <AnnouncementCard
          priorityVariant="important"
          priorityText="IMPORTANT"
          isPinned={true}
          title="Project Review Schedule Released"
          message="The project review schedule for this week has been published. All groups must present their progress as per the assigned slots."
          postedBy="Project Coordinator"
          postedTime="3 hours ago"
        />
        <AnnouncementCard
          priorityVariant="urgent"
          priorityText="URGENT"
          title="DBMS Practical Room Changed"
          message="Tomorrow's practical will be conducted in Lab 405 instead of Lab 301 due to network maintenance."
          postedBy="CR"
          postedTime="5 hours ago"
        />
        <AnnouncementCard
          priorityVariant="normal"
          priorityText="EVENT"
          title="Guest Lecture: AI in Healthcare"
          message="There will be a guest lecture on 'AI in Healthcare' this Friday at 2:00 PM in the Main Seminar Hall. Attendance is highly recommended."
          postedBy="Dept. Coordinator"
          postedTime="Yesterday"
        />
        <AnnouncementCard
          priorityVariant="normal"
          priorityText="GENERAL"
          title="Library Hours Extended"
          message="In view of the upcoming end-semester examinations, the central library will remain open until 10:00 PM starting next Monday."
          postedBy="Librarian"
          postedTime="2 days ago"
        />
      </div>
    </div>
  );
}
