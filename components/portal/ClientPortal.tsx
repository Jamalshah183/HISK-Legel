'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import {
  Calendar,
  FolderOpen,
  CreditCard,
  MessageCircle,
  PhoneCall,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  User,
  Search,
  Lock,
  LogOut,
  Mail,
  KeyRound,
  Scale,
  Eye,
  EyeOff,
  LayoutDashboard,
  MapPin,
  ChevronRight,
  X,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import { usePortalStore } from '@/lib/portalStore';
import { INITIAL_CLIENT_CREDENTIALS } from '@/data/portalSeedData';
import { Client, CaseFile, Invoice, DocumentItem } from '@/types/portal';
import { buildWhatsAppUrl, DISPLAY_PHONE, LAWFIRM_ADDRESS, LAWFIRM_EMAIL } from '@/lib/whatsapp';
import { InvoicePdfModal } from '@/components/portal/InvoicePdfModal';
import { checkRateLimit, recordAttempt, resetRateLimit } from '@/lib/rateLimiter';
import { useInactivityTimeout } from '@/lib/useInactivityTimeout';

interface ClientPortalProps {
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
}

type ClientPortalTab = 'overview' | 'cases' | 'hearings' | 'documents' | 'invoices' | 'profile';

const SEEDED_DEMO_CRED_IDS = new Set(INITIAL_CLIENT_CREDENTIALS.map((c) => c.id));

const CASE_STAGES = [
  'Notice / Filing',
  'Reply / Audit',
  'CIR Appeals',
  'ATIR Tribunal',
  'High Court Writ',
  'Order / Relief'
];

function formatPkr(amount?: number): string {
  return `Rs. ${Number(amount || 0).toLocaleString()}`;
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
    addDocument
  } = usePortalStore();

  // Client session state (restored from localStorage if valid)
  const [authenticatedClientId, setAuthenticatedClientId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hisk_client_session_id') || null;
    }
    return null;
  });

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Workspace navigation & filters
  const [activeTab, setActiveTab] = useState<ClientPortalTab>('overview');
  const [caseSearch, setCaseSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('ALL');
  const [hearingNoticeFilter, setHearingNoticeFilter] = useState<'all' | 'hearings' | 'notices'>('all');

  // Modals & transient feedback
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState<Invoice | null>(null);
  const [paymentGuideInvoice, setPaymentGuideInvoice] = useState<Invoice | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);

  const [newDocCaseId, setNewDocCaseId] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentItem['category']>('Bank Statement');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [newDocFileSize, setNewDocFileSize] = useState('1.2 MB');
  const [clientNotice, setClientNotice] = useState<string | null>(null);

  const showClientNotice = (msg: string) => {
    setClientNotice(msg);
    setTimeout(() => {
      setClientNotice((prev) => (prev === msg ? null : prev));
    }, 6000);
  };

  const currentClient: Client | null = useMemo(() => {
    if (!authenticatedClientId) return null;
    return clients.find((c) => c.id === authenticatedClientId) || null;
  }, [authenticatedClientId, clients]);

  const handleClientSignOut = () => {
    setAuthenticatedClientId(null);
    setActiveTab('overview');
    setAuthError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hisk_client_session_id');
    }
  };

  // Auto-logout after 5 minutes of inactivity
  useInactivityTimeout(
    !!authenticatedClientId,
    () => {
      handleClientSignOut();
      setAuthError('You were signed out automatically after 5 minutes of inactivity.');
    },
    300000
  );

  // Strict credential authentication (matches Admin-created credentials & seeded test accounts)
  const authenticateWithCredentials = (identifierRaw: string, passwordRaw: string) => {
    setAuthError(null);

    const rateCheck = checkRateLimit('client_login');
    if (!rateCheck.allowed) {
      setAuthError(rateCheck.message || 'Too many attempts. Please wait a moment and try again.');
      return;
    }
    recordAttempt('client_login');

    const cleanIdentifier = identifierRaw.trim().toLowerCase();
    const cleanPassword = passwordRaw;

    if (!cleanIdentifier || !cleanPassword) {
      setAuthError('Please enter both your registered Email (or File No.) and Password.');
      return;
    }

    // 1. Direct email + password match in clientCredentials
    const directCred = clientCredentials.find(
      (c) => c.email.trim().toLowerCase() === cleanIdentifier && c.password === cleanPassword
    );
    if (directCred) {
      const targetClient =
        clients.find((cl) => cl.id === directCred.clientId) ||
        clients.find((cl) => cl.email?.trim().toLowerCase() === directCred.email.trim().toLowerCase());
      const resolvedId = targetClient?.id || directCred.clientId;
      resetRateLimit('client_login');
      setAuthenticatedClientId(resolvedId);
      setSelectedClientId(resolvedId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hisk_client_session_id', resolvedId);
      }
      return;
    }

    // 2. Lookup client by File No., NTN, or Email, then verify stored credential / case password
    const cleanIdNoHyphen = cleanIdentifier.replaceAll('-', '');
    const matchedClient = clients.find(
      (cl) =>
        cl.email?.trim().toLowerCase() === cleanIdentifier ||
        cl.fileNumber?.trim().toLowerCase() === cleanIdentifier ||
        (cl.ntn &&
          cleanIdNoHyphen.length >= 5 &&
          cl.ntn.replaceAll('-', '').toLowerCase() === cleanIdNoHyphen)
    );

    if (matchedClient) {
      const linkedCred = clientCredentials.find(
        (cr) =>
          cr.clientId === matchedClient.id ||
          (matchedClient.email &&
            cr.email.trim().toLowerCase() === matchedClient.email.trim().toLowerCase())
      );

      if (linkedCred && linkedCred.password === cleanPassword) {
        resetRateLimit('client_login');
        setAuthenticatedClientId(matchedClient.id);
        setSelectedClientId(matchedClient.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hisk_client_session_id', matchedClient.id);
        }
        return;
      }

      const linkedCaseCred = cases.find(
        (cs) =>
          cs.clientId === matchedClient.id &&
          cs.clientLoginPassword &&
          cs.clientLoginPassword === cleanPassword
      );

      if (linkedCaseCred) {
        resetRateLimit('client_login');
        setAuthenticatedClientId(matchedClient.id);
        setSelectedClientId(matchedClient.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hisk_client_session_id', matchedClient.id);
        }
        return;
      }

      if (!linkedCred && !cases.some((cs) => cs.clientId === matchedClient.id && cs.clientLoginPassword)) {
        setAuthError(
          'No portal password is assigned to this account yet. Please ask your HISK LEGAL administrator to set your client password.'
        );
        return;
      }
    }

    // 3. Direct match on CaseFile login credentials
    const matchedCase = cases.find(
      (cs) =>
        cs.clientLoginEmail?.trim().toLowerCase() === cleanIdentifier &&
        cs.clientLoginPassword === cleanPassword
    );
    if (matchedCase) {
      resetRateLimit('client_login');
      setAuthenticatedClientId(matchedCase.clientId);
      setSelectedClientId(matchedCase.clientId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hisk_client_session_id', matchedCase.clientId);
      }
      return;
    }

    setAuthError(
      'Invalid Email / File No. or Password. Verify your credentials or contact HISK LEGAL support.'
    );
  };

  const handleClientLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticateWithCredentials(loginIdentifier, clientPassword);
  };

  // Official demo presets strictly limited to seeded sample accounts
  const demoTestPresets = useMemo(() => {
    return clientCredentials
      .filter((cred) => SEEDED_DEMO_CRED_IDS.has(cred.id))
      .map((cred) => {
        const clientObj = clients.find((c) => c.id === cred.clientId);
        return {
          cred,
          fileNumber: clientObj?.fileNumber || '',
          category: clientObj?.fileCategoryCode || 'IT'
        };
      })
      .filter((item) => Boolean(clients.some((c) => c.id === item.cred.clientId)))
      .slice(0, 4);
  }, [clientCredentials, clients]);

  // Scoped client records
  const clientCases = useMemo(() => {
    if (!currentClient) return [];
    return cases.filter((c) => c.clientId === currentClient.id);
  }, [cases, currentClient]);

  const clientCaseIds = useMemo(() => new Set(clientCases.map((c) => c.id)), [clientCases]);

  const clientNotices = useMemo(() => {
    if (!currentClient) return [];
    return notices.filter((n) => n.clientId === currentClient.id || clientCaseIds.has(n.caseId));
  }, [notices, currentClient, clientCaseIds]);

  const clientDocs = useMemo(() => {
    if (!currentClient) return [];
    return documents.filter(
      (d) => (d.clientId === currentClient.id || clientCaseIds.has(d.caseId)) && d.isClientVisible !== false
    );
  }, [documents, currentClient, clientCaseIds]);

  const clientInvoices = useMemo(() => {
    if (!currentClient) return [];
    return invoices.filter((i) => i.clientId === currentClient.id || clientCaseIds.has(i.caseId));
  }, [invoices, currentClient, clientCaseIds]);

  const clientHearings = useMemo(() => {
    if (!currentClient) return [];
    const matching = hearings.filter(
      (h) =>
        clientCaseIds.has(h.caseId) ||
        h.clientName?.trim().toLowerCase() === currentClient.name.trim().toLowerCase()
    );
    return [...matching].sort((a, b) => a.date.localeCompare(b.date));
  }, [hearings, currentClient, clientCaseIds]);

  // Billing metrics
  const billingSummary = useMemo(() => {
    const totalBilled = clientInvoices.reduce((acc, inv) => acc + (inv.totalAmountPkr || 0), 0);
    const totalPaid = clientInvoices.reduce((acc, inv) => {
      if (inv.status === 'Paid') return acc + (inv.totalAmountPkr || 0);
      return acc + (inv.paidAmountPkr || 0);
    }, 0);
    const balanceDue = Math.max(0, totalBilled - totalPaid);
    return { totalBilled, totalPaid, balanceDue };
  }, [clientInvoices]);

  // Filtered views
  const filteredCases = useMemo(() => {
    const q = caseSearch.trim().toLowerCase();
    if (!q) return clientCases;
    return clientCases.filter(
      (c) =>
        c.caseTitle.toLowerCase().includes(q) ||
        c.caseRef.toLowerCase().includes(q) ||
        c.forum.toLowerCase().includes(q) ||
        c.assignedCounsel.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    );
  }, [clientCases, caseSearch]);

  const docCategories = useMemo(() => {
    const set = new Set(clientDocs.map((d) => d.category));
    return ['ALL', ...Array.from(set)];
  }, [clientDocs]);

  const filteredDocs = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    return clientDocs.filter((d) => {
      const catOk = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
      const searchOk =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.uploadedBy.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [clientDocs, docCategoryFilter, docSearch]);

  // Recent timeline feed across all cases
  const recentTimelineUpdates = useMemo(() => {
    const all: Array<{
      id: string;
      date: string;
      title: string;
      forum: string;
      description: string;
      outcome?: string;
      caseTitle: string;
      caseRef: string;
    }> = [];
    clientCases.forEach((c) => {
      c.timeline.forEach((t) => {
        all.push({
          ...t,
          caseTitle: c.caseTitle,
          caseRef: c.caseRef
        });
      });
    });
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [clientCases]);

  const handleDownloadDocument = (docItem: DocumentItem) => {
    if (
      docItem.downloadUrl &&
      docItem.downloadUrl !== '#' &&
      (docItem.downloadUrl.startsWith('http') ||
        docItem.downloadUrl.startsWith('data:') ||
        docItem.downloadUrl.startsWith('blob:'))
    ) {
      const a = document.createElement('a');
      a.href = docItem.downloadUrl;
      a.download = `${docItem.title.replace(/[^a-zA-Z0-9_-]+/g, '_')}.${docItem.fileType || 'pdf'}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      showClientNotice(`Downloading "${docItem.title}".`);
      return;
    }

    // Generate clean Certified Document Record PDF for stored case file entries
    const linkedCase = clientCases.find((c) => c.id === docItem.caseId);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setFillColor(10, 75, 53);
    pdf.rect(0, 0, 210, 28, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('HISK LEGAL ADVOCATES', 16, 13);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('CERTIFIED CASE VAULT DOCUMENT RECORD', 16, 20);

    pdf.setTextColor(26, 26, 26);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(docItem.title, 16, 44, { maxWidth: 178 });

    pdf.setDrawColor(210, 215, 220);
    pdf.line(16, 54, 194, 54);

    pdf.setFontSize(10);
    const rows: Array<[string, string]> = [
      ['Client Name', currentClient?.name || 'N/A'],
      ['File Number', currentClient?.fileNumber || 'N/A'],
      ['NTN / CNIC', `${currentClient?.ntn || '-'} / ${currentClient?.cnic || '-'}`],
      ['Case Reference', linkedCase ? `${linkedCase.caseRef} — ${linkedCase.caseTitle}` : docItem.caseId],
      ['Document Category', docItem.category],
      ['File Size / Format', `${docItem.fileSize} (${docItem.fileType.toUpperCase()})`],
      ['Uploaded By', docItem.uploadedBy],
      ['Recorded Date', docItem.uploadedAt]
    ];

    let y = 64;
    rows.forEach(([label, val]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(90, 98, 117);
      pdf.text(`${label}:`, 16, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(26, 26, 26);
      pdf.text(val, 65, y, { maxWidth: 128 });
      y += 9;
    });

    pdf.setDrawColor(210, 215, 220);
    pdf.line(16, y + 6, 194, y + 6);
    pdf.setFontSize(8.5);
    pdf.setTextColor(90, 98, 117);
    pdf.text(
      `${LAWFIRM_ADDRESS} | Tel: ${DISPLAY_PHONE} | Email: ${LAWFIRM_EMAIL}`,
      16,
      y + 15
    );

    const safeFile = docItem.title.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 40);
    pdf.save(`${safeFile}_HISK_Record.pdf`);
    showClientNotice(`Downloaded certified document record for "${docItem.title}".`);
  };

  const handleUploadClientDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;
    const targetCaseId = newDocCaseId || clientCases[0]?.id || 'general';
    const extMatch = newDocFileName.split('.').pop()?.toLowerCase();
    const resolvedType: DocumentItem['fileType'] =
      extMatch === 'doc' || extMatch === 'docx'
        ? 'doc'
        : extMatch === 'png'
        ? 'png'
        : extMatch === 'jpg' || extMatch === 'jpeg'
        ? 'jpg'
        : 'pdf';

    addDocument({
      caseId: targetCaseId,
      clientId: currentClient.id,
      title: newDocTitle.trim() || newDocFileName || 'Client Submitted Document',
      category: newDocCategory,
      fileSize: newDocFileSize || '1.2 MB',
      uploadedBy: currentClient.contactPerson || currentClient.name,
      fileType: resolvedType,
      downloadUrl: '#',
      isClientVisible: true
    });

    setShowUploadModal(false);
    setNewDocTitle('');
    setNewDocFileName('');
    showClientNotice('Document logged in your portal vault. Notify counsel on WhatsApp if urgent.');
  };

  const handleCopyIban = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('PK36MEZN0001020104829103').catch(() => {});
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2500);
    }
  };

  // =========================================================================
  // 1. CLIENT PORTAL LOGIN VIEW (MOBILE-FIRST & RESPONSIVE 2-COLUMN DESKTOP)
  // =========================================================================
  if (!authenticatedClientId || !currentClient) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#FAFAF7] text-[#1A1A1A] py-6 px-4 sm:py-10 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Login Form Card (Primary Focus) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="relative w-12 h-12 shrink-0 bg-[#FAFAF7] rounded-xl border border-slate-200 p-1.5">
                  <Image
                    src="/images/logo-transparent.png"
                    alt="HISK LEGAL"
                    fill
                    unoptimized
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0A4B35] tracking-tight">
                    Client Portal Sign In
                  </h1>
                  <p className="text-xs text-[#5A6275] mt-0.5">
                    High Court Writs · FBR Notices · Case Vault · Invoices
                  </p>
                </div>
              </div>

              <form onSubmit={handleClientLoginSubmit} className="mt-6 space-y-4">
                {authError && (
                  <div
                    role="alert"
                    className="bg-red-50 border border-red-200 text-red-800 px-3.5 py-3 rounded-xl text-xs font-medium flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="client-login-identifier"
                    className="block text-xs font-semibold text-[#1A1A1A] mb-1.5"
                  >
                    Email Address or File No.
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5A6275] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="client-login-identifier"
                      type="text"
                      required
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. finance@alsyedlogistics.com.pk or AI-IT-001"
                      className="w-full min-h-[44px] bg-[#FAFAF7] border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-slate-400 focus:outline-none focus:border-[#0F6B4C] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="client-login-password"
                    className="block text-xs font-semibold text-[#1A1A1A] mb-1.5"
                  >
                    Portal Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#5A6275] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="client-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      placeholder="Enter your assigned password"
                      className="w-full min-h-[44px] bg-[#FAFAF7] border border-slate-200 rounded-xl pl-10 pr-12 py-2.5 text-sm text-[#1A1A1A] placeholder:text-slate-400 focus:outline-none focus:border-[#0F6B4C] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#5A6275] hover:text-[#0A4B35] rounded-lg cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Lock className="w-4 h-4 text-[#F5A623]" />
                  <span>Sign In to Client Portal</span>
                </button>
              </form>
            </div>

            {/* Support Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5A6275]">
              <span>Need login credentials or reset?</span>
              <div className="flex items-center gap-2">
                <a
                  href={buildWhatsAppUrl({
                    customMessage:
                      'Assalamu Alaikum HISK LEGAL, please share or reset my Client Portal login credentials.'
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3 py-2 rounded-lg bg-[#0F6B4C]/10 hover:bg-[#0F6B4C]/15 text-[#0A4B35] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Desk</span>
                </a>
                <a
                  href="tel:+923145113670"
                  className="min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[#1A1A1A] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#0F6B4C]" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Test Login Presets & Portal Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.04 }}
            className="lg:col-span-6 bg-[#0A4B35] text-white rounded-2xl border border-[#0F6B4C] p-5 sm:p-8 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[#F5A623]">
                  Tax, Corporate &amp; Litigation Access
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-white leading-snug">
                  Track every FBR reply, High Court hearing, and retainer invoice in one place
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                  Clients added in the Admin Portal can sign in immediately using their registered Email Address (or File No.) and assigned password.
                </p>
              </div>

              {/* 1-Click Test Accounts for Evaluation */}
              {demoTestPresets.length > 0 && (
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Sample Client Test Logins</span>
                    <span className="font-mono text-emerald-200/80">Pass: Password123!</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {demoTestPresets.map(({ cred, fileNumber, category }) => (
                      <div
                        key={cred.id}
                        className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl p-3 transition-colors flex flex-col justify-between gap-2.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-emerald-200 font-mono tabular-nums">
                            <span>{fileNumber || category}</span>
                            <span>{category} File</span>
                          </div>
                          <div className="text-xs font-semibold text-white truncate mt-0.5">
                            {cred.clientName}
                          </div>
                          <div className="text-[11px] text-emerald-100/80 font-mono truncate">
                            {cred.email}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginIdentifier(cred.email);
                              setClientPassword(cred.password);
                              setAuthError(null);
                            }}
                            className="flex-1 min-h-[38px] px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Fill Form
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginIdentifier(cred.email);
                              setClientPassword(cred.password);
                              authenticateWithCredentials(cred.email, cred.password);
                            }}
                            className="flex-1 min-h-[38px] px-2.5 py-1.5 rounded-lg bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <span>Test Login</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/15 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="font-semibold text-white">Court Dates</div>
                <div className="text-emerald-200/80 mt-0.5">Cause list &amp; order sheets</div>
              </div>
              <div>
                <div className="font-semibold text-white">FBR Replies</div>
                <div className="text-emerald-200/80 mt-0.5">Notices &amp; stay status</div>
              </div>
              <div>
                <div className="font-semibold text-white">Billing &amp; PDF</div>
                <div className="text-emerald-200/80 mt-0.5">Tax invoices &amp; vault</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED CLIENT WORKSPACE (RESPONSIVE SIDEBAR + MOBILE THUMB BAR)
  // =========================================================================
  const navItems: Array<{
    id: ClientPortalTab;
    label: string;
    mobileLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'overview', label: 'Overview', mobileLabel: 'Overview', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases & Timeline', mobileLabel: 'Cases', icon: Scale, count: clientCases.length },
    {
      id: 'hearings',
      label: 'Hearings & Notices',
      mobileLabel: 'Hearings',
      icon: Calendar,
      count: clientHearings.length + clientNotices.length
    },
    { id: 'documents', label: 'Document Vault', mobileLabel: 'Docs', icon: FolderOpen, count: clientDocs.length },
    { id: 'invoices', label: 'Invoices & Billing', mobileLabel: 'Invoices', icon: CreditCard, count: clientInvoices.length },
    { id: 'profile', label: 'File Profile', mobileLabel: 'Profile', icon: User }
  ];

  const primaryCounsel = clientCases[0]?.assignedCounsel || 'Adv. Hafiz Irfan Shabber Kayani';
  const nextUpcomingHearing = clientHearings[0] || null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FAFAF7] text-[#1A1A1A] pb-20 lg:pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        {/* Compact Responsive Client Identity Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0A4B35] text-[#F5A623] flex items-center justify-center font-heading font-bold text-lg shrink-0">
              {currentClient.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5A6275]">
                <span className="font-mono font-semibold text-[#0A4B35] tabular-nums">
                  {currentClient.fileNumber || 'CLIENT FILE'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentClient.category}</span>
                {currentClient.ntn && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">NTN {currentClient.ntn}</span>
                  </>
                )}
              </div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-[#1A1A1A] truncate mt-0.5">
                {currentClient.name}
              </h1>
              <div className="text-xs text-[#5A6275] truncate">
                {currentClient.rtoCto || currentClient.city} · Lead Counsel: {primaryCounsel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <a
              href={buildWhatsAppUrl({
                customMessage: `Assalamu Alaikum HISK LEGAL, this is ${currentClient.name} (${currentClient.fileNumber || currentClient.ntn}). I have an inquiry regarding my case file.`
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F6B4C] hover:bg-[#0A4B35] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 text-[#F5A623]" />
              <span>Chat Counsel</span>
            </a>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="lg:hidden min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#1A1A1A] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              title="File Profile"
            >
              <User className="w-4 h-4 text-[#0F6B4C]" />
            </button>

            <button
              type="button"
              onClick={handleClientSignOut}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>

        {/* Transient Notification Toast */}
        {clientNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs font-medium">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#0F6B4C] shrink-0" />
              <span className="truncate">{clientNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setClientNotice(null)}
              className="min-w-[32px] min-h-[32px] flex items-center justify-center text-emerald-800 hover:text-black cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Workspace Layout: Desktop Sidebar (248px) + Main Viewport */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Navigation Rail */}
          <aside className="hidden lg:block w-60 shrink-0 bg-white rounded-2xl border border-slate-200 p-2.5 sticky top-20">
            <nav aria-label="Client Portal Navigation" className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0A4B35] text-white'
                        : 'text-[#1A1A1A] hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 whitespace-nowrap">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5A623]' : 'text-[#0F6B4C]'}`} />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.count === 'number' && (
                      <span
                        className={`font-mono tabular-nums text-[11px] ${
                          isActive ? 'text-emerald-200' : 'text-[#5A6275]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-slate-100 px-2 pb-1 space-y-2 text-xs">
              <div className="font-semibold text-[#1A1A1A]">Quick Support</div>
              <p className="text-[11px] text-[#5A6275] leading-relaxed">
                Office No. 10, 2nd Floor, Awan Plaza, G-8 Markaz, Islamabad
              </p>
              <a
                href="tel:+923145113670"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6B4C] hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{DISPLAY_PHONE}</span>
              </a>
            </div>
          </aside>

          {/* Main Tab Content */}
          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {/* ================= OVERVIEW TAB ================= */}
                {activeTab === 'overview' && (
                  <>
                    {/* 4-Card KPI Strip */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('cases')}
                        className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#0F6B4C]/40 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs text-[#5A6275]">
                          <span>Active Cases</span>
                          <Scale className="w-4 h-4 text-[#0F6B4C]" />
                        </div>
                        <div className="font-heading text-2xl font-bold text-[#1A1A1A] font-mono tabular-nums mt-2">
                          {clientCases.length}
                        </div>
                        <div className="text-[11px] text-[#0F6B4C] font-medium mt-1 truncate">
                          High Court &amp; Tribunal
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('hearings')}
                        className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#0F6B4C]/40 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs text-[#5A6275]">
                          <span>Upcoming Hearings</span>
                          <Calendar className="w-4 h-4 text-[#0F6B4C]" />
                        </div>
                        <div className="font-heading text-2xl font-bold text-[#1A1A1A] font-mono tabular-nums mt-2">
                          {clientHearings.length}
                        </div>
                        <div className="text-[11px] text-[#5A6275] mt-1 truncate font-mono tabular-nums">
                          {nextUpcomingHearing ? `Next: ${nextUpcomingHearing.date}` : 'No date fixed'}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setHearingNoticeFilter('notices');
                          setActiveTab('hearings');
                        }}
                        className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#0F6B4C]/40 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs text-[#5A6275]">
                          <span>FBR / Tax Notices</span>
                          <AlertCircle className="w-4 h-4 text-[#D97706]" />
                        </div>
                        <div className="font-heading text-2xl font-bold text-[#1A1A1A] font-mono tabular-nums mt-2">
                          {clientNotices.length}
                        </div>
                        <div className="text-[11px] text-[#D97706] font-medium mt-1 truncate">
                          {clientNotices.filter((n) => n.status === 'Pending Reply').length} pending reply
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('invoices')}
                        className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#0F6B4C]/40 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs text-[#5A6275]">
                          <span>Fee Balance</span>
                          <CreditCard className="w-4 h-4 text-[#0F6B4C]" />
                        </div>
                        <div className="font-heading text-lg sm:text-xl font-bold text-[#0A4B35] font-mono tabular-nums mt-2 truncate">
                          {billingSummary.balanceDue > 0 ? formatPkr(billingSummary.balanceDue) : 'Settled'}
                        </div>
                        <div className="text-[11px] text-[#5A6275] mt-1 truncate">
                          {clientInvoices.length} invoice{clientInvoices.length === 1 ? '' : 's'} on file
                        </div>
                      </button>
                    </div>

                    {/* Two-Column Overview Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Next Hearing & Primary Case Progress */}
                      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-heading text-base font-bold text-[#1A1A1A]">
                            Active Proceedings Snapshot
                          </h2>
                          <button
                            type="button"
                            onClick={() => setActiveTab('cases')}
                            className="text-xs font-semibold text-[#0F6B4C] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <span>View All Cases</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {clientCases.length === 0 ? (
                          <div className="py-8 text-center text-xs text-[#5A6275] bg-[#FAFAF7] rounded-xl border border-slate-100 p-4">
                            No legal cases have been linked to your file yet. Contact your advocate for updates.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {clientCases.slice(0, 3).map((cs) => (
                              <div key={cs.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="text-xs text-[#5A6275] flex flex-wrap items-center gap-1.5">
                                    <span className="font-mono font-semibold text-[#0A4B35]">
                                      {cs.caseRef}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span>{cs.forum}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-[#0F6B4C]">
                                    {cs.status}
                                  </span>
                                </div>
                                <div className="text-sm font-semibold text-[#1A1A1A]">
                                  {cs.caseTitle}
                                </div>
                                <div className="grid grid-cols-6 gap-1 pt-1" aria-label={`Stage ${cs.auditStage} of 6`}>
                                  {CASE_STAGES.map((stageLabel, idx) => {
                                    const active = idx + 1 <= (cs.auditStage || 1);
                                    return (
                                      <div key={stageLabel} className="space-y-1">
                                        <div
                                          className={`h-1.5 rounded-full ${
                                            active ? 'bg-[#0F6B4C]' : 'bg-slate-200'
                                          }`}
                                        />
                                        <div className="text-[10px] text-[#5A6275] truncate hidden sm:block">
                                          {stageLabel}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Court & Order Updates */}
                      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-heading text-base font-bold text-[#1A1A1A]">
                            Recent Order &amp; Activity Log
                          </h2>
                          <button
                            type="button"
                            onClick={() => {
                              setNewDocCaseId(clientCases[0]?.id || '');
                              setShowUploadModal(true);
                            }}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#F5A623]" />
                            <span>Upload Doc</span>
                          </button>
                        </div>

                        {recentTimelineUpdates.length === 0 ? (
                          <div className="py-8 text-center text-xs text-[#5A6275] bg-[#FAFAF7] rounded-xl border border-slate-100 p-4">
                            No court proceedings recorded yet.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {recentTimelineUpdates.map((item) => (
                              <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1 text-xs">
                                <div className="flex items-center justify-between gap-2 text-[#5A6275]">
                                  <span className="font-mono truncate">{item.caseRef}</span>
                                  <span className="font-mono tabular-nums shrink-0">{item.date}</span>
                                </div>
                                <div className="font-semibold text-[#1A1A1A]">{item.title}</div>
                                <p className="text-[#5A6275] line-clamp-2">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ================= CASES & TIMELINE TAB ================= */}
                {activeTab === 'cases' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">
                          Active Cases &amp; Court Timeline
                        </h2>
                        <p className="text-xs text-[#5A6275]">
                          Real-time litigation stages, demand figures, and court order sheets
                        </p>
                      </div>
                      <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-[#5A6275] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={caseSearch}
                          onChange={(e) => setCaseSearch(e.target.value)}
                          placeholder="Search case ref, forum, counsel..."
                          className="w-full min-h-[42px] bg-[#FAFAF7] border border-slate-200 rounded-xl pl-9 pr-3 text-xs focus:outline-none focus:border-[#0F6B4C]"
                        />
                      </div>
                    </div>

                    {filteredCases.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                        <Scale className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="text-sm font-semibold text-[#1A1A1A]">No matching case files found</div>
                        <p className="text-xs text-[#5A6275]">
                          {caseSearch
                            ? 'Try clearing your search filter.'
                            : 'Your advocate has not linked an active case to this file yet.'}
                        </p>
                      </div>
                    ) : (
                      filteredCases.map((c: CaseFile) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-5"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A6275]">
                                <span className="font-mono font-semibold text-[#0A4B35]">{c.caseRef}</span>
                                <span aria-hidden="true">·</span>
                                <span>{c.forum}</span>
                                <span aria-hidden="true">·</span>
                                <span>{c.taxYear}</span>
                              </div>
                              <h3 className="font-heading text-base sm:text-lg font-bold text-[#1A1A1A]">
                                {c.caseTitle}
                              </h3>
                              <div className="text-xs text-[#5A6275]">
                                Lead Counsel: <span className="font-semibold text-[#1A1A1A]">{c.assignedCounsel}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <span className="text-xs font-semibold text-[#0A4B35] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                                Status: {c.status}
                              </span>
                              <a
                                href={buildWhatsAppUrl({
                                  customMessage: `Assalamu Alaikum ${c.assignedCounsel}, I am contacting regarding case ${c.caseRef} (${c.caseTitle}).`
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0F6B4C] hover:bg-[#0A4B35] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                              >
                                <MessageCircle className="w-4 h-4 text-[#F5A623]" />
                                <span>Message Counsel</span>
                              </a>
                            </div>
                          </div>

                          {/* Metrics & Stage Progress */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAFAF7] p-3.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[#5A6275] block">Disputed Demand</span>
                              <span className="font-mono tabular-nums font-bold text-sm text-[#1A1A1A] mt-0.5 block">
                                {formatPkr(c.demandAmountPkr)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#5A6275] block">Relief / Tax Saved</span>
                              <span className="font-mono tabular-nums font-bold text-sm text-[#0F6B4C] mt-0.5 block">
                                {formatPkr(c.savedAmountPkr)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#5A6275] block">Next Scheduled Hearing</span>
                              <span className="font-mono tabular-nums font-bold text-sm text-[#1A1A1A] mt-0.5 block">
                                {c.nextHearingDate || 'To be fixed'}
                              </span>
                            </div>
                          </div>

                          {/* 6-Stage Progress */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#1A1A1A]">Litigation Stage Progress</span>
                              <span className="font-mono tabular-nums text-[#5A6275]">
                                Stage {c.auditStage || 1} of 6
                              </span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {CASE_STAGES.map((stageName, idx) => {
                                const stepNum = idx + 1;
                                const isDone = stepNum <= (c.auditStage || 1);
                                return (
                                  <div
                                    key={stageName}
                                    className={`p-2 rounded-lg border text-[11px] ${
                                      isDone
                                        ? 'bg-emerald-50/70 border-emerald-200 text-[#0A4B35] font-semibold'
                                        : 'bg-[#FAFAF7] border-slate-200 text-[#5A6275]'
                                    }`}
                                  >
                                    <div className="font-mono tabular-nums text-[10px]">0{stepNum}</div>
                                    <div className="truncate mt-0.5">{stageName}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Case History & Order Sheets */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-[#1A1A1A]">
                              Case History &amp; Official Order Sheets
                            </h4>
                            {c.timeline.length === 0 ? (
                              <p className="text-xs text-[#5A6275]">No order sheets posted yet.</p>
                            ) : (
                              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                                {c.timeline.map((t) => (
                                  <div key={t.id} className="p-3.5 bg-white text-xs space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                      <span className="font-semibold text-[#1A1A1A]">{t.title}</span>
                                      <span className="font-mono tabular-nums text-[#0F6B4C] font-medium">
                                        {t.date} · {t.forum}
                                      </span>
                                    </div>
                                    <p className="text-[#5A6275] leading-relaxed">{t.description}</p>
                                    {t.outcome && (
                                      <div className="bg-emerald-50 border border-emerald-200 text-[#0A4B35] px-3 py-2 rounded-lg font-medium">
                                        Official Order: {t.outcome}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ================= HEARINGS & NOTICES TAB ================= */}
                {activeTab === 'hearings' && (
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">
                          Hearings &amp; FBR Tax Notices
                        </h2>
                        <p className="text-xs text-[#5A6275]">
                          Scheduled High Court/Tribunal appearances and statutory tax notice deadlines
                        </p>
                      </div>

                      <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'hearings', label: `Hearings (${clientHearings.length})` },
                          { id: 'notices', label: `Notices (${clientNotices.length})` }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setHearingNoticeFilter(opt.id as 'all' | 'hearings' | 'notices')
                            }
                            className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              hearingNoticeFilter === opt.id
                                ? 'bg-white text-[#0A4B35] shadow-sm'
                                : 'text-[#5A6275] hover:text-[#1A1A1A]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(hearingNoticeFilter === 'all' || hearingNoticeFilter === 'hearings') && (
                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-[#1A1A1A]">Scheduled Court Hearings</h3>
                        {clientHearings.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-[#5A6275]">
                            No upcoming court hearings currently scheduled on the cause list.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {clientHearings.map((h) => (
                              <div
                                key={h.id}
                                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono tabular-nums font-bold text-sm text-[#0A4B35]">
                                    {h.date} · {h.time}
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      h.priority === 'High' ? 'text-red-700' : 'text-[#0F6B4C]'
                                    }`}
                                  >
                                    {h.priority} Priority
                                  </span>
                                </div>
                                <div className="font-semibold text-sm text-[#1A1A1A]">{h.caseTitle}</div>
                                <div className="text-[#5A6275] space-y-1">
                                  <div>
                                    Forum: <span className="text-[#1A1A1A] font-medium">{h.forum}</span>
                                  </div>
                                  <div>
                                    Bench: <span className="text-[#1A1A1A] font-medium">{h.bench}</span>
                                  </div>
                                  <div>
                                    Purpose: <span className="text-[#1A1A1A] font-medium">{h.purpose}</span>
                                  </div>
                                  <div>
                                    Counsel: <span className="text-[#0F6B4C] font-semibold">{h.counselAssigned}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                    {(hearingNoticeFilter === 'all' || hearingNoticeFilter === 'notices') && (
                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-[#1A1A1A]">FBR &amp; Regulatory Notices</h3>
                        {clientNotices.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-[#5A6275]">
                            No pending FBR or regulatory notices logged on your account.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {clientNotices.map((n) => (
                              <div
                                key={n.id}
                                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-2.5 text-xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2 text-[#5A6275]">
                                    <span className="font-mono font-semibold text-[#0A4B35]">
                                      CNO {n.cnoNumber}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-mono">Sec {n.sectionCode}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>{n.taxYear}</span>
                                  </div>
                                  <span
                                    className={`font-semibold self-start sm:self-auto px-2.5 py-1 rounded-lg border ${
                                      n.status === 'Pending Reply' || n.status === 'Show Cause Issued'
                                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    }`}
                                  >
                                    {n.status}
                                  </span>
                                </div>
                                <div className="text-sm font-semibold text-[#1A1A1A]">{n.noticeTitle}</div>
                                <p className="text-[#5A6275] leading-relaxed">{n.summary}</p>
                                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[#5A6275]">
                                  <span>Officer: {n.issuingOfficer}</span>
                                  <div className="flex items-center gap-4 font-mono tabular-nums">
                                    <span>Due: {n.dueDate}</span>
                                    <span className="font-bold text-[#1A1A1A]">
                                      {formatPkr(n.disputedAmountPkr)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                )}

                {/* ================= DOCUMENTS TAB ================= */}
                {activeTab === 'documents' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">
                          Case Document Vault
                        </h2>
                        <p className="text-xs text-[#5A6275]">
                          Download court orders, replies, and tax filings or submit documents to your advocate
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewDocCaseId(clientCases[0]?.id || '');
                          setShowUploadModal(true);
                        }}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Upload className="w-4 h-4 text-[#F5A623]" />
                        <span>Upload Document</span>
                      </button>
                    </div>

                    {/* Search & Category Filter */}
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#5A6275] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={docSearch}
                          onChange={(e) => setDocSearch(e.target.value)}
                          placeholder="Search document title, category, uploader..."
                          className="w-full min-h-[42px] bg-[#FAFAF7] border border-slate-200 rounded-xl pl-9 pr-3 text-xs focus:outline-none focus:border-[#0F6B4C]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                        {docCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setDocCategoryFilter(cat)}
                            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                              docCategoryFilter === cat
                                ? 'bg-[#0A4B35] text-white'
                                : 'bg-slate-100 text-[#5A6275] hover:text-[#1A1A1A]'
                            }`}
                          >
                            {cat === 'ALL' ? 'All Files' : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredDocs.length === 0 ? (
                      <div className="py-10 text-center space-y-2 bg-[#FAFAF7] rounded-xl border border-slate-100 p-4">
                        <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="text-sm font-semibold text-[#1A1A1A]">No documents available</div>
                        <p className="text-xs text-[#5A6275]">
                          Upload bank statements, bills, or notices using the Upload Document button.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {filteredDocs.map((docItem) => (
                          <div
                            key={docItem.id}
                            className="p-4 bg-white hover:bg-[#FAFAF7] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5A6275]">
                                <span className="font-semibold text-[#0F6B4C]">{docItem.category}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">{docItem.fileSize}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">{docItem.uploadedAt}</span>
                              </div>
                              <div className="text-sm font-semibold text-[#1A1A1A] truncate">
                                {docItem.title}
                              </div>
                              <div className="text-xs text-[#5A6275]">
                                Uploaded by {docItem.uploadedBy}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(docItem)}
                              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                            >
                              <Download className="w-4 h-4 text-[#F5A623]" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ================= INVOICES & BILLING TAB ================= */}
                {activeTab === 'invoices' && (
                  <div className="space-y-4">
                    {/* Billing Totals */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <div className="text-xs text-[#5A6275]">Total Fee Invoiced</div>
                        <div className="font-heading text-xl font-bold text-[#1A1A1A] font-mono tabular-nums mt-1">
                          {formatPkr(billingSummary.totalBilled)}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <div className="text-xs text-[#5A6275]">Total Paid</div>
                        <div className="font-heading text-xl font-bold text-[#0F6B4C] font-mono tabular-nums mt-1">
                          {formatPkr(billingSummary.totalPaid)}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <div className="text-xs text-[#5A6275]">Outstanding Balance</div>
                        <div className="font-heading text-xl font-bold text-[#B45309] font-mono tabular-nums mt-1">
                          {formatPkr(billingSummary.balanceDue)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">
                          Retainer &amp; Hearing Fee Invoices
                        </h2>
                        <p className="text-xs text-[#5A6275]">
                          Download official tax invoices or view verified Meezan Bank payment details
                        </p>
                      </div>

                      {clientInvoices.length === 0 ? (
                        <div className="py-10 text-center text-xs text-[#5A6275] bg-[#FAFAF7] rounded-xl border border-slate-100">
                          No fee invoices have been issued for this client file.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {clientInvoices.map((inv) => (
                            <div
                              key={inv.id}
                              className="bg-[#FAFAF7] p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A6275]">
                                  <span className="font-mono font-semibold text-[#0A4B35]">
                                    {inv.invoiceNumber}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">Issued {inv.issueDate}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">Due {inv.dueDate}</span>
                                </div>
                                <div className="text-sm font-semibold text-[#1A1A1A]">
                                  {inv.serviceDescription}
                                </div>
                                <div className="text-xs text-[#5A6275] font-mono tabular-nums">
                                  Retainer {formatPkr(inv.retainerFeePkr)} · Hearing {formatPkr(inv.hearingFeePkr)} · Tax {formatPkr(inv.salesTaxPkr)}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                  <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                      inv.status === 'Paid'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-red-50 border-red-200 text-red-700'
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                  <span className="font-mono tabular-nums font-bold text-base text-[#0A4B35]">
                                    {formatPkr(inv.totalAmountPkr)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedInvoiceForPdf(inv)}
                                    className="flex-1 sm:flex-initial min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#F5A623]" />
                                    <span>Invoice PDF</span>
                                  </button>

                                  {inv.status !== 'Paid' && (
                                    <button
                                      type="button"
                                      onClick={() => setPaymentGuideInvoice(inv)}
                                      className="flex-1 sm:flex-initial min-h-[42px] px-3.5 py-2 rounded-xl bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                      <span>Pay / Bank Info</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= PROFILE & COUNSEL TAB ================= */}
                {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">
                          Registered File Profile
                        </h2>
                        <p className="text-xs text-[#5A6275]">
                          Master details synced from your HISK LEGAL chambers file
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                        {[
                          { label: 'File No. / Volume', value: `${currentClient.fileNumber || '-'} · ${currentClient.volumeNo || 'VOL-I'}`, mono: true },
                          { label: 'File Category', value: currentClient.category },
                          { label: 'Business / Client Name', value: currentClient.businessName || currentClient.name },
                          { label: 'Entity Status', value: currentClient.entityStatus || currentClient.status },
                          { label: 'NTN Number', value: currentClient.ntn || '-', mono: true },
                          { label: 'CNIC / Login ID', value: currentClient.cnic || '-', mono: true },
                          { label: 'RTO / CTO / Station', value: currentClient.rtoCto || currentClient.city || '-' },
                          {
                            label: 'Authority / Court',
                            value: currentClient.pendingBeforeCourt || currentClient.authority || 'FBR'
                          },
                          { label: 'Contact Person', value: currentClient.contactPerson || '-' },
                          { label: 'Registered Email', value: currentClient.email || '-', mono: true },
                          { label: 'Mobile / WhatsApp', value: currentClient.whatsapp || currentClient.phone || '-', mono: true },
                          { label: 'Billing Terms', value: currentClient.chargeType || 'CHARGE' }
                        ].map((row) => (
                          <div key={row.label} className="bg-[#FAFAF7] p-3 rounded-xl border border-slate-100">
                            <div className="text-[11px] text-[#5A6275]">{row.label}</div>
                            <div
                              className={`font-semibold text-[#1A1A1A] mt-0.5 break-words ${
                                row.mono ? 'font-mono tabular-nums' : ''
                              }`}
                            >
                              {row.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#FAFAF7] p-3.5 rounded-xl border border-slate-100 text-xs">
                        <div className="text-[11px] text-[#5A6275]">Registered Address</div>
                        <div className="font-medium text-[#1A1A1A] mt-0.5">
                          {currentClient.registeredAddress || currentClient.city}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-[#0A4B35] text-white rounded-2xl border border-[#0F6B4C] p-5 sm:p-6 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-[#F5A623]">Assigned Legal Chambers</div>
                        <h3 className="font-heading text-xl font-bold text-white">{primaryCounsel}</h3>
                        <p className="text-xs text-emerald-100/85 leading-relaxed">
                          High Court Advocates &amp; Tax Consultants representing your matter before FBR, CIR Appeals, ATIR, SECP, and Honourable High Courts.
                        </p>

                        <div className="space-y-2 pt-2 text-xs text-emerald-100">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                            <span>{LAWFIRM_ADDRESS}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-[#F5A623] shrink-0" />
                            <span className="font-mono tabular-nums">{DISPLAY_PHONE}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
                            <span className="font-mono">{LAWFIRM_EMAIL}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-3 border-t border-white/15">
                        <a
                          href={buildWhatsAppUrl({
                            customMessage: `Assalamu Alaikum HISK LEGAL, this is ${currentClient.name} (${currentClient.fileNumber || currentClient.ntn}). I need to update my profile or discuss my case.`
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Message Chambers on WhatsApp</span>
                        </a>
                        <a
                          href="tel:+923145113670"
                          className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <PhoneCall className="w-4 h-4 text-[#F5A623]" />
                          <span>Call Chambers Desk</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM THUMB NAVIGATION BAR (5 TABS <= 15% VIEWPORT CAP) */}
      <nav
        aria-label="Mobile Client Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                isActive ? 'text-[#0A4B35]' : 'text-[#5A6275]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0F6B4C]' : 'text-[#5A6275]'}`} />
              <span>{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* MODAL: UPLOAD CLIENT DOCUMENT */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">
                Upload Document to Case Vault
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-black cursor-pointer"
                aria-label="Close upload modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadClientDoc} className="space-y-3.5 text-xs">
              {clientCases.length > 0 && (
                <div>
                  <label className="font-semibold text-[#1A1A1A] block mb-1">Related Case File</label>
                  <select
                    value={newDocCaseId || clientCases[0].id}
                    onChange={(e) => setNewDocCaseId(e.target.value)}
                    className="w-full min-h-[42px] bg-[#FAFAF7] px-3 py-2 rounded-xl border border-slate-200"
                  >
                    {clientCases.map((cs) => (
                      <option key={cs.id} value={cs.id}>
                        {cs.caseRef} — {cs.caseTitle}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Document Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as DocumentItem['category'])}
                  className="w-full min-h-[42px] bg-[#FAFAF7] px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="Bank Statement">Bank Statement</option>
                  <option value="FBR Notice">FBR Notice</option>
                  <option value="Tax Return & Wealth Statement">Tax Return &amp; Wealth Statement</option>
                  <option value="Fee Challan">Fee Challan</option>
                  <option value="Wakalatnama / Power of Attorney">Wakalatnama / Power of Attorney</option>
                  <option value="Reply & Rebuttal">Reply &amp; Rebuttal</option>
                  <option value="Court Order / Stay Order">Court Order / Stay Order</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meezan Bank Statement FY 2025"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full min-h-[42px] bg-[#FAFAF7] px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <label className="block border-2 border-dashed border-[#0F6B4C]/30 bg-[#FAFAF7] hover:bg-emerald-50/40 p-5 rounded-2xl text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewDocFileName(file.name);
                      const sizeMb = Math.max(0.1, file.size / (1024 * 1024)).toFixed(1);
                      setNewDocFileSize(`${sizeMb} MB`);
                      if (!newDocTitle.trim()) {
                        setNewDocTitle(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                />
                <Upload className="w-7 h-7 text-[#0F6B4C] mx-auto mb-1.5" />
                <div className="font-semibold text-[#1A1A1A]">
                  {newDocFileName ? `Selected: ${newDocFileName}` : 'Tap to choose PDF, Image, or Word file'}
                </div>
                <div className="text-[11px] text-[#5A6275] mt-0.5">
                  {newDocFileName ? `File size: ${newDocFileSize}` : 'Accepted: PDF, JPG, PNG, DOC'}
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-[#5A6275] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-semibold cursor-pointer"
                >
                  Submit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BANK TRANSFER & PAYMENT PROOF GUIDE */}
      {paymentGuideInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">
                  Bank Transfer &amp; Payment Details
                </h3>
                <p className="text-xs font-mono text-[#0F6B4C] mt-0.5">
                  {paymentGuideInvoice.invoiceNumber} · {formatPkr(paymentGuideInvoice.totalAmountPkr)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentGuideInvoice(null)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-black cursor-pointer"
                aria-label="Close payment modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAFAF7] border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-[#5A6275]">Bank Name</span>
                <span className="font-semibold text-[#1A1A1A]">Meezan Bank Ltd. (Islamic)</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#5A6275]">Account Title</span>
                <span className="font-semibold text-[#0A4B35]">HISK LEGAL ADVOCATES</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#5A6275]">Account No.</span>
                <span className="font-mono tabular-nums font-semibold">0102-0104829103</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[#5A6275] block">IBAN</span>
                  <span className="font-mono tabular-nums font-bold text-[#0A4B35]">
                    PK36 MEZN 0001 0201 0482 9103
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyIban}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedIban ? <Check className="w-3.5 h-3.5 text-[#0F6B4C]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIban ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#5A6275] leading-relaxed">
              Mention Invoice Ref <span className="font-mono font-semibold text-[#1A1A1A]">{paymentGuideInvoice.invoiceNumber}</span> in your transfer remarks, then send the transfer screenshot to chambers for official paid receipt issuance.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={buildWhatsAppUrl({
                  customMessage: `Assalamu Alaikum HISK LEGAL, I am transferring ${formatPkr(
                    paymentGuideInvoice.totalAmountPkr
                  )} against Invoice ${paymentGuideInvoice.invoiceNumber} (${currentClient.name}). Sharing payment proof shortly.`
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#F5A623]" />
                <span>Send Receipt via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setPaymentGuideInvoice(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-[#5A6275] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Legal PDF Invoice Modal (Read-only for Clients) */}
      {selectedInvoiceForPdf && (
        <InvoicePdfModal
          invoice={selectedInvoiceForPdf}
          client={currentClient}
          caseFile={clientCases.find((c) => c.id === selectedInvoiceForPdf.caseId) || clientCases[0]}
          onClose={() => setSelectedInvoiceForPdf(null)}
        />
      )}
    </div>
  );
};
