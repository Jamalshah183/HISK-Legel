'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { AdminPortal } from '@/components/portal/AdminPortal';
import { usePortalStore } from '@/lib/portalStore';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Mail, KeyRound, LogOut, CheckCircle2, User } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { checkRateLimit, recordAttempt, resetRateLimit } from '@/lib/rateLimiter';
import { useInactivityTimeout } from '@/lib/useInactivityTimeout';

const ALLOWED_ADMIN_EMAILS = ['jamalshah183@gmail.com', 'adv.kayani@gmail.com', 'adv.kiyani@gmail.com', 'aamer222@gmail.com'];

export default function AdminPortalPage() {
  const [portalMode, setPortalMode] = useState<'admin' | 'client'>('admin');
  const { clients } = usePortalStore();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const email = user?.email?.toLowerCase();
      if (user && email && ALLOWED_ADMIN_EMAILS.includes(email)) {
        setCurrentUser(user);
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);

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
        setCurrentUser(result.user);
        setIsAdminLoggedIn(true);
      } else {
        await signOut(auth);
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
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

              <div className="bg-[#FAFAF7] p-3.5 rounded-2xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                <span className="font-extrabold text-[#0A4B35] block">Authorized Admin Portal Accounts:</span>
                <div className="font-mono bg-emerald-50 text-[#0A4B35] p-2 rounded font-bold border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span>jamalshah183@gmail.com</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-sans">Admin</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-emerald-200/60 pt-1">
                    <span>adv.kayani@gmail.com</span>
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-sans font-extrabold">CEO Account</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 pt-1">
                  Connected to Firebase Project <span className="font-mono text-[#0A4B35] font-bold">hisk-46a92</span>.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
