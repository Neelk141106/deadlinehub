import React, { createContext, useContext, useState } from 'react';
import { MOCK_DEADLINES } from '../data/mockData';
import { AnnouncementProvider } from './AnnouncementContext';

const DeadlineContext = createContext();

export function DeadlineProvider({ children }) {
  const [deadlines, setDeadlines] = useState(MOCK_DEADLINES);
  const [userRole, setUserRole] = useState('student'); // 'student' | 'teacher'

  const addDeadline = (newDeadline) => {
    const deadlineWithId = {
      id: Date.now(),
      ...newDeadline,
    };
    setDeadlines((prev) => [deadlineWithId, ...prev]);
  };

  const updateDeadline = (id, updatedFields) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d))
    );
  };

  const deleteDeadline = (id) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  const removeDeadline = (id) => {
    deleteDeadline(id);
  };

  return (
    <DeadlineContext.Provider
      value={{
        deadlines,
        addDeadline,
        updateDeadline,
        deleteDeadline,
        removeDeadline,
        userRole,
        setUserRole,
      }}
    >
      <AnnouncementProvider>
        {children}
      </AnnouncementProvider>
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
