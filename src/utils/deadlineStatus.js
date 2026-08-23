/**
 * Pure (non-hook) deadline status calculation.
 * Returns one of: 'today' | 'tomorrow' | 'this-week' | 'upcoming' | 'past'
 * Mirrors the logic in useDeadlineUrgency so status filter values match the dropdowns.
 */
export function getDeadlineStatus(dueDateString) {
  if (!dueDateString) return 'upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDay = new Date(dueDateString);
  dueDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)  return 'past';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays <= 7)  return 'this-week';
  return 'upcoming';
}
