import React, { createContext, useContext, useState } from 'react';
import { MOCK_ANNOUNCEMENTS } from '../data/mockData';

const AnnouncementContext = createContext();

export function AnnouncementProvider({ children }) {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);

  const addAnnouncement = (newAnnouncement) => {
    const announcementWithId = {
      id: Date.now(),
      postedTime: newAnnouncement.postedTime || 'Just now',
      postedAt: newAnnouncement.postedAt || new Date(),
      isPinned: newAnnouncement.isPinned || false,
      priorityVariant: newAnnouncement.priorityVariant || (newAnnouncement.priority ? newAnnouncement.priority.toLowerCase() : 'normal'),
      priorityText: newAnnouncement.priorityText || (newAnnouncement.priority ? newAnnouncement.priority.toUpperCase() : 'NORMAL'),
      ...newAnnouncement,
    };
    setAnnouncements((prev) => [announcementWithId, ...prev]);
  };

  const updateAnnouncement = (id, updatedFields) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const removeAnnouncement = (id) => {
    deleteAnnouncement(id);
  };

  const togglePin = (id) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
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
