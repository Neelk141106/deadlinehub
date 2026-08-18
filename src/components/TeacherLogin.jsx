import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function TeacherLogin({ onLogin, onBack }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Back Button */}
      <div className="w-full max-w-md mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Role Selection
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-md shadow-primary-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
              <path d="m9 16 2 2 4-4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Teacher / Admin Login</h1>
          <p className="text-gray-500 text-sm">
            Manage your classes, deadlines and announcements.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">College Email</label>
            <Input 
              type="email" 
              placeholder="faculty@college.edu" 
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 block">Password</label>
              <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                className="w-full pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center py-2.5 mt-2">
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
}
