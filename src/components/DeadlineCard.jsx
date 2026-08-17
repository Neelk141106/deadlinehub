import React from 'react';
import { Badge } from './ui/Badge';

export function DeadlineCard({
  urgency,
  urgencyVariant = 'urgent', // 'urgent' | 'approaching' | 'normal' | 'past'
  subject,
  title,
  dateTime,
  priority
}) {
  const borderColors = {
    urgent: 'border-l-red-500',
    approaching: 'border-l-amber-400',
    normal: 'border-l-indigo-500',
    past: 'border-l-gray-300'
  };

  const borderColorClass = borderColors[urgencyVariant] || 'border-l-transparent';

  return (
    <div className={`card-hover p-4 sm:p-5 border-l-4 ${borderColorClass}`}>
      <div className="flex flex-col gap-3">
        {/* 1. Urgency */}
        <div>
          <Badge variant={urgencyVariant}>{urgency}</Badge>
        </div>
        
        {/* 2 & 3. Subject and Title */}
        <div>
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">{subject}</p>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1 pt-3 border-t border-gray-100">
          {/* 4. Due date/time */}
          <div className="flex items-center text-sm text-gray-600 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-gray-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {dateTime}
          </div>
          
          {/* 5. Priority */}
          <div className="text-xs text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded-md w-fit">
            <span className="font-medium mr-1">Priority:</span> {priority}
          </div>
        </div>
      </div>
    </div>
  );
}
