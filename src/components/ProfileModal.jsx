import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../context/ClassContext';

export function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { classes } = useClasses();

  if (!isOpen || !user) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#151C2C] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary-500/20">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
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
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Info Details */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Email</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 select-all">{user.email}</span>
          </div>

          {user.studentCode && (
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Student Code</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{user.studentCode}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Department</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user.department || 'Information Technology'}</span>
          </div>

          {(user.semester || user.division) && (
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Academic Info</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {[user.semester, user.division].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}

          <div className="flex justify-between py-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {user.role === 'teacher' ? 'Owned Classes' : 'Enrolled Classes'}
            </span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
