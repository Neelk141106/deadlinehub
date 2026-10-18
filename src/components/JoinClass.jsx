import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useClasses } from '../context/ClassContext';
import { useAuth } from '../context/AuthContext';
import { joinRequestApi } from '../api/api';

export function JoinClass({ onBackToHome, onSuccess, onRequestSubmitted, isModal = false, onClose }) {
  const { user } = useAuth();
  const { joinClass } = useClasses();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinedClass, setJoinedClass] = useState(null);
  const [requestSubmitted, setRequestSubmitted] = useState(null);

  const isTeacher = user && user.role === 'teacher';

  const handleDirectJoin = async (e) => {
    if (e) e.preventDefault();
    if (loading || requestLoading) return;
    setError('');

    if (isTeacher) {
      setError('Teacher accounts cannot join classes. Please sign in with a student account.');
      return;
    }

    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    setLoading(true);
    try {
      const res = await joinClass(classCode.trim().toUpperCase());
      if (res && (res.requiresApproval || res.status === 'pending')) {
        const reqObj = res.request || { classId: res.class, status: 'pending' };
        setRequestSubmitted(reqObj);
        if (onRequestSubmitted) {
          onRequestSubmitted(reqObj);
        }
      } else {
        setJoinedClass(res);
        if (onSuccess) {
          onSuccess(res);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to join class. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (loading || requestLoading) return;
    setError('');

    if (isTeacher) {
      setError('Teacher accounts cannot submit join requests. Only students can request to join.');
      return;
    }

    if (!classCode.trim()) {
      setError('Please enter a class code to request access');
      return;
    }

    setRequestLoading(true);
    try {
      const res = await joinRequestApi.create({ classCode: classCode.trim().toUpperCase() });
      if (res && res.success) {
        const reqObj = res.request || { classCode: classCode.trim().toUpperCase() };
        setRequestSubmitted(reqObj);
        if (onRequestSubmitted) {
          onRequestSubmitted(reqObj);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit join request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleFinish = () => {
    if (onClose) {
      onClose();
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  const content = (
    <div className={`w-full ${isModal ? '' : 'max-w-md card p-8 sm:p-10'}`}>
      {isTeacher ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Teacher Account Detected
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You are currently authenticated as <strong>{user?.name || user?.email}</strong> with a Faculty / Teacher account.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 rounded-lg p-2.5">
              Teacher accounts create and manage classes and review requests in <strong>Join Requests</strong>. Only student accounts can join classes or submit join requests.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={handleFinish}
              className="w-full justify-center py-2.5 cursor-pointer"
            >
              Return to Teacher Workspace
            </Button>
          </div>
        </div>
      ) : !joinedClass && !requestSubmitted ? (
        <>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Join a Class
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Enter the unique class code shared by your teacher or class representative.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleDirectJoin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Class Code
              </label>
              <Input
                type="text"
                placeholder="e.g. D15C-5IT"
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                className="w-full text-center uppercase tracking-widest text-lg font-mono"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-400 text-center mt-1">
                Ask your teacher for the class code, then enter it here.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || requestLoading || !classCode.trim()}
                className="w-full justify-center py-2.5 cursor-pointer"
              >
                {loading || requestLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking Class Code...</span>
                  </div>
                ) : (
                  'Join Class'
                )}
              </Button>
            </div>

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </form>
        </>
      ) : requestSubmitted ? (
        /* Join Request Submitted View */
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Join Request Submitted!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Your request is now pending approval by the class instructor. You will receive an in-app notification when reviewed.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0E1524] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 text-center">
            <p className="font-bold text-base text-slate-900 dark:text-slate-100">
              {requestSubmitted.classId?.className || 'Class Access Requested'}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <span className="font-mono">{requestSubmitted.classId?.classCode || classCode}</span>
              <span>• Pending Review</span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleFinish}
            className="w-full justify-center py-2.5 cursor-pointer"
          >
            Back to Dashboard
          </Button>
        </div>
      ) : (
        /* Direct Join Success View */
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Enrolled Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You are now an active member of this class.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0E1524] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 text-center">
            <p className="font-bold text-base text-slate-900 dark:text-slate-100">
              {joinedClass.className}
            </p>
            {joinedClass.subject && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {joinedClass.subject}
              </p>
            )}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold">
              <span className="font-mono">{joinedClass.classCode}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleFinish}
            className="w-full justify-center py-2.5 cursor-pointer"
          >
            Go to My Classes & Dashboard
          </Button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      {onBackToHome && (
        <div className="w-full max-w-md mb-6">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Skip for now
          </button>
        </div>
      )}

      {content}
    </div>
  );
}

export default JoinClass;
