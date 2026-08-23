import React, { useState, useMemo } from 'react';
import { PageHeader } from './ui/PageHeader';
import { Input } from './ui/Input';
import { AnnouncementCard } from './AnnouncementCard';
import { MOCK_ANNOUNCEMENTS } from '../data/mockData';

// Helper: bucket a Date into a filter category
function getAnnouncementDateBucket(date) {
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - 7);
  const monthStart = new Date(today); monthStart.setDate(today.getDate() - 30);

  if (date >= today)       return 'today';
  if (date >= yesterday)   return 'yesterday';
  if (date >= weekStart)   return 'this-week';
  if (date >= monthStart)  return 'this-month';
  return 'older';
}

export function AnnouncementsPage() {
  const [searchQuery, setSearchQuery]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFilter, setDateFilter]         = useState('');

  const filteredAnnouncements = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return MOCK_ANNOUNCEMENTS.filter((a) => {
      // 1. Search: title or message
      if (query && !a.title.toLowerCase().includes(query) && !a.message.toLowerCase().includes(query)) {
        return false;
      }

      // 2. Category filter
      if (categoryFilter && a.category !== categoryFilter) return false;

      // 3. Priority filter: matches priorityVariant ('urgent' | 'important' | 'normal')
      if (priorityFilter && a.priorityVariant !== priorityFilter) return false;

      // 4. Date filter
      if (dateFilter && getAnnouncementDateBucket(a.postedAt) !== dateFilter) return false;

      return true;
    });
  }, [searchQuery, categoryFilter, priorityFilter, dateFilter]);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Category */}
          <select
            className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Category: All</option>
            <option value="academic">Academic</option>
            <option value="examination">Examination</option>
            <option value="lecture">Lecture</option>
            <option value="practical">Practical</option>
            <option value="department">Department</option>
            <option value="event">Event</option>
            <option value="general">General</option>
          </select>

          {/* Priority */}
          <select
            className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Priority: All</option>
            <option value="urgent">Urgent</option>
            <option value="important">Important</option>
            <option value="normal">Normal</option>
          </select>

          {/* Date */}
          <select
            className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
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
      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => (
            <AnnouncementCard
              key={a.id}
              priorityVariant={a.priorityVariant}
              priorityText={a.priorityText}
              isPinned={a.isPinned}
              title={a.title}
              message={a.message}
              postedBy={a.postedBy}
              postedTime={a.postedTime}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No announcements found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
