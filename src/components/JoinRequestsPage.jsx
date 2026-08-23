import React from 'react';

export function JoinRequestsPage() {
  const requests = [
    { name: 'Aarav Sharma', email: 'aarav@college.edu', code: '23IT041', reqClass: 'IT • Semester 5 • D15C' },
    { name: 'Priya Patel', email: 'priya@college.edu', code: '23IT089', reqClass: 'IT • Semester 5 • D15C' },
    { name: 'Rohan Desai', email: 'rohan.d@college.edu', code: '23IT112', reqClass: 'IT • Semester 5 • D15A' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Requests</h1>
        <p className="text-gray-600">Review students requesting access to your classes.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Pending Requests</h2>
          <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
            {requests.length} Pending
          </span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {requests.map((req, index) => (
            <div key={index} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
                  {req.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{req.name}</h3>
                  <div className="text-sm text-gray-500 mt-1 space-y-1">
                    <p>{req.email}</p>
                    <p>Student Code: <span className="font-medium text-gray-700">{req.code}</span></p>
                    <p className="inline-flex items-center gap-1.5 mt-1 text-primary-600 font-medium bg-primary-50 px-2.5 py-0.5 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      {req.reqClass}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  Reject
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
