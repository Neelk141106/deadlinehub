import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationBell({ onNavigate }) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const displayedNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    return true;
  });

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }

    setIsOpen(false);

    if (onNavigate) {
      if (notif.relatedResource === 'deadline') {
        onNavigate('deadlines', notif.relatedResourceId);
      } else if (notif.relatedResource === 'announcement') {
        onNavigate('announcements', notif.relatedResourceId);
      } else if (notif.relatedResource === 'class') {
        onNavigate('classes', notif.relatedResourceId);
      }
    }
  };

  const getBadgeAndIcon = (type) => {
    switch (type) {
      case 'deadline_reminder':
        return {
          bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
          label: 'Reminder',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'announcement_created':
      case 'announcement_updated':
        return {
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
          label: 'Notice',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          ),
        };
      case 'deadline_updated':
        return {
          bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
          label: 'Updated',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
        };
      case 'deadline_created':
      default:
        return {
          bg: 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border-primary-200 dark:border-primary-900/50',
          label: 'Deadline',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary-600 rounded-full ring-2 ring-white dark:ring-[#151C2C] shadow-sm animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-14 sm:top-auto sm:mt-2 sm:w-96 bg-white dark:bg-[#151C2C] rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 border border-primary-200/50 dark:border-primary-900/40">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800/60 px-4 bg-slate-50/50 dark:bg-slate-900/30">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</p>
                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/60 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  You are all caught up on classes, deadlines, and announcements!
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const { bg, label, icon } = getBadgeAndIcon(notif.type);
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                      notif.isRead
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-80 hover:opacity-100'
                        : 'bg-primary-50/30 dark:bg-primary-950/20 hover:bg-primary-50/50 dark:hover:bg-primary-950/30'
                    }`}
                  >
                    {/* Type Icon Badge */}
                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${bg}`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <h3 className={`text-xs leading-snug truncate ${
                        notif.isRead
                          ? 'font-medium text-slate-800 dark:text-slate-200'
                          : 'font-bold text-slate-900 dark:text-slate-100'
                      }`}>
                        {notif.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                    </div>

                    {/* Right action / unread dot */}
                    <div className="flex flex-col items-center justify-between self-stretch shrink-0 pt-1">
                      {!notif.isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-500 shrink-0"
                          title="Unread"
                        />
                      )}
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 p-1 transition-opacity cursor-pointer"
                          title="Mark as read"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
