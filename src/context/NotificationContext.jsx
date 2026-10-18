import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { socket, status } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const processedToastIdsRef = useRef(new Set());

  // Toast removal helper
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Toast adder helper (transient popups)
  const addToast = useCallback(({ type, action, title, message }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = {
      id,
      type: type || 'general',
      action: action || 'info',
      title,
      message,
      timestamp: new Date(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);

    return id;
  }, [removeToast]);

  // Backward-compatible aliases
  const addNotification = addToast;
  const removeNotification = removeToast;

  // Fetch persistent notifications and unread count from API
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await notificationApi.getAll({ limit: 50 });
      if (data && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch unread count directly
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await notificationApi.getUnreadCount();
      if (data && data.success) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch unread notification count:', err.message);
    }
  }, [user]);

  // Load notifications whenever authenticated user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setToasts([]);
    }
  }, [user, fetchNotifications]);

  // Refetch on socket reconnection
  useEffect(() => {
    if (user && status === 'connected') {
      fetchNotifications();
    }
  }, [user, status, fetchNotifications]);

  // Socket.IO real-time notification listener
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notif) => {
      if (!notif || !notif._id) return;

      // Prevent duplicate processing
      if (processedToastIdsRef.current.has(notif._id)) return;
      processedToastIdsRef.current.add(notif._id);
      setTimeout(() => {
        processedToastIdsRef.current.delete(notif._id);
      }, 10000);

      // Prepend to persistent notifications list
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notif._id);
        if (exists) return prev;
        return [notif, ...prev];
      });

      // Increment unread count if unread
      if (!notif.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // Display floating toast banner
      addToast({
        type: notif.type.includes('announcement') ? 'announcement' : 'deadline',
        action: notif.type.includes('reminder') ? 'reminder' : 'created',
        title: notif.title,
        message: notif.message,
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, user, addToast]);

  // Mark an individual notification as read
  const markAsRead = async (id) => {
    if (!id) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await notificationApi.markAsRead(id);
      if (res && res.success && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Revert if API failed
      fetchUnreadCount();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        fetchUnreadCount,
        addNotification,
        removeNotification,
        addToast,
        removeToast,
        toasts,
      }}
    >
      {children}
      <NotificationToasts toasts={toasts} onDismiss={removeToast} />
    </NotificationContext.Provider>
  );
}

function NotificationToasts({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full sm:w-80 pointer-events-none"
    >
      {toasts.map((item) => (
        <NotificationToastItem key={item.id} toast={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function NotificationToastItem({ toast, onDismiss }) {
  const isDeadline = toast.type === 'deadline';
  const isReminder = toast.action === 'reminder';

  let badgeClasses = 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/70 dark:border-primary-900/50';
  if (isReminder) {
    badgeClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/50';
  } else if (!isDeadline) {
    badgeClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50';
  }

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-[#151C2C] text-slate-900 dark:text-slate-100 rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
      role="status"
    >
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

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Dismiss toast"
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
