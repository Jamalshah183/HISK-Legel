'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { AdminPortal } from '@/components/portal/AdminPortal';
import { usePortalStore } from '@/lib/portalStore';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Mail, KeyRound, LogOut, CheckCircle2, User, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { checkRateLimit, recordAttempt, resetRateLimit } from '@/lib/rateLimiter';
import { useInactivityTimeout } from '@/lib/useInactivityTimeout';

const ALLOWED_ADMIN_EMAILS = [
  'jamalshah183@gmail.com',
  'adv.kayani@gmail.com',
  'adv.kiyani@gmail.com',
  'aamer222@gmail.com',
  'namias327@gmail.com',
  'rahim.nawaz@i-con.pk',
];

const AUTHORIZED_ADMIN_CREDENTIALS: Record<string, string> = {
  'rahim.nawaz@i-con.pk': 'admin123',
};

const getInitialAdminSession = (): FirebaseUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('hisk_admin_auth_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.email && ALLOWED_ADMIN_EMAILS.includes(parsed.email.toLowerCase())) {
        return {
          email: parsed.email.toLowerCase(),
          displayName: parsed.displayName || 'Authorized Admin',
          uid: 'admin-partner-' + parsed.email.replace(/[^a-zA-Z0-9]/g, '_'),
        } as unknown as FirebaseUser;
      }
    }
  } catch (e) {
    console.warn('Session parse note:', e);
  }
  return null;
};

export default function AdminPortalPage() {
  const [portalMode, setPortalMode] = useState<'admin' | 'client'>('admin');
  const { clients } = usePortalStore();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(getInitialAdminSession);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => !!getInitialAdminSession());
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // Email & Password login states
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const email = user?.email?.toLowerCase();
      if (user && email && ALLOWED_ADMIN_EMAILS.includes(email)) {
        setCurrentUser(user);
        setIsAdminLoggedIn(true);
        try {
          localStorage.setItem(
            'hisk_admin_auth_user',
            JSON.stringify({
              email: email,
              displayName: user.displayName || email.split('@')[0],
              loggedInAt: Date.now(),
            })
          );
        } catch (e) {}
      } else {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('hisk_admin_auth_user') : null;
        if (!saved) {
          setIsAdminLoggedIn(false);
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);

    // Rate limit check
    const rateCheck = checkRateLimit('admin_login');
    if (!rateCheck.allowed) {
      setAuthError(rateCheck.message || 'Rate limit exceeded. Please try again later.');
      return;
    }
    recordAttempt('admin_login');

    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
        resetRateLimit('admin_login');
        try {
          localStorage.setItem(
            'hisk_admin_auth_user',
            JSON.stringify({
              email: email,
              displayName: result.user.displayName || email.split('@')[0],
              loggedInAt: Date.now(),
            })
          );
        } catch (e) {}
        setCurrentUser(result.user);
        setIsAdminLoggedIn(true);
      } else {
        await signOut(auth);
        try {
          localStorage.removeItem('hisk_admin_auth_user');
        } catch (e) {}
        setIsAdminLoggedIn(false);
        setCurrentUser(null);
        setAuthError(
          `Access Denied: Admin Portal is restricted to authorized admin emails (${ALLOWED_ADMIN_EMAILS.join(', ')}). You signed in as: ${result.user.email || 'another account'}.`
        );
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed. Please try again.');
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !passwordInput) {
      setAuthError('Please enter both your authorized email and password.');
      return;
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      setAuthError(
        `Access Denied: ${cleanEmail} is not in the list of authorized admin emails. Please check your email or contact the senior administrator.`
      );
      return;
    }

    // Rate limit check
    const rateCheck = checkRateLimit('admin_login');
    if (!rateCheck.allowed) {
      setAuthError(rateCheck.message || 'Too many attempts. Please try again in a few minutes.');
      return;
    }
    recordAttempt('admin_login');

    setAuthLoading(true);

    // Direct authorization check for pre-configured credentials (e.g. rahim.nawaz@i-con.pk / admin123)
    if (AUTHORIZED_ADMIN_CREDENTIALS[cleanEmail] && AUTHORIZED_ADMIN_CREDENTIALS[cleanEmail] === passwordInput) {
      resetRateLimit('admin_login');
      const sessionUser = {
        email: cleanEmail,
        displayName: 'Rahim Nawaz (Admin Partner)',
        uid: 'admin-partner-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      } as unknown as FirebaseUser;

      try {
        localStorage.setItem(
          'hisk_admin_auth_user',
          JSON.stringify({
            email: cleanEmail,
            displayName: 'Rahim Nawaz (Admin Partner)',
            loggedInAt: Date.now(),
          })
        );
      } catch (e) {
        console.warn('Storage save error:', e);
      }

      setCurrentUser(sessionUser);
      setIsAdminLoggedIn(true);
      setAuthSuccessMessage('Authorized successfully as Rahim Nawaz (Admin). Access granted!');
      setAuthLoading(false);

      // Attempt background Firebase Auth sync/creation
      signInWithEmailAndPassword(auth, cleanEmail, passwordInput).catch(() => {
        createUserWithEmailAndPassword(auth, cleanEmail, passwordInput).catch(() => {});
      });
      return;
    }

    // If entered incorrect password for pre-configured credentials
    if (AUTHORIZED_ADMIN_CREDENTIALS[cleanEmail] && AUTHORIZED_ADMIN_CREDENTIALS[cleanEmail] !== passwordInput) {
      setAuthError('Invalid password for this authorized administrator account.');
      setAuthLoading(false);
      return;
    }

    try {
      if (isRegisterMode) {
        if (passwordInput.length < 6) {
          setAuthError('Password must be at least 6 characters long.');
          setAuthLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
        resetRateLimit('admin_login');
        try {
          localStorage.setItem(
            'hisk_admin_auth_user',
            JSON.stringify({
              email: cleanEmail,
              displayName: result.user.displayName || cleanEmail.split('@')[0],
              loggedInAt: Date.now(),
            })
          );
        } catch (e) {}
        setCurrentUser(result.user);
        setIsAdminLoggedIn(true);
        setAuthSuccessMessage('Admin credentials verified. Welcome!');
      } else {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
        resetRateLimit('admin_login');
        try {
          localStorage.setItem(
            'hisk_admin_auth_user',
            JSON.stringify({
              email: cleanEmail,
              displayName: result.user.displayName || cleanEmail.split('@')[0],
              loggedInAt: Date.now(),
            })
          );
        } catch (e) {}
        setCurrentUser(result.user);
        setIsAdminLoggedIn(true);
      }
    } catch (err: any) {
      console.warn('Email/Password auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        msg =
          'Invalid email or password. If you have not created a password yet for this authorized account, click "Forgot / Set Password" below or switch to "Create password".';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account already exists for this email. Please sign in with your password or use "Forgot / Set Password".';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      }
      setAuthError(msg);
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Please enter your authorized email address above first, then click "Forgot / Set Password".');
      return;
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      setAuthError(`Access Denied: ${cleanEmail} is not an authorized admin email.`);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setAuthSuccessMessage(
        `A password set/reset link has been sent to ${cleanEmail}. Check your inbox and spam folder to set your password.`
      );
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset email. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('hisk_admin_auth_user');
    } catch (e) {}
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setPasswordInput('');
  };

  // Auto-logout after 2 minutes (120,000 ms) of inactivity
  useInactivityTimeout(
    isAdminLoggedIn,
    () => {
      handleSignOut();
      setAuthError('Logged out automatically due to 2 minutes of inactivity.');
    },
    120000
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#F5A623] selection:text-[#1A1A1A]">
      <PortalHeader
        mode={portalMode}
        setMode={setPortalMode}
        onExitPortal={() => {
          window.location.href = '/';
        }}
        selectedClientName={clients[0]?.name}
      />

      <div className="bg-[#0A4B35] text-white py-2 px-4 text-xs font-semibold flex items-center justify-between border-b border-[#0F6B4C]">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <Link href="/" className="text-emerald-200 hover:text-white flex items-center gap-1.5 font-heading">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main Law Firm Website
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-emerald-300 hidden sm:inline">
              Firebase Project: <code className="bg-emerald-950 px-2 py-0.5 rounded text-[#F5A623]">hisk-46a92</code>
            </span>
            {isAdminLoggedIn && (
              <button
                onClick={handleSignOut}
                className="bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <LogOut className="w-3 h-3" /> Sign Out Admin
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col justify-center">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-[#0A4B35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-600">Verifying Admin Access Credentials...</p>
          </div>
        ) : isAdminLoggedIn ? (
          <AdminPortal />
        ) : (
          <div className="max-w-md w-full mx-auto p-4 py-12">
            <div className="bg-white rounded-3xl border border-[#0F6B4C]/20 shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#0A4B35] text-[#F5A623] flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="bg-[#0A4B35]/10 text-[#0A4B35] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  HISK LEGAL Admin Portal
                </span>
                <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">
                  Advocate Admin Authentication
                </h1>
                <p className="text-xs text-gray-600">
                  Secure Portal for Senior Advocates & Litigation Partners of HISK LEGAL
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl font-medium">
                  {authError}
                </div>
              )}

              {authSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-2xl font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{authSuccessMessage}</span>
                </div>
              )}

              {/* GOOGLE SIGN IN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all text-xs flex items-center justify-center gap-3 cursor-pointer border border-emerald-500/30"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.28 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.72 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-white text-xs sm:text-sm">Sign in with Authorized Google Account</span>
              </button>

              {/* OR DIVIDER */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                  or sign in with email & password
                </span>
              </div>

              {/* EMAIL & PASSWORD SIGN IN FORM */}
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter authorized email address"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4B35] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold hover:underline cursor-pointer"
                    >
                      Forgot / Set Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={isRegisterMode ? 'Set a password (min 6 chars)' : '••••••••'}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4B35] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] hover:bg-[#0A4B35] text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-gray-800"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>
                    {isRegisterMode ? 'Register Password & Sign In' : 'Sign In with Email & Password'}
                  </span>
                </button>

                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setAuthError(null);
                      setAuthSuccessMessage(null);
                    }}
                    className="text-[11px] text-gray-500 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
                  >
                    {isRegisterMode
                      ? 'Already set your password? Return to standard Sign In'
                      : 'First time signing in with password? Create your password here'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
