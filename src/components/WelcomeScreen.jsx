import React from 'react';

export function WelcomeScreen({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Brand & Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Never miss what matters.
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Deadlines, announcements and academic updates — all in one place.
          </p>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Student Card */}
          <button 
            onClick={() => onSelectRole('student')}
            className="group flex flex-col items-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-primary-500 shadow-sm hover:shadow-xl transition-all duration-300 text-left focus:outline-none focus:ring-4 focus:ring-primary-100"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-100 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">I'm a Student</h2>
            <p className="text-gray-500 text-center leading-relaxed">
              View deadlines, announcements and class updates.
            </p>
          </button>

          {/* Teacher / Admin Card */}
          <button 
            onClick={() => onSelectRole('teacher')}
            className="group flex flex-col items-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-primary-500 shadow-sm hover:shadow-xl transition-all duration-300 text-left focus:outline-none focus:ring-4 focus:ring-primary-100"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-100 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
                <path d="m9 16 2 2 4-4"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">I'm a Teacher / Admin</h2>
            <p className="text-gray-500 text-center leading-relaxed">
              Manage classes, deadlines and announcements.
            </p>
          </button>
        </div>
        
        {/* Footer/Brand */}
        <div className="mt-16 text-center text-gray-400 text-sm font-medium">
          DeadlineHub
        </div>
      </div>
    </div>
  );
}
