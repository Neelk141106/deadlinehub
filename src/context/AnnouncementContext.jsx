import React, { createContext, useContext, useState, useEffect } from 'react';
import { announcementApi } from '../api/api';

const AnnouncementContext = createContext();

export function AnnouncementProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await announcementApi.getAll();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const addAnnouncement = async (newAnnouncement) => {
    try {
      const created = await announcementApi.create(newAnnouncement);
      setAnnouncements((prev) => [created, ...prev]);
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
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id || a._id === id ? updated : a))
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
      setAnnouncements((prev) => prev.filter((a) => a.id !== id && a._id !== id));
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
