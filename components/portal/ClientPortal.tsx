'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  ShieldCheck,
  FileText,
  Calendar,
  FolderOpen,
  CreditCard,
  MessageCircle,
  PhoneCall,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Search,
  Lock,
  ArrowRight,
  ExternalLink,
  Info,
  LogOut,
  Mail,
  KeyRound,
  Construction,
  Clock,
  Sparkles,
  Scale,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { usePortalStore } from '@/lib/portalStore';
import { Client, CaseFile, Invoice } from '@/types/portal';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { InvoicePdfModal } from '@/components/portal/InvoicePdfModal';
import { checkRateLimit, recordAttempt, resetRateLimit } from '@/lib/rateLimiter';
import { useInactivityTimeout } from '@/lib/useInactivityTimeout';

interface ClientPortalProps {
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  selectedClientId,
  setSelectedClientId
}) => {
  const {
    clients,
    cases,
    notices,
    documents,
    invoices,
    hearings,
    clientCredentials,
    addDocument,
    markInvoicePaid
  } = usePortalStore();

  const [inputNtnOrCnic, setInputNtnOrCnic] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState<Invoice | null>(null);
  const [newClientDocTitle, setNewClientDocTitle] = useState('');
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);

  // Client authentication state
  const [authenticatedClientId, setAuthenticatedClientId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hisk_client_session_id') || null;
    }
    return null;
  });
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Rate limit check
    const rateCheck = checkRateLimit('client_login');
    if (!rateCheck.allowed) {
      setAuthError(rateCheck.message || 'Too many attempts. Please try again later.');
      return;
    }
    recordAttempt('client_login');

    const cleanEmail = clientEmail.trim().toLowerCase();

    // 1. Check in clientCredentials
    const matchedCred = clientCredentials.find(
      (c) => c.email.toLowerCase() === cleanEmail && c.password === clientPassword
    );

    if (matchedCred) {
      resetRateLimit('client_login');
      setAuthenticatedClientId(matchedCred.clientId);
      setSelectedClientId(matchedCred.clientId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hisk_client_session_id', matchedCred.clientId);
      }
      return;
    }

    // 2. Check in clients list by email
    const matchedClient = clients.find(
      (c) => c.email.toLowerCase() === cleanEmail || c.ntn.replaceAll('-', '').includes(cleanEmail.replaceAll('-', ''))
    );

    if (matchedClient) {
      resetRateLimit('client_login');
      setAuthenticatedClientId(matchedClient.id);
      setSelectedClientId(matchedClient.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hisk_client_session_id', matchedClient.id);
      }
      return;
    }

    setAuthError('Invalid credentials. Please enter your email and password created in the Admin Portal.');
  };

  const handleClientSignOut = () => {
    setAuthenticatedClientId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hisk_client_session_id');
    }
  };

  // Auto-logout after 2 minutes (120,000 ms) of inactivity
  useInactivityTimeout(
    !!authenticatedClientId,
    () => {
      handleClientSignOut();
      setAuthError('You have been automatically logged out due to 2 minutes of inactivity.');
    },
    120000
  );

  // Get active selected client or fallback
  const currentClient =
    clients.find((c) => c.id === (authenticatedClientId || selectedClientId)) || clients[0] || null;

  // Filter client specific data
  const clientCases = cases.filter((c) => c.clientId === currentClient?.id);
  const clientNotices = notices.filter((n) => n.clientId === currentClient?.id);
  const clientDocs = documents.filter((d) => d.clientId === currentClient?.id);
  const clientInvoices = invoices.filter((i) => i.clientId === currentClient?.id);

  const handleUploadClientDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || clientCases.length === 0) return;
    const activeCase = clientCases[0];

    addDocument({
      caseId: activeCase.id,
      clientId: currentClient.id,
      title: newClientDocTitle || 'Client Provided Bank Statement',
      category: 'Bank Statement',
      fileSize: '2.1 MB',
      uploadedBy: currentClient.name,
      fileType: 'pdf',
      downloadUrl: '#',
      isClientVisible: true
    });

    setShowUploadModal(false);
    setNewClientDocTitle('');
    alert('Document uploaded successfully to your legal case vault!');
  };

  // DEDICATED APPEALING CLIENT "UNDER CONSTRUCTION" VIEW (NO LOGIN BOX)
  if (!showLayoutPreview) {
    return (
      <div className="min-h-[85vh] bg-[#071F17] text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-[#F5A623] selection:text-[#1A1A1A]">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#0F6B4C]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#F5A623]/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,107,76,0.25)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-4xl w-full mx-auto relative z-10 text-center space-y-8 sm:space-y-10 my-auto py-6 sm:py-10">
          {/* Top Logo & Status Pills */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-56 sm:w-72 h-16 sm:h-20 mx-auto drop-shadow-2xl">
              <Image
                src="https://i.ibb.co/V02sjKtY/file-00000000549882089b03c95577e607a2.png"
                alt="HISK LEGAL Logo"
                fill
                unoptimized
                className="object-contain object-center"
                referrerPolicy="no-referrer"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2.5 bg-[#0F6B4C]/50 border border-[#F5A623]/40 px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F5A623]"></span>
              </span>
              <span className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-widest text-[#F5A623]">
                Client Workspace Upgrade
              </span>
              <span className="text-white/40">|</span>
              <span className="text-xs font-semibold text-emerald-200">
                Exclusively For Clients
              </span>
            </div>
          </div>

          {/* Big, Striking "UNDER CONSTRUCTION" Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-[#F5A623]/15 border border-[#F5A623]/40 text-[#F5A623] shadow-inner">
              <Construction className="w-10 h-10 sm:w-14 sm:h-14 animate-pulse text-[#F5A623]" />
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-heading font-black tracking-tight uppercase leading-none drop-shadow-2xl">
              <span className="text-white">Under</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFD584] to-[#F5A623]">
                Construction
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-emerald-100/90 font-normal leading-relaxed drop-shadow">
              We are currently engineering a high-security, real-time client case vault and court hearing tracking portal exclusively for registered clients of <strong className="text-white font-extrabold">HISK LEGAL</strong>.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-xl mx-auto bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-left space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-2 text-emerald-200">
                <Clock className="w-4 h-4 text-[#F5A623]" />
                System Integration &amp; Encrypted Vault Setup
              </span>
              <span className="font-mono text-[#F5A623] font-extrabold">85% Complete</span>
            </div>
            <div className="w-full bg-emerald-950/80 rounded-full h-2.5 overflow-hidden border border-emerald-500/30">
              <div className="bg-gradient-to-r from-[#0F6B4C] via-[#F5A623] to-[#FFD584] h-full rounded-full w-[85%] transition-all duration-1000 shadow-sm" />
            </div>
            <p className="text-[11px] text-emerald-300/70 text-right">
              Expected Launch: Q2 2026 • Encrypted 256-bit Case Vault
            </p>
          </div>

          {/* Upcoming Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="bg-white/5 hover:bg-white/10 transition-all border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm group">
              <div className="w-9 h-9 rounded-xl bg-[#0F6B4C]/70 flex items-center justify-center text-[#F5A623] mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-white mb-1">
                Live Hearing Calendar
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Direct cause list sync for High Court &amp; Appellate Tribunal dates.
              </p>
            </div>

            <div className="bg-white/5 hover:bg-white/10 transition-all border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm group">
              <div className="w-9 h-9 rounded-xl bg-[#0F6B4C]/70 flex items-center justify-center text-[#F5A623] mb-3 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-white mb-1">
                Secure Evidence Vault
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Download certified stay orders, tax appeals, and legal opinions.
              </p>
            </div>

            <div className="bg-white/5 hover:bg-white/10 transition-all border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm group">
              <div className="w-9 h-9 rounded-xl bg-[#0F6B4C]/70 flex items-center justify-center text-[#F5A623] mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-white mb-1">
                FBR Notice Tracking
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Real-time alerts for show-cause summons and ATL compliance.
              </p>
            </div>

            <div className="bg-white/5 hover:bg-white/10 transition-all border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm group">
              <div className="w-9 h-9 rounded-xl bg-[#0F6B4C]/70 flex items-center justify-center text-[#F5A623] mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-white mb-1">
                Direct Advocate Desk
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Instant encrypted messaging with your handling legal advocate.
              </p>
            </div>
          </div>

          {/* Direct Urgent Action Hub for Clients */}
          <div className="pt-2 sm:pt-4 max-w-2xl mx-auto space-y-4">
            <div className="bg-gradient-to-r from-[#0F6B4C]/40 via-[#0A4B35]/60 to-[#0F6B4C]/40 border border-[#F5A623]/30 rounded-3xl p-5 sm:p-6 backdrop-blur-md space-y-4 shadow-2xl">
              <div>
                <h4 className="font-heading font-extrabold text-base sm:text-lg text-white">
                  Need an Immediate Update on Your Active Case?
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                  Our High Court advocates and legal support team are active right now to assist with hearings, stay orders, and filings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <a
                  href={buildWhatsAppUrl({
                    customMessage: 'Assalamu Alaikum HISK LEGAL, I am an active client requesting an urgent status briefing on my ongoing case/court matter.'
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white font-heading font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Chat With Advocate on WhatsApp</span>
                </a>

                <a
                  href="tel:+923145113670"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-bold text-sm sm:text-base px-5 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-[#F5A623]" />
                  <span>Call: +92 314 5113670</span>
                </a>
              </div>
            </div>

            {/* Subtle Discrete Toggle to Preview Layout and Keep Coding 100% Intact */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  const demoId = clients[0]?.id || 'cli-101';
                  setSelectedClientId(demoId);
                  setAuthenticatedClientId(demoId);
                  setShowLayoutPreview(true);
                }}
                className="text-[11px] text-emerald-400/60 hover:text-[#F5A623] transition-colors underline underline-offset-4 cursor-pointer"
              >
                Law Firm Internal: Preview Client Dashboard &amp; Case Vault Layout &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Return to Under Construction Screen Banner (Preserving Layout & Code) */}
      <div className="bg-amber-500/10 border-2 border-dashed border-amber-400/90 p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-amber-950 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#F5A623] text-[#1A1A1A] shrink-0 shadow-sm">
            <Construction className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-extrabold text-sm sm:text-base text-[#1A1A1A]">
                Client Portal Layout &amp; Code Architecture (Active Preview)
              </h2>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Exclusively For Clients
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 max-w-3xl leading-relaxed">
              All client management modules, documents, hearing lists, and invoices are 100% preserved in the codebase.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowLayoutPreview(false)}
          className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-heading font-extrabold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-end md:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Under Construction View</span>
        </button>
      </div>

      {/* Top Client Bar & Switcher */}
      <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0A4B35] text-[#F5A623] flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
            {currentClient?.name.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0F6B4C]/10 text-[#0F6B4C] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                {currentClient?.category || 'Corporate Client'}
              </span>
              <span className="text-xs font-mono font-bold text-gray-500">NTN: {currentClient?.ntn}</span>
            </div>
            <h1 className="text-xl font-heading font-extrabold text-[#1A1A1A] mt-1">
              {currentClient?.name}
            </h1>
            <p className="text-xs text-[#5A6275]">
              {currentClient?.registeredAddress} • {currentClient?.city} • Email: <span className="font-mono">{currentClient?.email}</span>
            </p>
          </div>
        </div>

        {/* Client Account Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClientSignOut}
            className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-extrabold px-4 py-2 rounded-2xl border border-red-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#0F6B4C]/15 shadow-sm">
          <div className="flex items-center justify-between text-[#0F6B4C] mb-2">
            <span className="text-xs font-bold text-[#5A6275]">Active Legal Proceedings</span>
            <ShieldCheck className="w-5 h-5 text-[#0F6B4C]" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-[#1A1A1A]">
            {clientCases.length} Active Files
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">High Court & Tribunal Representation</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#0F6B4C]/15 shadow-sm">
          <div className="flex items-center justify-between text-[#0F6B4C] mb-2">
            <span className="text-xs font-bold text-[#5A6275]">Pending FBR Notices</span>
            <AlertCircle className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-[#1A1A1A]">
            {clientNotices.length} Notices
          </div>
          <div className="text-[11px] text-amber-800 font-bold mt-1">Legal Counsel Drafting Replies</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#0F6B4C]/15 shadow-sm">
          <div className="flex items-center justify-between text-[#0F6B4C] mb-2">
            <span className="text-xs font-bold text-[#5A6275]">Total Tax Saved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-emerald-700">
            {currentClient?.totalTaxSaved || 'Rs. 0'}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">Via High Court Stay Orders</div>
        </div>
      </div>

      {/* Main Section: Active Case & Live Stage Tracker */}
      <div className="space-y-6">
        <h2 className="text-xl font-heading font-extrabold text-[#1A1A1A]">
          Your Active Cases & Court Stage Progress
        </h2>

        {clientCases.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl p-6 border border-[#0F6B4C]/15 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#0A4B35] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                    {c.forum}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0F6B4C]">Ref: {c.caseRef}</span>
                </div>
                <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">{c.caseTitle}</h3>
                <div className="text-xs text-[#5A6275]">
                  Lead Counsel: <span className="font-bold text-[#0F6B4C]">{c.assignedCounsel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
                  Status: {c.status}
                </span>
                <a
                  href={buildWhatsAppUrl({ topic: 'general' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-emerald-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Counsel</span>
                </a>
              </div>
            </div>

            {/* Hearing Timeline History */}
            <div>
              <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A] mb-3">Case History & Order Sheets</h4>
              <div className="space-y-3 pl-4 border-l-2 border-[#0F6B4C]/20">
                {c.timeline.map((t) => (
                  <div key={t.id} className="bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#1A1A1A]">
                      <span>{t.title}</span>
                      <span className="text-[#0F6B4C]">{t.date}</span>
                    </div>
                    <p className="text-[#5A6275]">{t.description}</p>
                    {t.outcome && (
                      <div className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 p-2 rounded-xl mt-2">
                        Official Order: {t.outcome}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Document Vault & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Vault */}
        <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#0F6B4C]" />
              <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Case Document Vault</h3>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#0A4B35] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#0F6B4C] flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Upload Bill/Doc</span>
            </button>
          </div>

          <div className="space-y-3">
            {clientDocs.map((doc) => (
              <div key={doc.id} className="bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold bg-[#0F6B4C]/10 text-[#0F6B4C] px-2 py-0.5 rounded-md">
                    {doc.category}
                  </span>
                  <div className="font-bold text-[#1A1A1A] mt-1">{doc.title}</div>
                  <div className="text-[10px] text-[#5A6275]">{doc.fileSize} • Uploaded {doc.uploadedAt}</div>
                </div>
                <button
                  onClick={() => alert(`Simulated Download: Downloading "${doc.title}" certified copy.`)}
                  className="bg-[#0A4B35] text-white p-2 rounded-xl hover:bg-[#0F6B4C]"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-[#F5A623]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Invoices & Retainers */}
        <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0F6B4C]" />
              <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Retainer Fee Invoices</h3>
            </div>
          </div>

          <div className="space-y-3">
            {clientInvoices.map((inv) => (
              <div key={inv.id} className="bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono font-bold text-[#0F6B4C]">{inv.invoiceNumber}</div>
                  <div className="font-bold text-[#1A1A1A] mt-0.5">{inv.serviceDescription}</div>
                  <div className="text-[10px] text-[#5A6275]">Issued: {inv.issueDate}</div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 justify-between sm:justify-end">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                    <div className="font-extrabold text-[#0F6B4C] text-sm">
                      Rs. {inv.totalAmountPkr.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForPdf(inv)}
                      className="bg-[#0A4B35] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-[#0F6B4C] flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#F5A623]" />
                      <span>Printable PDF</span>
                    </button>

                    {inv.status !== 'Paid' && (
                      <button
                        onClick={() => {
                          markInvoicePaid(inv.id, 'Online PKR');
                          alert('Simulated Payment Successful! Bank payment receipt generated.');
                        }}
                        className="text-[11px] font-bold bg-[#F5A623] text-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-sm hover:bg-amber-500"
                      >
                        Pay Online Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: UPLOAD CLIENT DOCUMENT */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#0F6B4C]/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Upload Document to Advocates</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleUploadClientDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Document Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank Statement 2024 / Electricity Bill"
                  value={newClientDocTitle}
                  onChange={(e) => setNewClientDocTitle(e.target.value)}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="border-2 border-dashed border-[#0F6B4C]/30 bg-[#FAFAF7] p-6 rounded-2xl text-center">
                <Upload className="w-8 h-8 text-[#0F6B4C] mx-auto mb-2" />
                <div className="font-bold text-[#1A1A1A]">Drop your file here</div>
                <div className="text-[10px] text-[#5A6275] mt-1">Scanned PDF or images</div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A4B35] text-white font-extrabold shadow-sm"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Legal PDF Invoice Modal */}
      {selectedInvoiceForPdf && (
        <InvoicePdfModal
          invoice={selectedInvoiceForPdf}
          client={currentClient}
          caseFile={clientCases.find((c) => c.id === selectedInvoiceForPdf.caseId) || clientCases[0]}
          onClose={() => setSelectedInvoiceForPdf(null)}
          onMarkPaid={markInvoicePaid}
        />
      )}
    </div>
  );
};
