import React from 'react';
import { Badge } from './ui/Badge';
import { useDeadlineUrgency } from '../hooks/useDeadlineUrgency';

export function DeadlineCard({
  dueDate,
  subject,
  title,
  priority
}) {
  const { text: urgencyText, variant: urgencyVariant } = useDeadlineUrgency(dueDate);
  
  const dateObj = new Date(dueDate);
  const dateTimeDisplay = `${dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

  const borderColors = {
    urgent: 'border-l-red-500',
    approaching: 'border-l-amber-400',
    normal: 'border-l-primary-500',
    past: 'border-l-slate-300 dark:border-l-slate-600'
  };

  const borderColorClass = borderColors[urgencyVariant] || 'border-l-transparent';

  return (
    <div className={`card-hover p-4 sm:p-5 border-l-4 ${borderColorClass}`}>
      <div className="flex flex-col gap-3">
        {/* 1. Urgency */}
        <div>
          <Badge variant={urgencyVariant}>{urgencyText}</Badge>
        </div>
        
        {/* 2 & 3. Subject and Title */}
        <div>
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">{subject}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{title}</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* 4. Due date/time */}
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-slate-400 dark:text-slate-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {dateTimeDisplay}
          </div>
          
          {/* 5. Priority */}
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center bg-slate-50 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
            <span className="font-semibold mr-1">Priority:</span> {priority}
          </div>
        </div>
      </div>
    </div>
  );
}
