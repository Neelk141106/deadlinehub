import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { classApi } from '../api/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ClassContext = createContext(null);

export function ClassProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [classes, setClasses] = useState([]);

  // Parse initial class workspace navigation from URL hash or localStorage
  const parseInitialNav = () => {
    let initialClassId = null;
    let initialTab = 'overview';

    if (typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/^#\/class\/([a-fA-F0-9]{24})(?:\/([a-zA-Z]+))?/);
      if (match) {
        initialClassId = match[1];
        if (match[2] && ['overview', 'deadlines', 'announcements', 'students', 'members'].includes(match[2].toLowerCase())) {
          initialTab = match[2].toLowerCase() === 'members' ? 'students' : match[2].toLowerCase();
        }
      }
    }

    if (!initialClassId && typeof window !== 'undefined') {
      try {
        const storedId = localStorage.getItem('deadlinehub_opened_class_id');
        const storedTab = localStorage.getItem('deadlinehub_opened_class_tab');
        if (storedId) {
          initialClassId = storedId;
          if (storedTab && ['overview', 'deadlines', 'announcements', 'students', 'members'].includes(storedTab.toLowerCase())) {
            initialTab = storedTab.toLowerCase() === 'members' ? 'students' : storedTab.toLowerCase();
          }
        }
      } catch (_e) {}
    }

    return { initialClassId, initialTab };
  };

  const initialNav = parseInitialNav();
  const [openedClassId, setOpenedClassId] = useState(initialNav.initialClassId);
  const [openedClassTab, setOpenedClassTabState] = useState(initialNav.initialTab);

  const [selectedClassId, setSelectedClassIdState] = useState(() => {
    try {
      return localStorage.getItem('deadlinehub_selected_class_id') || null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setSelectedClassId = useCallback((id) => {
    setSelectedClassIdState(id);
    try {
      if (id) {
        localStorage.setItem('deadlinehub_selected_class_id', id);
      } else {
        localStorage.removeItem('deadlinehub_selected_class_id');
      }
    } catch (_e) {}
  }, []);

  const openClassWorkspace = useCallback((classId, tab = 'overview') => {
    if (!classId) return;
    const cleanTab = tab === 'members' ? 'students' : tab;
    setOpenedClassId(classId);
    setOpenedClassTabState(cleanTab);
    try {
      localStorage.setItem('deadlinehub_opened_class_id', classId);
      localStorage.setItem('deadlinehub_opened_class_tab', cleanTab);
      if (typeof window !== 'undefined') {
        const targetHash = `#/class/${classId}/${cleanTab}`;
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
      }
    } catch (_e) {}
  }, []);

  const closeClassWorkspace = useCallback(() => {
    setOpenedClassId(null);
    setOpenedClassTabState('overview');
    try {
      localStorage.removeItem('deadlinehub_opened_class_id');
      localStorage.removeItem('deadlinehub_opened_class_tab');
      if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/class/')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (_e) {}
  }, []);

  const setOpenedClassTab = useCallback((tab) => {
    const cleanTab = tab === 'members' ? 'students' : tab;
    setOpenedClassTabState(cleanTab);
    try {
      localStorage.setItem('deadlinehub_opened_class_tab', cleanTab);
      if (openedClassId && typeof window !== 'undefined') {
        const targetHash = `#/class/${openedClassId}/${cleanTab}`;
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
      }
    } catch (_e) {}
  }, [openedClassId]);

  // Listen to browser Back/Forward navigation hashchange
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashChange = () => {
      if (!window.location.hash) {
        setOpenedClassId(null);
        setOpenedClassTabState('overview');
        try {
          localStorage.removeItem('deadlinehub_opened_class_id');
          localStorage.removeItem('deadlinehub_opened_class_tab');
        } catch (_e) {}
        return;
      }

      const match = window.location.hash.match(/^#\/class\/([a-fA-F0-9]{24})(?:\/([a-zA-Z]+))?/);
      if (match) {
        const hashId = match[1];
        const hashTab = match[2] ? (match[2] === 'members' ? 'students' : match[2]) : 'overview';
        setOpenedClassId(hashId);
        setOpenedClassTabState(hashTab);
        try {
          localStorage.setItem('deadlinehub_opened_class_id', hashId);
          localStorage.setItem('deadlinehub_opened_class_tab', hashTab);
        } catch (_e) {}
      } else if (window.location.hash.startsWith('#/class/')) {
        closeClassWorkspace();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [closeClassWorkspace]);

  const openedClassIdRef = useRef(openedClassId);
  useEffect(() => {
    openedClassIdRef.current = openedClassId;
  }, [openedClassId]);

  const selectedClassIdRef = useRef(selectedClassId);
  useEffect(() => {
    selectedClassIdRef.current = selectedClassId;
  }, [selectedClassId]);

  // Clean in-memory workspace and selection state on logout or account switch
  useEffect(() => {
    if (!user) {
      setClasses([]);
      setOpenedClassId(null);
      setOpenedClassTabState('overview');
      setSelectedClassIdState(null);
    }
  }, [user]);

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

        // Authorization check against fresh class list
        const activeOpened = openedClassIdRef.current;
        if (activeOpened) {
          const isAuthorized = res.classes.some((c) => c._id.toString() === activeOpened.toString());
          if (!isAuthorized) {
            closeClassWorkspace();
          }
        }
        const activeSelected = selectedClassIdRef.current;
        if (activeSelected) {
          const isStillValid = res.classes.some((c) => c._id.toString() === activeSelected.toString());
          if (!isStillValid) {
            setSelectedClassId(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, closeClassWorkspace, setSelectedClassId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Real-time Socket.IO listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleClassCreated = (newClass) => {
      const currentUserId = (user?._id || user?.id)?.toString();
      const teacherId = (newClass.teacherId?._id || newClass.teacherId)?.toString();
      if (user.role === 'teacher' && teacherId && currentUserId && teacherId === currentUserId) {
        setClasses((prev) => {
          if (prev.some((c) => c._id === newClass._id)) return prev;
          return [newClass, ...prev];
        });
      }
    };

    const handleStudentJoined = ({ classId, student }) => {
      const currentUserId = (user?._id || user?.id)?.toString();
      const studentIdStr = (student?._id || student)?.toString();
      if (user?.role === 'student' && currentUserId && studentIdStr === currentUserId) {
        fetchClasses();
        return;
      }
      setClasses((prev) =>
        prev.map((cls) => {
          if (cls._id === classId) {
            const alreadyHasStudent = cls.students && cls.students.some((s) => (s._id || s)?.toString() === studentIdStr);
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

    const handleClassUpdated = (updatedClass) => {
      setClasses((prev) =>
        prev.map((c) => (c._id === updatedClass._id ? updatedClass : c))
      );
    };

    const handleClassDeleted = ({ _id }) => {
      setClasses((prev) => prev.filter((c) => c._id !== _id));
      setSelectedClassId((current) => (current === _id ? null : current));
      if (openedClassId && openedClassId.toString() === _id.toString()) {
        closeClassWorkspace();
      }
    };

    const handleStudentLeft = ({ classId, studentId }) => {
      const currentUserId = user?._id || user?.id;
      if (currentUserId && currentUserId.toString() === (studentId?._id || studentId)?.toString()) {
        setClasses((prev) => prev.filter((c) => c._id !== classId));
        setSelectedClassId((current) => (current === classId ? null : current));
        if (openedClassId && openedClassId.toString() === classId.toString()) {
          closeClassWorkspace();
        }
      } else {
        setClasses((prev) =>
          prev.map((cls) => {
            if (cls._id === classId) {
              return {
                ...cls,
                students: (cls.students || []).filter((s) => (s._id || s)?.toString() !== (studentId?._id || studentId)?.toString()),
              };
            }
            return cls;
          })
        );
      }
    };

    const handleStudentRemoved = ({ classId, studentId }) => {
      const currentUserId = user?._id || user?.id;
      if (currentUserId && currentUserId.toString() === (studentId?._id || studentId)?.toString()) {
        setClasses((prev) => prev.filter((c) => c._id !== classId));
        setSelectedClassId((current) => (current === classId ? null : current));
        if (openedClassId && openedClassId.toString() === classId.toString()) {
          closeClassWorkspace();
        }
      } else {
        setClasses((prev) =>
          prev.map((cls) => {
            if (cls._id === classId) {
              return {
                ...cls,
                students: (cls.students || []).filter((s) => (s._id || s)?.toString() !== (studentId?._id || studentId)?.toString()),
              };
            }
            return cls;
          })
        );
      }
    };

    const handleJoinRequestApproved = (request) => {
      fetchClasses();
      if (socket && request) {
        const approvedClassId = (request.classId?._id || request.classId)?.toString();
        if (approvedClassId) {
          socket.emit('join:class', { classId: approvedClassId });
        }
      }
    };

    socket.on('class:created', handleClassCreated);
    socket.on('class:updated', handleClassUpdated);
    socket.on('class:student-joined', handleStudentJoined);
    socket.on('class:student-left', handleStudentLeft);
    socket.on('class:student-removed', handleStudentRemoved);
    socket.on('class:left', ({ classId }) => {
      setClasses((prev) => prev.filter((c) => c._id !== classId));
      setSelectedClassId((current) => (current === classId ? null : current));
      if (openedClassId && openedClassId.toString() === classId.toString()) {
        closeClassWorkspace();
      }
    });
    socket.on('class:deleted', handleClassDeleted);
    socket.on('join-request:approved', handleJoinRequestApproved);

    return () => {
      socket.off('class:created', handleClassCreated);
      socket.off('class:updated', handleClassUpdated);
      socket.off('class:student-joined', handleStudentJoined);
      socket.off('class:student-left', handleStudentLeft);
      socket.off('class:student-removed', handleStudentRemoved);
      socket.off('class:left');
      socket.off('class:deleted', handleClassDeleted);
      socket.off('join-request:approved', handleJoinRequestApproved);
    };
  }, [socket, user, fetchClasses, openedClassId, closeClassWorkspace, setSelectedClassId]);

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
      if (res && res.requiresApproval) {
        return res;
      }
      if (res && res.class) {
        setClasses((prev) => {
          if (prev.some((c) => c._id === res.class._id)) return prev;
          return [res.class, ...prev];
        });
        return res.class;
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateClass = async (id, classData) => {
    setError(null);
    try {
      const res = await classApi.update(id, classData);
      if (res && res.class) {
        setClasses((prev) => prev.map((c) => (c._id === id ? res.class : c)));
        return res.class;
      }
      throw new Error(res.message || 'Failed to update class');
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
      if (openedClassId && openedClassId.toString() === id.toString()) {
        closeClassWorkspace();
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const leaveClass = async (id) => {
    setError(null);
    try {
      const res = await classApi.leave(id);
      setClasses((prev) => prev.filter((c) => c._id !== id));
      if (selectedClassId === id) {
        setSelectedClassId(null);
      }
      if (openedClassId && openedClassId.toString() === id.toString()) {
        closeClassWorkspace();
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeStudent = async (classId, studentId) => {
    setError(null);
    try {
      const res = await classApi.removeStudent(classId, studentId);
      if (res && res.class) {
        setClasses((prev) => prev.map((c) => (c._id === classId ? res.class : c)));
      } else {
        setClasses((prev) =>
          prev.map((c) => {
            if (c._id !== classId) return c;
            return {
              ...c,
              students: (c.students || []).filter((s) => (s._id || s)?.toString() !== studentId?.toString()),
            };
          })
        );
      }
      return res;
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
        openedClassId,
        setOpenedClassId,
        openedClassTab,
        setOpenedClassTab,
        openClassWorkspace,
        closeClassWorkspace,
        loading,
        error,
        fetchClasses,
        createClass,
        updateClass,
        joinClass,
        deleteClass,
        leaveClass,
        removeStudent,
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
