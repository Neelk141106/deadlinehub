import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnnouncementProvider } from './AnnouncementContext';
import { NotificationProvider } from './NotificationContext';
import { ClassProvider } from './ClassContext';
import { deadlineApi } from '../api/api';
import { useSocket } from './SocketContext';

const DeadlineContext = createContext();

export function DeadlineProvider({ children }) {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deadlineApi.getAll();
      setDeadlines(data);
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
      setError(err.message || 'Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  // Real-time Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (deadline) => {
      setDeadlines((prev) => {
        // Deduplicate: skip if this _id is already in state (e.g. initiating teacher tab)
        const exists = prev.some((d) => d._id === deadline._id);
        if (exists) return prev;
        return [deadline, ...prev];
      });
    };

    const handleUpdated = (deadline) => {
      setDeadlines((prev) =>
        prev.map((d) => (d._id === deadline._id ? deadline : d))
      );
    };

    const handleDeleted = ({ _id }) => {
      setDeadlines((prev) => prev.filter((d) => d._id !== _id));
    };

    socket.on('deadline:created', handleCreated);
    socket.on('deadline:updated', handleUpdated);
    socket.on('deadline:deleted', handleDeleted);

    return () => {
      socket.off('deadline:created', handleCreated);
      socket.off('deadline:updated', handleUpdated);
      socket.off('deadline:deleted', handleDeleted);
    };
  }, [socket]);

  const addDeadline = async (newDeadline) => {
    try {
      const created = await deadlineApi.create(newDeadline);
      // Add to local state immediately (socket will deduplicate)
      setDeadlines((prev) => [created, ...prev]);
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
      setDeadlines((prev) =>
        prev.map((d) => (d.id === id || d._id === id ? updated : d))
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
      setDeadlines((prev) => prev.filter((d) => d.id !== id && d._id !== id));
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

