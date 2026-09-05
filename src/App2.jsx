import React, { useState } from 'react';
import { AppWelcome } from './components/AppWelcome';
import { StudentDashboard } from './components/StudentDashboard';
import { DeadlinesPage } from './components/DeadlinesPage';
import { AnnouncementsPage } from './components/AnnouncementsPage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { StudentLogin } from './components/StudentLogin';
import { StudentRegistration } from './components/StudentRegistration';
import { TeacherLogin } from './components/TeacherLogin';
import { JoinClass } from './components/JoinClass';
import { ClassesPage } from './components/ClassesPage';
import { JoinRequestsPage } from './components/JoinRequestsPage';
import { ManageDeadlinesPage } from './components/ManageDeadlinesPage';
import { ManageAnnouncementsPage } from './components/ManageAnnouncementsPage';
import { ThemeToggle } from './components/ui/ThemeToggle';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('deadlines');
  const [userRole, setUserRole] = useState('student');

  const navItemClass = (tabId) => 
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
      activeTab === tabId 
        ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 border border-primary-200/70 dark:border-primary-900/50 shadow-sm' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  if (currentView === 'landing') {
    return (
      <AppWelcome
        onGetStarted={() => setCurrentView('welcome')}
      />
    );
  }

  if (currentView === 'welcome') {
    return <WelcomeScreen 
      onSelectRole={(role) => {
        if (role === 'student') setCurrentView('studentLogin');
        else if (role === 'teacher') setCurrentView('teacherLogin');
      }} 
      onBack={() => setCurrentView('landing')}
    />;
  }

  if (currentView === 'studentLogin') {
    return <StudentLogin 
      onLogin={() => setCurrentView('joinClass')} 
      onBack={() => setCurrentView('welcome')} 
      onRegisterClick={() => setCurrentView('studentRegistration')} 
    />;
  }

  if (currentView === 'teacherLogin') {
    return <TeacherLogin 
      onLogin={() => {
        setUserRole('teacher');
        setActiveTab('classes');
        setCurrentView('app');
      }} 
      onBack={() => setCurrentView('welcome')} 
    />;
  }

  if (currentView === 'studentRegistration') {
    return <StudentRegistration 
      onRegister={() => setCurrentView('joinClass')} 
      onLoginClick={() => setCurrentView('studentLogin')} 
      onBack={() => setCurrentView('studentLogin')} 
    />;
  }

  if (currentView === 'joinClass') {
    return <JoinClass onBackToHome={() => {
      setUserRole('student');
      setActiveTab('dashboard');
      setCurrentView('app');
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#151C2C] border-r border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent tracking-tight">
              DeadlineHub
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {userRole === 'student' ? 'Student Workspace' : 'Teacher / Admin'}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          {userRole === 'student' ? (
            <>
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
            </>
          ) : (
            <>
              <a onClick={() => setActiveTab('classes')} className={navItemClass('classes')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Classes
              </a>
              <a onClick={() => setActiveTab('joinRequests')} className={navItemClass('joinRequests')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Join Requests
              </a>
              <a onClick={() => setActiveTab('deadlines')} className={navItemClass('deadlines')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Deadlines
              </a>
              <a onClick={() => setActiveTab('announcements')} className={navItemClass('announcements')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Announcements
              </a>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle showLabel={true} />
          </div>

          <div className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </a>
            <button 
              onClick={() => setCurrentView('welcome')} 
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Switch Role
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white dark:bg-[#151C2C] border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent tracking-tight">
            DeadlineHub
          </h1>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {userRole === 'student' ? 'Student' : 'Teacher/Admin'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm">
            {userRole === 'student' ? 'S' : 'T'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        {activeTab === 'dashboard' && <StudentDashboard />}
        {activeTab === 'classes' && <ClassesPage />}
        {activeTab === 'joinRequests' && <JoinRequestsPage />}
        {activeTab === 'deadlines' && (userRole === 'teacher' ? <ManageDeadlinesPage /> : <DeadlinesPage />)}
        {activeTab === 'announcements' && (userRole === 'teacher' ? <ManageAnnouncementsPage /> : <AnnouncementsPage />)}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#151C2C]/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 z-10">
        <div className="flex justify-around items-center p-2">
          {userRole === 'student' ? (
            <>
              <a onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span className="text-[11px] font-medium">Dashboard</span>
              </a>
              <a onClick={() => setActiveTab('deadlines')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px] font-medium">Deadlines</span>
              </a>
              <a onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="text-[11px] font-medium">Alerts</span>
              </a>
            </>
          ) : (
            <>
              <a onClick={() => setActiveTab('classes')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'classes' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-[11px] font-medium">Classes</span>
              </a>
              <a onClick={() => setActiveTab('joinRequests')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'joinRequests' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                <span className="text-[11px] font-medium">Requests</span>
              </a>
              <a onClick={() => setActiveTab('deadlines')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px] font-medium">Deadlines</span>
              </a>
              <a onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="text-[11px] font-medium">Alerts</span>
              </a>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

export default App;
