import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function JoinClass({ onBackToHome }) {
  const [step, setStep] = useState('enter_code'); // 'enter_code', 'preview_class', 'pending_approval'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Optional Back Button for early steps */}
      {step === 'enter_code' && (
        <div className="w-full max-w-md mb-6">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Skip for now
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
        
        {step === 'enter_code' && (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-md shadow-primary-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Join your class</h1>
              <p className="text-gray-500 text-sm">
                Enter the class code shared by your CR, teacher or administrator.
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setStep('preview_class'); }}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 block">Class Code</label>
                <Input 
                  type="text" 
                  placeholder="D15C-5IT" 
                  className="w-full text-center uppercase tracking-widest text-lg font-mono"
                  defaultValue="D15C-5IT"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full justify-center py-2.5 mt-2">
                Find Class
              </Button>
            </form>
          </>
        )}

        {step === 'preview_class' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Class</h1>
              <p className="text-gray-500 text-sm">
                Is this the correct class?
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6 text-center space-y-2">
              <div className="text-lg font-bold text-gray-900">Information Technology</div>
              <div className="text-gray-600 font-medium">Semester 5</div>
              <div className="text-gray-600 font-medium">Division D15C</div>
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">Class Code</span>
                <span className="font-mono text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded inline-block">D15C-5IT</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={() => setStep('pending_approval')} variant="primary" className="w-full justify-center py-2.5">
                Request to Join
              </Button>
              <button onClick={() => setStep('enter_code')} className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Back / Change Code
              </button>
            </div>
          </>
        )}

        {step === 'pending_approval' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Sent</h1>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Your request to join <span className="font-semibold text-gray-900">IT • Semester 5 • D15C</span> is waiting for approval.
              </p>
              
              <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student:</span>
                  <span className="font-medium text-gray-900">Jane Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-900">student@college.edu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Code:</span>
                  <span className="font-medium text-gray-900">101155</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-amber-600 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={onBackToHome} variant="primary" className="w-full justify-center py-2.5">
                Back to Home
              </Button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
