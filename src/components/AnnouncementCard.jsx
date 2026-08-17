import React from 'react';
import { Badge } from './ui/Badge';

export function AnnouncementCard({
  priorityVariant = 'normal', // 'urgent' | 'important' | 'normal'
  priorityText,
  isPinned = false,
  title,
  message,
  postedBy,
  postedTime
}) {
  const borderColors = {
    urgent: 'border-l-red-500',
    important: 'border-l-indigo-500',
    normal: 'border-l-gray-300'
  };

  const badgeVariant = priorityVariant === 'urgent' ? 'urgent' : (priorityVariant === 'important' ? 'normal' : 'past');
  const borderColorClass = borderColors[priorityVariant] || borderColors.normal;

  return (
    <div className={`card-hover p-4 sm:p-5 border-l-4 ${borderColorClass} flex flex-col gap-3 relative`}>
      {/* 1. Priority / Category & 6. Pinned Indicator */}
      <div className="flex items-center justify-between">
        <Badge variant={badgeVariant}>{priorityText}</Badge>
        {isPinned && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600" title="Pinned Announcement">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 9V4l1-2H7L8 4v5c0 1.12-.42 2.15-1.11 2.98l-1.63 1.96C4.69 14.62 5.11 16 6 16h5v6l1 2 1-2v-6h5c.89 0 1.31-1.38.74-2.06l-1.63-1.96C16.42 11.15 16 10.12 16 9z"/></svg>
            <span className="tracking-wide">PINNED</span>
          </div>
        )}
      </div>
      
      {/* 2 & 3. Title and Message */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1.5">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>
      
      {/* 4 & 5. Posted by and time */}
      <div className="mt-1 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500 font-medium">
        <span>Posted by {postedBy}</span>
        <span className="mx-2 text-gray-300">&bull;</span>
        <span>{postedTime}</span>
      </div>
    </div>
  );
}
