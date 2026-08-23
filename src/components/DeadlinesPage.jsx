import React, { useState, useMemo } from 'react';
import { PageHeader } from './ui/PageHeader';
import { Input } from './ui/Input';
import { DeadlineCard } from './DeadlineCard';
import { getDeadlineStatus } from '../utils/deadlineStatus';

export function DeadlinesPage() {
  // --- State ---
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter]       = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // --- Mock dates (relative to today so urgency is always demonstrable) ---
  const dates = useMemo(() => {
    const today = new Date();
    const addDays = (d) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
    return {
      today:    today.toISOString(),
      tomorrow: addDays(1).toISOString(),
      in3Days:  addDays(3).toISOString(),
      nextWeek: addDays(7).toISOString(),
      in10Days: addDays(10).toISOString(),
      past:     addDays(-2).toISOString(),
    };
  }, []);

  // --- Mock deadline data (includes type field for Type filter) ---
  const allDeadlines = useMemo(() => [
    { id: 1, dueDate: dates.today,    subject: 'Mini Project',             title: 'Project Review',        type: 'project',    priority: 'High' },
    { id: 2, dueDate: dates.tomorrow, subject: 'Analysis of Algorithms',   title: 'Assignment 2',          type: 'assignment', priority: 'High' },
    { id: 3, dueDate: dates.in3Days,  subject: 'Full Stack Development',   title: 'Experiment 4',          type: 'experiment', priority: 'Important' },
    { id: 4, dueDate: dates.nextWeek, subject: 'Data Warehousing',         title: 'Practical Submission',  type: 'practical',  priority: 'Normal' },
    { id: 5, dueDate: dates.in10Days, subject: 'Cloud Computing',          title: 'Quiz',                  type: 'quiz',       priority: 'Normal' },
    { id: 6, dueDate: dates.past,     subject: 'Full Stack Development',   title: 'Experiment 3',          type: 'experiment', priority: 'Normal' },
  ], [dates]);

  // --- Combined filter logic ---
  const filteredDeadlines = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return allDeadlines.filter((deadline) => {
      // 1. Search: title or subject
      if (query && !deadline.title.toLowerCase().includes(query) && !deadline.subject.toLowerCase().includes(query)) {
        return false;
      }

      // 2. Status filter: compare against calculated status string
      if (statusFilter) {
        const status = getDeadlineStatus(deadline.dueDate);
        if (status !== statusFilter) return false;
      }

      // 3. Subject filter
      if (subjectFilter && deadline.subject !== subjectFilter) return false;

      // 4. Type filter
      if (typeFilter && deadline.type !== typeFilter) return false;

      // 5. Priority filter (case-insensitive comparison)
      if (priorityFilter && deadline.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;

      return true;
    });
  }, [allDeadlines, searchQuery, statusFilter, subjectFilter, typeFilter, priorityFilter]);

  // --- Render ---
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status */}
          <select
            className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status: All</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          {/* Subject */}
          <select
            className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">Subject: All</option>
            <option value="Analysis of Algorithms">Analysis of Algorithms</option>
            <option value="Full Stack Development">Full Stack Development</option>
            <option value="Data Warehousing">Data Warehousing</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="Mini Project">Mini Project</option>
          </select>

          {/* Type */}
          <select
            className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Type: All</option>
            <option value="assignment">Assignment</option>
            <option value="experiment">Experiment</option>
            <option value="practical">Practical</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
          </select>

          {/* Priority */}
          <select
            className="input-field bg-gray-50 border-gray-200 py-2 px-3 text-sm flex-1 min-w-[140px]"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Priority: All</option>
            <option value="High">High</option>
            <option value="Important">Important</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Deadlines Grid */}
      {filteredDeadlines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              dueDate={deadline.dueDate}
              subject={deadline.subject}
              title={deadline.title}
              priority={deadline.priority}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No deadlines found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
