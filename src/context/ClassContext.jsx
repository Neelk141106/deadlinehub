import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { classApi } from '../api/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ClassContext = createContext(null);

export function ClassProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null); // null means "All Classes"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasses = useCallback(async () => {
    if (!user) {
      setClasses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await classApi.getMyClasses();
      if (res && res.classes) {
        setClasses(res.classes);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Real-time Socket.IO listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleClassCreated = (newClass) => {
      // If current user is the teacher who created it, append if not already in state
      if (user.role === 'teacher' && newClass.teacherId && (newClass.teacherId._id === user._id || newClass.teacherId === user._id)) {
        setClasses((prev) => {
          if (prev.some((c) => c._id === newClass._id)) return prev;
          return [newClass, ...prev];
        });
      }
    };

    const handleStudentJoined = ({ classId, student }) => {
      setClasses((prev) =>
        prev.map((cls) => {
          if (cls._id === classId) {
            const alreadyHasStudent = cls.students && cls.students.some((s) => s._id === student._id || s === student._id);
            if (alreadyHasStudent) return cls;
            return {
              ...cls,
              students: [...(cls.students || []), student],
            };
          }
          return cls;
        })
      );
    };

    const handleClassDeleted = ({ _id }) => {
      setClasses((prev) => prev.filter((c) => c._id !== _id));
      setSelectedClassId((current) => (current === _id ? null : current));
    };

    socket.on('class:created', handleClassCreated);
    socket.on('class:student-joined', handleStudentJoined);
    socket.on('class:deleted', handleClassDeleted);

    return () => {
      socket.off('class:created', handleClassCreated);
      socket.off('class:student-joined', handleStudentJoined);
      socket.off('class:deleted', handleClassDeleted);
    };
  }, [socket, user]);

  const createClass = async (classData) => {
    setError(null);
    try {
      const res = await classApi.create(classData);
      if (res && res.class) {
        setClasses((prev) => {
          if (prev.some((c) => c._id === res.class._id)) return prev;
          return [res.class, ...prev];
        });
        return res.class;
      }
      throw new Error(res.message || 'Failed to create class');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const joinClass = async (classCode) => {
    setError(null);
    try {
      const res = await classApi.join(classCode);
      if (res && res.class) {
        setClasses((prev) => {
          if (prev.some((c) => c._id === res.class._id)) return prev;
          return [res.class, ...prev];
        });
        return res.class;
      }
      throw new Error(res.message || 'Failed to join class');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteClass = async (id) => {
    setError(null);
    try {
      await classApi.delete(id);
      setClasses((prev) => prev.filter((c) => c._id !== id));
      if (selectedClassId === id) {
        setSelectedClassId(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        selectedClassId,
        setSelectedClassId,
        loading,
        error,
        fetchClasses,
        createClass,
        joinClass,
        deleteClass,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
}

export default ClassContext;
