import React from 'react';

export function ClassesPage() {
  const classes = [
    { div: 'D15C', subject: 'Information Technology', sem: 'Semester 5', students: 72, code: 'D15C-5IT' },
    { div: 'D15B', subject: 'Information Technology', sem: 'Semester 5', students: 68, code: 'D15B-5IT' },
    { div: 'D15A', subject: 'Information Technology', sem: 'Semester 5', students: 70, code: 'D15A-5IT' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Classes</h1>
        <p className="text-gray-600">Manage your classes and student access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{cls.div}</h2>
                <span className="bg-primary-50 text-primary-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {cls.students} Students
                </span>
              </div>
              
              <div className="space-y-1 mb-6">
                <p className="text-gray-700 font-medium">{cls.subject}</p>
                <p className="text-gray-500 text-sm">{cls.sem}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-6 flex justify-between items-center border border-gray-100">
                <span className="text-sm text-gray-500">Class Code:</span>
                <span className="font-mono font-bold text-gray-900">{cls.code}</span>
              </div>

              <div className="flex flex-col gap-2">
                <button className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  View Students
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Join Requests
                </button>
                <button className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium py-2 px-4 rounded-lg transition-colors">
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
