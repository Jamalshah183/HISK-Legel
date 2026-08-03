'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { checkRateLimit, recordAttempt, resetRateLimit } from '@/lib/rateLimiter';
import { useInactivityTimeout } from '@/lib/useInactivityTimeout';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar as CalendarIcon,
  FolderOpen,
  CheckSquare,
  CreditCard,
  Send,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  UserCheck,
  ChevronRight,
  Download,
  Eye,
  FileCode,
  FilePlus,
  CheckCircle2,
  XCircle,
  MessageSquare,
  PhoneCall,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Info,
  CalendarCheck,
  ExternalLink,
  PlusCircle,
  X,
  Share2,
  Upload,
  Printer,
  Edit3,
  Copy,
  MessageCircle,
  Lock,
  LogOut
} from 'lucide-react';
import { usePortalStore } from '@/lib/portalStore';
import { InvoicePdfModal } from '@/components/portal/InvoicePdfModal';
import { SearchableCaseSelect } from '@/components/portal/SearchableCaseSelect';
import {
  CaseFile,
  Client,
  FBRNotice,
  DocumentItem,
  InternalTask,
  InternalNote,
  Invoice,
  HearingEvent,
  LegalForum,
  CaseStatus,
  RiskLevel
} from '@/types/portal';
import { buildGoogleCalendarUrl } from '@/lib/googleCalendar';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

const ADVOCATES = [
  'Hafiz Irfan Shabber Kayani'
];

const ALLOWED_ADMIN_EMAILS = ['jamalshah183@gmail.com', 'adv.kayani@gmail.com', 'adv.kiyani@gmail.com'];

export const AdminPortal: React.FC = () => {
  // Admin authentication state
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState<boolean>(true);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const email = user?.email?.toLowerCase();
      if (user && email && ALLOWED_ADMIN_EMAILS.includes(email)) {
        setAdminUser(user);
      } else {
        setAdminUser(null);
      }
      setAdminAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdminGoogleSignIn = async () => {
    setAdminAuthError(null);

    // Rate limit check
    const rateCheck = checkRateLimit('admin_login');
    if (!rateCheck.allowed) {
      setAdminAuthError(rateCheck.message || 'Rate limit exceeded. Please try again later.');
      return;
    }
    recordAttempt('admin_login');

    setAdminAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
        resetRateLimit('admin_login');
        setAdminUser(result.user);
      } else {
        await signOut(auth);
        setAdminUser(null);
        setAdminAuthError(
          `Access Denied: You do not have partner admin privileges with this account (${result.user.email || 'unknown'}).`
        );
      }
    } catch (err: any) {
      setAdminAuthError(err.message || 'Google Sign-In failed. Please try again.');
      setAdminUser(null);
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setAdminUser(null);
  };

  // Auto-logout after 2 minutes (120,000 ms) of inactivity
  useInactivityTimeout(
    !!adminUser,
    () => {
      handleAdminSignOut();
      setAdminAuthError('Logged out automatically due to 2 minutes of inactivity.');
    },
    120000
  );

  const {
    clients,
    cases,
    notices,
    documents,
    tasks,
    notes,
    invoices,
    hearings,
    notifications,
    clientCredentials,
    addClientCredential,
    addClient,
    addCase,
    updateCase,
    updateCaseStatus,
    addTimelineEvent,
    addNotice,
    updateNoticeStatus,
    addDocument,
    addTask,
    toggleTask,
    addNote,
    addInvoice,
    markInvoicePaid,
    addHearing,
    updateCaseHearing,
    updateHearing,
    sendNotification
  } = usePortalStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'cases' | 'calendar' | 'documents' | 'tasks' | 'billing' | 'notifications'
  >('dashboard');

  // Calendar Month Navigation State
  const [calendarCurrentDate, setCalendarCurrentDate] = useState<Date>(() => new Date(2026, 7, 1));
  const [showClientPassword, setShowClientPassword] = useState(false);

  // Case Management Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [counselFilter, setCounselFilter] = useState<string>('All');
  const [forumFilter, setForumFilter] = useState<string>('All');
  const [taxYearFilter, setTaxYearFilter] = useState<string>('All');

  // Document Vault Search & Filters
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [docUploaderFilter, setDocUploaderFilter] = useState('All');

  // Tasks & Internal Notes Search & Filters
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState('All');
  const [noteSearchTerm, setNoteSearchTerm] = useState('');

  // Billing & Fee Invoices Search & Filters
  const [billingSearchTerm, setBillingSearchTerm] = useState('');
  const [billingStatusFilter, setBillingStatusFilter] = useState('All');
  const [billingClientFilter, setBillingClientFilter] = useState('All');

  // WhatsApp & Email Alerts Search & Filters
  const [notifSearchTerm, setNotifSearchTerm] = useState('');
  const [notifTypeFilter, setNotifTypeFilter] = useState('All');
  const [notifStatusFilter, setNotifStatusFilter] = useState('All');

  // Dynamic Unique Options for Filters
  const docCategories = Array.from(new Set(documents.map((d) => d.category)));
  const docUploaders = Array.from(new Set(documents.map((d) => d.uploadedBy)));
  const taskAssignees = Array.from(new Set(tasks.map((t) => t.assignedTo)));
  const billingClients = Array.from(new Set(invoices.map((inv) => inv.clientName)));
  const caseForums = Array.from(new Set(cases.map((c) => c.forum)));
  const caseTaxYears = Array.from(new Set(cases.map((c) => c.taxYear)));
  const caseAdvocates = Array.from(new Set(cases.map((c) => c.assignedCounsel).concat(ADVOCATES)));

  // Comprehensive Filtered Collections by Unique Data (CNO #, Section Code, Tax Year, Forum, Case Ref, NTN, File Size, Date, Author, Invoice #, etc.)
  const filteredCases = cases.filter((c) => {
    const q = searchTerm.trim().toLowerCase();

    // Find linked notices to match CNO number, Section code, issuing officer
    const linkedNotices = notices.filter((n) => n.caseId === c.id || n.cnoNumber === c.caseRef);
    const linkedCnos = linkedNotices.map((n) => n.cnoNumber.toLowerCase()).join(' ');
    const linkedSections = linkedNotices.map((n) => n.sectionCode.toLowerCase()).join(' ');
    const linkedOfficers = linkedNotices.map((n) => n.issuingOfficer.toLowerCase()).join(' ');

    const matchesSearch =
      q === '' ||
      c.caseTitle.toLowerCase().includes(q) ||
      c.caseRef.toLowerCase().includes(q) ||
      (c.caseId && c.caseId.toLowerCase().includes(q)) ||
      c.clientName.toLowerCase().includes(q) ||
      c.clientNtn.toLowerCase().includes(q) ||
      c.forum.toLowerCase().includes(q) ||
      c.taxYear.toLowerCase().includes(q) ||
      c.assignedCounsel.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      c.riskLevel.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      (c.nextHearingPurpose && c.nextHearingPurpose.toLowerCase().includes(q)) ||
      (c.demandAmountPkr && c.demandAmountPkr.toString().includes(q)) ||
      linkedCnos.includes(q) ||
      linkedSections.includes(q) ||
      linkedOfficers.includes(q);

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCounsel = counselFilter === 'All' || c.assignedCounsel === counselFilter;
    const matchesForum = forumFilter === 'All' || c.forum === forumFilter;
    const matchesTaxYear = taxYearFilter === 'All' || c.taxYear === taxYearFilter;

    return matchesSearch && matchesStatus && matchesCounsel && matchesForum && matchesTaxYear;
  });

  const filteredDocuments = documents.filter((doc) => {
    const q = docSearchTerm.trim().toLowerCase();

    // Link case and notices to match file search against case metadata (CNO, Section, Forum, Tax Year, Client NTN, Ref)
    const linkedCase = cases.find((c) => c.id === doc.caseId);
    const linkedNotices = notices.filter((n) => n.caseId === doc.caseId);
    const linkedCnos = linkedNotices.map((n) => n.cnoNumber.toLowerCase()).join(' ');
    const linkedSections = linkedNotices.map((n) => n.sectionCode.toLowerCase()).join(' ');

    const matchesSearch =
      q === '' ||
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.uploadedBy.toLowerCase().includes(q) ||
      (doc.fileSize && doc.fileSize.toLowerCase().includes(q)) ||
      (doc.fileType && doc.fileType.toLowerCase().includes(q)) ||
      (doc.uploadedAt && doc.uploadedAt.toLowerCase().includes(q)) ||
      (doc.caseId && doc.caseId.toLowerCase().includes(q)) ||
      (linkedCase && (
        linkedCase.caseTitle.toLowerCase().includes(q) ||
        linkedCase.caseRef.toLowerCase().includes(q) ||
        linkedCase.clientName.toLowerCase().includes(q) ||
        linkedCase.clientNtn.toLowerCase().includes(q) ||
        linkedCase.forum.toLowerCase().includes(q) ||
        linkedCase.taxYear.toLowerCase().includes(q) ||
        linkedCase.assignedCounsel.toLowerCase().includes(q)
      )) ||
      linkedCnos.includes(q) ||
      linkedSections.includes(q);

    const matchesCategory =
      docCategoryFilter === 'All' || doc.category === docCategoryFilter;
    const matchesUploader =
      docUploaderFilter === 'All' || doc.uploadedBy === docUploaderFilter;

    return matchesSearch && matchesCategory && matchesUploader;
  });

  const filteredTasks = tasks.filter((t) => {
    const q = taskSearchTerm.trim().toLowerCase();
    const linkedCase = cases.find((c) => c.id === t.caseId);
    const linkedNotices = notices.filter((n) => n.caseId === t.caseId);
    const linkedCnos = linkedNotices.map((n) => n.cnoNumber.toLowerCase()).join(' ');
    const linkedSections = linkedNotices.map((n) => n.sectionCode.toLowerCase()).join(' ');

    const matchesSearch =
      q === '' ||
      t.title.toLowerCase().includes(q) ||
      t.assignedTo.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q) ||
      t.dueDate.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (linkedCase && (
        linkedCase.caseTitle.toLowerCase().includes(q) ||
        linkedCase.caseRef.toLowerCase().includes(q) ||
        linkedCase.clientName.toLowerCase().includes(q) ||
        linkedCase.clientNtn.toLowerCase().includes(q)
      )) ||
      linkedCnos.includes(q) ||
      linkedSections.includes(q);

    const matchesStatus =
      taskStatusFilter === 'All' ||
      (taskStatusFilter === 'Pending' && !t.isCompleted) ||
      (taskStatusFilter === 'Completed' && t.isCompleted);
    const matchesAssignee =
      taskAssigneeFilter === 'All' || t.assignedTo === taskAssigneeFilter;

    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const filteredNotes = notes.filter((n) => {
    const q = noteSearchTerm.trim().toLowerCase();
    const linkedCase = cases.find((c) => c.id === n.caseId);
    const linkedNotices = notices.filter((not) => not.caseId === n.caseId);
    const linkedCnos = linkedNotices.map((not) => not.cnoNumber.toLowerCase()).join(' ');
    const linkedSections = linkedNotices.map((not) => not.sectionCode.toLowerCase()).join(' ');

    return (
      q === '' ||
      n.text.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q) ||
      n.date.toLowerCase().includes(q) ||
      (linkedCase && (
        linkedCase.caseTitle.toLowerCase().includes(q) ||
        linkedCase.caseRef.toLowerCase().includes(q) ||
        linkedCase.clientName.toLowerCase().includes(q) ||
        linkedCase.clientNtn.toLowerCase().includes(q)
      )) ||
      linkedCnos.includes(q) ||
      linkedSections.includes(q)
    );
  });

  const filteredInvoices = invoices.filter((inv) => {
    const q = billingSearchTerm.trim().toLowerCase();
    const linkedCase = cases.find((c) => c.id === inv.caseId);
    const linkedNotices = notices.filter((n) => n.caseId === inv.caseId);
    const linkedCnos = linkedNotices.map((n) => n.cnoNumber.toLowerCase()).join(' ');
    const linkedSections = linkedNotices.map((n) => n.sectionCode.toLowerCase()).join(' ');

    const matchesSearch =
      q === '' ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.serviceDescription.toLowerCase().includes(q) ||
      inv.clientName.toLowerCase().includes(q) ||
      inv.clientNtn.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q) ||
      inv.issueDate.toLowerCase().includes(q) ||
      inv.dueDate.toLowerCase().includes(q) ||
      inv.totalAmountPkr.toString().includes(q) ||
      (linkedCase && (
        linkedCase.caseTitle.toLowerCase().includes(q) ||
        linkedCase.caseRef.toLowerCase().includes(q) ||
        linkedCase.forum.toLowerCase().includes(q) ||
        linkedCase.taxYear.toLowerCase().includes(q)
      )) ||
      linkedCnos.includes(q) ||
      linkedSections.includes(q);

    const matchesStatus =
      billingStatusFilter === 'All' || inv.status === billingStatusFilter;
    const matchesClient =
      billingClientFilter === 'All' || inv.clientName === billingClientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  const filteredNotifications = notifications.filter((notif) => {
    const q = notifSearchTerm.trim().toLowerCase();
    const linkedCase = cases.find((c) => c.id === notif.caseId);

    const matchesSearch =
      q === '' ||
      notif.title.toLowerCase().includes(q) ||
      notif.message.toLowerCase().includes(q) ||
      notif.clientName.toLowerCase().includes(q) ||
      notif.recipientPhoneOrEmail.toLowerCase().includes(q) ||
      notif.type.toLowerCase().includes(q) ||
      notif.status.toLowerCase().includes(q) ||
      (linkedCase && (
        linkedCase.caseTitle.toLowerCase().includes(q) ||
        linkedCase.caseRef.toLowerCase().includes(q)
      ));

    const matchesType =
      notifTypeFilter === 'All' || notif.type === notifTypeFilter;
    const matchesStatus =
      notifStatusFilter === 'All' || notif.status === notifStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calendar State
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Modal States
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [showNoticesModal, setShowNoticesModal] = useState(false);
  const [noticeStatusFilter, setNoticeStatusFilter] = useState<'all' | 'Pending Reply' | 'Challenged in Appeal' | 'Order Passed'>('all');
  const [noticeSearchTerm, setNoticeSearchTerm] = useState('');
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddHearingModal, setShowAddHearingModal] = useState(false);
  const [showSendNotifModal, setShowSendNotifModal] = useState(false);

  // Selected Case Detail Drawer & Sub-tab
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null);
  const [caseDetailTab, setCaseDetailTab] = useState<'overview' | 'notices' | 'tasks' | 'notes' | 'documents' | 'billing' | 'whatsapp'>('overview');

  // Edit Case Details State
  const [isEditingCase, setIsEditingCase] = useState(false);
  const [editCaseForm, setEditCaseForm] = useState<Partial<CaseFile>>({});

  // WhatsApp Tab State & Templates
  const [waTemplateType, setWaTemplateType] = useState<'hearing' | 'notice' | 'invoice' | 'stay' | 'custom'>('hearing');
  const [waCustomMessage, setWaCustomMessage] = useState('');
  const [waCopiedNotice, setWaCopiedNotice] = useState(false);

  // PDF Invoice Modal State
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState<Invoice | null>(null);

  // Case Detail Hearing Form States
  const [isEditingCaseHearing, setIsEditingCaseHearing] = useState(false);
  const [caseHearingForm, setCaseHearingForm] = useState(() => ({
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    time: '10:00 AM',
    forum: 'Islamabad High Court (IHC)' as LegalForum,
    bench: 'Division Bench - Islamabad High Court',
    purpose: 'Arguments on Interlocutory Stay Order Application',
    counselAssigned: 'Hafiz Irfan Shabber Kayani',
    previousHearingDate: '',
    previousHearingOutcome: ''
  }));

  const handleStartEditHearing = () => {
    if (selectedCase) {
      setCaseHearingForm({
        date: selectedCase.nextHearingDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        time: '10:00 AM',
        forum: selectedCase.forum || 'Islamabad High Court (IHC)',
        bench: 'Honourable High Court Bench',
        purpose: selectedCase.nextHearingPurpose || 'Cause List Arguments & Proceedings',
        counselAssigned: selectedCase.assignedCounsel || 'Hafiz Irfan Shabber Kayani',
        previousHearingDate: selectedCase.nextHearingDate || new Date().toISOString().split('T')[0],
        previousHearingOutcome: ''
      });
    }
    setIsEditingCaseHearing(true);
  };

  const handleSaveCaseHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    updateCaseHearing(selectedCase.id, {
      nextHearingDate: caseHearingForm.date,
      nextHearingPurpose: caseHearingForm.purpose,
      previousHearingDate: caseHearingForm.previousHearingDate,
      previousHearingOutcome: caseHearingForm.previousHearingOutcome,
      time: caseHearingForm.time,
      bench: caseHearingForm.bench,
      forum: caseHearingForm.forum,
      counselAssigned: caseHearingForm.counselAssigned
    });

    setSelectedCase((prev) =>
      prev
        ? {
            ...prev,
            nextHearingDate: caseHearingForm.date,
            nextHearingPurpose: caseHearingForm.purpose,
            forum: caseHearingForm.forum,
            assignedCounsel: caseHearingForm.counselAssigned
          }
        : null
    );

    setIsEditingCaseHearing(false);
    alert('Hearing schedule and previous hearing record updated successfully!');
  };

  // Case File Details Edit Handlers
  const handleStartEditCase = () => {
    if (selectedCase) {
      const existingCred = clientCredentials.find(
        (c) => c.clientId === selectedCase.clientId || (c.email && c.email.toLowerCase() === selectedCase.clientLoginEmail?.toLowerCase())
      );
      setEditCaseForm({
        caseTitle: selectedCase.caseTitle,
        caseRef: selectedCase.caseRef,
        taxYear: selectedCase.taxYear,
        forum: selectedCase.forum,
        status: selectedCase.status,
        riskLevel: selectedCase.riskLevel,
        demandAmountPkr: selectedCase.demandAmountPkr,
        savedAmountPkr: selectedCase.savedAmountPkr,
        assignedCounsel: selectedCase.assignedCounsel,
        summary: selectedCase.summary,
        nextHearingDate: selectedCase.nextHearingDate || '',
        nextHearingPurpose: selectedCase.nextHearingPurpose || '',
        clientLoginEmail: existingCred?.email || selectedCase.clientLoginEmail || '',
        clientLoginPassword: existingCred?.password || selectedCase.clientLoginPassword || ''
      });
      setIsEditingCase(!isEditingCase);
    }
  };

  const handleSaveCaseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    updateCase(selectedCase.id, editCaseForm);
    if (editCaseForm.clientLoginEmail && editCaseForm.clientLoginPassword) {
      addClientCredential({
        clientId: selectedCase.clientId,
        clientName: selectedCase.clientName,
        email: editCaseForm.clientLoginEmail,
        password: editCaseForm.clientLoginPassword
      });
    }
    setSelectedCase((prev) => (prev ? { ...prev, ...editCaseForm } : null));
    setIsEditingCase(false);
    alert('Case details and client portal access credentials updated successfully!');
  };

  // WhatsApp Message Generator
  const getFormattedWhatsAppText = () => {
    if (!selectedCase) return '';
    const caseInvoices = invoices.filter((i) => i.caseId === selectedCase.id);
    const latestInvoice = caseInvoices[0];

    switch (waTemplateType) {
      case 'hearing':
        return `*HISK LEGAL - ADVOCATES & TAX CONSULTANTS*\n📍 *Office No. 10, 2nd Floor, Awan Plaza, G-8 Markaz, Islamabad*\n\nAssalamu Alaikum *${selectedCase.clientName}*,\n\nThis is an official court hearing notification regarding your tax litigation file:\n📁 *Case File:* ${selectedCase.caseTitle}\n🏛️ *Ref / CNO:* ${selectedCase.caseRef}\n⚖️ *Legal Forum:* ${selectedCase.forum}\n\n📅 *Next Court Hearing:* ${selectedCase.nextHearingDate || 'Upcoming Schedule'}\n⏰ *Time:* 10:00 AM\n👤 *Assigned Counsel:* ${selectedCase.assignedCounsel}\n🎯 *Purpose:* ${selectedCase.nextHearingPurpose || 'Cause List Arguments & Proceedings'}\n\n📌 *Instructions for Client:* Please ensure all supporting income tax/sales tax records are updated. Reply to this message if you require a preliminary briefing with your advocate before the hearing.\n\nRegards,\n*Advocate Desk - HISK LEGAL*\n📞 Contact: +92 314 5113670`;

      case 'notice':
        return `*HISK LEGAL - ADVOCATES & TAX CONSULTANTS*\n📍 *Islamabad High Court & FBR Tax Practice*\n\nAssalamu Alaikum *${selectedCase.clientName}*,\n\nImportant update regarding your FBR tax notice compliance:\n📁 *Case File:* ${selectedCase.caseTitle}\n📄 *Notice Ref:* ${selectedCase.caseRef}\n🏛️ *Tax Forum:* ${selectedCase.forum}\n📅 *Tax Year:* ${selectedCase.taxYear}\n\n⚠️ *Disputed Tax Demand:* Rs. ${(selectedCase.demandAmountPkr / 100000).toFixed(2)} Lakh\n⏳ *Reply Due Date:* ${selectedCase.nextHearingDate || 'Within 7 Days'}\n\n⚖️ *Legal Status:* Our advocate team has prepared the comprehensive rebuttal and stay petition under the Income Tax Ordinance. No coercive action will be taken by FBR during pending stay.\n\nRegards,\n*Advocate Desk - HISK LEGAL*`;

      case 'invoice':
        return `*HISK LEGAL - ADVOCATES & TAX CONSULTANTS*\n📍 *G-8 Markaz, Islamabad*\n\nAssalamu Alaikum *${selectedCase.clientName}*,\n\nFee Remittance Statement for legal services rendered:\n📄 *Invoice Ref:* ${latestInvoice ? latestInvoice.invoiceNumber : 'INV-2026-HISK'}\n📁 *Case:* ${selectedCase.caseTitle}\n💰 *Total Payable Amount:* Rs. ${latestInvoice ? latestInvoice.totalAmountPkr.toLocaleString() : '250,000'} PKR\n\n🏦 *Bank Transfer Details:*\n• *Bank Name:* Habib Bank Limited (HBL)\n• *Account Title:* HISK LEGAL Advocates\n• *IBAN:* PK36HABB0001234567890123\n• *Branch:* G-8 Markaz Branch, Islamabad\n\nPlease share the payment transaction receipt/screenshot here upon remittance so we can issue your official stamped tax clearance receipt.\n\nThank you,\n*Accounts Dept - HISK LEGAL*`;

      case 'stay':
        return `*HISK LEGAL - ADVOCATES & TAX CONSULTANTS*\n📍 *High Court & Appellate Litigation Desk*\n\nAssalamu Alaikum *${selectedCase.clientName}*,\n\n🎉 *FAVORABLE COURT ORDER UPDATE:*\nWe are pleased to inform you that the Honourable Court has granted an *Interlocutory Stay Order* in your case:\n\n📁 *Case Title:* ${selectedCase.caseTitle}\n🏛️ *Court Forum:* ${selectedCase.forum}\n🛡️ *Relief Granted:* FBR tax recovery notice stayed and bank attachment restrained until final decision.\n💵 *Tax Amount Protected:* Rs. ${(selectedCase.demandAmountPkr / 100000).toFixed(2)} Lakh\n\nYou can view and download the certified copy of the court order from your online HISK Client Portal.\n\nWarm regards,\n*Hafiz Irfan Shabber Kayani*\nSenior Partner - HISK LEGAL`;

      case 'custom':
      default:
        return `*HISK LEGAL - ADVOCATES & TAX CONSULTANTS*\n📍 *Islamabad High Court Practice*\n\nAssalamu Alaikum *${selectedCase.clientName}*,\n\n${waCustomMessage || `Regarding your tax file *${selectedCase.caseTitle}* (${selectedCase.caseRef}), our legal team has updated your case status to: *${selectedCase.status}*.`}\n\nPlease feel free to contact us if you need further clarification.\n\nBest regards,\n*HISK LEGAL Team*`;
    }
  };

  const handleSendWhatsAppDirect = () => {
    if (!selectedCase) return;
    const client = clients.find((c) => c.id === selectedCase.clientId);
    const phone = client?.phone || '+92 300 1234567';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('03') ? '92' + cleanPhone.slice(1) : cleanPhone;

    const text = getFormattedWhatsAppText();
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  const handleCopyWhatsAppText = () => {
    const text = getFormattedWhatsAppText();
    navigator.clipboard.writeText(text);
    setWaCopiedNotice(true);
    setTimeout(() => setWaCopiedNotice(false), 2500);
  };

  const handleLogWhatsAppNotification = () => {
    if (!selectedCase) return;
    const client = clients.find((c) => c.id === selectedCase.clientId);
    const phone = client?.phone || '+92 300 1234567';

    sendNotification({
      clientId: selectedCase.clientId,
      clientName: selectedCase.clientName,
      caseId: selectedCase.id,
      type: 'WhatsApp',
      recipientPhoneOrEmail: phone,
      title: `WhatsApp Alert (${waTemplateType.toUpperCase()}): ${selectedCase.caseRef}`,
      message: getFormattedWhatsAppText()
    });

    alert('Notification logged successfully in dispatch history!');
  };

  // Case Detail Inline Form States
  const [inlineTask, setInlineTask] = useState(() => ({
    title: '',
    assignedTo: 'Hafiz Irfan Shabber Kayani',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'Urgent' as const
  }));

  const [inlineNote, setInlineNote] = useState({
    text: '',
    author: 'Hafiz Irfan Shabber Kayani',
    isPrivileged: true
  });

  const [inlineDoc, setInlineDoc] = useState({
    title: '',
    category: 'FBR Notice' as const
  });

  const [inlineInvoice, setInlineInvoice] = useState(() => ({
    serviceDescription: 'Legal Retainer & High Court Case Representation',
    retainerFeePkr: 250000,
    hearingFeePkr: 50000,
    salesTaxPkr: 48000,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  }));

  // Comprehensive New Case Form Inputs
  const [newCaseData, setNewCaseData] = useState(() => ({
    title: '',
    clientId: clients[0]?.id || '',
    cnoNumber: '',
    sectionCode: '122(5A)',
    assignedCounsel: 'Hafiz Irfan Shabber Kayani',
    forum: 'Islamabad High Court (IHC)' as LegalForum,
    taxYear: 'Tax Year 2025',
    status: 'Notice Received' as CaseStatus,
    riskLevel: 'High' as RiskLevel,
    demandAmountPkr: 5000000,
    savedAmountPkr: 0,
    nextHearingDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    nextHearingTime: '10:00 AM',
    nextHearingBench: 'Division Bench - Islamabad High Court',
    nextHearingPurpose: 'Arguments on Interlocutory Stay Order Application',
    summary: '',
    initialNote: '',
    initialTask: '',
    clientLoginEmail: '',
    clientLoginPassword: ''
  }));

  const [newClientData, setNewClientData] = useState({
    name: '',
    businessName: '',
    cnic: '',
    ntn: '',
    category: 'Corporate' as const,
    phone: '',
    email: '',
    city: 'Islamabad',
    registeredAddress: '',
    status: 'Active' as const,
    clientLoginEmail: '',
    clientLoginPassword: 'Password123!'
  });


  const [newNoticeData, setNewNoticeData] = useState(() => ({
    cnoNumber: '',
    caseId: cases[0]?.id || '',
    clientId: clients[0]?.id || '',
    sectionCode: '122(5A)',
    noticeTitle: '',
    issuingOfficer: 'Deputy Commissioner Inland Revenue, RTO Islamabad',
    taxYear: '2025',
    dateReceived: new Date().toISOString().split('T')[0],
    dueDate: '',
    disputedAmountPkr: 2500000,
    status: 'Pending Reply' as const,
    summary: ''
  }));

  const [newDocData, setNewDocData] = useState({
    caseId: cases[0]?.id || '',
    clientId: clients[0]?.id || '',
    title: '',
    category: 'FBR Notice' as const,
    fileSize: '1.5 MB',
    uploadedBy: 'Advocate Desk',
    fileType: 'pdf' as const,
    downloadUrl: '#',
    isClientVisible: true
  });

  const [newInvoiceData, setNewInvoiceData] = useState(() => ({
    caseId: cases[0]?.id || '',
    clientId: cases[0]?.clientId || clients[0]?.id || '',
    serviceDescription: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    retainerFeePkr: 250000,
    hearingFeePkr: 50000,
    salesTaxPkr: 48000,
    totalAmountPkr: 348000,
    paidAmountPkr: 0,
    status: 'Pending' as const
  }));

  const [newHearingData, setNewHearingData] = useState(() => ({
    caseId: cases[0]?.id || '',
    caseTitle: '',
    clientName: '',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '10:00 AM',
    forum: 'Islamabad High Court (IHC)' as LegalForum,
    bench: 'Honourable High Court Bench',
    counselAssigned: 'Hafiz Irfan Shabber Kayani',
    purpose: '',
    priority: 'High' as const,
    previousHearingDate: '',
    previousHearingOutcome: ''
  }));

  const [notifData, setNotifData] = useState({
    clientId: clients[0]?.id || '',
    type: 'WhatsApp' as const,
    recipientPhoneOrEmail: clients[0]?.phone || '',
    title: 'Court Hearing Alert',
    message: 'Dear Client, your upcoming tax hearing is scheduled at High Court Islamabad. - HISK LEGAL'
  });

  // Submit Handlers
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addCase({
      title: newCaseData.title,
      clientId: newCaseData.clientId,
      assignedCounsel: newCaseData.assignedCounsel,
      forum: newCaseData.forum,
      taxYear: newCaseData.taxYear,
      status: newCaseData.status,
      riskLevel: newCaseData.riskLevel,
      demandAmountPkr: newCaseData.demandAmountPkr,
      summary: `${newCaseData.summary} ${
        newCaseData.cnoNumber ? `[CNO No: ${newCaseData.cnoNumber}, Sec: ${newCaseData.sectionCode}]` : ''
      }`,
      nextHearingDate: newCaseData.nextHearingDate || undefined,
      nextHearingPurpose: newCaseData.nextHearingPurpose || undefined,
      clientLoginEmail: newCaseData.clientLoginEmail,
      clientLoginPassword: newCaseData.clientLoginPassword
    });

    if (created && newCaseData.initialNote) {
      addNote({
        caseId: created.id,
        author: newCaseData.assignedCounsel,
        text: newCaseData.initialNote,
        isPrivileged: true
      });
    }

    if (created && newCaseData.initialTask) {
      addTask({
        caseId: created.id,
        title: newCaseData.initialTask,
        assignedTo: newCaseData.assignedCounsel,
        dueDate: newCaseData.nextHearingDate || new Date().toISOString().split('T')[0],
        priority: 'Urgent'
      });
    }

    setShowAddCaseModal(false);
    alert(`Tax Litigation Case File ${created.caseRef} registered successfully! ${
      newCaseData.clientLoginEmail ? `Client Portal sign-in credentials created for ${newCaseData.clientLoginEmail}.` : ''
    }`);
    setNewCaseData({
      title: '',
      clientId: clients[0]?.id || '',
      cnoNumber: '',
      sectionCode: '122(5A)',
      forum: 'Islamabad High Court (IHC)' as LegalForum,
      taxYear: 'Tax Year 2025',
      status: 'Notice Received' as CaseStatus,
      riskLevel: 'High' as RiskLevel,
      assignedCounsel: 'Hafiz Irfan Shabber Kayani',
      demandAmountPkr: 5000000,
      savedAmountPkr: 0,
      nextHearingDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      nextHearingTime: '10:00 AM',
      nextHearingBench: 'Division Bench - Islamabad High Court',
      nextHearingPurpose: 'Arguments on Interlocutory Stay Order Application',
      summary: '',
      initialNote: '',
      initialTask: '',
      clientLoginEmail: '',
      clientLoginPassword: ''
    });
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const loginEmail = newClientData.email || newClientData.clientLoginEmail;
    const loginPass = newClientData.clientLoginPassword || 'Password123!';
    
    const createdClient = addClient(newClientData, loginEmail, loginPass);
    setShowAddClientModal(false);
    alert(`Client Profile created for ${createdClient.name}! Client Portal sign-in credentials created: Email: ${loginEmail}, Password: ${loginPass}`);
  };


  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    addNotice(newNoticeData);
    setShowAddNoticeModal(false);
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCaseId = newDocData.caseId || cases[0]?.id || '';
    const selCase = cases.find((c) => c.id === targetCaseId);
    const targetClientId = selCase ? selCase.clientId : (newDocData.clientId || clients[0]?.id || '');

    const createdDoc = addDocument({
      ...newDocData,
      caseId: targetCaseId,
      clientId: targetClientId
    });

    alert(`Document "${createdDoc.title || 'Legal Document'}" uploaded & synced to Case File [${selCase?.caseRef || 'REF'}] successfully!`);

    setNewDocData({
      caseId: cases[0]?.id || '',
      clientId: cases[0]?.clientId || clients[0]?.id || '',
      title: '',
      category: 'FBR Notice',
      fileSize: '1.5 MB',
      uploadedBy: 'Hafiz Irfan Shabber Kayani',
      fileType: 'pdf',
      downloadUrl: '#',
      isClientVisible: true
    });

    setShowAddDocModal(false);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const selCase = cases.find((c) => c.id === newInvoiceData.caseId) || cases[0];
    const targetCaseId = selCase ? selCase.id : newInvoiceData.caseId;
    const targetClientId = selCase ? selCase.clientId : (clients[0]?.id || '');
    const totalPkr = (newInvoiceData.retainerFeePkr || 0) + (newInvoiceData.hearingFeePkr || 0) + (newInvoiceData.salesTaxPkr || 0);

    const created = addInvoice({
      caseId: targetCaseId,
      clientId: targetClientId,
      serviceDescription: newInvoiceData.serviceDescription || 'Legal Representation & Retainer Fees',
      issueDate: newInvoiceData.issueDate || new Date().toISOString().split('T')[0],
      dueDate: newInvoiceData.dueDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      retainerFeePkr: newInvoiceData.retainerFeePkr,
      hearingFeePkr: newInvoiceData.hearingFeePkr,
      salesTaxPkr: newInvoiceData.salesTaxPkr,
      totalAmountPkr: totalPkr,
      paidAmountPkr: 0,
      status: 'Pending'
    });

    setShowAddInvoiceModal(false);
    alert(`Invoice ${created.invoiceNumber} created successfully!`);
  };

  const handleCreateHearing = (e: React.FormEvent) => {
    e.preventDefault();
    const selCase = cases.find((c) => c.id === newHearingData.caseId);
    addHearing({
      ...newHearingData,
      caseTitle: selCase ? selCase.caseTitle : 'Tax Case Hearing',
      clientName: selCase ? selCase.clientName : 'Client'
    });

    const calUrl = buildGoogleCalendarUrl({
      title: `Tax Hearing: ${selCase ? selCase.caseTitle : 'Court Hearing'}`,
      details: `Client: ${selCase ? selCase.clientName : 'Client'}\nPurpose: ${newHearingData.purpose}\nBench: ${newHearingData.bench}\nCounsel: ${newHearingData.counselAssigned}`,
      location: newHearingData.forum,
      startDate: newHearingData.date,
      startTime: newHearingData.time || '10:00'
    });

    setShowAddHearingModal(false);

    if (window.confirm('Hearing successfully scheduled! Open Google Calendar to sync event now?')) {
      window.open(calUrl, '_blank');
    }
  };

  const handleSendNotif = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === notifData.clientId);
    sendNotification({
      ...notifData,
      clientName: client ? client.name : 'Client'
    });

    // Also trigger native WhatsApp link
    if (notifData.type === 'WhatsApp') {
      const cleanPhone = notifData.recipientPhoneOrEmail.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(notifData.message)}`;
      window.open(waUrl, '_blank');
    }

    setShowSendNotifModal(false);
  };

  // Inline Handlers for Selected Case Drawer
  const handleAddInlineTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !inlineTask.title) return;
    addTask({
      caseId: selectedCase.id,
      title: inlineTask.title,
      assignedTo: inlineTask.assignedTo,
      dueDate: inlineTask.dueDate,
      priority: inlineTask.priority
    });
    setInlineTask({
      title: '',
      assignedTo: 'Adv. Jamshaid Khan',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: 'Urgent'
    });
  };

  const handleAddInlineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !inlineNote.text) return;
    addNote({
      caseId: selectedCase.id,
      author: inlineNote.author,
      text: inlineNote.text,
      isPrivileged: inlineNote.isPrivileged
    });
    setInlineNote({
      text: '',
      author: 'Hafiz Irfan Shabber Kayani',
      isPrivileged: true
    });
  };

  const handleAddInlineDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !inlineDoc.title) return;
    addDocument({
      caseId: selectedCase.id,
      clientId: selectedCase.clientId,
      title: inlineDoc.title,
      category: inlineDoc.category,
      fileSize: '1.8 MB',
      uploadedBy: 'Advocate Desk',
      fileType: 'pdf',
      downloadUrl: '#',
      isClientVisible: true
    });
    setInlineDoc({ title: '', category: 'FBR Notice' });
  };

  const handleAddInlineInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    const client = clients.find((c) => c.id === selectedCase.clientId);
    const totalPkr = inlineInvoice.retainerFeePkr + inlineInvoice.hearingFeePkr + inlineInvoice.salesTaxPkr;

    addInvoice({
      caseId: selectedCase.id,
      clientId: selectedCase.clientId,
      serviceDescription: inlineInvoice.serviceDescription,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: inlineInvoice.dueDate,
      retainerFeePkr: inlineInvoice.retainerFeePkr,
      hearingFeePkr: inlineInvoice.hearingFeePkr,
      salesTaxPkr: inlineInvoice.salesTaxPkr,
      totalAmountPkr: totalPkr,
      paidAmountPkr: 0,
      status: 'Pending'
    });

    setInlineInvoice({
      serviceDescription: 'Legal Retainer & Representation',
      retainerFeePkr: 200000,
      hearingFeePkr: 50000,
      salesTaxPkr: 40000,
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
    });
  };

  const handleSendWhatsAppCaseReminder = () => {
    if (!selectedCase) return;
    const client = clients.find((c) => c.id === selectedCase.clientId);
    const phone = client?.phone || '+92 300 1234567';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const msg = `Assalamu Alaikum ${selectedCase.clientName},\n\nThis is an official hearing notice from HISK LEGAL regarding your tax file *${selectedCase.caseTitle}* (${selectedCase.caseRef}).\n\n📌 *Forum:* ${selectedCase.forum}\n📅 *Next Hearing Date:* ${selectedCase.nextHearingDate || 'Upcoming Schedule'}\n⚖️ *Lead Counsel:* ${selectedCase.assignedCounsel}\n🎯 *Purpose:* ${selectedCase.nextHearingPurpose || 'Cause list hearing'}\n\nPlease keep your tax documentation ready. Reply to this message if you have any questions.`;

    sendNotification({
      clientId: selectedCase.clientId,
      clientName: selectedCase.clientName,
      caseId: selectedCase.id,
      type: 'WhatsApp',
      recipientPhoneOrEmail: phone,
      title: `Hearing Alert: ${selectedCase.caseRef}`,
      message: msg
    });

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddCaseToGoogleCalendar = () => {
    if (!selectedCase) return;
    const url = buildGoogleCalendarUrl({
      title: `Tax Court Hearing: ${selectedCase.caseTitle}`,
      details: `Client: ${selectedCase.clientName}\nCase Ref: ${selectedCase.caseRef}\nCounsel: ${selectedCase.assignedCounsel}\nPurpose: ${selectedCase.nextHearingPurpose || 'Court Proceedings'}`,
      location: selectedCase.forum,
      startDate: selectedCase.nextHearingDate || new Date().toISOString().split('T')[0],
      startTime: '10:00'
    });
    window.open(url, '_blank');
  };

  // Combine explicit hearings with cases that have a nextHearingDate scheduled
  const allSyncedHearings = [
    ...hearings,
    ...cases
      .filter((c) => c.nextHearingDate && !hearings.some((h) => h.caseId === c.id && h.date === c.nextHearingDate))
      .map((c) => ({
        id: `case-h-${c.id}`,
        caseId: c.id,
        caseTitle: c.caseTitle,
        clientName: c.clientName,
        date: c.nextHearingDate!,
        time: '10:00 AM',
        forum: c.forum,
        bench: 'Honourable High Court / Appellate Bench',
        counselAssigned: c.assignedCounsel,
        purpose: c.nextHearingPurpose || 'Cause List Hearing Proceedings',
        priority: c.riskLevel === 'Critical' ? ('High' as const) : ('Medium' as const)
      }))
  ];

  // Filter Calendar Hearings
  const calendarHearings = selectedCalendarDate
    ? allSyncedHearings.filter((h) => h.date === selectedCalendarDate)
    : allSyncedHearings;

  // Render Days for Dynamic Calendar Grid
  const calendarYear = calendarCurrentDate.getFullYear();
  const calendarMonth = calendarCurrentDate.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const mStr = (calendarMonth + 1).toString().padStart(2, '0');
    const dStr = dayNum.toString().padStart(2, '0');
    const dateStr = `${calendarYear}-${mStr}-${dStr}`;
    const dayHearings = allSyncedHearings.filter((h) => h.date === dateStr);
    return { dayNum, dateStr, dayHearings };
  });

  // Metrics
  const pendingNoticesCount = notices.filter((n) => n.status === 'Pending Reply').length;

  if (adminAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-4 border-[#0A4B35] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-600">Verifying Admin Account...</p>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#0F6B4C]/20 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="relative w-48 h-16 mx-auto">
              <Image
                src="https://i.ibb.co/wh9Gb1br/20260723-032202-0000.png"
                alt="HISK LEGAL Logo"
                fill
                unoptimized
                className="object-contain object-center brightness-0"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="bg-[#0A4B35]/10 text-[#0A4B35] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              HISK LEGAL Admin Portal
            </span>
            <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">
              Advocate Admin Authentication
            </h1>
            <p className="text-xs text-gray-600">
              Restricted Portal for Senior Advocates & Partners of HISK LEGAL. Please sign in with your authorized account.
            </p>
          </div>

          {adminAuthError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Access Denied</span>
              </div>
              <p>{adminAuthError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdminGoogleSignIn}
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
            <span className="text-white text-xs sm:text-sm">Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0A4B35] text-white shrink-0 border-r border-[#0F6B4C] p-4 flex flex-col justify-between">
        <div>
          <div className="mb-6 px-2 pt-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#F5A623] block">
              Case Management System
            </span>
            <h2 className="text-lg font-heading font-extrabold text-white">HISK LEGAL Desk</h2>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'cases', label: 'Case Management', icon: Briefcase, badge: cases.length },
              { id: 'calendar', label: 'Hearing Calendar', icon: CalendarIcon, badge: hearings.length },
              { id: 'documents', label: 'Document Vault', icon: FolderOpen },
              { id: 'tasks', label: 'Tasks & Internal Notes', icon: CheckSquare },
              { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
              { id: 'notifications', label: 'WhatsApp / Email Alerts', icon: Send }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#F5A623] text-[#1A1A1A] shadow-md'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#0A4B35] text-white' : 'bg-white/15 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-emerald-600/30 text-[11px] text-emerald-200 space-y-2">
          <div>
            <div className="font-bold text-white">HISK LEGAL Advocates</div>
            <div className="text-[10px] text-emerald-300 font-mono">jamalshah183@gmail.com</div>
          </div>
          <button
            type="button"
            onClick={handleAdminSignOut}
            className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden">
        {/* --- TAB 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Control Header & Quick Launch Hub */}
            <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-[#F5A623] uppercase tracking-wider block">Senior Partner Executive Desk</span>
                  <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">Advocate Control & Analytics Dashboard</h1>
                  <p className="text-xs text-[#5A6275]">High Court Tax Writs, ATIR Appeals, FBR Notice Compliance & Fee Receivables.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowAddCaseModal(true)}
                    className="bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Case File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewDocData((prev) => ({
                        ...prev,
                        caseId: prev.caseId || cases[0]?.id || '',
                        clientId: prev.clientId || cases[0]?.clientId || clients[0]?.id || ''
                      }));
                      setShowAddDocModal(true);
                    }}
                    className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#F5A623]" />
                    <span>Upload Case File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewInvoiceData((prev) => ({
                        ...prev,
                        caseId: prev.caseId || cases[0]?.id || '',
                        clientId: prev.clientId || cases[0]?.clientId || clients[0]?.id || ''
                      }));
                      setShowAddInvoiceModal(true);
                    }}
                    className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#F5A623]" />
                    <span>Issue Fee Invoice</span>
                  </button>
                </div>
              </div>

              {/* Action Bar Shortcuts */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs font-bold text-[#0F6B4C]">
                <span className="text-gray-400 text-[11px] uppercase font-mono mr-1">Quick Actions:</span>
                <button
                  onClick={() => setShowAddNoticeModal(true)}
                  className="bg-[#FAFAF7] hover:bg-[#0A4B35]/10 text-[#0F6B4C] border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Log FBR Notice</span>
                </button>
                <button
                  onClick={() => setShowAddHearingModal(true)}
                  className="bg-[#FAFAF7] hover:bg-[#0A4B35]/10 text-[#0F6B4C] border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>Schedule Cause List Hearing</span>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="bg-[#FAFAF7] hover:bg-[#0A4B35]/10 text-[#0F6B4C] border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#0F6B4C]" />
                  <span>Document Vault ({documents.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className="bg-[#FAFAF7] hover:bg-[#0A4B35]/10 text-[#0F6B4C] border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#0F6B4C]" />
                  <span>Billing & Invoices ({invoices.length})</span>
                </button>
              </div>
            </div>

            {/* Decision Analytics Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#5A6275] uppercase">
                  <span>Active Case Files</span>
                  <Briefcase className="w-4 h-4 text-[#0F6B4C]" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#1A1A1A] mt-1">{cases.length} Active Files</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Demand Protected: Rs. {(cases.reduce((a, c) => a + c.demandAmountPkr, 0) / 10000000).toFixed(2)} Cr
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#5A6275] uppercase">
                  <span>Fee Receivables</span>
                  <CreditCard className="w-4 h-4 text-[#F5A623]" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#0F6B4C] mt-1">
                  Rs. {(invoices.filter((i) => i.status !== 'Paid').reduce((a, i) => a + (i.totalAmountPkr - i.paidAmountPkr), 0) / 1000).toFixed(0)}k PKR
                </div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1">
                  {invoices.filter((i) => i.status !== 'Paid').length} Unpaid / Pending Invoices
                </div>
              </div>

              <div
                onClick={() => setShowNoticesModal(true)}
                className="bg-white p-5 rounded-3xl border border-red-200 hover:border-red-500 shadow-sm transition-all cursor-pointer group hover:shadow-md"
                title="Click to view all pending FBR notice replies"
              >
                <div className="flex justify-between items-center text-[11px] font-bold text-[#5A6275] uppercase">
                  <span>FBR Notice Compliance</span>
                  <AlertTriangle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-red-700 mt-1 flex items-center justify-between">
                  <span>{notices.filter((n) => n.status === 'Pending Reply').length} Replies Due</span>
                  <span className="text-xs font-extrabold text-[#0F6B4C] group-hover:underline flex items-center gap-1">
                    View All ({notices.length}) →
                  </span>
                </div>
                <div className="text-[11px] text-red-600 font-semibold mt-1">
                  Avoid Ex-Parte Demand Orders • Click to view due replies
                </div>
              </div>
            </div>

            {/* High Priority Decision Action Queue & Recent Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Litigation Cases (2 Cols) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Active Tax Litigation Repository</h3>
                    <p className="text-xs text-[#5A6275]">Click any case file to view all synced documents, invoices, tasks, notes, and WhatsApp dispatches.</p>
                  </div>
                  <button onClick={() => setActiveTab('cases')} className="text-xs font-extrabold text-[#0F6B4C] hover:underline shrink-0">
                    View All ({cases.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {cases.map((c) => {
                    const caseDocs = documents.filter((d) => d.caseId === c.id);
                    const caseInvs = invoices.filter((i) => i.caseId === c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className="p-4 rounded-2xl bg-[#FAFAF7] border border-gray-200 hover:border-[#0F6B4C] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-[#0A4B35] text-white px-2 py-0.5 rounded">
                              {c.caseRef}
                            </span>
                            <span className="text-xs font-extrabold text-[#1A1A1A]">{c.clientName}</span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-[#0F6B4C] px-2 py-0.5 rounded">
                              Tax Year {c.taxYear}
                            </span>
                          </div>
                          <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">{c.caseTitle}</h4>
                          <div className="text-[11px] text-[#5A6275] flex items-center gap-3 flex-wrap">
                            <span>Forum: <strong className="text-[#0F6B4C]">{c.forum}</strong></span>
                            <span>• Lead Counsel: <strong>{c.assignedCounsel}</strong></span>
                          </div>

                          {/* Synced Stats Tags */}
                          <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-gray-600">
                            <span className="bg-white border px-2 py-0.5 rounded-md text-[#0F6B4C] flex items-center gap-1">
                              <FolderOpen className="w-3 h-3 text-[#F5A623]" /> {caseDocs.length} Synced Docs
                            </span>
                            <span className="bg-white border px-2 py-0.5 rounded-md text-[#0F6B4C] flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-[#F5A623]" /> {caseInvs.length} Invoices
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-red-700 block">
                            Rs. {(c.demandAmountPkr / 100000).toFixed(1)} Lakh
                          </span>
                          <span className="text-[10px] font-bold bg-[#F5A623]/20 text-[#1A1A1A] px-2.5 py-0.5 rounded-full inline-block mt-1">
                            {c.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cause List Hearings & Priority Action Queue */}
              <div className="space-y-6">
                {/* Upcoming Hearings */}
                <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Cause List Court Schedule</h3>
                    <button onClick={() => setShowAddHearingModal(true)} className="text-xs font-bold text-[#0F6B4C] flex items-center gap-1 hover:underline">
                      <Plus className="w-3.5 h-3.5 text-[#F5A623]" /> Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {hearings.slice(0, 3).map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          const selCase = cases.find((c) => c.id === h.caseId);
                          if (selCase) setSelectedCase(selCase);
                        }}
                        className="p-4 rounded-2xl bg-[#0A4B35]/5 border border-[#0F6B4C]/20 text-xs space-y-1.5 cursor-pointer hover:border-[#0F6B4C] transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#0F6B4C]">{h.forum}</span>
                          <span className="font-extrabold text-[#1A1A1A] bg-[#F5A623] px-2 py-0.5 rounded">
                            {h.date}
                          </span>
                        </div>
                        <div className="font-extrabold text-sm text-[#1A1A1A]">{h.caseTitle}</div>
                        <div className="text-[#5A6275]">Bench: {h.bench}</div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = buildGoogleCalendarUrl({
                                title: `Tax Hearing: ${h.caseTitle}`,
                                details: `Client: ${h.clientName}\nCounsel: ${h.counselAssigned}\nBench: ${h.bench}`,
                                location: h.forum,
                                startDate: h.date,
                                startTime: '10:00'
                              });
                              window.open(url, '_blank');
                            }}
                            className="text-[10px] font-extrabold text-[#0F6B4C] flex items-center gap-1 hover:underline"
                          >
                            <CalendarIcon className="w-3 h-3 text-[#F5A623]" /> Add to Google Calendar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Unpaid Invoices Summary */}
                <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-3">
                  <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Fee Receivables Summary</h3>
                  <div className="space-y-2 text-xs">
                    {invoices.filter((i) => i.status !== 'Paid').map((i) => (
                      <div key={i.id} className="p-3 rounded-xl bg-[#FAFAF7] border border-gray-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#1A1A1A]">{i.clientName}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{i.invoiceNumber} • Due: {i.dueDate}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-[#0F6B4C] block">Rs. {i.totalAmountPkr.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForPdf(i)}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 mt-0.5"
                          >
                            Send Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CASE MANAGEMENT --- */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">Tax Litigation Repository</h1>
                <p className="text-xs text-[#5A6275]">Filter active tax appeals, High Court writs, and show cause responses.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddHearingModal(true)}
                  className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <CalendarIcon className="w-4 h-4 text-[#F5A623]" />
                  <span>Schedule Hearing</span>
                </button>

                <button
                  onClick={() => setShowAddCaseModal(true)}
                  className="bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Case</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#0F6B4C]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                <Search className="w-4 h-4 text-[#0F6B4C] shrink-0" />
                <input
                  type="text"
                  placeholder="Search by Case Title, Ref #, CNO No, Section Code, NTN, Client, Forum, Tax Year, Counsel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F6B4C] text-xs font-medium"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 shrink-0"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold text-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="Notice Received">Notice Received</option>
                  <option value="Response Drafted">Response Drafted</option>
                  <option value="Under Audit">Under Audit</option>
                  <option value="CIR Appeal Pending">CIR Appeal Pending</option>
                  <option value="ATIR Tribunal Pending">ATIR Tribunal Pending</option>
                  <option value="High Court Writ Active">High Court Writ Active</option>
                  <option value="Stay Granted">Stay Granted</option>
                  <option value="Favorable Order Passed">Favorable Order Passed</option>
                </select>

                <select
                  value={forumFilter}
                  onChange={(e) => setForumFilter(e.target.value)}
                  className="bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold text-xs"
                >
                  <option value="All">All Legal Forums</option>
                  {caseForums.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <select
                  value={taxYearFilter}
                  onChange={(e) => setTaxYearFilter(e.target.value)}
                  className="bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold text-xs"
                >
                  <option value="All">All Tax Years</option>
                  {caseTaxYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <div className="bg-[#0A4B35]/10 text-[#0A4B35] font-extrabold px-3 py-2 rounded-xl text-xs shrink-0">
                  {filteredCases.length} / {cases.length} Files
                </div>
              </div>
            </div>

            {/* Cases Vertical List */}
            <div className="flex flex-col gap-4">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold bg-[#0A4B35] text-white px-2.5 py-0.5 rounded-md">
                        {c.caseRef}
                      </span>
                      <span className="text-xs font-bold text-[#5A6275]">Tax Year: {c.taxYear}</span>
                      <span className="text-xs font-extrabold text-[#0F6B4C] bg-emerald-100 px-2.5 py-0.5 rounded-md">
                        {c.forum}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          c.riskLevel === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : c.riskLevel === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.riskLevel} Risk
                      </span>
                      <span className="text-[10px] font-bold bg-[#F5A623]/20 text-[#1A1A1A] px-2.5 py-0.5 rounded-full">
                        {c.status}
                      </span>
                    </div>

                    <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">{c.caseTitle}</h3>

                    <div className="text-xs text-[#5A6275] flex flex-wrap gap-x-4 gap-y-1">
                      <span>Client: <strong className="text-[#1A1A1A]">{c.clientName}</strong> (NTN: {c.clientNtn})</span>
                      <span>Lead Counsel: <strong className="text-[#0F6B4C]">{c.assignedCounsel}</strong></span>
                      <span>Disputed Demand: <strong className="text-red-700">Rs. {(c.demandAmountPkr / 100000).toFixed(1)} Lakh</strong></span>
                    </div>

                    <p className="text-xs text-gray-700 bg-[#FAFAF7] p-3 rounded-2xl border border-gray-100">
                      {c.summary}
                    </p>

                    {c.nextHearingDate && (
                      <div className="text-xs text-[#0F6B4C] font-semibold flex items-center gap-2 pt-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#F5A623]" />
                        <span>Next Hearing: <strong className="text-[#1A1A1A]">{c.nextHearingDate}</strong> — {c.nextHearingPurpose || 'Proceedings'}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 gap-3">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Open Case File</span>
                      <ChevronRight className="w-4 h-4 text-[#F5A623]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: HEARING CALENDAR (INTERACTIVE GRID) --- */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">Tax Hearing Calendar</h1>
                <p className="text-xs text-[#5A6275]">Click on any date to filter hearings or click a hearing to open case details.</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedCalendarDate && (
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-2 rounded-2xl text-xs"
                  >
                    Show All Dates
                  </button>
                )}
                <button
                  onClick={() => setShowAddHearingModal(true)}
                  className="bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Court Hearing</span>
                </button>
              </div>
            </div>

            {/* Interactive Month Grid */}
            <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">
                    {calendarCurrentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} Cause List Grid
                  </h3>
                  <div className="flex items-center gap-1 bg-[#FAFAF7] border border-gray-200 rounded-xl p-1 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarCurrentDate(
                          new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() - 1, 1)
                        )
                      }
                      className="px-2 py-1 font-extrabold text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                      title="Previous Month"
                    >
                      &larr; Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarCurrentDate(new Date())}
                      className="px-2.5 py-1 font-bold text-[#0F6B4C] hover:bg-emerald-50 rounded-lg transition-all text-[11px]"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarCurrentDate(
                          new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, 1)
                        )
                      }
                      className="px-2 py-1 font-extrabold text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                      title="Next Month"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#0F6B4C]">
                  {selectedCalendarDate ? `Selected: ${selectedCalendarDate}` : 'Showing All Dates'}
                </span>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#5A6275] border-b pb-2">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((cd) => {
                  const isSelected = selectedCalendarDate === cd.dateStr;
                  const hasHearings = cd.dayHearings.length > 0;

                  return (
                    <button
                      key={cd.dateStr}
                      onClick={() => setSelectedCalendarDate(cd.dateStr)}
                      className={`p-2 min-h-[70px] rounded-2xl border transition-all flex flex-col justify-between text-left ${
                        isSelected
                          ? 'bg-[#0A4B35] text-white border-[#0A4B35] shadow-md'
                          : hasHearings
                          ? 'bg-[#0F6B4C]/10 border-[#0F6B4C]/30 text-[#1A1A1A] hover:bg-[#0F6B4C]/20'
                          : 'bg-[#FAFAF7] border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-extrabold text-xs flex justify-between w-full">
                        <span>{cd.dayNum}</span>
                        {hasHearings && (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#F5A623]' : 'bg-[#0F6B4C]'}`} />
                        )}
                      </div>

                      {hasHearings && (
                        <div className="mt-1">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-[#F5A623] text-[#1A1A1A]' : 'bg-[#0F6B4C] text-white'
                            }`}
                          >
                            {cd.dayHearings.length} Hearing{cd.dayHearings.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hearings List for Selected Date or All */}
            <div className="space-y-4">
              <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">
                {selectedCalendarDate ? `Hearings Scheduled for ${selectedCalendarDate}` : 'All Scheduled Hearings'}
              </h3>

              {calendarHearings.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-[#0F6B4C]/15 text-center text-xs text-gray-500">
                  No hearings listed for this date.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calendarHearings.map((h) => {
                    const selCase = cases.find((c) => c.id === h.caseId);
                    return (
                      <div
                        key={h.id}
                        className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-3 hover:border-[#0F6B4C] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-[#0F6B4C] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                            {h.forum}
                          </span>
                          <span className="text-xs font-extrabold text-[#1A1A1A] bg-[#F5A623] px-2 py-0.5 rounded-md">
                            {h.date} @ {h.time}
                          </span>
                        </div>

                        <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">{h.caseTitle}</h3>

                        <div className="text-xs text-[#5A6275]">
                          Client: <span className="font-bold text-[#1A1A1A]">{h.clientName}</span> • Bench: {h.bench}
                        </div>

                        <div className="text-xs font-bold text-[#0F6B4C]">Lead Counsel: {h.counselAssigned}</div>

                        <div className="text-xs text-gray-700 bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-100">
                          Purpose: {h.purpose}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <button
                            onClick={() => {
                              if (selCase) setSelectedCase(selCase);
                            }}
                            className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <span>Open Case Details</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#F5A623]" />
                          </button>

                          <button
                            onClick={() => {
                              const url = buildGoogleCalendarUrl({
                                title: `Tax Hearing: ${h.caseTitle}`,
                                details: `Client: ${h.clientName}\nCounsel: ${h.counselAssigned}\nBench: ${h.bench}`,
                                location: h.forum,
                                startDate: h.date,
                                startTime: '10:00'
                              });
                              window.open(url, '_blank');
                            }}
                            className="bg-amber-100 hover:bg-amber-200 text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <CalendarIcon className="w-3.5 h-3.5 text-[#0F6B4C]" />
                            <span>Add Google Calendar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 6: DOCUMENT VAULT --- */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">Secure Document Storage</h1>
                <p className="text-xs text-[#5A6275]">Categorized repository of stay orders, wakalatnamas, FBR replies, & tax return filings.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewDocData((prev) => ({
                    ...prev,
                    caseId: prev.caseId || cases[0]?.id || '',
                    clientId: prev.clientId || cases[0]?.clientId || clients[0]?.id || ''
                  }));
                  setShowAddDocModal(true);
                }}
                className="bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            </div>

            {/* Document Vault Search & Filter Bar */}
            <div className="bg-white p-5 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#5A6275] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={docSearchTerm}
                    onChange={(e) => setDocSearchTerm(e.target.value)}
                    placeholder="Search documents by Title, CNO #, Section Code, Category, Uploader, File Size, Date, Client, or Case Ref..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF7] rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F6B4C] font-medium"
                  />
                  {docSearchTerm && (
                    <button
                      onClick={() => setDocSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#FAFAF7] px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                    <Filter className="w-3.5 h-3.5 text-[#0F6B4C]" />
                    <span className="font-bold text-[#5A6275]">Category:</span>
                    <select
                      value={docCategoryFilter}
                      onChange={(e) => setDocCategoryFilter(e.target.value)}
                      className="bg-transparent font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Categories ({documents.length})</option>
                      {docCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {docUploaders.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#FAFAF7] px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                      <span className="font-bold text-[#5A6275]">Uploader:</span>
                      <select
                        value={docUploaderFilter}
                        onChange={(e) => setDocUploaderFilter(e.target.value)}
                        className="bg-transparent font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
                      >
                        <option value="All">All Uploaders</option>
                        {docUploaders.map((up) => (
                          <option key={up} value={up}>
                            {up}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(docSearchTerm || docCategoryFilter !== 'All' || docUploaderFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setDocSearchTerm('');
                        setDocCategoryFilter('All');
                        setDocUploaderFilter('All');
                      }}
                      className="bg-red-50 text-red-700 hover:bg-red-100 font-bold px-3 py-2 rounded-2xl text-xs transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#5A6275] font-semibold flex items-center justify-between px-1">
                <span>Showing {filteredDocuments.length} of {documents.length} archived legal documents</span>
              </div>
            </div>

            {/* Document Grid */}
            {filteredDocuments.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-[#0F6B4C]/15 text-center space-y-2">
                <FolderOpen className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-heading font-extrabold text-base text-[#1A1A1A]">No Matching Documents Found</h4>
                <p className="text-xs text-[#5A6275]">Try adjusting your search query or selected category filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDocuments.map((doc) => {
                  const linkedCase = cases.find((c) => c.id === doc.caseId);
                  return (
                    <div key={doc.id} className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm flex items-start justify-between gap-4 hover:border-[#0F6B4C] transition-all">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold bg-[#0F6B4C]/10 text-[#0F6B4C] px-2.5 py-0.5 rounded-md">
                            {doc.category}
                          </span>
                          {doc.isClientVisible ? (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                              Client Visible
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md">
                              Internal
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-extrabold text-sm text-[#1A1A1A] mt-1">{doc.title}</h3>

                        {/* Direct Case File Link */}
                        {linkedCase ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCase(linkedCase)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#0F6B4C] bg-[#0A4B35]/10 hover:bg-[#0A4B35]/20 px-2.5 py-1 rounded-xl transition-all"
                            title="Open Case File Detail Page"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-[#F5A623]" />
                            <span>Case: [{linkedCase.caseRef}] {linkedCase.clientName}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic block">Unassigned Case</span>
                        )}

                        <div className="text-[11px] text-[#5A6275] pt-1">
                          Uploaded by: <span className="font-bold">{doc.uploadedBy}</span> on {doc.uploadedAt}
                        </div>
                        <div className="text-[11px] font-mono text-[#0F6B4C]">Size: {doc.fileSize}</div>
                      </div>

                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Simulated PDF Download: Downloading "${doc.title}"...`);
                        }}
                        className="bg-[#0A4B35] text-white p-3 rounded-2xl hover:bg-[#0F6B4C] transition-colors shrink-0"
                        title="Download File"
                      >
                        <Download className="w-4 h-4 text-[#F5A623]" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 7: TASKS & INTERNAL NOTES --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">Internal Tasks & Privileged Notes</h1>
                <p className="text-xs text-[#5A6275]">Legal team task assignments and confidential attorney notes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks Column */}
              <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Associate Tasks ({filteredTasks.length})</h3>
                </div>

                {/* Task Search & Filter Bar */}
                <div className="space-y-2.5 bg-[#FAFAF7] p-3.5 rounded-2xl border border-gray-200">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#5A6275] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={taskSearchTerm}
                      onChange={(e) => setTaskSearchTerm(e.target.value)}
                      placeholder="Search tasks by title, associate, CNO #, Section Code, Case Ref, or NTN..."
                      className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F6B4C]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-gray-200">
                      <span className="font-bold text-[#5A6275] text-[10px]">Status:</span>
                      <select
                        value={taskStatusFilter}
                        onChange={(e) => setTaskStatusFilter(e.target.value)}
                        className="bg-transparent font-bold text-[#1A1A1A] focus:outline-none text-xs cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending Only</option>
                        <option value="Completed">Completed Only</option>
                      </select>
                    </div>

                    {(taskSearchTerm || taskStatusFilter !== 'All') && (
                      <button
                        onClick={() => {
                          setTaskSearchTerm('');
                          setTaskStatusFilter('All');
                          setTaskAssigneeFilter('All');
                        }}
                        className="text-[10px] font-bold text-red-600 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Items */}
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 bg-[#FAFAF7] rounded-2xl border border-dashed border-gray-200">
                    No associate tasks match the search or filter criteria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleTask(t.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          t.isCompleted
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-[#FAFAF7] border-gray-200 hover:border-[#0F6B4C]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={t.isCompleted}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0F6B4C]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-[#1A1A1A]">{t.title}</span>
                            <span className="text-[10px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                              Due: {t.dueDate}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5A6275]">
                            Assigned to: <span className="font-bold text-[#0F6B4C]">{t.assignedTo}</span>
                          </div>
                          {t.notes && <div className="text-[11px] text-gray-600 mt-1 italic">{t.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privileged Notes Column */}
              <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Privileged Attorney Notes ({filteredNotes.length})</h3>
                </div>

                {/* Notes Search Bar */}
                <div className="relative bg-[#FAFAF7] p-2 rounded-2xl border border-gray-200">
                  <Search className="w-3.5 h-3.5 text-[#5A6275] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={noteSearchTerm}
                    onChange={(e) => setNoteSearchTerm(e.target.value)}
                    placeholder="Search notes content, author, CNO #, Section Code, or Case Ref..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F6B4C]"
                  />
                  {noteSearchTerm && (
                    <button
                      onClick={() => setNoteSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {filteredNotes.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 bg-[#FAFAF7] rounded-2xl border border-dashed border-gray-200">
                    No privileged notes match your search.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotes.map((n) => (
                      <div key={n.id} className="p-4 rounded-2xl bg-[#0A4B35]/5 border border-[#0F6B4C]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold bg-[#0A4B35] text-white px-2 py-0.5 rounded-md">
                            {n.author}
                          </span>
                          <span className="text-xs text-[#5A6275]">{n.date}</span>
                        </div>
                        <p className="text-xs text-[#1A1A1A] italic">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 8: BILLING & INVOICES --- */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">Billing & Fee Management</h1>
                <p className="text-xs text-[#5A6275]">Retainer contracts, High Court appearance fees, & fee payment statuses.</p>
              </div>
              <button
                onClick={() => setShowAddInvoiceModal(true)}
                className="bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Fee Invoice</span>
              </button>
            </div>

            {/* Billing Search & Filter Bar */}
            <div className="bg-white p-5 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#5A6275] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={billingSearchTerm}
                    onChange={(e) => setBillingSearchTerm(e.target.value)}
                    placeholder="Search invoices by invoice #, service, client, NTN, CNO #, Section Code, or case ref..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF7] rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F6B4C]"
                  />
                  {billingSearchTerm && (
                    <button
                      onClick={() => setBillingSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#FAFAF7] px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                    <Filter className="w-3.5 h-3.5 text-[#0F6B4C]" />
                    <span className="font-bold text-[#5A6275]">Status:</span>
                    <select
                      value={billingStatusFilter}
                      onChange={(e) => setBillingStatusFilter(e.target.value)}
                      className="bg-transparent font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses ({invoices.length})</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending / Unpaid</option>
                      <option value="Partially Paid">Partially Paid</option>
                    </select>
                  </div>

                  {billingClients.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#FAFAF7] px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                      <span className="font-bold text-[#5A6275]">Client:</span>
                      <select
                        value={billingClientFilter}
                        onChange={(e) => setBillingClientFilter(e.target.value)}
                        className="bg-transparent font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
                      >
                        <option value="All">All Clients</option>
                        {billingClients.map((cli) => (
                          <option key={cli} value={cli}>
                            {cli}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(billingSearchTerm || billingStatusFilter !== 'All' || billingClientFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setBillingSearchTerm('');
                        setBillingStatusFilter('All');
                        setBillingClientFilter('All');
                      }}
                      className="bg-red-50 text-red-700 hover:bg-red-100 font-bold px-3 py-2 rounded-2xl text-xs transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#5A6275] font-semibold flex items-center justify-between px-1">
                <span>Showing {filteredInvoices.length} of {invoices.length} fee invoices</span>
                <span>
                  Total Filtered Amount: <strong className="text-[#0F6B4C]">Rs. {filteredInvoices.reduce((acc, i) => acc + i.totalAmountPkr, 0).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Invoices List */}
            {filteredInvoices.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-[#0F6B4C]/15 text-center space-y-2">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-heading font-extrabold text-base text-[#1A1A1A]">No Matching Invoices Found</h4>
                <p className="text-xs text-[#5A6275]">Try adjusting your search criteria or status filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((inv) => {
                  const linkedCase = cases.find((c) => c.id === inv.caseId);
                  return (
                    <div key={inv.id} className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#0F6B4C] transition-all">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0F6B4C] bg-[#0F6B4C]/10 px-2 py-0.5 rounded">{inv.invoiceNumber}</span>
                          <span className="text-xs text-[#5A6275]">Issued: {inv.issueDate}</span>
                        </div>
                        <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">{inv.serviceDescription}</h3>
                        
                        {/* Direct Linked Case File button */}
                        {linkedCase ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCase(linkedCase)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#0F6B4C] bg-[#0A4B35]/10 hover:bg-[#0A4B35]/20 px-2.5 py-1 rounded-xl transition-all"
                            title="Open Case File Detail Page"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-[#F5A623]" />
                            <span>Case: [{linkedCase.caseRef}] {linkedCase.clientName}</span>
                          </button>
                        ) : (
                          <div className="text-xs text-[#5A6275]">
                            Client: <span className="font-bold text-[#1A1A1A]">{inv.clientName}</span> (NTN: {inv.clientNtn})
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 shrink-0">
                      <div>
                        <div className="text-[10px] text-[#5A6275]">Total Invoice Fee</div>
                        <div className="font-extrabold text-[#0F6B4C] text-base">
                          Rs. {inv.totalAmountPkr.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span
                          className={`text-center text-[10px] font-extrabold px-3 py-1 rounded-full ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'Partially Paid'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {inv.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForPdf(inv)}
                            className="bg-[#0A4B35] text-white text-xs font-bold px-3 py-1 rounded-xl hover:bg-[#0F6B4C] flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-[#F5A623]" /> PDF
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceForPdf(inv)}
                            className="bg-[#25D366] text-white text-xs font-bold px-2.5 py-1 rounded-xl hover:bg-emerald-600 flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> WhatsApp
                          </button>
                        </div>

                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => markInvoicePaid(inv.id, 'Bank Transfer')}
                            className="bg-[#FAFAF7] text-gray-700 text-[11px] font-bold px-3 py-1 rounded-xl hover:bg-gray-200 border border-gray-300"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* --- TAB 9: NOTIFICATIONS DISPATCHER --- */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-[#1A1A1A]">WhatsApp & Email Dispatcher</h1>
                <p className="text-xs text-[#5A6275]">Send real-time hearing reminders and FBR notice response alerts to clients.</p>
              </div>
              <button
                onClick={() => setShowSendNotifModal(true)}
                className="bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send WhatsApp Alert</span>
              </button>
            </div>

            {/* Notifications Search & Filter Bar */}
            <div className="bg-white p-5 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#5A6275] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={notifSearchTerm}
                    onChange={(e) => setNotifSearchTerm(e.target.value)}
                    placeholder="Search alert logs by client, phone, email, CNO #, Section Code, or case ref..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF7] rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F6B4C]"
                  />
                  {notifSearchTerm && (
                    <button
                      onClick={() => setNotifSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#FAFAF7] px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                    <Filter className="w-3.5 h-3.5 text-[#0F6B4C]" />
                    <span className="font-bold text-[#5A6275]">Channel:</span>
                    <select
                      value={notifTypeFilter}
                      onChange={(e) => setNotifTypeFilter(e.target.value)}
                      className="bg-transparent font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Channels ({notifications.length})</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FAFAF7] px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                    <span className="font-bold text-[#5A6275]">Delivery:</span>
                    <select
                      value={notifStatusFilter}
                      onChange={(e) => setNotifStatusFilter(e.target.value)}
                      className="bg-transparent font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Sent">Sent / Delivered</option>
                      <option value="Failed">Failed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {(notifSearchTerm || notifTypeFilter !== 'All' || notifStatusFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setNotifSearchTerm('');
                        setNotifTypeFilter('All');
                        setNotifStatusFilter('All');
                      }}
                      className="bg-red-50 text-red-700 hover:bg-red-100 font-bold px-3 py-2 rounded-2xl text-xs transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#5A6275] font-semibold flex items-center justify-between px-1">
                <span>Showing {filteredNotifications.length} of {notifications.length} client communication logs</span>
              </div>
            </div>

            {/* Notifications Log */}
            <div className="bg-white p-6 rounded-3xl border border-[#0F6B4C]/15 shadow-sm space-y-4">
              <h3 className="font-heading font-extrabold text-base text-[#1A1A1A]">Sent Notifications Log</h3>
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 bg-[#FAFAF7] rounded-2xl border border-dashed border-gray-200">
                  No communication logs match your search or filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => (
                    <div key={notif.id} className="p-4 rounded-2xl bg-[#FAFAF7] border border-gray-200 flex items-start justify-between gap-3 hover:border-[#0F6B4C] transition-all">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              notif.type === 'WhatsApp'
                                ? 'bg-[#25D366]'
                                : notif.type === 'Email'
                                ? 'bg-blue-600'
                                : 'bg-purple-600'
                            }`}
                          >
                            {notif.type}
                          </span>
                          <span className="font-bold text-xs text-[#1A1A1A]">{notif.title}</span>
                          <span className="text-[10px] text-[#5A6275]">({notif.sentAt})</span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium italic mb-1">&quot;{notif.message}&quot;</p>
                        <div className="text-[11px] text-[#5A6275]">
                          Recipient: <span className="font-bold text-[#1A1A1A]">{notif.clientName}</span> ({notif.recipientPhoneOrEmail})
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
                        {notif.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* MODAL 1: COMPREHENSIVE NEW TAX CASE MODAL */}
      {showAddCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-[#0F6B4C]/20 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block">Litigation Intake</span>
                <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Register New Tax Litigation File</h3>
              </div>
              <button onClick={() => setShowAddCaseModal(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Court Writ Petition against Section 7E Deemed Tax Demand"
                  value={newCaseData.title}
                  onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Select Client</label>
                  <select
                    value={newCaseData.clientId}
                    onChange={(e) => setNewCaseData({ ...newCaseData, clientId: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (NTN: {c.ntn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">FBR CNO / Order No.</label>
                  <input
                    type="text"
                    placeholder="e.g. CNO-100008927"
                    value={newCaseData.cnoNumber}
                    onChange={(e) => setNewCaseData({ ...newCaseData, cnoNumber: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Legal Forum</label>
                  <select
                    value={newCaseData.forum}
                    onChange={(e) => setNewCaseData({ ...newCaseData, forum: e.target.value as LegalForum })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  >
                    <option value="Islamabad High Court (IHC)">Islamabad High Court (IHC)</option>
                    <option value="Appellate Tribunal Inland Revenue (ATIR)">Appellate Tribunal (ATIR)</option>
                    <option value="Commissioner Inland Revenue (Appeals)">CIR (Appeals)</option>
                    <option value="FBR RTO Islamabad">FBR RTO Islamabad</option>
                    <option value="FBR LTO Rawalpindi">FBR LTO Rawalpindi</option>
                    <option value="Supreme Court of Pakistan">Supreme Court of Pakistan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Section Code</label>
                  <input
                    type="text"
                    value={newCaseData.sectionCode}
                    onChange={(e) => setNewCaseData({ ...newCaseData, sectionCode: e.target.value })}
                    placeholder="122(5A), 177, 7E, 214C"
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tax Year</label>
                  <input
                    type="text"
                    value={newCaseData.taxYear}
                    onChange={(e) => setNewCaseData({ ...newCaseData, taxYear: e.target.value })}
                    placeholder="Tax Year 2025"
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lead Counsel</label>
                  <select
                    value={newCaseData.assignedCounsel}
                    onChange={(e) => setNewCaseData({ ...newCaseData, assignedCounsel: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold"
                  >
                    {ADVOCATES.map((adv) => (
                      <option key={adv} value={adv}>
                        {adv}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Risk Level</label>
                  <select
                    value={newCaseData.riskLevel}
                    onChange={(e) => setNewCaseData({ ...newCaseData, riskLevel: e.target.value as RiskLevel })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Disputed Demand (PKR)</label>
                  <input
                    type="number"
                    value={newCaseData.demandAmountPkr}
                    onChange={(e) => setNewCaseData({ ...newCaseData, demandAmountPkr: Number(e.target.value) })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {/* Hearing Schedule Block */}
              <div className="bg-[#0A4B35]/5 p-3 rounded-2xl border border-[#0F6B4C]/20 space-y-2">
                <span className="font-extrabold text-[#0F6B4C] block">Initial Cause List Schedule</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Initial Hearing Date</label>
                    <input
                      type="date"
                      value={newCaseData.nextHearingDate}
                      onChange={(e) => setNewCaseData({ ...newCaseData, nextHearingDate: e.target.value })}
                      className="w-full bg-white p-2 rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Hearing Purpose</label>
                    <input
                      type="text"
                      placeholder="e.g. Confirmation of Stay Order"
                      value={newCaseData.nextHearingPurpose}
                      onChange={(e) => setNewCaseData({ ...newCaseData, nextHearingPurpose: e.target.value })}
                      className="w-full bg-white p-2 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Case Summary & Legal Grounds</label>
                <textarea
                  rows={2}
                  placeholder="Summary of show cause notice, statutory grounds of writ or appeal..."
                  value={newCaseData.summary}
                  onChange={(e) => setNewCaseData({ ...newCaseData, summary: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Initial Privileged Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Check HC stay precedents for Sec 7E"
                    value={newCaseData.initialNote}
                    onChange={(e) => setNewCaseData({ ...newCaseData, initialNote: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Initial Associate Task (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Draft Writ Petition draft by Friday"
                    value={newCaseData.initialTask}
                    onChange={(e) => setNewCaseData({ ...newCaseData, initialTask: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {/* Client Portal Credentials Block */}
              <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#1A1A1A] text-xs block">🔐 Assign Client Portal Login (Optional)</span>
                  <span className="text-[10px] text-gray-600 font-bold">Allows client to sign-in to track this case</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Client Sign-In Email</label>
                    <input
                      type="email"
                      placeholder="client@company.pk"
                      value={newCaseData.clientLoginEmail || ''}
                      onChange={(e) => setNewCaseData({ ...newCaseData, clientLoginEmail: e.target.value })}
                      className="w-full bg-white p-2 rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Client Password</label>
                    <input
                      type="text"
                      placeholder="Password123!"
                      value={newCaseData.clientLoginPassword || ''}
                      onChange={(e) => setNewCaseData({ ...newCaseData, clientLoginPassword: e.target.value })}
                      className="w-full bg-white p-2 rounded-xl border border-gray-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">

                <button
                  type="button"
                  onClick={() => setShowAddCaseModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F5A623] text-[#1A1A1A] font-extrabold shadow-sm"
                >
                  Register Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#0F6B4C]/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Register Client Profile</h3>
              <button onClick={() => setShowAddClientModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Client Full Name / Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Farooq Traders"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">NTN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="3948572-9"
                    value={newClientData.ntn}
                    onChange={(e) => setNewClientData({ ...newClientData, ntn: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">CNIC Number</label>
                  <input
                    type="text"
                    required
                    placeholder="35202-1234567-1"
                    value={newClientData.cnic}
                    onChange={(e) => setNewClientData({ ...newClientData, cnic: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="client@company.pk"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Set Client Portal Password</label>
                <input
                  type="text"
                  required
                  placeholder="Password123!"
                  value={newClientData.clientLoginPassword || 'Password123!'}
                  onChange={(e) => setNewClientData({ ...newClientData, clientLoginPassword: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-mono"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Client can use this email & password to sign in to their Client Portal</span>
              </div>

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A4B35] text-white font-extrabold shadow-sm"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FBR NOTICES & PENDING REPLIES REGISTRY */}
      {showNoticesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] p-6 border border-[#0F6B4C]/20 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full uppercase">
                      Statutory Compliance Desk
                    </span>
                    <span className="text-[10px] font-extrabold bg-[#0A4B35] text-white px-2.5 py-0.5 rounded-full">
                      {notices.filter((n) => n.status === 'Pending Reply').length} Due Replies
                    </span>
                  </div>
                  <h2 className="text-xl font-heading font-extrabold text-[#1A1A1A]">
                    FBR Statutory Notices & Pending Replies
                  </h2>
                  <p className="text-xs text-gray-600">
                    Track show cause notices, audit calls, section 122/177 assessments, and manage due reply deadlines.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowAddNoticeModal(true);
                    }}
                    className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>Log Notice</span>
                  </button>
                  <button
                    onClick={() => setShowNoticesModal(false)}
                    className="text-gray-400 hover:text-black font-extrabold p-1 text-base ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAFAF7] p-3 rounded-2xl border border-gray-200">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search CNO, Section, Client, Officer..."
                    value={noticeSearchTerm}
                    onChange={(e) => setNoticeSearchTerm(e.target.value)}
                    className="w-full bg-white pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs font-bold w-full sm:w-auto overflow-x-auto">
                  {[
                    { id: 'all', label: `All (${notices.length})` },
                    { id: 'Pending Reply', label: `Due Replies (${notices.filter((n) => n.status === 'Pending Reply').length})` },
                    { id: 'Challenged in Appeal', label: `In Appeal (${notices.filter((n) => n.status === 'Challenged in Appeal').length})` },
                    { id: 'Order Passed', label: `Orders (${notices.filter((n) => n.status === 'Order Passed').length})` }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setNoticeStatusFilter(f.id as any)}
                      className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        noticeStatusFilter === f.id
                          ? 'bg-[#0A4B35] text-white font-extrabold shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List of Notices */}
              <div className="space-y-3">
                {notices
                  .filter((n) => {
                    const matchesFilter =
                      noticeStatusFilter === 'all' || n.status === noticeStatusFilter;
                    const q = noticeSearchTerm.toLowerCase().trim();
                    const matchesSearch =
                      !q ||
                      n.noticeTitle.toLowerCase().includes(q) ||
                      n.cnoNumber.toLowerCase().includes(q) ||
                      n.sectionCode.toLowerCase().includes(q) ||
                      n.clientName.toLowerCase().includes(q) ||
                      n.issuingOfficer.toLowerCase().includes(q);
                    return matchesFilter && matchesSearch;
                  })
                  .map((notice) => {
                    const linkedCase = cases.find((c) => c.id === notice.caseId);
                    const isPending = notice.status === 'Pending Reply';
                    return (
                      <div
                        key={notice.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPending
                            ? 'bg-red-50/50 border-red-200 hover:border-red-400'
                            : 'bg-white border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-extrabold text-[11px] bg-[#0A4B35] text-white px-2 py-0.5 rounded">
                                {notice.cnoNumber}
                              </span>
                              <span className="font-extrabold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                u/s {notice.sectionCode}
                              </span>
                              <span className="text-xs font-extrabold text-gray-900">
                                {notice.clientName}
                              </span>
                            </div>
                            <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A] mt-1">
                              {notice.noticeTitle}
                            </h4>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <select
                              value={notice.status}
                              onChange={(e) => updateNoticeStatus(notice.id, e.target.value as any)}
                              className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border cursor-pointer ${
                                isPending
                                  ? 'bg-red-600 text-white border-red-700'
                                  : notice.status === 'Challenged in Appeal'
                                  ? 'bg-amber-500 text-black border-amber-600'
                                  : 'bg-emerald-700 text-white border-emerald-800'
                              }`}
                            >
                              <option value="Pending Reply">⚠️ Pending Reply</option>
                              <option value="Challenged in Appeal">⚖️ Challenged in Appeal</option>
                              <option value="Order Passed">✅ Order Passed / Replied</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 my-2 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-gray-100">
                          {notice.summary}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600 border-t pt-2 border-gray-100">
                          <div>
                            <span className="text-gray-400 block">Issuing Authority:</span>
                            <span className="font-semibold text-gray-800 truncate block">{notice.issuingOfficer}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Tax Year:</span>
                            <span className="font-extrabold text-[#0F6B4C]">{notice.taxYear}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Disputed Demand:</span>
                            <span className="font-extrabold text-red-700">
                              Rs. {(notice.disputedAmountPkr / 100000).toFixed(1)} Lakh
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Reply Due Date:</span>
                            <span className={`font-extrabold ${isPending ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                              {notice.dueDate} {isPending && '(Urgent)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                          {linkedCase ? (
                            <button
                              onClick={() => {
                                setShowNoticesModal(false);
                                setSelectedCase(linkedCase);
                              }}
                              className="text-xs font-bold text-[#0F6B4C] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-[#F5A623]" />
                              <span>Open Linked Case [{linkedCase.caseRef}]</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No direct case file linked</span>
                          )}

                          <button
                            onClick={() => {
                              if (linkedCase) {
                                setShowNoticesModal(false);
                                setSelectedCase(linkedCase);
                                setCaseDetailTab('whatsapp');
                                setWaTemplateType('notice');
                              } else {
                                alert(`Notice Ref: ${notice.cnoNumber}\nClient: ${notice.clientName}\nDue Date: ${notice.dueDate}`);
                              }
                            }}
                            className="bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp Client Alert</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setShowNoticesModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold px-5 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG FBR NOTICE */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#0F6B4C]/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block">FBR Compliance</span>
                <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Log FBR Notice</h3>
              </div>
              <button onClick={() => setShowAddNoticeModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Select Case File <span className="text-red-500">*</span> (Syncs to Case Detail Page)
                </label>
                <SearchableCaseSelect
                  required
                  cases={cases}
                  value={newNoticeData.caseId}
                  onChange={(caseId) => {
                    const sel = cases.find((c) => c.id === caseId);
                    setNewNoticeData({
                      ...newNoticeData,
                      caseId: caseId,
                      clientId: sel ? sel.clientId : newNoticeData.clientId
                    });
                  }}
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notice CNO Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNO-2026-991823"
                  value={newNoticeData.cnoNumber}
                  onChange={(e) => setNewNoticeData({ ...newNoticeData, cnoNumber: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Section Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 122(5A), 177, 7E, 214C"
                  value={newNoticeData.sectionCode}
                  onChange={(e) => setNewNoticeData({ ...newNoticeData, sectionCode: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notice Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Notice for Audit of Income Tax Return"
                  value={newNoticeData.noticeTitle}
                  onChange={(e) => setNewNoticeData({ ...newNoticeData, noticeTitle: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newNoticeData.dueDate}
                    onChange={(e) => setNewNoticeData({ ...newNoticeData, dueDate: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Demand Amount (PKR)</label>
                  <input
                    type="number"
                    value={newNoticeData.disputedAmountPkr}
                    onChange={(e) => setNewNoticeData({ ...newNoticeData, disputedAmountPkr: Number(e.target.value) })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A4B35] text-white font-extrabold shadow-sm"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: UPLOAD DOCUMENT */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#0F6B4C]/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block">Document Vault Intake</span>
                <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Upload Document to Case Vault</h3>
              </div>
              <button onClick={() => setShowAddDocModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Select Case File <span className="text-red-500">*</span> (Syncs to Case Detail Page)
                </label>
                <SearchableCaseSelect
                  required
                  cases={cases}
                  value={newDocData.caseId || cases[0]?.id || ''}
                  onChange={(caseId) => {
                    const sel = cases.find((c) => c.id === caseId);
                    setNewDocData({
                      ...newDocData,
                      caseId: caseId,
                      clientId: sel ? sel.clientId : (clients[0]?.id || '')
                    });
                  }}
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified High Court Stay Order Copy"
                  value={newDocData.title}
                  onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={newDocData.category}
                    onChange={(e) => setNewDocData({ ...newDocData, category: e.target.value as any })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold"
                  >
                    <option value="Court Order / Stay Order">Court Order / Stay Order</option>
                    <option value="Wakalatnama / Power of Attorney">Wakalatnama / Power of Attorney</option>
                    <option value="FBR Notice">FBR Notice</option>
                    <option value="Reply & Rebuttal">Reply & Rebuttal</option>
                    <option value="Tax Return & Wealth Statement">Tax Return & Wealth Statement</option>
                    <option value="Bank Statement">Bank Statement</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Uploaded By / Author</label>
                  <select
                    value={newDocData.uploadedBy}
                    onChange={(e) => setNewDocData({ ...newDocData, uploadedBy: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold"
                  >
                    {ADVOCATES.map((adv) => (
                      <option key={adv} value={adv}>
                        {adv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-2 border-dashed border-[#0F6B4C]/30 bg-[#FAFAF7] p-4 rounded-2xl text-center">
                <FolderOpen className="w-6 h-6 text-[#0F6B4C] mx-auto mb-1" />
                <div className="font-bold text-[#1A1A1A]">Drag & drop legal PDF / DOC file</div>
                <div className="text-[10px] text-[#5A6275] mt-0.5">High Court Stay Order, FBR Reply (Max 25MB)</div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="clientVisibleCheck"
                  checked={newDocData.isClientVisible}
                  onChange={(e) => setNewDocData({ ...newDocData, isClientVisible: e.target.checked })}
                  className="rounded border-gray-300 text-[#0F6B4C]"
                />
                <label htmlFor="clientVisibleCheck" className="text-xs text-gray-700 font-medium cursor-pointer">
                  Make document visible to client in Client Portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A4B35] text-white font-extrabold shadow-sm"
                >
                  Save & Sync to Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ISSUE INVOICE */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#0F6B4C]/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block">Billing & Receivables</span>
                <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Issue Legal Fee Invoice</h3>
              </div>
              <button onClick={() => setShowAddInvoiceModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Select Case File <span className="text-red-500">*</span> (Syncs to Case Detail Page)
                </label>
                <SearchableCaseSelect
                  required
                  cases={cases}
                  value={newInvoiceData.caseId}
                  onChange={(caseId) => {
                    const sel = cases.find((c) => c.id === caseId);
                    setNewInvoiceData({
                      ...newInvoiceData,
                      caseId: caseId,
                      clientId: sel ? sel.clientId : newInvoiceData.clientId
                    });
                  }}
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Service Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Court Stay Order Retainer & Representation"
                  value={newInvoiceData.serviceDescription}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, serviceDescription: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Retainer Fee (PKR)</label>
                  <input
                    type="number"
                    value={newInvoiceData.retainerFeePkr}
                    onChange={(e) =>
                      setNewInvoiceData({
                        ...newInvoiceData,
                        retainerFeePkr: Number(e.target.value),
                        totalAmountPkr: Number(e.target.value) + newInvoiceData.hearingFeePkr + newInvoiceData.salesTaxPkr
                      })
                    }
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Hearing Fee (PKR)</label>
                  <input
                    type="number"
                    value={newInvoiceData.hearingFeePkr}
                    onChange={(e) =>
                      setNewInvoiceData({
                        ...newInvoiceData,
                        hearingFeePkr: Number(e.target.value),
                        totalAmountPkr: newInvoiceData.retainerFeePkr + Number(e.target.value) + newInvoiceData.salesTaxPkr
                      })
                    }
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAFAF7] rounded-xl border border-gray-200 flex justify-between font-extrabold text-[#0F6B4C]">
                <span>Total Fee Payable:</span>
                <span>Rs. {newInvoiceData.totalAmountPkr.toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F5A623] text-[#1A1A1A] font-extrabold shadow-sm"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: SCHEDULE HEARING */}
      {showAddHearingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#0F6B4C]/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Schedule Court Hearing</h3>
              <button onClick={() => setShowAddHearingModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateHearing} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Case File</label>
                <SearchableCaseSelect
                  cases={cases}
                  value={newHearingData.caseId}
                  onChange={(caseId) => setNewHearingData({ ...newHearingData, caseId: caseId })}
                />
              </div>

              {/* Previous Hearing Record */}
              <div className="bg-[#FAFAF7] p-3 rounded-2xl border border-emerald-800/10 space-y-2">
                <div className="text-[11px] font-extrabold text-[#0F6B4C]">Previous Hearing Record (What Happened Last Time)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block text-[10px] mb-0.5">Last Hearing Date</label>
                    <input
                      type="date"
                      value={newHearingData.previousHearingDate || ''}
                      onChange={(e) => setNewHearingData({ ...newHearingData, previousHearingDate: e.target.value })}
                      className="w-full bg-white p-2 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block text-[10px] mb-0.5">Forum</label>
                    <input
                      type="text"
                      value={newHearingData.forum}
                      onChange={(e) => setNewHearingData({ ...newHearingData, forum: e.target.value as LegalForum })}
                      className="w-full bg-white p-2 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-[10px] mb-0.5">Previous Hearing Outcome / Court Order</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Interim stay granted against FBR demand notice. Adjourned for arguments."
                    value={newHearingData.previousHearingOutcome || ''}
                    onChange={(e) => setNewHearingData({ ...newHearingData, previousHearingOutcome: e.target.value })}
                    className="w-full bg-white p-2 rounded-xl border border-gray-200 text-xs resize-none"
                  />
                </div>
              </div>

              {/* New Hearing Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">New Hearing Date</label>
                  <input
                    type="date"
                    required
                    value={newHearingData.date}
                    onChange={(e) => setNewHearingData({ ...newHearingData, date: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={newHearingData.time}
                    onChange={(e) => setNewHearingData({ ...newHearingData, time: e.target.value })}
                    className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Next Hearing Purpose / Stage</label>
                <input
                  type="text"
                  required
                  placeholder="Arguments on Confirmation of Interim Stay Order"
                  value={newHearingData.purpose}
                  onChange={(e) => setNewHearingData({ ...newHearingData, purpose: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddHearingModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A4B35] text-white font-extrabold shadow-sm"
                >
                  Save Cause List Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: WHATSAPP NOTIFICATION DISPATCHER */}
      {showSendNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#0F6B4C]/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-extrabold text-[#1A1A1A]">Send Client WhatsApp Alert</h3>
              <button onClick={() => setShowSendNotifModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleSendNotif} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Channel</label>
                <select
                  value={notifData.type}
                  onChange={(e) => setNotifData({ ...notifData, type: e.target.value as any })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-bold text-[#0F6B4C]"
                >
                  <option value="WhatsApp">WhatsApp Instant Message</option>
                  <option value="Email">Official Client Email</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Recipient Phone / Email</label>
                <input
                  type="text"
                  required
                  value={notifData.recipientPhoneOrEmail}
                  onChange={(e) => setNotifData({ ...notifData, recipientPhoneOrEmail: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={notifData.title}
                  onChange={(e) => setNotifData({ ...notifData, title: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={notifData.message}
                  onChange={(e) => setNotifData({ ...notifData, message: e.target.value })}
                  className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSendNotifModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25D366] text-white font-extrabold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Alert Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COMPREHENSIVE CASE DETAIL DRAWER (WITH CLICK OUTSIDE TO CLOSE) --- */}
      {selectedCase && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-all"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCase(null);
            }
          }}
        >
          <div className="bg-white w-full max-w-3xl h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-extrabold bg-[#0A4B35] text-white px-2.5 py-0.5 rounded-md">
                      {selectedCase.caseRef}
                    </span>
                    <span className="text-xs font-bold text-[#0F6B4C] bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      Tax Year {selectedCase.taxYear}
                    </span>
                  </div>
                  <h2 className="text-xl font-heading font-extrabold text-[#1A1A1A]">
                    {selectedCase.caseTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartEditCase}
                    className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    title="Edit Case File Details"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>{isEditingCase ? 'Cancel Edit' : 'Edit Case'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCase(null);
                      setIsEditingCase(false);
                    }}
                    className="text-gray-400 hover:text-black font-extrabold p-1 text-base ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Navigation Tabs inside Case Detail Drawer */}
              <div className="flex items-center gap-1 border-b pb-2 text-xs font-bold overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview & Details' },
                  { id: 'notices', label: `FBR Notices (${notices.filter((n) => n.caseId === selectedCase.id).length})` },
                  { id: 'whatsapp', label: 'WhatsApp Alerts 💬' },
                  { id: 'tasks', label: `Tasks (${tasks.filter((t) => t.caseId === selectedCase.id).length})` },
                  { id: 'notes', label: `Notes (${notes.filter((n) => n.caseId === selectedCase.id).length})` },
                  { id: 'documents', label: `Docs (${documents.filter((d) => d.caseId === selectedCase.id).length})` },
                  { id: 'billing', label: `Invoices (${invoices.filter((i) => i.caseId === selectedCase.id).length})` }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCaseDetailTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      caseDetailTab === t.id
                        ? 'bg-[#0A4B35] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW & CASE DETAILS */}
              {caseDetailTab === 'overview' && (
                <div className="space-y-6">
                  {/* EDIT CASE DETAILS FORM */}
                  {isEditingCase ? (
                    <form onSubmit={handleSaveCaseEdit} className="bg-white p-5 rounded-2xl border-2 border-[#0F6B4C]/30 shadow-md space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b pb-3 font-heading font-extrabold text-sm text-[#0A4B35]">
                        <span>Edit Case File Parameters</span>
                        <span className="text-xs text-gray-500 font-mono">Case ID: {selectedCase.id}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-gray-700 block mb-1">Case Title</label>
                          <input
                            type="text"
                            required
                            value={editCaseForm.caseTitle || ''}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, caseTitle: e.target.value })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-extrabold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">CNO / Case Reference No.</label>
                          <input
                            type="text"
                            required
                            value={editCaseForm.caseRef || ''}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, caseRef: e.target.value })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Tax Year</label>
                          <input
                            type="text"
                            required
                            value={editCaseForm.taxYear || ''}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, taxYear: e.target.value })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Legal Forum</label>
                          <select
                            value={editCaseForm.forum}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, forum: e.target.value as LegalForum })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-bold"
                          >
                            <option value="Islamabad High Court (IHC)">Islamabad High Court (IHC)</option>
                            <option value="Appellate Tribunal Inland Revenue (ATIR)">Appellate Tribunal (ATIR)</option>
                            <option value="Commissioner Inland Revenue (Appeals)">CIR (Appeals)</option>
                            <option value="FBR RTO Islamabad">FBR RTO Islamabad</option>
                            <option value="FBR LTO Rawalpindi">FBR LTO Rawalpindi</option>
                            <option value="Supreme Court of Pakistan">Supreme Court of Pakistan</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Case Status</label>
                          <select
                            value={editCaseForm.status}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, status: e.target.value as CaseStatus })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-bold text-[#0F6B4C]"
                          >
                            <option value="Notice Received">Notice Received</option>
                            <option value="Response Drafted">Response Drafted</option>
                            <option value="Under Audit">Under Audit</option>
                            <option value="CIR Appeal Pending">CIR Appeal Pending</option>
                            <option value="ATIR Tribunal Pending">ATIR Tribunal Pending</option>
                            <option value="High Court Writ Active">High Court Writ Active</option>
                            <option value="Stay Granted">Stay Granted</option>
                            <option value="Favorable Order Passed">Favorable Order Passed</option>
                            <option value="Closed & Settled">Closed & Settled</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Risk Level</label>
                          <select
                            value={editCaseForm.riskLevel}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, riskLevel: e.target.value as RiskLevel })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-bold"
                          >
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Demand Amount (PKR)</label>
                          <input
                            type="number"
                            value={editCaseForm.demandAmountPkr || 0}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, demandAmountPkr: Number(e.target.value) })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-mono font-bold text-red-700"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Tax Saved Amount (PKR)</label>
                          <input
                            type="number"
                            value={editCaseForm.savedAmountPkr || 0}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, savedAmountPkr: Number(e.target.value) })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-mono font-bold text-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Assigned Lead Counsel</label>
                          <input
                            type="text"
                            value={editCaseForm.assignedCounsel || ''}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, assignedCounsel: e.target.value })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 font-bold text-[#0F6B4C]"
                          />
                        </div>

                        {/* Client Portal Credentials Edit */}
                        <div className="sm:col-span-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 space-y-2">
                          <div className="text-[11px] font-extrabold text-[#0A4B35] flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-[#0F6B4C]" />
                            <span>Client Portal Sign-In Credentials (Email & Password)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-gray-700 block text-[10px] mb-0.5">Client Portal Email</label>
                              <input
                                type="email"
                                required
                                value={editCaseForm.clientLoginEmail || ''}
                                onChange={(e) => setEditCaseForm({ ...editCaseForm, clientLoginEmail: e.target.value })}
                                placeholder="client@company.com"
                                className="w-full bg-white p-2 rounded-xl border border-gray-300 font-medium text-xs text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-gray-700 block text-[10px] mb-0.5">Client Portal Password</label>
                              <input
                                type="text"
                                required
                                value={editCaseForm.clientLoginPassword || ''}
                                onChange={(e) => setEditCaseForm({ ...editCaseForm, clientLoginPassword: e.target.value })}
                                placeholder="e.g. ClientPass123"
                                className="w-full bg-white p-2 rounded-xl border border-gray-300 font-mono text-xs text-gray-900"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-gray-700 block mb-1">Case Synopsis / Legal Summary</label>
                          <textarea
                            rows={3}
                            value={editCaseForm.summary || ''}
                            onChange={(e) => setEditCaseForm({ ...editCaseForm, summary: e.target.value })}
                            className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-300 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                          type="button"
                          onClick={() => setIsEditingCase(false)}
                          className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-[#0A4B35] text-white font-extrabold shadow-sm hover:bg-[#0F6B4C]"
                        >
                          Save Case Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Case Info Grid */
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 text-xs">
                      <div>
                        <span className="text-[#5A6275] block">Client Name:</span>
                        <span className="font-bold text-[#1A1A1A]">{selectedCase.clientName}</span>
                      </div>
                      <div>
                        <span className="text-[#5A6275] block">NTN Number:</span>
                        <span className="font-mono font-bold text-[#0F6B4C]">{selectedCase.clientNtn}</span>
                      </div>
                      <div>
                        <span className="text-[#5A6275] block">Lead Advocate:</span>
                        <span className="font-bold text-[#0F6B4C]">{selectedCase.assignedCounsel}</span>
                      </div>
                      <div>
                        <span className="text-[#5A6275] block">Tax Demand at Stake:</span>
                        <span className="font-extrabold text-red-700">
                          Rs. {(selectedCase.demandAmountPkr / 100000).toFixed(1)} Lakh
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hearing Management Card */}
                  <div className="bg-[#0A4B35]/5 border border-[#0F6B4C]/20 p-5 rounded-2xl text-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#0F6B4C]/20 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-[#0F6B4C] block">
                          Listed Hearing & Cause List
                        </span>
                        <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                          {selectedCase.nextHearingDate
                            ? `Next Hearing: ${selectedCase.nextHearingDate}`
                            : 'No Upcoming Hearing Scheduled'}
                        </h4>
                      </div>

                      <button
                        onClick={handleStartEditHearing}
                        className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#F5A623]" />
                        <span>{isEditingCaseHearing ? 'Cancel Edit' : 'Add / Update Hearing'}</span>
                      </button>
                    </div>

                    {/* Inline Hearing Edit / Add Form */}
                    {isEditingCaseHearing ? (
                      <form onSubmit={handleSaveCaseHearing} className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                        <div className="font-extrabold text-[#0A4B35] text-xs">
                          Update Hearing Date & Cause List Details
                        </div>

                        {/* Previous Hearing Record */}
                        <div className="bg-[#FAFAF7] p-3 rounded-2xl border border-emerald-800/10 space-y-2">
                          <div className="text-[11px] font-extrabold text-[#0F6B4C]">Previous Hearing Record (What Happened Last Time)</div>
                          <div>
                            <label className="font-bold text-gray-700 block text-[10px] mb-0.5">Previous Hearing Date</label>
                            <input
                              type="date"
                              value={caseHearingForm.previousHearingDate}
                              onChange={(e) => setCaseHearingForm({ ...caseHearingForm, previousHearingDate: e.target.value })}
                              className="w-full bg-white p-2 rounded-xl border border-gray-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-700 block text-[10px] mb-0.5">Previous Hearing Outcome / Order Sheet Summary</label>
                            <textarea
                              rows={2}
                              placeholder="e.g. High Court issued interim stay order against FBR demand notice. Adjourned for arguments."
                              value={caseHearingForm.previousHearingOutcome}
                              onChange={(e) => setCaseHearingForm({ ...caseHearingForm, previousHearingOutcome: e.target.value })}
                              className="w-full bg-white p-2 rounded-xl border border-gray-200 text-xs resize-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">New Hearing Date</label>
                            <input
                              type="date"
                              required
                              value={caseHearingForm.date}
                              onChange={(e) => setCaseHearingForm({ ...caseHearingForm, date: e.target.value })}
                              className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200 font-bold"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Time</label>
                            <input
                              type="text"
                              required
                              value={caseHearingForm.time}
                              onChange={(e) => setCaseHearingForm({ ...caseHearingForm, time: e.target.value })}
                              className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Legal Forum</label>
                            <select
                              value={caseHearingForm.forum}
                              onChange={(e) =>
                                setCaseHearingForm({ ...caseHearingForm, forum: e.target.value as LegalForum })
                              }
                              className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200 font-bold"
                            >
                              <option value="Islamabad High Court (IHC)">Islamabad High Court (IHC)</option>
                              <option value="Appellate Tribunal Inland Revenue (ATIR)">Appellate Tribunal (ATIR)</option>
                              <option value="Commissioner Inland Revenue (Appeals)">CIR (Appeals)</option>
                              <option value="FBR RTO Islamabad">FBR RTO Islamabad</option>
                              <option value="FBR LTO Rawalpindi">FBR LTO Rawalpindi</option>
                              <option value="Supreme Court of Pakistan">Supreme Court of Pakistan</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Bench / Court Room</label>
                            <input
                              type="text"
                              placeholder="e.g. Division Bench - IHC"
                              value={caseHearingForm.bench}
                              onChange={(e) => setCaseHearingForm({ ...caseHearingForm, bench: e.target.value })}
                              className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Hearing Purpose / Stage</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Arguments on Interim Stay Extension"
                            value={caseHearingForm.purpose}
                            onChange={(e) => setCaseHearingForm({ ...caseHearingForm, purpose: e.target.value })}
                            className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Assigned Counsel</label>
                          <input
                            type="text"
                            value={caseHearingForm.counselAssigned}
                            onChange={(e) => setCaseHearingForm({ ...caseHearingForm, counselAssigned: e.target.value })}
                            className="w-full bg-[#FAFAF7] p-2 rounded-xl border border-gray-200 font-bold text-[#0F6B4C]"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <button
                            type="button"
                            onClick={() => setIsEditingCaseHearing(false)}
                            className="px-3 py-1.5 rounded-xl border text-gray-600 font-bold text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-[#0A4B35] text-white font-extrabold text-xs shadow-sm"
                          >
                            Save Hearing Schedule
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-gray-200">
                          <div>
                            <span className="text-[10px] text-gray-500 block">Hearing Date:</span>
                            <span className="font-extrabold text-[#1A1A1A]">
                              {selectedCase.nextHearingDate || 'Pending Date'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block">Forum / Court:</span>
                            <span className="font-bold text-[#0F6B4C]">{selectedCase.forum}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block">Lead Advocate:</span>
                            <span className="font-bold text-[#1A1A1A]">{selectedCase.assignedCounsel}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-500 block">Purpose / Stage:</span>
                          <p className="font-semibold text-gray-800">
                            {selectedCase.nextHearingPurpose || 'Cause list hearing appearance'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSendWhatsAppCaseReminder}
                              className="bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send WhatsApp Alert</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleAddCaseToGoogleCalendar}
                              className="bg-amber-100 hover:bg-amber-200 text-[#1A1A1A] font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-amber-300"
                            >
                              <CalendarIcon className="w-3.5 h-3.5 text-[#0F6B4C]" />
                              <span>Google Calendar</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleStartEditHearing}
                            className="text-[#0F6B4C] hover:underline font-extrabold text-xs flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Reschedule / Update
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chronological Hearing Timeline */}
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-[#1A1A1A] mb-3">Chronological Cause List History</h3>
                    <div className="space-y-3 relative pl-4 border-l-2 border-[#0F6B4C]/20">
                      {selectedCase.timeline.map((item) => (
                        <div key={item.id} className="relative bg-[#FAFAF7] p-3 rounded-2xl border border-gray-200 text-xs">
                          <div className="absolute -left-[23px] top-3 w-3 h-3 rounded-full bg-[#0F6B4C]" />
                          <div className="flex justify-between font-bold text-[#1A1A1A] mb-1">
                            <span>{item.title}</span>
                            <span className="text-[#0F6B4C]">{item.date}</span>
                          </div>
                          <p className="text-[#5A6275] mb-1">{item.description}</p>
                          {item.outcome && (
                            <div className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 p-1.5 rounded-lg">
                              Outcome: {item.outcome}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CLIENT ACCESS CREDENTIALS SUMMARY CARD */}
                  {(() => {
                    const caseCred = clientCredentials.find(
                      (c) => c.clientId === selectedCase.clientId || (c.email && c.email.toLowerCase() === selectedCase.clientLoginEmail?.toLowerCase())
                    );
                    const displayEmail = caseCred?.email || selectedCase.clientLoginEmail || 'Not assigned yet';
                    const displayPass = caseCred?.password || selectedCase.clientLoginPassword || 'Not assigned yet';

                    return (
                      <div className="bg-[#0A4B35]/5 border border-[#0F6B4C]/20 p-4 rounded-2xl space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-[#0F6B4C]/20 pb-2">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#0F6B4C]" />
                            <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                              Client Portal Access Credentials
                            </h4>
                          </div>
                          <button
                            onClick={handleStartEditCase}
                            className="text-[#0F6B4C] hover:underline font-extrabold text-xs flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Login Details
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-gray-200">
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold block">Client Portal Email:</span>
                            <span className="font-mono font-bold text-[#1A1A1A] select-all">{displayEmail}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold block">Client Password:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#0F6B4C] select-all">
                                {showClientPassword ? displayPass : '••••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowClientPassword(!showClientPassword)}
                                className="text-[10px] text-gray-500 hover:text-black font-extrabold underline cursor-pointer"
                              >
                                {showClientPassword ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* OVERVIEW SECTION: TASKS */}
                  {(() => {
                    const caseTasks = tasks.filter((t) => t.caseId === selectedCase.id);
                    return (
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-[#0F6B4C]" />
                            <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                              Case Tasks & Action Items ({caseTasks.length})
                            </h4>
                          </div>
                          <button
                            onClick={() => setCaseDetailTab('tasks')}
                            className="text-[#0F6B4C] hover:underline font-bold text-xs"
                          >
                            Manage Tasks &rarr;
                          </button>
                        </div>

                        {caseTasks.length === 0 ? (
                          <div className="p-3 text-center bg-[#FAFAF7] rounded-xl text-gray-500 text-[11px]">
                            No tasks created for this case yet. Click &quot;Manage Tasks&quot; to assign internal action items.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {caseTasks.map((task) => (
                              <div
                                key={task.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                                  task.isCompleted ? 'bg-emerald-50/40 border-emerald-200 opacity-75' : 'bg-[#FAFAF7] border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={task.isCompleted}
                                    onChange={() => toggleTask(task.id)}
                                    className="rounded border-gray-300 text-[#0A4B35] focus:ring-[#0F6B4C] w-4 h-4 cursor-pointer"
                                  />
                                  <span className={`font-semibold truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-[#1A1A1A]'}`}>
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded">
                                    {task.assignedTo}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                      task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* OVERVIEW SECTION: NOTES */}
                  {(() => {
                    const caseNotes = notes.filter((n) => n.caseId === selectedCase.id);
                    return (
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#0F6B4C]" />
                            <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                              Privileged Internal Legal Notes ({caseNotes.length})
                            </h4>
                          </div>
                          <button
                            onClick={() => setCaseDetailTab('notes')}
                            className="text-[#0F6B4C] hover:underline font-bold text-xs"
                          >
                            View All Notes &rarr;
                          </button>
                        </div>

                        {caseNotes.length === 0 ? (
                          <div className="p-3 text-center bg-[#FAFAF7] rounded-xl text-gray-500 text-[11px]">
                            No internal notes added for this case yet. Click &quot;View All Notes&quot; to record confidential attorney observations.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {caseNotes.map((note) => (
                              <div key={note.id} className="p-3 rounded-xl bg-[#FAFAF7] border border-gray-200 space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                                  <span className="text-[#0F6B4C] font-extrabold">{note.author}</span>
                                  <span>{note.date}</span>
                                </div>
                                <p className="text-[#1A1A1A] text-xs whitespace-pre-line">{note.text || note.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* OVERVIEW SECTION: DOCUMENTS */}
                  {(() => {
                    const caseDocs = documents.filter((d) => d.caseId === selectedCase.id);
                    return (
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#0F6B4C]" />
                            <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                              Case Vault Documents ({caseDocs.length})
                            </h4>
                          </div>
                          <button
                            onClick={() => setCaseDetailTab('documents')}
                            className="text-[#0F6B4C] hover:underline font-bold text-xs"
                          >
                            Manage Vault &rarr;
                          </button>
                        </div>

                        {caseDocs.length === 0 ? (
                          <div className="p-3 text-center bg-[#FAFAF7] rounded-xl text-gray-500 text-[11px]">
                            No vault documents uploaded for this case file yet. Click &quot;Manage Vault&quot; to upload legal pleadings and petitions.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {caseDocs.map((docItem) => (
                              <div key={docItem.id} className="p-3 rounded-xl bg-[#FAFAF7] border border-gray-200 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <h5 className="font-bold text-[#1A1A1A] truncate text-xs">{docItem.title}</h5>
                                  <span className="text-[10px] text-gray-500 block">
                                    {docItem.category} • {docItem.fileSize}
                                  </span>
                                </div>
                                <a
                                  href={docItem.downloadUrl || '#'}
                                  download
                                  className="bg-emerald-100 hover:bg-emerald-200 text-[#0F6B4C] px-2.5 py-1 rounded-lg font-bold text-[10px] shrink-0"
                                >
                                  Download
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* OVERVIEW SECTION: INVOICES */}
                  {(() => {
                    const caseInvoices = invoices.filter((i) => i.caseId === selectedCase.id);
                    return (
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#0F6B4C]" />
                            <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                              Fee Invoices & Billing ({caseInvoices.length})
                            </h4>
                          </div>
                          <button
                            onClick={() => setCaseDetailTab('billing')}
                            className="text-[#0F6B4C] hover:underline font-bold text-xs"
                          >
                            Billing Ledger &rarr;
                          </button>
                        </div>

                        {caseInvoices.length === 0 ? (
                          <div className="p-3 text-center bg-[#FAFAF7] rounded-xl text-gray-500 text-[11px]">
                            No invoices issued for this case file yet. Click &quot;Billing Ledger&quot; to generate an advocate fee bill.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {caseInvoices.map((inv) => (
                              <div key={inv.id} className="p-3 rounded-xl bg-[#FAFAF7] border border-gray-200 flex items-center justify-between gap-2">
                                <div>
                                  <div className="font-mono font-bold text-[#0A4B35] text-xs">{inv.invoiceNumber}</div>
                                  <div className="text-[11px] text-gray-600">{inv.serviceDescription}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-extrabold text-[#1A1A1A] text-xs">Rs. {inv.totalAmountPkr.toLocaleString()}</div>
                                  <span
                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB: LINKED FBR NOTICES */}
              {caseDetailTab === 'notices' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200">
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                        Linked FBR Statutory Notices ({notices.filter((n) => n.caseId === selectedCase.id).length})
                      </h4>
                      <p className="text-xs text-gray-500">Track show cause notices, audit demands, and reply deadlines for this case file.</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewNoticeData({ ...newNoticeData, caseId: selectedCase.id, clientId: selectedCase.clientId });
                        setShowAddNoticeModal(true);
                      }}
                      className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F5A623]" />
                      <span>Log FBR Notice</span>
                    </button>
                  </div>

                  {notices.filter((n) => n.caseId === selectedCase.id).length === 0 ? (
                    <div className="p-8 text-center bg-[#FAFAF7] rounded-2xl border border-dashed border-gray-300 text-gray-500 text-xs space-y-2">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="font-bold">No FBR notices logged for this case file yet.</p>
                      <p className="text-gray-400">Click &quot;Log FBR Notice&quot; above to record a new show cause or assessment notice.</p>
                    </div>
                  ) : (
                    notices
                      .filter((n) => n.caseId === selectedCase.id)
                      .map((notice) => {
                        const isPending = notice.status === 'Pending Reply';
                        return (
                          <div
                            key={notice.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isPending ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-extrabold text-[10px] bg-[#0A4B35] text-white px-2 py-0.5 rounded">
                                  {notice.cnoNumber}
                                </span>
                                <span className="font-extrabold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                  u/s {notice.sectionCode}
                                </span>
                              </div>

                              <select
                                value={notice.status}
                                onChange={(e) => updateNoticeStatus(notice.id, e.target.value as any)}
                                className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border cursor-pointer ${
                                  isPending
                                    ? 'bg-red-600 text-white border-red-700'
                                    : notice.status === 'Challenged in Appeal'
                                    ? 'bg-amber-500 text-black border-amber-600'
                                    : 'bg-emerald-700 text-white border-emerald-800'
                                }`}
                              >
                                <option value="Pending Reply">⚠️ Pending Reply</option>
                                <option value="Challenged in Appeal">⚖️ Challenged in Appeal</option>
                                <option value="Order Passed">✅ Order Passed / Replied</option>
                              </select>
                            </div>

                            <h5 className="font-heading font-extrabold text-sm text-[#1A1A1A] mt-2">{notice.noticeTitle}</h5>
                            <p className="text-xs text-gray-600 my-1.5 leading-relaxed bg-white/80 p-2 rounded-xl border border-gray-100">
                              {notice.summary}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 pt-2 border-t border-gray-100">
                              <div>
                                <span className="text-gray-400 block">Issuing Officer:</span>
                                <span className="font-semibold text-gray-800 truncate block">{notice.issuingOfficer}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Disputed Demand:</span>
                                <span className="font-extrabold text-red-700">Rs. {(notice.disputedAmountPkr / 100000).toFixed(1)} Lakh</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Reply Due Date:</span>
                                <span className={`font-extrabold ${isPending ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                                  {notice.dueDate} {isPending && '(Urgent)'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              )}

              {/* TAB 2: WHATSAPP REMINDERS & TEMPLATES */}
              {caseDetailTab === 'whatsapp' && (
                <div className="space-y-5 text-xs">
                  {/* Recipient Info Card */}
                  <div className="bg-[#0A4B35]/5 border border-[#0F6B4C]/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-[#0F6B4C]">Client Recipient Contact</div>
                      <div className="font-extrabold text-sm text-[#1A1A1A] mt-0.5">{selectedCase.clientName}</div>
                      <div className="text-gray-600 font-mono text-xs">
                        Phone: {clients.find((c) => c.id === selectedCase.clientId)?.phone || '+92 300 1234567'} • NTN: {selectedCase.clientNtn}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Direct WhatsApp Connected
                      </span>
                    </div>
                  </div>

                  {/* Template Selector Cards */}
                  <div>
                    <label className="font-extrabold text-gray-800 block mb-2">Select Legal Dispatch Template:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'hearing', label: '1. Cause List & Hearing', icon: CalendarIcon },
                        { id: 'notice', label: '2. FBR Notice & Due Date', icon: FileText },
                        { id: 'invoice', label: '3. Fee Invoice & Bank', icon: Printer },
                        { id: 'stay', label: '4. High Court Stay Relief', icon: CheckCircle2 },
                        { id: 'custom', label: '5. Custom Message', icon: Edit3 }
                      ].map((tmpl) => {
                        const IconComp = tmpl.icon;
                        const isActive = waTemplateType === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => setWaTemplateType(tmpl.id as any)}
                            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                              isActive
                                ? 'bg-[#0A4B35] text-white border-[#0A4B35] shadow-md'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#0F6B4C]'
                            }`}
                          >
                            <IconComp className={`w-4 h-4 mb-2 ${isActive ? 'text-[#F5A623]' : 'text-[#0F6B4C]'}`} />
                            <span className="font-extrabold text-[11px] leading-tight">{tmpl.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Message Field */}
                  {waTemplateType === 'custom' && (
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Custom Message Body:</label>
                      <textarea
                        rows={4}
                        value={waCustomMessage}
                        onChange={(e) => setWaCustomMessage(e.target.value)}
                        placeholder="Type custom legal update or instructions for the client..."
                        className="w-full bg-[#FAFAF7] p-3 rounded-2xl border border-gray-300 font-sans text-xs focus:ring-2 focus:ring-[#0F6B4C]"
                      />
                    </div>
                  )}

                  {/* WhatsApp Message Preview Box */}
                  <div className="bg-[#E5DDD5] p-4 rounded-3xl border border-[#0F6B4C]/20 shadow-inner">
                    <div className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>WhatsApp Format Preview</span>
                      <span className="text-emerald-700 font-mono">Encrypted Client Dispatch</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm text-xs text-gray-800 space-y-2 whitespace-pre-line font-sans border-l-4 border-[#25D366]">
                      {getFormattedWhatsAppText()}
                    </div>
                  </div>

                  {/* Dispatch Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendWhatsAppDirect}
                        className="bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send via WhatsApp Web</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyWhatsAppText}
                        className="bg-white hover:bg-gray-100 text-[#1A1A1A] font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-gray-300 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#0F6B4C]" />
                        <span>{waCopiedNotice ? 'Copied!' : 'Copy Message'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogWhatsAppNotification}
                      className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
                      <span>Log to Dispatch History</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: TASKS & ACTION ITEMS */}
              {caseDetailTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Inline Add Task Form */}
                  <form onSubmit={handleAddInlineTask} className="bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 text-xs space-y-3">
                    <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">Add Task for this Case</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Task title (e.g. Draft Writ petition grounds)..."
                        value={inlineTask.title}
                        onChange={(e) => setInlineTask({ ...inlineTask, title: e.target.value })}
                        className="bg-white p-2 rounded-xl border border-gray-200 sm:col-span-2"
                      />
                      <input
                        type="date"
                        value={inlineTask.dueDate}
                        onChange={(e) => setInlineTask({ ...inlineTask, dueDate: e.target.value })}
                        className="bg-white p-2 rounded-xl border border-gray-200"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <select
                        value={inlineTask.assignedTo}
                        onChange={(e) => setInlineTask({ ...inlineTask, assignedTo: e.target.value })}
                        className="bg-white p-2 rounded-xl border border-gray-200 font-bold text-xs"
                      >
                        {ADVOCATES.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="bg-[#0A4B35] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#F5A623]" /> Add Case Task
                      </button>
                    </div>
                  </form>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {tasks.filter((t) => t.caseId === selectedCase.id).length === 0 ? (
                      <div className="text-center p-6 text-xs text-gray-500 bg-[#FAFAF7] rounded-2xl border">
                        No internal tasks added for this case yet.
                      </div>
                    ) : (
                      tasks
                        .filter((t) => t.caseId === selectedCase.id)
                        .map((t) => (
                          <div
                            key={t.id}
                            onClick={() => toggleTask(t.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              t.isCompleted ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:border-[#0F6B4C]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={t.isCompleted}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 text-[#0F6B4C] rounded border-gray-300"
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex justify-between font-bold text-[#1A1A1A]">
                                <span>{t.title}</span>
                                <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px]">Due: {t.dueDate}</span>
                              </div>
                              <div className="text-[#5A6275] text-[11px] mt-1">
                                Assigned: <span className="font-bold text-[#0F6B4C]">{t.assignedTo}</span>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PRIVILEGED NOTES */}
              {caseDetailTab === 'notes' && (
                <div className="space-y-6">
                  {/* Inline Add Note Form */}
                  <form onSubmit={handleAddInlineNote} className="bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 text-xs space-y-3">
                    <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">Add Confidential Attorney Note</h4>
                    <textarea
                      rows={2}
                      required
                      placeholder="Enter legal strategy notes or client meeting summary..."
                      value={inlineNote.text}
                      onChange={(e) => setInlineNote({ ...inlineNote, text: e.target.value })}
                      className="w-full bg-white p-2.5 rounded-xl border border-gray-200"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-[#0A4B35] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#F5A623]" /> Save Note
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {notes.filter((n) => n.caseId === selectedCase.id).length === 0 ? (
                      <div className="text-center p-6 text-xs text-gray-500 bg-[#FAFAF7] rounded-2xl border">
                        No attorney notes added for this case file yet.
                      </div>
                    ) : (
                      notes
                        .filter((n) => n.caseId === selectedCase.id)
                        .map((n) => (
                          <div key={n.id} className="p-4 rounded-2xl bg-[#0A4B35]/5 border border-[#0F6B4C]/20 text-xs space-y-1">
                            <div className="flex justify-between font-bold text-[#0F6B4C]">
                              <span>{n.author}</span>
                              <span className="text-[10px] text-gray-500">{n.date}</span>
                            </div>
                            <p className="text-gray-800 italic">{n.text}</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CASE DOCUMENTS */}
              {caseDetailTab === 'documents' && (
                <div className="space-y-6">
                  {/* Inline Document Upload Form */}
                  <form onSubmit={handleAddInlineDoc} className="bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 text-xs space-y-3">
                    <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">Upload Case Document directly</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Document title (e.g. High Court Writ Order Sheet)..."
                        value={inlineDoc.title}
                        onChange={(e) => setInlineDoc({ ...inlineDoc, title: e.target.value })}
                        className="bg-white p-2 rounded-xl border border-gray-200"
                      />
                      <select
                        value={inlineDoc.category}
                        onChange={(e) => setInlineDoc({ ...inlineDoc, category: e.target.value as any })}
                        className="bg-white p-2 rounded-xl border border-gray-200 font-bold"
                      >
                        <option value="Court Order / Stay Order">Court Order / Stay Order</option>
                        <option value="Wakalatnama / Power of Attorney">Wakalatnama / Power of Attorney</option>
                        <option value="FBR Notice">FBR Notice</option>
                        <option value="Reply & Rebuttal">Reply & Rebuttal</option>
                        <option value="Tax Return & Wealth Statement">Tax Return & Wealth Statement</option>
                        <option value="Bank Statement">Bank Statement</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-[#0A4B35] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#F5A623]" /> Upload to Case Vault
                      </button>
                    </div>
                  </form>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {documents.filter((d) => d.caseId === selectedCase.id).length === 0 ? (
                      <div className="text-center p-6 text-xs text-gray-500 bg-[#FAFAF7] rounded-2xl border">
                        No documents attached to this case file yet.
                      </div>
                    ) : (
                      documents
                        .filter((d) => d.caseId === selectedCase.id)
                        .map((d) => (
                          <div
                            key={d.id}
                            className="p-3.5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="text-[10px] font-extrabold bg-[#0F6B4C]/10 text-[#0F6B4C] px-2 py-0.5 rounded">
                                {d.category}
                              </span>
                              <div className="font-extrabold text-[#1A1A1A] mt-1">{d.title}</div>
                              <div className="text-[10px] text-gray-500">
                                Uploaded on {d.uploadedAt} • Size: {d.fileSize}
                              </div>
                            </div>

                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`Downloading ${d.title}...`);
                              }}
                              className="bg-[#0A4B35] text-white p-2.5 rounded-xl hover:bg-[#0F6B4C]"
                            >
                              <Download className="w-4 h-4 text-[#F5A623]" />
                            </a>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: BILLING & INVOICES */}
              {caseDetailTab === 'billing' && (
                <div className="space-y-6">
                  {/* Inline Invoice Generator Form */}
                  <form onSubmit={handleAddInlineInvoice} className="bg-[#FAFAF7] p-4 rounded-2xl border border-gray-200 text-xs space-y-3">
                    <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">Generate Legal Fee Invoice for this Case</h4>
                    <input
                      type="text"
                      required
                      placeholder="Service description (e.g. High Court Representation Fee)..."
                      value={inlineInvoice.serviceDescription}
                      onChange={(e) => setInlineInvoice({ ...inlineInvoice, serviceDescription: e.target.value })}
                      className="w-full bg-white p-2 rounded-xl border border-gray-200"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="font-bold text-gray-600 block mb-1">Retainer (PKR)</label>
                        <input
                          type="number"
                          value={inlineInvoice.retainerFeePkr}
                          onChange={(e) => setInlineInvoice({ ...inlineInvoice, retainerFeePkr: Number(e.target.value) })}
                          className="w-full bg-white p-2 rounded-xl border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-600 block mb-1">Hearing Fee (PKR)</label>
                        <input
                          type="number"
                          value={inlineInvoice.hearingFeePkr}
                          onChange={(e) => setInlineInvoice({ ...inlineInvoice, hearingFeePkr: Number(e.target.value) })}
                          className="w-full bg-white p-2 rounded-xl border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-600 block mb-1">Sales Tax (PKR)</label>
                        <input
                          type="number"
                          value={inlineInvoice.salesTaxPkr}
                          onChange={(e) => setInlineInvoice({ ...inlineInvoice, salesTaxPkr: Number(e.target.value) })}
                          className="w-full bg-white p-2 rounded-xl border border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="font-extrabold text-[#0F6B4C]">
                        Total: Rs. {(inlineInvoice.retainerFeePkr + inlineInvoice.hearingFeePkr + inlineInvoice.salesTaxPkr).toLocaleString()}
                      </div>

                      <button
                        type="submit"
                        className="bg-[#F5A623] text-[#1A1A1A] font-extrabold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Generate Invoice
                      </button>
                    </div>
                  </form>

                  {/* Invoices List for Case */}
                  <div className="space-y-3">
                    {invoices.filter((i) => i.caseId === selectedCase.id).length === 0 ? (
                      <div className="text-center p-6 text-xs text-gray-500 bg-[#FAFAF7] rounded-2xl border">
                        No invoices generated for this case file yet.
                      </div>
                    ) : (
                      invoices
                        .filter((i) => i.caseId === selectedCase.id)
                        .map((i) => (
                          <div
                            key={i.id}
                            className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-mono text-xs font-bold text-[#0F6B4C]">{i.invoiceNumber}</div>
                              <div className="font-extrabold text-[#1A1A1A] mt-0.5">{i.serviceDescription}</div>
                              <div className="text-[10px] text-gray-500">Issued: {i.issueDate} • Due: {i.dueDate}</div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                              <div className="flex items-center gap-2 justify-between sm:justify-end">
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                    i.status === 'Paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {i.status}
                                </span>
                                <div className="font-extrabold text-[#0F6B4C] text-sm">
                                  Rs. {i.totalAmountPkr.toLocaleString()}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedInvoiceForPdf(i)}
                                  className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                >
                                  <Printer className="w-3.5 h-3.5 text-[#F5A623]" />
                                  <span>View / Print PDF</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedInvoiceForPdf(i)}
                                  className="bg-[#25D366] hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="bg-[#0A4B35] text-white font-extrabold px-6 py-2.5 rounded-2xl text-xs"
              >
                Close Case File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Legal PDF Invoice Modal */}
      {selectedInvoiceForPdf && (
        <InvoicePdfModal
          invoice={selectedInvoiceForPdf}
          client={clients.find((c) => c.id === selectedInvoiceForPdf.clientId)}
          caseFile={cases.find((c) => c.id === selectedInvoiceForPdf.caseId)}
          onClose={() => setSelectedInvoiceForPdf(null)}
          onMarkPaid={markInvoicePaid}
        />
      )}
    </div>
  );
};
