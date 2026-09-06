import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ className = '' }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center p-1 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer ${
        isDark
          ? 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
          : 'bg-slate-100 border-slate-200 hover:border-slate-300'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
          !isDark
            ? 'bg-white text-amber-500 shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </span>
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
          isDark
            ? 'bg-primary-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-600'
        }`}
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
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
    </button>
  );
}

export default ThemeToggle;
