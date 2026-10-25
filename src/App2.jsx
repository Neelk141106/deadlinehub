import React, { useState, useEffect } from 'react';
import { AppWelcome } from './components/AppWelcome';
import { StudentDashboard } from './components/StudentDashboard';
import { DeadlinesPage } from './components/DeadlinesPage';
import { AnnouncementsPage } from './components/AnnouncementsPage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { StudentLogin } from './components/StudentLogin';
import { StudentRegistration } from './components/StudentRegistration';
import { TeacherLogin } from './components/TeacherLogin';
import { TeacherRegistration } from './components/TeacherRegistration';
import { JoinClass } from './components/JoinClass';
import { ClassesPage } from './components/ClassesPage';
import { JoinRequestsPage } from './components/JoinRequestsPage';
import { ManageDeadlinesPage } from './components/ManageDeadlinesPage';
import { ManageAnnouncementsPage } from './components/ManageAnnouncementsPage';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { ConnectionStatus } from './components/ui/ConnectionStatus';
import { NotificationBell } from './components/NotificationBell';
import { ProfileModal } from './components/ProfileModal';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [userRole, setUserRole] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('deadlinehub_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.role) return parsed.role;
      }
    } catch (_e) {}
    return 'student';
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const openedClass = localStorage.getItem('deadlinehub_opened_class_id');
      const savedUserStr = localStorage.getItem('deadlinehub_user');
      const role = savedUserStr ? JSON.parse(savedUserStr)?.role : 'student';
      if (openedClass) {
        return role === 'teacher' ? 'classes' : 'dashboard';
      }
      const savedTab = localStorage.getItem('deadlinehub_active_tab');
      if (savedTab && ['dashboard', 'classes', 'joinRequests', 'deadlines', 'announcements'].includes(savedTab)) {
        return savedTab;
      }
    } catch (_e) {}
    return 'deadlines';
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileAccountDrawer, setShowMobileAccountDrawer] = useState(false);

  const handleSignOut = () => {
    logout();
    setCurrentView('landing');
    setUserRole('student');
    handleNavigate('deadlines');
    setShowProfileModal(false);
    setShowMobileAccountDrawer(false);
  };

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    setShowMobileAccountDrawer(false);
    try {
      localStorage.setItem('deadlinehub_active_tab', tabId);
    } catch (_e) {}
  };

  useEffect(() => {
    if (user) {
      const role = user.role || 'student';
      setUserRole(role);
      const openedClassId = localStorage.getItem('deadlinehub_opened_class_id');
      const savedTab = localStorage.getItem('deadlinehub_active_tab');

      if (openedClassId) {
        const targetTab = role === 'teacher' ? 'classes' : 'dashboard';
        setActiveTab(targetTab);
        try {
          localStorage.setItem('deadlinehub_active_tab', targetTab);
        } catch (_e) {}
      } else if (savedTab) {
        if (role === 'teacher' && ['classes', 'joinRequests', 'deadlines', 'announcements'].includes(savedTab)) {
          setActiveTab(savedTab);
        } else if (role === 'student' && ['dashboard', 'deadlines', 'announcements'].includes(savedTab)) {
          setActiveTab(savedTab);
        } else {
          const fallback = role === 'teacher' ? 'classes' : 'dashboard';
          setActiveTab(fallback);
          try {
            localStorage.setItem('deadlinehub_active_tab', fallback);
          } catch (_e) {}
        }
      } else {
        const fallback = role === 'teacher' ? 'classes' : 'dashboard';
        setActiveTab(fallback);
        try {
          localStorage.setItem('deadlinehub_active_tab', fallback);
        } catch (_e) {}
      }
      setCurrentView('app');
    } else if (!authLoading) {
      setCurrentView((prev) => (prev === 'app' ? 'landing' : prev));
    }
  }, [user, authLoading]);

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
      prefilledEmail={prefilledEmail}
      onLogin={(loggedInUser) => {
        const role = loggedInUser?.role || 'student';
        setUserRole(role);
        handleNavigate(role === 'teacher' ? 'classes' : 'dashboard');
        setCurrentView('app');
      }} 
      onBack={() => setCurrentView('welcome')} 
      onRegisterClick={() => setCurrentView('studentRegistration')}
    />;
  }

  if (currentView === 'teacherLogin') {
    return <TeacherLogin 
      prefilledEmail={prefilledEmail}
      onLogin={(loggedInUser) => {
        const role = loggedInUser?.role || 'teacher';
        setUserRole(role);
        handleNavigate(role === 'teacher' ? 'classes' : 'dashboard');
        setCurrentView('app');
      }} 
      onBack={() => setCurrentView('welcome')} 
      onRegisterClick={() => setCurrentView('teacherRegistration')}
    />;
  }

  if (currentView === 'teacherRegistration') {
    return <TeacherRegistration
      onRegister={({ email } = {}) => {
        if (email) setPrefilledEmail(email);
        setCurrentView('teacherLogin');
      }}
      onLoginClick={() => setCurrentView('teacherLogin')}
      onBack={() => setCurrentView('teacherLogin')}
    />;
  }

  if (currentView === 'studentRegistration') {
    return <StudentRegistration 
      onRegister={({ email } = {}) => {
        if (email) setPrefilledEmail(email);
        setCurrentView('studentLogin');
      }}
      onLoginClick={() => setCurrentView('studentLogin')}
      onBack={() => setCurrentView('studentLogin')}
    />;
  }

  if (currentView === 'joinClass') {
    return <JoinClass onBackToHome={() => {
      setUserRole('student');
      handleNavigate('dashboard');
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
              <a onClick={() => handleNavigate('dashboard')} className={navItemClass('dashboard')}>
                {/* Dashboard Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Dashboard
              </a>
              <a onClick={() => handleNavigate('deadlines')} className={navItemClass('deadlines')}>
                {/* Deadlines Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Deadlines
              </a>
              <a onClick={() => handleNavigate('announcements')} className={navItemClass('announcements')}>
                {/* Announcements Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Announcements
              </a>
            </>
          ) : (
            <>
              <a onClick={() => handleNavigate('classes')} className={navItemClass('classes')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                My Classes
              </a>
              <a onClick={() => handleNavigate('joinRequests')} className={navItemClass('joinRequests')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Join Requests
              </a>
              <a onClick={() => handleNavigate('deadlines')} className={navItemClass('deadlines')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Deadlines
              </a>
              <a onClick={() => handleNavigate('announcements')} className={navItemClass('announcements')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Announcements
              </a>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Live Sync</span>
            <ConnectionStatus />
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors cursor-pointer min-h-[44px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white/95 dark:bg-[#151C2C]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-xs shrink-0 text-white font-bold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 16 14"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent tracking-tight truncate leading-tight">
              DeadlineHub
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
              {userRole === 'student' ? 'Student Workspace' : 'Teacher / Admin'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <NotificationBell onNavigate={(tab) => handleNavigate(tab)} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setShowMobileAccountDrawer(true)}
            className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800/60 transition-colors shadow-xs"
            title="Account & Sign Out"
            aria-label="Open account and sign out menu"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : (userRole === 'student' ? 'S' : 'T')}
          </button>
        </div>
      </header>

      {/* Mobile Account Drawer / Profile Sheet */}
      {showMobileAccountDrawer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Account Menu"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileAccountDrawer(false);
          }}
          className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-start sm:p-4 animate-in fade-in duration-150"
        >
          <div className="w-full sm:max-w-sm sm:ml-auto bg-white dark:bg-[#151C2C] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-top-4 duration-200">
            {/* Header / User Info */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary-500/20 shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : (userRole === 'student' ? 'S' : 'T')}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'Account'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate select-all">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-900/40">
                    {userRole === 'teacher' ? 'Faculty Member' : 'Student'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileAccountDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Live Status</span>
                <ConnectionStatus />
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMobileAccountDrawer(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                View Full Profile &amp; Class Info
              </button>

              {/* Prominent Working Sign Out Button on Mobile */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer min-h-[44px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                Sign Out of DeadlineHub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container with Desktop Header */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/80 dark:bg-[#151C2C]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-lg border border-primary-200/50 dark:border-primary-900/40">
              {activeTab === 'joinRequests' ? 'Join Requests' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell onNavigate={(tab) => handleNavigate(tab)} />
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 pl-1 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 transition-colors"
              title="View Profile"
              aria-label="Open profile"
            >
              <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : (userRole === 'student' ? 'S' : 'T')}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                  {user?.name || (userRole === 'student' ? 'Student' : 'Faculty')}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                  {userRole}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-28 md:pb-8 overflow-auto">
          {activeTab === 'dashboard' && (userRole === 'teacher' ? <ClassesPage /> : <StudentDashboard />)}
          {activeTab === 'classes' && <ClassesPage />}
          {activeTab === 'joinRequests' && <JoinRequestsPage />}
          {activeTab === 'deadlines' && (userRole === 'teacher' ? <ManageDeadlinesPage /> : <DeadlinesPage />)}
          {activeTab === 'announcements' && (userRole === 'teacher' ? <ManageAnnouncementsPage /> : <AnnouncementsPage />)}
        </main>
      </div>

      {/* Mobile Bottom Navigation with iPhone Safe Area padding */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#151C2C]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-20 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]">
        <div className="flex justify-around items-center px-1 py-1.5">
          {userRole === 'student' ? (
            <>
              <a onClick={() => handleNavigate('dashboard')} className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span className="text-[11px]">Dashboard</span>
              </a>
              <a onClick={() => handleNavigate('deadlines')} className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px]">Deadlines</span>
              </a>
              <a onClick={() => handleNavigate('announcements')} className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="text-[11px]">Alerts</span>
              </a>
              <button onClick={() => setShowProfileModal(true)} className="flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-[11px]">Profile</span>
              </button>
            </>
          ) : (
            <>
              <a onClick={() => handleNavigate('classes')} className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer transition-colors ${activeTab === 'classes' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-[11px]">Classes</span>
              </a>
              <a onClick={() => handleNavigate('joinRequests')} className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer transition-colors ${activeTab === 'joinRequests' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                <span className="text-[11px]">Requests</span>
              </a>
              <a onClick={() => handleNavigate('deadlines')} className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px]">Deadlines</span>
              </a>
              <a onClick={() => handleNavigate('announcements')} className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="text-[11px]">Alerts</span>
              </a>
              <button onClick={() => setShowProfileModal(true)} className="flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-[11px]">Profile</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSignOut={handleSignOut}
      />
    </div>
  );
}

export default App;
