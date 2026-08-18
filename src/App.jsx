import React, { useState } from 'react';
import { StudentDashboard } from './components/StudentDashboard';
import { DeadlinesPage } from './components/DeadlinesPage';
import { AnnouncementsPage } from './components/AnnouncementsPage';

function App() {
  const [activeTab, setActiveTab] = useState('deadlines');

  const navItemClass = (tabId) => 
    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
      activeTab === tabId 
        ? 'text-primary-700 bg-primary-50' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary-600 tracking-tight">DeadlineHub</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <a onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
            {/* Dashboard Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Dashboard
          </a>
          <a onClick={() => setActiveTab('deadlines')} className={navItemClass('deadlines')}>
            {/* Deadlines Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Deadlines
          </a>
          <a onClick={() => setActiveTab('announcements')} className={navItemClass('announcements')}>
            {/* Announcements Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Announcements
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Logout
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary-600 tracking-tight">DeadlineHub</h1>
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
          S
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        {activeTab === 'dashboard' && <StudentDashboard />}
        {activeTab === 'deadlines' && <DeadlinesPage />}
        {activeTab === 'announcements' && <AnnouncementsPage />}
      </main>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around items-center p-2">
          <a onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 cursor-pointer ${activeTab === 'dashboard' ? 'text-primary-600' : 'text-gray-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-medium">Dashboard</span>
          </a>
          <a onClick={() => setActiveTab('deadlines')} className={`flex flex-col items-center p-2 cursor-pointer ${activeTab === 'deadlines' ? 'text-primary-600' : 'text-gray-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-[10px] font-medium">Deadlines</span>
          </a>
          <a onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center p-2 cursor-pointer ${activeTab === 'announcements' ? 'text-primary-600' : 'text-gray-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="text-[10px] font-medium">Alerts</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default App;
