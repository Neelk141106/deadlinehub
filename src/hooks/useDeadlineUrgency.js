import { useMemo } from 'react';

export function useDeadlineUrgency(dueDateString) {
  return useMemo(() => {
    if (!dueDateString) return { text: '', variant: 'normal' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateString);
    const dueDay = new Date(dueDate);
    dueDay.setHours(0, 0, 0, 0);

    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'PAST', variant: 'past' };
    }
    
    if (diffDays === 0) {
      return { text: 'DUE TODAY', variant: 'urgent' };
    }
    
    if (diffDays === 1) {
      return { text: 'DUE TOMORROW', variant: 'urgent' };
    }
    
    if (diffDays > 1 && diffDays <= 5) {
      return { text: `DUE IN ${diffDays} DAYS`, variant: 'approaching' };
    }
    
    if (diffDays > 5 && diffDays <= 7) {
      return { text: 'THIS WEEK', variant: 'approaching' };
    }
    
    const formattedDate = dueDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    }).toUpperCase();
    
    return { text: formattedDate, variant: 'normal' };
  }, [dueDateString]);
}
