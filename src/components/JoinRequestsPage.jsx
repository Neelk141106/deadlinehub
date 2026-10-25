import React, { useState, useEffect, useCallback } from 'react';
import { joinRequestApi } from '../api/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export function JoinRequestsPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null); // id of request currently being approved/rejected
  const [tab, setTab] = useState('pending'); // 'pending' | 'history'
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await joinRequestApi.getPending();
      if (data && data.success) {
        setPendingCount(data.requests ? data.requests.length : 0);
      }
    } catch {
      // ignore count fetch failure
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const data = tab === 'pending'
        ? await joinRequestApi.getPending()
        : await joinRequestApi.getHistory();
      if (data && data.success) {
        setRequests(data.requests || []);
        if (tab === 'pending') {
          setPendingCount(data.requests ? data.requests.length : 0);
        }
      }
    } catch (err) {
      console.error('Failed to load join requests:', err);
      setError(err.message || 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  }, [user, tab]);

  useEffect(() => {
    fetchRequests();
    fetchPendingCount();
  }, [fetchRequests, fetchPendingCount]);

  // Real-time updates when new join requests arrive or are reviewed
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewRequest = (newReq) => {
      setPendingCount((prev) => prev + 1);
      setRequests((prev) => {
        if (prev.some((r) => r._id === newReq._id)) return prev;
        if (tab === 'pending' && newReq.status !== 'pending') return prev;
        if (tab === 'pending') return [newReq, ...prev];
        return prev;
      });
    };

    const handleRequestUpdated = (updatedReq) => {
      if (updatedReq.status !== 'pending') {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
      setRequests((prev) => {
        if (tab === 'pending') {
          return prev.filter((r) => r._id !== updatedReq._id);
        }
        if (updatedReq.status === 'cancelled') {
          return prev.filter((r) => r._id !== updatedReq._id);
        }
        const exists = prev.some((r) => r._id === updatedReq._id);
        if (exists) {
          return prev.map((r) => (r._id === updatedReq._id ? updatedReq : r));
        }
        return [updatedReq, ...prev];
      });
    };

    socket.on('join-request:created', handleNewRequest);
    socket.on('join-request:updated', handleRequestUpdated);

    return () => {
      socket.off('join-request:created', handleNewRequest);
      socket.off('join-request:updated', handleRequestUpdated);
    };
  }, [socket, user, tab]);

  const handleApprove = async (requestId) => {
    if (actionInProgress) return;
    setActionInProgress(requestId);
    setError('');
    setSuccessMessage('');

    try {
      const res = await joinRequestApi.approve(requestId);
      if (res && res.success) {
        setPendingCount((prev) => Math.max(0, prev - 1));
        if (tab === 'pending') {
          setRequests((prev) => prev.filter((r) => r._id !== requestId));
        } else {
          setRequests((prev) =>
            prev.map((r) => (r._id === requestId ? { ...r, status: 'approved' } : r))
          );
        }
        setSuccessMessage('Join request approved! Student enrolled successfully.');
        setTimeout(() => setSuccessMessage(''), 3500);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (requestId) => {
    if (actionInProgress) return;
    setActionInProgress(requestId);
    setError('');
    setSuccessMessage('');

    try {
      const res = await joinRequestApi.reject(requestId);
      if (res && res.success) {
        setPendingCount((prev) => Math.max(0, prev - 1));
        if (tab === 'pending') {
          setRequests((prev) => prev.filter((r) => r._id !== requestId));
        } else {
          setRequests((prev) =>
            prev.map((r) => (r._id === requestId ? { ...r, status: 'rejected' } : r))
          );
        }
        setSuccessMessage('Join request rejected.');
        setTimeout(() => setSuccessMessage(''), 3500);
      }
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Join Requests
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review and approve students requesting access to your classes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
            tab === 'pending'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span>Pending Requests</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            tab === 'history'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          All History
        </button>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer ml-3 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchRequests}
            className="underline font-semibold hover:text-red-700 ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="card overflow-hidden">
        {/* Header Summary */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            {tab === 'pending' ? 'Pending Review' : 'Join Requests History'}
          </h2>
          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40">
            {tab === 'pending' ? `${requests.length} Pending` : `${requests.length} Total`}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Loading requests from database...
            </p>
          </div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800/60 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {tab === 'pending' ? 'No pending join requests' : 'No join requests history'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {tab === 'pending'
                ? 'When students enter your class codes or submit join requests, they will appear here for your approval.'
                : 'No approved or rejected join requests recorded yet.'}
            </p>
          </div>
        ) : (
          /* List of Real Requests */
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {requests.map((req) => {
              const student = req.studentId || {};
              const targetClass = req.classId || {};
              const studentName = student.name || 'Student';
              const isProcessing = actionInProgress === req._id;

              const classLabel = [
                targetClass.department,
                targetClass.semester,
                targetClass.division,
              ].filter(Boolean).join(' • ') || targetClass.className || 'Class';

              return (
                <div
                  key={req._id}
                  className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Student Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {studentName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {studentName}
                        </h3>
                        {req.status === 'approved' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40">
                            Approved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40">
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                        <p className="truncate">{student.email || 'No email provided'}</p>
                        {student.studentCode && (
                          <p>
                            Student Code:{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {student.studentCode}
                            </span>
                          </p>
                        )}
                        <p className="inline-flex items-center gap-1.5 mt-1 text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-950/60 border border-primary-200/50 dark:border-primary-900/40 px-2 py-0.5 rounded-md text-[11px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          <span>{targetClass.className} ({targetClass.classCode || 'Code'})</span>
                          {classLabel && <span className="opacity-75">• {classLabel}</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Pending Requests */}
                  {req.status === 'pending' && (
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReject(req._id)}
                        disabled={isProcessing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 min-h-[44px] bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-xs py-2 px-3.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(req._id)}
                        disabled={isProcessing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 min-h-[44px] bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                        <span>{isProcessing ? 'Processing...' : 'Approve'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinRequestsPage;
