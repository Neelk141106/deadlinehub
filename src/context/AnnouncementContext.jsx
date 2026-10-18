import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { announcementApi } from '../api/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const AnnouncementContext = createContext();

export function AnnouncementProvider({ children }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();

  const getCanonicalId = (item) => (item?._id || item?.id || '')?.toString();

  const fetchAnnouncements = useCallback(async () => {
    if (!user) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await announcementApi.getAll();
      const seen = new Set();
      const unique = [];
      for (const a of (Array.isArray(data) ? data : [])) {
        const id = getCanonicalId(a);
        if (id && !seen.has(id)) {
          seen.add(id);
          unique.push(a);
        } else if (!id) {
          unique.push(a);
        }
      }
      setAnnouncements(unique);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Real-time Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (announcement) => {
      const incomingId = getCanonicalId(announcement);
      if (!incomingId) return;

      setAnnouncements((prev) => {
        const exists = prev.some((a) => getCanonicalId(a) === incomingId);
        if (exists) {
          return prev.map((a) => (getCanonicalId(a) === incomingId ? { ...a, ...announcement, id: incomingId } : a));
        }
        return [{ ...announcement, id: incomingId }, ...prev];
      });
    };

    const handleUpdated = (announcement) => {
      const incomingId = getCanonicalId(announcement);
      setAnnouncements((prev) =>
        prev.map((a) => (getCanonicalId(a) === incomingId ? { ...a, ...announcement, id: incomingId } : a))
      );
    };

    const handleDeleted = ({ _id }) => {
      const deletedId = (_id || '').toString();
      setAnnouncements((prev) => prev.filter((a) => getCanonicalId(a) !== deletedId));
    };

    const handleMembershipChanged = () => {
      fetchAnnouncements();
    };

    socket.on('announcement:created', handleCreated);
    socket.on('announcement:updated', handleUpdated);
    socket.on('announcement:deleted', handleDeleted);
    socket.on('class:student-joined', handleMembershipChanged);
    socket.on('class:student-left', handleMembershipChanged);
    socket.on('class:student-removed', handleMembershipChanged);
    socket.on('class:left', handleMembershipChanged);
    socket.on('class:deleted', handleMembershipChanged);
    socket.on('join-request:approved', handleMembershipChanged);

    return () => {
      socket.off('announcement:created', handleCreated);
      socket.off('announcement:updated', handleUpdated);
      socket.off('announcement:deleted', handleDeleted);
      socket.off('class:student-joined', handleMembershipChanged);
      socket.off('class:student-left', handleMembershipChanged);
      socket.off('class:student-removed', handleMembershipChanged);
      socket.off('class:left', handleMembershipChanged);
      socket.off('class:deleted', handleMembershipChanged);
      socket.off('join-request:approved', handleMembershipChanged);
    };
  }, [socket]);

  const addAnnouncement = async (newAnnouncement) => {
    try {
      const created = await announcementApi.create(newAnnouncement);
      const createdId = getCanonicalId(created);
      setAnnouncements((prev) => {
        if (!createdId) return [created, ...prev];
        const exists = prev.some((a) => getCanonicalId(a) === createdId);
        if (exists) {
          return prev.map((a) => (getCanonicalId(a) === createdId ? created : a));
        }
        return [created, ...prev];
      });
      return created;
    } catch (err) {
      console.error('Failed to add announcement:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateAnnouncement = async (id, updatedFields) => {
    try {
      const updated = await announcementApi.update(id, updatedFields);
      const updatedId = (id || '').toString();
      setAnnouncements((prev) =>
        prev.map((a) => (getCanonicalId(a) === updatedId ? updated : a))
      );
      return updated;
    } catch (err) {
      console.error('Failed to update announcement:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await announcementApi.delete(id);
      const deleteId = (id || '').toString();
      setAnnouncements((prev) => prev.filter((a) => getCanonicalId(a) !== deleteId));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeAnnouncement = (id) => {
    return deleteAnnouncement(id);
  };

  const togglePin = async (id) => {
    try {
      const target = announcements.find((a) => a.id === id || a._id === id);
      if (!target) return;
      const updated = await announcementApi.update(id, { isPinned: !target.isPinned });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id || a._id === id ? updated : a))
      );
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      setError(err.message);
    }
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        loading,
        error,
        fetchAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        removeAnnouncement,
        togglePin,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
}

export default AnnouncementContext;

