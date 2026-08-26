import React from 'react';
import { useDeadlines } from '../context/DeadlineContext';

export function DemoRoleSwitcher({ className = '' }) {
  const { userRole, setUserRole } = useDeadlines();

  return (
    <div className={`inline-flex items-center gap-2 bg-indigo-50/90 border border-indigo-200 text-indigo-950 px-3 py-1.5 rounded-lg shadow-sm ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Demo View:
      </span>
      <select
        value={userRole}
        onChange={(e) => setUserRole(e.target.value)}
        className="bg-white border border-indigo-300 font-bold text-xs rounded px-2.5 py-1 text-indigo-950 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        <option value="student">🎓 Student View</option>
        <option value="teacher">👨‍🏫 Teacher / Admin View</option>
      </select>
    </div>
  );
}
