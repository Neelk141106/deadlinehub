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
import { VerifyOtp } from './components/VerifyOtp';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [verificationTarget, setVerificationTarget] = useState({
    email: '',
    role: 'student',
    notice: '',
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
  const [userRole, setUserRole] = useState('student');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
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
      prefilledEmail={verificationTarget.email}
      onLogin={(loggedInUser) => {
        const role = loggedInUser?.role || 'student';
        setUserRole(role);
        handleNavigate(role === 'teacher' ? 'classes' : 'dashboard');
        setCurrentView('app');
      }} 
      onBack={() => setCurrentView('welcome')} 
      onRegisterClick={() => setCurrentView('studentRegistration')}
      onVerifyClick={({ email, role }) => {
        setVerificationTarget({
          email: email || '',
          role: role || 'student',
          notice: 'Please enter the 6-digit verification code sent to your email.',
        });
        setCurrentView('verifyOtp');
      }}
    />;
  }

  if (currentView === 'teacherLogin') {
    return <TeacherLogin 
      prefilledEmail={verificationTarget.email}
      onLogin={(loggedInUser) => {
        const role = loggedInUser?.role || 'teacher';
        setUserRole(role);
        handleNavigate(role === 'teacher' ? 'classes' : 'dashboard');
        setCurrentView('app');
      }} 
      onBack={() => setCurrentView('welcome')} 
      onRegisterClick={() => setCurrentView('teacherRegistration')}
      onVerifyClick={({ email, role }) => {
        setVerificationTarget({
          email: email || '',
          role: role || 'teacher',
          notice: 'Please enter the 6-digit verification code sent to your email.',
        });
        setCurrentView('verifyOtp');
      }}
    />;
  }

  if (currentView === 'teacherRegistration') {
    return <TeacherRegistration
      onRegister={({ email, role, notice }) => {
        setVerificationTarget({
          email: email || '',
          role: role || 'teacher',
          notice: notice || '',
        });
        setCurrentView('verifyOtp');
      }}
      onLoginClick={() => setCurrentView('teacherLogin')}
      onBack={() => setCurrentView('teacherLogin')}
    />;
  }

  if (currentView === 'studentRegistration') {
    return <StudentRegistration 
      onRegister={({ email, role, notice }) => {
        setVerificationTarget({
          email: email || '',
          role: role || 'student',
          notice: notice || '',
        });
        setCurrentView('verifyOtp');
      }}
      onLoginClick={() => setCurrentView('studentLogin')}
      onBack={() => setCurrentView('studentLogin')}
    />;
  }

  if (currentView === 'verifyOtp') {
    return (
      <VerifyOtp
        initialEmail={verificationTarget.email}
        initialRole={verificationTarget.role}
        infoNotice={verificationTarget.notice}
        onVerified={({ email, role }) => {
          setVerificationTarget((prev) => ({ ...prev, email }));
          setCurrentView(role === 'teacher' ? 'teacherLogin' : 'studentLogin');
        }}
        onBack={() => {
          setCurrentView(verificationTarget.role === 'teacher' ? 'teacherLogin' : 'studentLogin');
        }}
        onNavigateLogin={() => {
          setCurrentView(verificationTarget.role === 'teacher' ? 'teacherLogin' : 'studentLogin');
        }}
      />
    );
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
              onClick={() => {
                logout();
                setCurrentView('landing');
                setUserRole('student');
                handleNavigate('deadlines');
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
          <NotificationBell onNavigate={(tab) => handleNavigate(tab)} />
          <ConnectionStatus showLabel={false} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800/60 transition-colors"
            title="View Profile"
            aria-label="Open profile"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : (userRole === 'student' ? 'S' : 'T')}
          </button>
        </div>
      </header>

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
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
          {activeTab === 'dashboard' && (userRole === 'teacher' ? <ClassesPage /> : <StudentDashboard />)}
          {activeTab === 'classes' && <ClassesPage />}
          {activeTab === 'joinRequests' && <JoinRequestsPage />}
          {activeTab === 'deadlines' && (userRole === 'teacher' ? <ManageDeadlinesPage /> : <DeadlinesPage />)}
          {activeTab === 'announcements' && (userRole === 'teacher' ? <ManageAnnouncementsPage /> : <AnnouncementsPage />)}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#151C2C]/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 z-10">
        <div className="flex justify-around items-center p-2">
          {userRole === 'student' ? (
            <>
              <a onClick={() => handleNavigate('dashboard')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span className="text-[11px] font-medium">Dashboard</span>
              </a>
              <a onClick={() => handleNavigate('deadlines')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px] font-medium">Deadlines</span>
              </a>
              <a onClick={() => handleNavigate('announcements')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="text-[11px] font-medium">Alerts</span>
              </a>
            </>
          ) : (
            <>
              <a onClick={() => handleNavigate('classes')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'classes' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-[11px] font-medium">Classes</span>
              </a>
              <a onClick={() => handleNavigate('joinRequests')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'joinRequests' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                <span className="text-[11px] font-medium">Requests</span>
              </a>
              <a onClick={() => handleNavigate('deadlines')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'deadlines' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[11px] font-medium">Deadlines</span>
              </a>
              <a onClick={() => handleNavigate('announcements')} className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${activeTab === 'announcements' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="text-[11px] font-medium">Alerts</span>
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}

export default App;
