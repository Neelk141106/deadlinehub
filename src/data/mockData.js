/**
 * Shared mock data for DeadlineHub Experiment 2.
 *
 * Both the Dashboard and the Deadlines page derive from this single source,
 * so counts and cards are always consistent with each other.
 *
 * Dates are computed relative to "now" at module load time so urgency labels
 * remain demonstrable on any calendar date.
 */

const today = new Date();
const addDays = (d) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000);

export const MOCK_DEADLINES = [
  {
    id: 1,
    dueDate: today.toISOString(),          // today
    subject: 'Mini Project',
    title: 'Project Review',
    type: 'project',
    priority: 'High',
  },
  {
    id: 2,
    dueDate: addDays(1).toISOString(),     // tomorrow
    subject: 'Analysis of Algorithms',
    title: 'Assignment 2',
    type: 'assignment',
    priority: 'High',
  },
  {
    id: 3,
    dueDate: addDays(3).toISOString(),     // in 3 days
    subject: 'Full Stack Development',
    title: 'Experiment 4',
    type: 'experiment',
    priority: 'Important',
  },
  {
    id: 4,
    dueDate: addDays(7).toISOString(),     // this week boundary
    subject: 'Data Warehousing',
    title: 'Practical Submission',
    type: 'practical',
    priority: 'Normal',
  },
  {
    id: 5,
    dueDate: addDays(10).toISOString(),    // upcoming (beyond this week)
    subject: 'Cloud Computing',
    title: 'Quiz',
    type: 'quiz',
    priority: 'Normal',
  },
  {
    id: 6,
    dueDate: addDays(-2).toISOString(),    // past
    subject: 'Full Stack Development',
    title: 'Experiment 3',
    type: 'experiment',
    priority: 'Normal',
  },
];

// Announcement hours/days helpers (relative to now)
const hoursAgo = (h) => new Date(today.getTime() - h * 60 * 60 * 1000);
const daysAgo  = (d) => new Date(today.getTime() - d * 24 * 60 * 60 * 1000);

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    priorityVariant: 'urgent',
    priorityText: 'URGENT',
    isPinned: true,
    category: 'examination',
    title: 'Exam Schedule Updated',
    message: 'The final examination schedule for Semester 5 has been updated. Please review the new timetable on the university portal immediately.',
    postedBy: 'HOD IT',
    postedTime: '1 hour ago',
    postedAt: hoursAgo(1),
  },
  {
    id: 2,
    priorityVariant: 'important',
    priorityText: 'IMPORTANT',
    isPinned: true,
    category: 'academic',
    title: 'Project Review Schedule Released',
    message: 'The project review schedule for this week has been published. All groups must present their progress as per the assigned slots.',
    postedBy: 'Project Coordinator',
    postedTime: '3 hours ago',
    postedAt: hoursAgo(3),
  },
  {
    id: 3,
    priorityVariant: 'urgent',
    priorityText: 'URGENT',
    isPinned: false,
    category: 'practical',
    title: 'DBMS Practical Room Changed',
    message: "Tomorrow's practical will be conducted in Lab 405 instead of Lab 301 due to network maintenance.",
    postedBy: 'CR',
    postedTime: '5 hours ago',
    postedAt: hoursAgo(5),
  },
  {
    id: 4,
    priorityVariant: 'normal',
    priorityText: 'EVENT',
    isPinned: false,
    category: 'event',
    title: 'Guest Lecture: AI in Healthcare',
    message: "There will be a guest lecture on 'AI in Healthcare' this Friday at 2:00 PM in the Main Seminar Hall. Attendance is highly recommended.",
    postedBy: 'Dept. Coordinator',
    postedTime: 'Yesterday',
    postedAt: daysAgo(1),
  },
  {
    id: 5,
    priorityVariant: 'normal',
    priorityText: 'GENERAL',
    isPinned: false,
    category: 'general',
    title: 'Library Hours Extended',
    message: 'In view of the upcoming end-semester examinations, the central library will remain open until 10:00 PM starting next Monday.',
    postedBy: 'Librarian',
    postedTime: '2 days ago',
    postedAt: daysAgo(2),
  },
];
