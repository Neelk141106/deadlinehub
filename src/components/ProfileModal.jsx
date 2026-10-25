import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../context/ClassContext';

export function ProfileModal({ isOpen, onClose, onSignOut }) {
  const { user, logout } = useAuth();
  const { classes } = useClasses();

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSignOut = () => {
    onClose();
    if (onSignOut) {
      onSignOut();
    } else {
      logout();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151C2C] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary-500/20 shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h2 id="profile-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </h2>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-900/40">
                {user.role || 'Student'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close profile modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Info Details */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-800 gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Email</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 select-all truncate text-right">{user.email}</span>
          </div>

          {user.studentCode && (
            <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-800 gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Student Code</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{user.studentCode}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-800 gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Department</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-right">{user.department || 'Information Technology'}</span>
          </div>

          {(user.semester || user.division) && (
            <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-800 gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Academic Info</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {[user.semester, user.division].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">
              {user.role === 'teacher' ? 'Owned Classes' : 'Enrolled Classes'}
            </span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
            </span>
          </div>
        </div>

        {/* Footer Actions: Working Sign Out and Close */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full sm:flex-1 py-2.5 px-4 min-h-[44px] rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 px-4 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
