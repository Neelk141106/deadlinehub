import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AnnouncementProvider } from './AnnouncementContext';
import { NotificationProvider } from './NotificationContext';
import { ClassProvider } from './ClassContext';
import { deadlineApi } from '../api/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const DeadlineContext = createContext();

export function DeadlineProvider({ children }) {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();

  const getCanonicalId = (item) => (item?._id || item?.id || '')?.toString();

  const fetchDeadlines = useCallback(async () => {
    if (!user) {
      setDeadlines([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await deadlineApi.getAll();
      const seen = new Set();
      const unique = [];
      for (const d of (Array.isArray(data) ? data : [])) {
        const id = getCanonicalId(d);
        if (id && !seen.has(id)) {
          seen.add(id);
          unique.push(d);
        } else if (!id) {
          unique.push(d);
        }
      }
      setDeadlines(unique);
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
      setError(err.message || 'Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  // Real-time Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (deadline) => {
      const incomingId = getCanonicalId(deadline);
      if (!incomingId) return;

      setDeadlines((prev) => {
        const exists = prev.some((d) => getCanonicalId(d) === incomingId);
        if (exists) {
          return prev.map((d) => (getCanonicalId(d) === incomingId ? { ...d, ...deadline, id: incomingId } : d));
        }
        return [{ ...deadline, id: incomingId }, ...prev];
      });
    };

    const handleUpdated = (deadline) => {
      const incomingId = getCanonicalId(deadline);
      setDeadlines((prev) =>
        prev.map((d) => (getCanonicalId(d) === incomingId ? { ...d, ...deadline, id: incomingId } : d))
      );
    };

    const handleDeleted = ({ _id }) => {
      const deletedId = (_id || '').toString();
      setDeadlines((prev) => prev.filter((d) => getCanonicalId(d) !== deletedId));
    };

    const handleMembershipChanged = () => {
      fetchDeadlines();
    };

    socket.on('deadline:created', handleCreated);
    socket.on('deadline:updated', handleUpdated);
    socket.on('deadline:deleted', handleDeleted);
    socket.on('class:student-joined', handleMembershipChanged);
    socket.on('class:student-left', handleMembershipChanged);
    socket.on('class:student-removed', handleMembershipChanged);
    socket.on('class:left', handleMembershipChanged);
    socket.on('class:deleted', handleMembershipChanged);
    socket.on('join-request:approved', handleMembershipChanged);

    return () => {
      socket.off('deadline:created', handleCreated);
      socket.off('deadline:updated', handleUpdated);
      socket.off('deadline:deleted', handleDeleted);
      socket.off('class:student-joined', handleMembershipChanged);
      socket.off('class:student-left', handleMembershipChanged);
      socket.off('class:student-removed', handleMembershipChanged);
      socket.off('class:left', handleMembershipChanged);
      socket.off('class:deleted', handleMembershipChanged);
      socket.off('join-request:approved', handleMembershipChanged);
    };
  }, [socket]);

  const addDeadline = async (newDeadline) => {
    try {
      const created = await deadlineApi.create(newDeadline);
      const createdId = getCanonicalId(created);
      setDeadlines((prev) => {
        if (!createdId) return [created, ...prev];
        const exists = prev.some((d) => getCanonicalId(d) === createdId);
        if (exists) {
          return prev.map((d) => (getCanonicalId(d) === createdId ? created : d));
        }
        return [created, ...prev];
      });
      return created;
    } catch (err) {
      console.error('Failed to add deadline:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateDeadline = async (id, updatedFields) => {
    try {
      const updated = await deadlineApi.update(id, updatedFields);
      const updatedId = (id || '').toString();
      setDeadlines((prev) =>
        prev.map((d) => (getCanonicalId(d) === updatedId ? updated : d))
      );
      return updated;
    } catch (err) {
      console.error('Failed to update deadline:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteDeadline = async (id) => {
    try {
      await deadlineApi.delete(id);
      const deleteId = (id || '').toString();
      setDeadlines((prev) => prev.filter((d) => getCanonicalId(d) !== deleteId));
    } catch (err) {
      console.error('Failed to delete deadline:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeDeadline = (id) => {
    return deleteDeadline(id);
  };

  return (
    <DeadlineContext.Provider
      value={{
        deadlines,
        loading,
        error,
        fetchDeadlines,
        addDeadline,
        updateDeadline,
        deleteDeadline,
        removeDeadline,
      }}
    >
      <ClassProvider>
        <AnnouncementProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AnnouncementProvider>
      </ClassProvider>
    </DeadlineContext.Provider>
  );
}

export function useDeadlines() {
  const context = useContext(DeadlineContext);
  if (!context) {
    throw new Error('useDeadlines must be used within a DeadlineProvider');
  }
  return context;
}

export default DeadlineContext;

