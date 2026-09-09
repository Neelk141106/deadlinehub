import React, { useState, useEffect } from 'react';
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
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('deadlines');
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    if (user) {
      setUserRole(user.role || 'student');
      if (user.role === 'teacher') {
        setActiveTab('classes');
      } else {
        setActiveTab('dashboard');
      }
      setCurrentView('app');
    }
  }, [user]);

  const navItemClass = (tabId) => 
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
      activeTab === tabId 
        ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 border border-primary-200/70 dark:border-primary-900/50 shadow-sm' 
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading DeadlineHub...</p>
        </div>
      </div>
    );
  }

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
      onLogin={(loggedInUser) => {
        // Role comes from the authenticated user returned by the backend
        const role = loggedInUser?.role || 'student';
        setUserRole(role);
        // Returning students who already have a division go straight to the app.
        // New students (no division yet) are directed to join a class first.
        if (loggedInUser?.division && loggedInUser.division.trim()) {
          setActiveTab('dashboard');
          setCurrentView('app');
        } else {
          setCurrentView('joinClass');
        }
      }} 
      onBack={() => setCurrentView('welcome')} 
      onRegisterClick={() => setCurrentView('studentRegistration')} 
    />;
  }

  if (currentView === 'teacherLogin') {
    return <TeacherLogin 
      onLogin={(loggedInUser) => {
        // Role comes from the authenticated user returned by the backend — never hardcoded
        const role = loggedInUser?.role || 'teacher';
        setUserRole(role);
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Dashboard
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
            <ThemeToggle />
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl font-medium transition-colors cursor-pointer text-left">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </button>
            <button 
              onClick={() => {
                logout();
                setCurrentView('landing');
                setUserRole('student');
                setActiveTab('deadlines');
              }} 
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Sign Out
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
            {user?.name ? user.name.charAt(0).toUpperCase() : (userRole === 'student' ? 'S' : 'T')}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        {activeTab === 'dashboard' && <StudentDashboard userName={user?.name || 'Student'} />}
        {activeTab === 'classes' && <ClassesPage />}
        {activeTab === 'joinRequests' && <JoinRequestsPage />}
        {activeTab === 'deadlines' && (userRole === 'teacher' ? <ManageDeadlinesPage /> : <DeadlinesPage />)}
        {activeTab === 'announcements' && (userRole === 'teacher' ? <ManageAnnouncementsPage /> : <AnnouncementsPage />)}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Profile</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your account information.</p>
            </div>
            <div className="card p-6 sm:p-8 space-y-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xl shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name || '—'}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                    user?.role === 'teacher'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40'
                      : 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/40'
                  }`}>
                    {user?.role === 'teacher' ? 'Teacher / Admin' : 'Student'}
                  </span>
                </div>
              </div>
              {/* Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-all">{user?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Role</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{user?.role || '—'}</p>
                  </div>
                </div>
                {/* Student-only fields */}
                {user?.role === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {user?.department && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Department</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.department}</p>
                      </div>
                    )}
                    {user?.semester && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Semester</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.semester}</p>
                      </div>
                    )}
                    {user?.division && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Division</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.division}</p>
                      </div>
                    )}
                    {user?.studentCode && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Student Code</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.studentCode}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Sign Out */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    setCurrentView('landing');
                    setUserRole('student');
                    setActiveTab('deadlines');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 rounded-xl transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#151C2C]/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 z-10">
        <div className="flex justify-around items-center p-2">
          {userRole === 'student' ? (
            <>
              <a onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span className="text-[11px] font-medium">Dashboard</span>
              </a>
              <a onClick={() => setActiveTab('deadlines')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px] font-medium">Deadlines</span>
              </a>
              <a onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="text-[11px] font-medium">Alerts</span>
              </a>
            </>
          ) : (
            <>
              <a onClick={() => setActiveTab('classes')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'classes' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-[11px] font-medium">Classes</span>
              </a>
              <a onClick={() => setActiveTab('joinRequests')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'joinRequests' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                <span className="text-[11px] font-medium">Requests</span>
              </a>
              <a onClick={() => setActiveTab('deadlines')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px] font-medium">Deadlines</span>
              </a>
              <a onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
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
