import React, { useState } from 'react';

export function ManageAnnouncementsPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  const announcements = [
    {
      id: 1,
      title: 'DBMS Practical Room Changed',
      category: 'Practical',
      priority: 'Urgent',
      target: 'D15C',
      isPinned: true,
      time: '2 hours ago'
    },
    {
      id: 2,
      title: 'Guest Lecture on AI',
      category: 'Event',
      priority: 'Normal',
      target: 'All Divisions',
      isPinned: false,
      time: '1 day ago'
    }
  ];

  if (showAddForm) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => setShowAddForm(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Announcement</h1>
            <p className="text-gray-600">Publish a new academic update for your students.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setShowAddForm(false); }}>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Announcement Details</h2>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Room change for practicals" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[120px]" placeholder="Write the announcement details here..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option>Academic</option>
                    <option>Examination</option>
                    <option>Lecture</option>
                    <option>Practical</option>
                    <option>Department</option>
                    <option>Event</option>
                    <option>General</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option>Normal</option>
                    <option>Important</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="pin-announcement" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <label htmlFor="pin-announcement" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Pin this announcement to the top
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mt-6">Target Students</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option>Information Technology</option>
                    <option>Computer Science</option>
                    <option>Electronics</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                    <option>Semester 3</option>
                    <option>Semester 4</option>
                    <option>Semester 5</option>
                    <option>Semester 6</option>
                    <option>Semester 7</option>
                    <option>Semester 8</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Division(s)</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option>All Divisions</option>
                    <option>D15A</option>
                    <option>D15B</option>
                    <option>D15C</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Announcements</h1>
          <p className="text-gray-600">Publish important academic updates for your students.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Announcement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Category & Priority</th>
                <th className="p-4 font-semibold">Target</th>
                <th className="p-4 font-semibold">Posted</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {announcements.map(announcement => (
                <tr key={announcement.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{announcement.title}</p>
                      {announcement.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                          Pinned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {announcement.category}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        announcement.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 
                        announcement.priority === 'Important' ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {announcement.priority}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600">{announcement.target}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-500">{announcement.time}</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title={announcement.isPinned ? "Unpin" : "Pin"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
