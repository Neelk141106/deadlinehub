import React from 'react';

export function ClassesPage() {
  const classes = [
    { div: 'D15C', subject: 'Information Technology', sem: 'Semester 5', students: 72, code: 'D15C-5IT' },
    { div: 'D15B', subject: 'Information Technology', sem: 'Semester 5', students: 68, code: 'D15B-5IT' },
    { div: 'D15A', subject: 'Information Technology', sem: 'Semester 5', students: 70, code: 'D15A-5IT' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">Classes</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage your classes and student access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, index) => (
          <div key={index} className="card-hover">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{cls.div}</h2>
                <span className="bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/40 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {cls.students} Students
                </span>
              </div>
              
              <div className="space-y-1 mb-6">
                <p className="text-slate-700 dark:text-slate-200 font-medium">{cls.subject}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{cls.sem}</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0E1524] rounded-xl p-3 mb-6 flex justify-between items-center border border-slate-200/80 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Class Code:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{cls.code}</span>
              </div>

              <div className="flex flex-col gap-2">
                <button className="btn-primary w-full gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  View Students
                </button>
                <button className="btn-secondary w-full gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Join Requests
                </button>
                <button className="w-full flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy Class Code
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
