import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { authApi } from '../api/api';

export function VerifyOtp({
  initialEmail = '',
  initialRole = 'student',
  infoNotice = '',
  onVerified,
  onBack,
  onNavigateLogin,
}) {
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [infoMessage, setInfoMessage] = useState(infoNotice || '');
  const inputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Focus the first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    if (error) setError('');
    const cleanVal = value.replace(/\D/g, '');

    // Single digit input
    if (cleanVal.length <= 1) {
      const nextDigits = [...digits];
      nextDigits[index] = cleanVal;
      setDigits(nextDigits);

      // Auto-advance to next input
      if (cleanVal && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
      return;
    }

    // Pasted multiple digits (e.g. "123456")
    const pastedChars = cleanVal.slice(0, 6).split('');
    const nextDigits = [...digits];
    pastedChars.forEach((ch, idx) => {
      if (idx < 6) nextDigits[idx] = ch;
    });
    setDigits(nextDigits);

    const focusIdx = Math.min(pastedChars.length, 5);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasteData) return;

    const pastedChars = pasteData.slice(0, 6).split('');
    const nextDigits = ['', '', '', '', '', ''];
    pastedChars.forEach((ch, idx) => {
      if (idx < 6) nextDigits[idx] = ch;
    });
    setDigits(nextDigits);

    const focusIdx = Math.min(pastedChars.length, 5);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setInfoMessage('');

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    const otp = digits.join('');
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email: email.trim(), otp });
      setSuccess(res.message || 'Email verified successfully! You can now log in.');
      setTimeout(() => {
        if (onVerified) {
          onVerified({ email: email.trim(), role: initialRole });
        } else if (onNavigateLogin) {
          onNavigateLogin();
        }
      }, 1200);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setSuccess('');
    setInfoMessage('');

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    setResending(true);
    try {
      const res = await authApi.resendOtp({ email: email.trim() });
      setInfoMessage(res.message || 'A fresh 6-digit verification code has been sent to your email.');
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      {/* Back Button */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={onBack || onNavigateLogin}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Login
        </button>
      </div>

      <div className="w-full max-w-md card p-8 sm:p-10">
        {/* Header Icon */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            Verify your email
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            We sent a 6-digit verification code to
          </p>
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-900/50">
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 break-all">
              {email || 'your email'}
            </span>
          </div>
        </div>

        {/* Info Notice (e.g. registration notice / email delivery info) */}
        {infoMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs sm:text-sm flex items-start gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="leading-relaxed">{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="leading-relaxed">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 Digit Input Boxes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block text-center mb-3">
              Enter 6-Digit Code
            </label>
            <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  aria-label={`Digit ${idx + 1}`}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm"
                />
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2.5">
              Code expires in <strong className="font-semibold text-slate-600 dark:text-slate-300">10 minutes</strong>
            </p>
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading || digits.join('').length !== 6}
            className="w-full justify-center py-2.5"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>

        {/* Resend Code Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Didn't receive the email? Check your spam folder or
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className={`text-xs font-semibold transition-colors cursor-pointer ${
              cooldown > 0 || resending
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline'
            }`}
          >
            {resending
              ? 'Sending code...'
              : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : 'Resend Verification Code'}
          </button>
        </div>

        {/* Change Email Option */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Already verified? <span className="font-semibold text-primary-600 dark:text-primary-400">Log In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
