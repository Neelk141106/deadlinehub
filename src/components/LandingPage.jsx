import React, { useState, useEffect } from 'react';

// ─── Pure SVG Decorative Icons ──────────────────────────────────────────────

function CalendarIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
      <path d="M3 9H21" stroke="#4F46E5" strokeWidth="2" />
      <path d="M8 2V5" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 2V5" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="13" r="1.25" fill="#6366F1" />
      <circle cx="12" cy="13" r="1.25" fill="#4F46E5" />
      <circle cx="16" cy="13" r="1.25" fill="#6366F1" />
      <circle cx="8" cy="17" r="1.25" fill="#818CF8" />
      <circle cx="12" cy="17" r="1.25" fill="#6366F1" />
    </svg>
  );
}

function ClockIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
      <path d="M12 7V12L15.5 14" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3A6 6 0 0 0 6 9V14L4 16V17H20V16L18 14V9A6 6 0 0 0 12 3Z" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 20A2 2 0 0 0 14 20" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
      <path d="M8 12L10.5 14.5L16 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5V19.5Z" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
      <path d="M6 8H16" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 12H13" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Student Desk & Laptop Graphic (Pure SVG Illustration) ─────────────────

function StudentLaptopIllustration({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Desk Base */}
      <rect x="20" y="170" width="280" height="8" rx="4" fill="#E2E8F0" />
      
      {/* Student Head & Shoulders */}
      <circle cx="160" cy="72" r="28" fill="#818CF8" />
      <path d="M125 145C125 118 140 106 160 106C180 106 195 118 195 145V170H125V145Z" fill="#4F46E5" />
      
      {/* Hair detail */}
      <path d="M142 56C142 46 150 40 160 40C170 40 178 46 178 56C174 52 166 52 160 55C154 52 146 52 142 56Z" fill="#3730A3" />

      {/* Laptop Screen */}
      <rect x="90" y="90" width="140" height="74" rx="6" fill="#1E1B4B" stroke="#4338CA" strokeWidth="3" />
      {/* Screen Display Content */}
      <rect x="98" y="98" width="124" height="58" rx="3" fill="#312E81" />
      {/* Academic code / lines on screen */}
      <rect x="106" y="106" width="50" height="5" rx="2.5" fill="#818CF8" />
      <rect x="106" y="116" width="75" height="5" rx="2.5" fill="#A5B4FC" />
      <rect x="106" y="126" width="60" height="5" rx="2.5" fill="#C7D2FE" />
      <circle cx="196" cy="116" r="10" fill="#4F46E5" />
      <path d="M193 116L195 118L200 113" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Laptop Keyboard / Base */}
      <polygon points="75,168 245,168 235,174 85,174" fill="#6366F1" />
      
      {/* Coffee Cup */}
      <rect x="250" y="146" width="18" height="24" rx="3" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      <path d="M268 152C272 152 274 155 274 158C274 161 272 164 268 164" stroke="#6366F1" strokeWidth="2" />
      <path d="M255 141C257 137 255 135 257 131" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Stack of Academic Books */}
      <rect x="35" y="152" width="40" height="8" rx="2" fill="#4F46E5" />
      <rect x="38" y="144" width="34" height="8" rx="2" fill="#7C3AED" />
      <rect x="40" y="136" width="30" height="8" rx="2" fill="#10B981" />
    </svg>
  );
}

// ─── Decorative Floating Card Component ─────────────────────────────────────

function FloatingCard({ icon, title, subtitle, badgeText, badgeColor = 'bg-indigo-50 text-indigo-700', delay = '0s' }) {
  return (
    <div
      className="flex items-center gap-3.5 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg shadow-indigo-100/50 border border-indigo-100/80 transition-all hover:scale-[1.02]"
      style={{ animation: `dhFloat 4.5s ease-in-out ${delay} infinite` }}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-gray-900 truncate leading-tight">{title}</p>
          {badgeText && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeColor}`}>
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Hamburger Icon ──────────────────────────────────────────────────────────

function HamburgerIcon({ open }) {
  return open ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

// ─── Main LandingPage Component ──────────────────────────────────────────────

export function LandingPage({ onGetStarted, onLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'DeadlineHub — Smart Academic Deadline & Announcement Board';
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes dhFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes dhFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dhBlob {
          0%, 100% { border-radius: 60% 40% 55% 45% / 55% 45% 60% 40%; }
          50%       { border-radius: 45% 55% 40% 60% / 40% 60% 45% 55%; }
        }
        .dh-fade-up   { animation: dhFadeUp 0.6s 0.0s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-fade-up-1 { animation: dhFadeUp 0.6s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-fade-up-2 { animation: dhFadeUp 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-fade-up-3 { animation: dhFadeUp 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-blob      { animation: dhBlob 10s ease-in-out infinite; }
        .dh-blob-slow { animation: dhBlob 14s ease-in-out infinite reverse; }
      `}</style>

      <div className="min-h-screen bg-white relative flex flex-col justify-between overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">

        {/* ── Background Decorative Elements ─────────────────────────────── */}
        <div aria-hidden="true" className="pointer-events-none select-none">
          {/* Top right gradient blob */}
          <div
            className="dh-blob absolute -top-40 -right-40 w-[600px] h-[600px] opacity-10"
            style={{ background: 'radial-gradient(circle, #4F46E5 0%, #7C3AED 70%, transparent 100%)' }}
          />
          {/* Mid-left gradient blob */}
          <div
            className="dh-blob-slow absolute top-[35%] -left-32 w-[420px] h-[420px] opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #818CF8 0%, #C7D2FE 100%)' }}
          />
          {/* Dot grid pattern top left */}
          <svg className="absolute top-20 left-10 opacity-[0.14]" width="180" height="180" fill="none">
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((_, c) => (
                <circle key={`t-${r}-${c}`} cx={c * 30 + 6} cy={r * 30 + 6} r="2.5" fill="#4F46E5"/>
              ))
            )}
          </svg>
          {/* Dot grid pattern bottom right */}
          <svg className="absolute bottom-24 right-12 opacity-[0.10]" width="150" height="150" fill="none">
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <circle key={`b-${r}-${c}`} cx={c * 30 + 6} cy={r * 30 + 6} r="2.5" fill="#7C3AED"/>
              ))
            )}
          </svg>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PROMINENT NAVBAR
        ════════════════════════════════════════════════════════════════════ */}
        <header
          id="landing-navbar"
          className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs py-3' : 'bg-transparent py-5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">

              {/* Noticeably Larger Brand / Logo */}
              <div className="flex items-center gap-3.5 flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 16 14"/>
                  </svg>
                </div>
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">DeadlineHub</span>
              </div>

              {/* Minimal Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
                <a href="#" className="text-indigo-600 bg-indigo-50/80 px-3.5 py-1.5 rounded-lg font-bold transition-colors">Home</a>
                <a href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors">About</a>
              </nav>

              {/* Desktop CTA Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  id="landing-login-btn"
                  onClick={onLogin}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </button>
                <button
                  id="landing-getstarted-btn-nav"
                  onClick={onGetStarted}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  Get Started
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button
                id="landing-hamburger"
                className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label="Toggle navigation menu"
              >
                <HamburgerIcon open={mobileMenuOpen} />
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-gray-100 shadow-xl animate-fadeIn">
              <div className="flex flex-col px-5 py-5 gap-3.5 text-base font-semibold">
                <a href="#" className="text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-lg font-bold" onClick={() => setMobileMenuOpen(false)}>Home</a>
                <a href="#about" className="text-gray-700 hover:text-indigo-600 px-3.5 py-2 rounded-lg" onClick={() => setMobileMenuOpen(false)}>About</a>
                <hr className="border-gray-100 my-1"/>
                <button
                  id="landing-login-mobile"
                  onClick={() => { setMobileMenuOpen(false); onLogin(); }}
                  className="text-left text-indigo-600 font-semibold py-2 px-3.5"
                >
                  Log In
                </button>
                <button
                  id="landing-getstarted-mobile"
                  onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                  className="w-full py-3 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Get Started →
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            WELL-BALANCED TWO-COLUMN HERO SECTION
        ════════════════════════════════════════════════════════════════════ */}
        <main className="flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">

            {/* ── LEFT COLUMN: Hero Content ────────────────────────────────── */}
            <div className="lg:col-span-6 text-center lg:text-left flex flex-col justify-center">

              {/* Badge */}
              <div className="dh-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 mx-auto lg:mx-0 w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse inline-block" />
                Smart Academic Deadline &amp; Announcement Board
              </div>

              {/* Larger, Bold Heading */}
              <h1 className="dh-fade-up-1 text-4xl sm:text-6xl lg:text-[4rem] font-extrabold text-gray-900 leading-[1.06] tracking-tight mb-6">
                Never miss<br />
                what{' '}
                <span className="relative inline-block text-indigo-600">
                  matters.
                  <span
                    aria-hidden="true"
                    className="absolute left-0 bottom-1.5 w-full h-3 bg-indigo-100/90 rounded -z-10"
                  />
                </span>
              </h1>

              {/* Supporting Paragraph */}
              <p className="dh-fade-up-2 text-base sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Deadlines, announcements and important academic updates&nbsp;—&nbsp;organized in one place.
              </p>

              {/* Primary & Secondary CTA Buttons */}
              <div className="dh-fade-up-3 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                <button
                  id="landing-getstarted-hero"
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  Get Started
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                <button
                  id="landing-login-hero"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all active:scale-95"
                >
                  Log In
                </button>
              </div>

              {/* Subtle Trust/Benefit Row */}
              <div className="dh-fade-up-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 mt-8 text-xs sm:text-sm text-gray-500 font-medium border-t border-gray-100 pt-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Free to use
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Student-friendly
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  All updates in one place
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN: Enhanced Academic Composition ────────────── */}
            <div id="about" className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-xl bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 rounded-3xl p-6 sm:p-8 border border-indigo-100/80 shadow-xl shadow-indigo-100/40">
                
                {/* Decorative Glass Header Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-indigo-100/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 opacity-80" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    Academic Overview
                  </span>
                </div>

                {/* Center Student & Desk Graphic */}
                <div className="flex justify-center my-2">
                  <StudentLaptopIllustration className="w-full h-auto max-h-48 drop-shadow-sm" />
                </div>

                {/* Decorative Icon Ribbon */}
                <div className="flex items-center justify-around py-3 my-3 bg-white/80 rounded-2xl border border-indigo-50 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <ClockIcon className="w-5 h-5 text-indigo-600" />
                    <span>Deadlines</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <BellIcon className="w-5 h-5 text-violet-600" />
                    <span>Alerts</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    <span>Schedule</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <BookIcon className="w-5 h-5 text-indigo-600" />
                    <span>Subjects</span>
                  </div>
                </div>

                {/* Sample Floating Academic Cards */}
                <div className="space-y-3.5 mt-4">
                  {/* Card 1: Urgent Assignment */}
                  <FloatingCard
                    delay="0s"
                    icon={<ClockIcon className="w-6 h-6" />}
                    title="Assignment Due — Tomorrow"
                    subtitle="Analysis of Algorithms • High Priority"
                    badgeText="Due Tomorrow"
                    badgeColor="bg-red-50 text-red-700 border border-red-100"
                  />

                  {/* Card 2: Announcement */}
                  <FloatingCard
                    delay="1.5s"
                    icon={<BellIcon className="w-6 h-6" />}
                    title="DBMS Practical Room Changed"
                    subtitle="Lab 405 instead of Lab 301 • Urgent"
                    badgeText="Notice"
                    badgeColor="bg-violet-50 text-violet-700 border border-violet-100"
                  />

                  {/* Card 3: Project Review */}
                  <FloatingCard
                    delay="3s"
                    icon={<CheckIcon className="w-6 h-6" />}
                    title="Project Review Scheduled"
                    subtitle="Full Stack Development • 24 Aug • 10:00 AM"
                    badgeText="Confirmed"
                    badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-100"
                  />
                </div>

              </div>
            </div>

          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════════
            SUBTLE BOTTOM WAVE DECORATIVE ACCENT
        ════════════════════════════════════════════════════════════════════ */}
        <footer aria-hidden="true" className="relative h-16 sm:h-20 overflow-hidden pointer-events-none w-full mt-4">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5"/>
                <stop offset="50%" stopColor="#7C3AED"/>
                <stop offset="100%" stopColor="#4F46E5"/>
              </linearGradient>
            </defs>
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="url(#waveGrad)"
              opacity="0.15"
            />
          </svg>
        </footer>

      </div>
    </>
  );
}
