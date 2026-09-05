import React, { useEffect } from 'react';
import { ThemeToggle } from './ui/ThemeToggle';

// ─── Pure SVG Decorative Icons ──────────────────────────────────────────────

function CalendarIcon({ className = 'w-5 h-5' }) {
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

function ClockIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
      <path d="M12 7V12L15.5 14" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3A6 6 0 0 0 6 9V14L4 16V17H20V16L18 14V9A6 6 0 0 0 12 3Z" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 20A2 2 0 0 0 14 20" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
      <path d="M8 12L10.5 14.5L16 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon({ className = 'w-5 h-5' }) {
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
    <svg className={className} viewBox="0 0 320 190" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Desk Base */}
      <rect x="20" y="165" width="280" height="8" rx="4" fill="#E2E8F0" />
      
      {/* Student Head & Shoulders */}
      <circle cx="160" cy="68" r="26" fill="#818CF8" />
      <path d="M128 140C128 115 142 104 160 104C178 104 192 115 192 140V165H128V140Z" fill="#4F46E5" />
      
      {/* Hair detail */}
      <path d="M144 52C144 43 151 37 160 37C169 37 176 43 176 52C172 48 165 48 160 51C155 48 148 48 144 52Z" fill="#3730A3" />

      {/* Laptop Screen */}
      <rect x="92" y="86" width="136" height="72" rx="6" fill="#1E1B4B" stroke="#4338CA" strokeWidth="3" />
      {/* Screen Display Content */}
      <rect x="100" y="94" width="120" height="56" rx="3" fill="#312E81" />
      {/* Academic lines on screen */}
      <rect x="108" y="102" width="48" height="5" rx="2.5" fill="#818CF8" />
      <rect x="108" y="112" width="70" height="5" rx="2.5" fill="#A5B4FC" />
      <rect x="108" y="122" width="55" height="5" rx="2.5" fill="#C7D2FE" />
      <circle cx="194" cy="112" r="9" fill="#4F46E5" />
      <path d="M191 112L193 114L198 109" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Laptop Keyboard / Base */}
      <polygon points="78,163 242,163 232,169 88,169" fill="#6366F1" />
      
      {/* Coffee Cup */}
      <rect x="248" y="142" width="18" height="22" rx="3" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      <path d="M266 148C270 148 272 151 272 154C272 157 270 160 266 160" stroke="#6366F1" strokeWidth="2" />
      
      {/* Stack of Books */}
      <rect x="36" y="148" width="38" height="8" rx="2" fill="#4F46E5" />
      <rect x="39" y="140" width="32" height="8" rx="2" fill="#7C3AED" />
      <rect x="41" y="132" width="28" height="8" rx="2" fill="#10B981" />
    </svg>
  );
}

// ─── Compact Academic/App Style Visual Component ─────────────────────────────

function AppStyleAcademicVisual() {
  return (
    <div className="relative w-full max-w-lg bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 rounded-3xl p-6 border border-indigo-100/80 shadow-xl shadow-indigo-100/30">
      
      {/* App Window Header Bar */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-indigo-100/60">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
          <span className="w-3 h-3 rounded-full bg-amber-400 opacity-80" />
          <span className="w-3 h-3 rounded-full bg-emerald-400 opacity-80" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-700">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
          Academic Overview
        </div>
      </div>

      {/* Center Illustration Graphic */}
      <div className="flex justify-center my-1">
        <StudentLaptopIllustration className="w-full h-auto max-h-40 drop-shadow-xs" />
      </div>

      {/* Decorative Ribbon Icons */}
      <div className="flex items-center justify-around py-2.5 my-3 bg-white/90 rounded-2xl border border-indigo-50 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <ClockIcon className="w-4 h-4 text-indigo-600" />
          <span>Deadlines</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <BellIcon className="w-4 h-4 text-violet-600" />
          <span>Alerts</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <CalendarIcon className="w-4 h-4 text-indigo-600" />
          <span>Schedule</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <BookIcon className="w-4 h-4 text-indigo-600" />
          <span>Subjects</span>
        </div>
      </div>

      {/* Compact Preview Cards */}
      <div className="space-y-3 mt-3">
        {/* Deadline Card */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-sm border border-indigo-100/80">
          <ClockIcon className="w-5 h-5 flex-shrink-0 text-indigo-600" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-xs font-bold text-gray-900 truncate">Assignment Due — Tomorrow</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 flex-shrink-0">
                Due Tomorrow
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate font-medium">Analysis of Algorithms • High Priority</p>
          </div>
        </div>

        {/* Announcement Alert Card */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-sm border border-indigo-100/80">
          <BellIcon className="w-5 h-5 flex-shrink-0 text-violet-600" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-xs font-bold text-gray-900 truncate">DBMS Practical Room Changed</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 flex-shrink-0">
                Notice
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate font-medium">Lab 405 instead of Lab 301 • Urgent</p>
          </div>
        </div>

        {/* Schedule Task Card */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-sm border border-indigo-100/80">
          <CheckIcon className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-xs font-bold text-gray-900 truncate">Project Review Scheduled</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
                Confirmed
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate font-medium">Full Stack Development • 24 Aug • 10:00 AM</p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Main Welcome App Screen Component ───────────────────────────────────────

export function AppWelcome({ onGetStarted }) {
  useEffect(() => {
    document.title = 'DeadlineHub — Smart Academic Deadline & Announcement Board';
  }, []);

  return (
    <>
      <style>{`
        @keyframes dhFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dhBlob {
          0%, 100% { border-radius: 60% 40% 55% 45% / 55% 45% 60% 40%; }
          50%       { border-radius: 45% 55% 40% 60% / 40% 60% 45% 55%; }
        }
        .dh-fade-up   { animation: dhFadeUp 0.5s 0.0s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-fade-up-1 { animation: dhFadeUp 0.5s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-fade-up-2 { animation: dhFadeUp 0.5s 0.16s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-fade-up-3 { animation: dhFadeUp 0.5s 0.24s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .dh-blob      { animation: dhBlob 10s ease-in-out infinite; }
        .dh-blob-slow { animation: dhBlob 14s ease-in-out infinite reverse; }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 relative flex flex-col justify-between overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200">

        {/* ── Background Decorative Elements ─────────────────────────────── */}
        <div aria-hidden="true" className="pointer-events-none select-none">
          <div
            className="dh-blob absolute -top-36 -right-36 w-[550px] h-[550px] opacity-10 dark:opacity-20"
            style={{ background: 'radial-gradient(circle, #4F46E5 0%, #7C3AED 70%, transparent 100%)' }}
          />
          <div
            className="dh-blob-slow absolute top-[30%] -left-32 w-[400px] h-[400px] opacity-[0.07] dark:opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #818CF8 0%, #C7D2FE 100%)' }}
          />
          <svg className="absolute top-16 left-8 opacity-[0.14] dark:opacity-[0.08]" width="160" height="160" fill="none">
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <circle key={`t-${r}-${c}`} cx={c * 30 + 6} cy={r * 30 + 6} r="2.5" fill="#4F46E5"/>
              ))
            )}
          </svg>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TOP-LEFT BRANDING HEADER (NO MARKETING LINKS)
        ════════════════════════════════════════════════════════════════════ */}
        <header className="w-full max-w-7xl mx-auto px-6 lg:px-10 pt-6 sm:pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5 cursor-pointer">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 16 14"/>
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-slate-900 dark:text-slate-100">Deadline</span>
              <span className="text-indigo-600 dark:text-primary-400">Hub</span>
            </span>
          </div>
          <ThemeToggle />
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN HERO SECTION (BALANCED APP WELCOME)
        ════════════════════════════════════════════════════════════════════ */}
        <main className="flex-1 flex items-center max-w-7xl mx-auto px-6 lg:px-10 py-6 lg:py-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">

            {/* ── LEFT COLUMN: Main Hero Content ──────────────────────────── */}
            <div className="lg:col-span-6 text-center lg:text-left flex flex-col justify-center">

              {/* Large Bold Heading */}
              <h1 className="dh-fade-up-1 text-4xl sm:text-6xl lg:text-[4.2rem] font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
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

              {/* Supporting Text */}
              <p className="dh-fade-up-2 text-base sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 font-medium">
                Your class deadlines, announcements and important academic updates&nbsp;—&nbsp;organized in one place.
              </p>

              {/* Single Primary Action Button */}
              <div className="dh-fade-up-3 flex justify-center lg:justify-start">
                <button
                  id="landing-getstarted-hero"
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-3 px-9 py-4 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                >
                  Get Started
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* 3 Subtle Benefit Badges */}
              <div className="dh-fade-up-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Simple
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Organized
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Student-friendly
                </span>
              </div>

            </div>

            {/* ── RIGHT COLUMN: Compact Academic App Visual ──────────────── */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <AppStyleAcademicVisual />
            </div>

          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════════
            SUBTLE BOTTOM WAVE DECORATIVE ACCENT
        ════════════════════════════════════════════════════════════════════ */}
        <footer aria-hidden="true" className="relative h-14 sm:h-16 overflow-hidden pointer-events-none w-full">
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
              opacity="0.12"
            />
          </svg>
        </footer>

      </div>
    </>
  );
}
