import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const processedKeysRef = useRef(new Set());

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(({ type, action, title, message }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = {
      id,
      type, // 'deadline' | 'announcement'
      action, // 'created' | 'updated' | 'deleted'
      title,
      message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 4000);

    return id;
  }, [removeNotification]);

  // Listen to Socket.IO real-time events for activity notifications
  useEffect(() => {
    if (!socket) return;

    const handleEvent = (eventKey, type, action, title, message) => {
      // Prevent duplicate notifications for the exact same event
      if (processedKeysRef.current.has(eventKey)) return;
      processedKeysRef.current.add(eventKey);

      // Clean up key after 5 seconds
      setTimeout(() => {
        processedKeysRef.current.delete(eventKey);
      }, 5000);

      addNotification({ type, action, title, message });
    };

    const onDeadlineCreated = (deadline) => {
      const eventKey = `deadline:created:${deadline._id || deadline.id}`;
      handleEvent(eventKey, 'deadline', 'created', 'New deadline added', deadline.title);
    };

    const onDeadlineUpdated = (deadline) => {
      const eventKey = `deadline:updated:${deadline._id || deadline.id}:${deadline.updatedAt || Date.now()}`;
      handleEvent(eventKey, 'deadline', 'updated', 'Deadline updated', deadline.title);
    };

    const onDeadlineDeleted = ({ _id }) => {
      const eventKey = `deadline:deleted:${_id}`;
      handleEvent(eventKey, 'deadline', 'deleted', 'Deadline removed', 'A deadline was deleted');
    };

    const onAnnouncementCreated = (announcement) => {
      const eventKey = `announcement:created:${announcement._id || announcement.id}`;
      handleEvent(eventKey, 'announcement', 'created', 'Announcement added', announcement.title);
    };

    const onAnnouncementUpdated = (announcement) => {
      const eventKey = `announcement:updated:${announcement._id || announcement.id}:${announcement.updatedAt || Date.now()}`;
      handleEvent(eventKey, 'announcement', 'updated', 'Announcement updated', announcement.title);
    };

    const onAnnouncementDeleted = ({ _id }) => {
      const eventKey = `announcement:deleted:${_id}`;
      handleEvent(eventKey, 'announcement', 'deleted', 'Announcement removed', 'An announcement was deleted');
    };

    socket.on('deadline:created', onDeadlineCreated);
    socket.on('deadline:updated', onDeadlineUpdated);
    socket.on('deadline:deleted', onDeadlineDeleted);
    socket.on('announcement:created', onAnnouncementCreated);
    socket.on('announcement:updated', onAnnouncementUpdated);
    socket.on('announcement:deleted', onAnnouncementDeleted);

    return () => {
      socket.off('deadline:created', onDeadlineCreated);
      socket.off('deadline:updated', onDeadlineUpdated);
      socket.off('deadline:deleted', onDeadlineDeleted);
      socket.off('announcement:created', onAnnouncementCreated);
      socket.off('announcement:updated', onAnnouncementUpdated);
      socket.off('announcement:deleted', onAnnouncementDeleted);
    };
  }, [socket, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
      <NotificationToasts
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

function NotificationToasts({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full sm:w-80 pointer-events-none"
    >
      {notifications.map((item) => (
        <NotificationToastItem key={item.id} notification={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function NotificationToastItem({ notification, onDismiss }) {
  const isDeadline = notification.type === 'deadline';
  const isDeleted = notification.action === 'deleted';

  // Badge/icon styling based on event type
  let badgeClasses = 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/70 dark:border-primary-900/50';
  if (isDeleted) {
    badgeClasses = 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/70 dark:border-red-900/50';
  } else if (!isDeadline) {
    badgeClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50';
  }

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-[#151C2C] text-slate-900 dark:text-slate-100 rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
      role="status"
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg shrink-0 ${badgeClasses}`}>
        {isDeadline ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {notification.message}
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
