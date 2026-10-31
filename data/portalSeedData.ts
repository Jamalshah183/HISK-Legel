import {
  Client,
  CaseFile,
  FBRNotice,
  DocumentItem,
  InternalTask,
  InternalNote,
  Invoice,
  NotificationLog,
  HearingEvent,
  PracticeArea,
  TeamMember,
  ReviewItem,
  LegalInsightItem,
  PartnerItem
} from '@/types/portal';
import { ATTORNEYS, TESTIMONIALS, BLOG_POSTS } from '@/data/lawFirmData';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-101',
    name: 'Al-Syed Logistics & Transport Pvt Ltd',
    businessName: 'Al-Syed Logistics',
    cnic: '35202-1928374-1',
    ntn: '3948572-9',
    category: 'Corporate',
    phone: '+92 300 8552011',
    email: 'finance@alsyedlogistics.com.pk',
    city: 'Islamabad',
    registeredAddress: 'Plot 42, I-9 Industrial Area, Islamabad',
    activeCasesCount: 2,
    totalTaxSaved: 'Rs. 3.80 Crore',
    status: 'Active',
    createdAt: '2025-01-15'
  },
  {
    id: 'cli-102',
    name: 'Tariq Tech Solutions & Software Ltd',
    businessName: 'Tariq Tech Solutions',
    cnic: '61101-8372645-3',
    ntn: '7483920-1',
    category: 'IT & Freelancer',
    phone: '+92 321 5543100',
    email: 'tax@tariqtech.io',
    city: 'Islamabad',
    registeredAddress: 'Suite 401, Evacuee Trust Complex, F-5/1, Islamabad',
    activeCasesCount: 1,
    totalTaxSaved: 'Rs. 1.25 Crore',
    status: 'Active',
    createdAt: '2025-03-10'
  },
  {
    id: 'cli-103',
    name: 'Apex Builders & Commercial Developers',
    businessName: 'Apex Builders',
    cnic: '37405-2234112-7',
    ntn: '2847593-4',
    category: 'Property Owner',
    phone: '+92 333 5129800',
    email: 'legal@apexbuilders.pk',
    city: 'Rawalpindi',
    registeredAddress: 'Plaza 18, Civic Centre, Phase 4, Bahria Town, Rawalpindi',
    activeCasesCount: 2,
    totalTaxSaved: 'Rs. 8.50 Crore',
    status: 'Active',
    createdAt: '2024-11-20'
  },
  {
    id: 'cli-104',
    name: 'Dr. Sarah Ahmed (Consolidated Medical)',
    businessName: 'Consolidated Medical Diagnostic',
    cnic: '35201-9988776-2',
    ntn: '5928374-6',
    category: 'High Net Worth Individual',
    phone: '+92 301 8443322',
    email: 'dr.sarah@clinic.pk',
    city: 'Islamabad',
    registeredAddress: 'Sector F-7/2, Margalla Road, Islamabad',
    activeCasesCount: 1,
    totalTaxSaved: 'Rs. 45 Lakh',
    status: 'Active',
    createdAt: '2025-06-05'
  }
];

export const INITIAL_CASES: CaseFile[] = [
  {
    id: 'case-2026-001',
    caseRef: 'IHC-WRIT-7E-2026/89',
    clientId: 'cli-103',
    clientName: 'Apex Builders & Commercial Developers',
    clientNtn: '2847593-4',
    caseTitle: 'High Court Writ Petition: Challenge Against Section 7E Deemed Property Tax Demand',
    assignedCounsel: 'Hafiz Irfan Shabber Kayani',
    assignedCounselTitle: 'Advocate High Court | CEO & Founder',
    forum: 'Islamabad High Court (IHC)',
    taxYear: 'Tax Year 2024 & 2025',
    status: 'Stay Granted',
    riskLevel: 'Critical',
    demandAmountPkr: 85000000,
    savedAmountPkr: 85000000,
    auditStage: 5,
    summary: 'Challenging unlawful Section 7E deemed property income assessment of Rs. 8.5 Crore before Division Bench IHC. High Court granted interim stay restraining FBR from coercive recovery.',
    nextHearingDate: '2026-08-12',
    nextHearingPurpose: 'Arguments on Confirmation of Interim Stay Order',
    createdAt: '2026-01-10',
    timeline: [
      {
        id: 'tl-101',
        date: '2026-01-12',
        title: 'FBR Section 7E Show Cause Received',
        forum: 'FBR RTO Islamabad',
        description: 'FBR issued notice demanding 5% deemed rental income tax on commercial plaza projects.',
        advocateName: 'Hafiz Irfan Shabber Kayani',
        outcome: 'Rebuttal filed contesting valuation & developer exemptions'
      },
      {
        id: 'tl-102',
        date: '2026-02-04',
        title: 'Adverse Assessment Order Passed',
        forum: 'FBR RTO Islamabad',
        description: 'DCIR rejected exemption claims and created demand of Rs. 8.5 Crore.',
        advocateName: 'Hafiz Irfan Shabber Kayani',
        outcome: 'Immediate Constitutional Writ Petition prepared for IHC'
      },
      {
        id: 'tl-103',
        date: '2026-02-18',
        title: 'IHC High Court Stay Granted',
        forum: 'Islamabad High Court (IHC)',
        description: 'Honourable Bench issued notices to Attorney General & FBR, granting stay against bank attachment.',
        advocateName: 'Hafiz Irfan Shabber Kayani',
        outcome: 'Interim Stay Order extended to next date'
      }
    ]
  },
  {
    id: 'case-2026-002',
    caseRef: 'ATIR-APP-122-2026/41',
    clientId: 'cli-101',
    clientName: 'Al-Syed Logistics & Transport Pvt Ltd',
    clientNtn: '3948572-9',
    caseTitle: 'Appellate Tribunal Appeal: Disallowance of Fuel & Fleet Operating Expenses u/s 122(5A)',
    assignedCounsel: 'Hafiz Irfan Shabber Kayani',
    assignedCounselTitle: 'Advocate High Court | CEO & Founder',
    forum: 'Appellate Tribunal Inland Revenue (ATIR)',
    taxYear: 'Tax Year 2023',
    status: 'ATIR Tribunal Pending',
    riskLevel: 'High',
    demandAmountPkr: 38000000,
    savedAmountPkr: 38000000,
    auditStage: 4,
    summary: 'Reassessment order passed by CIR disallowing Rs. 11 Crore fuel expenditure under Section 21(m). Appeal filed before ATIR Bench II requesting complete annulment.',
    nextHearingDate: '2026-08-04',
    nextHearingPurpose: 'Hearing on Stay Application & Main Appeal Grounds',
    createdAt: '2026-02-01',
    timeline: [
      {
        id: 'tl-201',
        date: '2026-02-10',
        title: 'CIR (Appeals) Decision Received',
        forum: 'Commissioner Inland Revenue (Appeals)',
        description: 'Partial relief granted, but major fuel disallowances maintained.',
        advocateName: 'Hafiz Irfan Shabber Kayani',
        outcome: 'Second Appeal drafted for ATIR'
      },
      {
        id: 'tl-202',
        date: '2026-03-01',
        title: 'ATIR Appeal Docketed & Stay Filed',
        forum: 'Appellate Tribunal Inland Revenue (ATIR)',
        description: 'Appeal registered as No. 41/2026 with urgent stay petition.',
        advocateName: 'Hafiz Irfan Shabber Kayani'
      }
    ]
  },
  {
    id: 'case-2026-003',
    caseRef: 'FBR-IT-154A-2026/14',
    clientId: 'cli-102',
    clientName: 'Tariq Tech Solutions & Software Ltd',
    clientNtn: '7483920-1',
    caseTitle: 'IT Export Tax Concession Audit u/s 154A & PSEB Exemption Clearance',
    assignedCounsel: 'Hafiz Irfan Shabber Kayani',
    assignedCounselTitle: 'Advocate High Court | CEO & Founder',
    forum: 'FBR LTO Rawalpindi',
    taxYear: 'Tax Year 2024',
    status: 'Response Drafted',
    riskLevel: 'Medium',
    demandAmountPkr: 12500000,
    savedAmountPkr: 12500000,
    auditStage: 2,
    summary: 'FBR audit notice seeking reclassification of IT export proceeds from 0.25% final tax regime into normal 29% corporate tax due to alleged PRC documentation delay.',
    nextHearingDate: '2026-07-30',
    nextHearingPurpose: 'Submission of Bank PRC & PSEB Verification Certificates',
    createdAt: '2026-03-15',
    timeline: [
      {
        id: 'tl-301',
        date: '2026-03-20',
        title: 'Section 177 Audit Notice Received',
        forum: 'FBR LTO Rawalpindi',
        description: 'Audit officer called for export realization certificates (PRCs) and software export register.',
        advocateName: 'Hafiz Irfan Shabber Kayani',
        outcome: 'Reconciled PRCs with State Bank forex proceeds'
      }
    ]
  },
  {
    id: 'case-2026-004',
    caseRef: 'ISB-CIVIL-111-2026/05',
    clientId: 'cli-104',
    clientName: 'Dr. Sarah Ahmed (Consolidated Medical)',
    clientNtn: '5928374-6',
    caseTitle: 'Section 111 Unexplained Wealth Reconciliation & High Court Revision',
    assignedCounsel: 'Hafiz Irfan Shabber Kayani',
    assignedCounselTitle: 'Advocate High Court | CEO & Founder',
    forum: 'FBR RTO Islamabad',
    taxYear: 'Tax Year 2022',
    status: 'Favorable Order Passed',
    riskLevel: 'Low',
    demandAmountPkr: 4500000,
    savedAmountPkr: 4500000,
    auditStage: 6,
    summary: 'Successfully defended client against unexplained wealth addition under Section 111. Proved foreign remittance banking trail and secured zero-penalty closure order.',
    nextHearingDate: undefined,
    nextHearingPurpose: undefined,
    createdAt: '2025-10-01',
    timeline: [
      {
        id: 'tl-401',
        date: '2025-11-15',
        title: 'Rebuttal & Remittance Trail Filed',
        forum: 'FBR RTO Islamabad',
        description: 'Submitted foreign remittance encashment certificates u/s 111(4).',
        advocateName: 'Hafiz Irfan Shabber Kayani'
      },
      {
        id: 'tl-402',
        date: '2026-01-10',
        title: 'Order Passed in Favor of Client',
        forum: 'FBR RTO Islamabad',
        description: 'FBR Deputy Commissioner dropped all proceedings and accepted wealth statement.',
        advocateName: 'Hafiz Irfan Shabber Kayani',
        outcome: 'Case Closed with Zero Liability'
      }
    ]
  }
];

export const INITIAL_NOTICES: FBRNotice[] = [
  {
    id: 'not-301',
    cnoNumber: 'CNO-2026-994812',
    caseId: 'case-2026-003',
    clientId: 'cli-102',
    clientName: 'Tariq Tech Solutions & Software Ltd',
    sectionCode: '154A / 177',
    noticeTitle: 'Notice for Audit of IT Export Remittances & Foreign Exchange PRCs',
    issuingOfficer: 'Additional Commissioner Inland Revenue, Audit Zone II, LTO Rawalpindi',
    taxYear: '2024',
    dateReceived: '2026-07-15',
    dueDate: '2026-07-30',
    disputedAmountPkr: 12500000,
    status: 'Pending Reply',
    summary: 'Call for bank encashment certificates (PRCs), client contracts, and SBP forex realization statements.',
  },
  {
    id: 'not-302',
    cnoNumber: 'CNO-2026-881204',
    caseId: 'case-2026-001',
    clientId: 'cli-103',
    clientName: 'Apex Builders & Commercial Developers',
    sectionCode: '7E',
    noticeTitle: 'Show Cause Notice under Section 7E for Deemed Rental Assessment',
    issuingOfficer: 'Deputy Commissioner Inland Revenue, Unit 04, RTO Islamabad',
    taxYear: '2025',
    dateReceived: '2026-01-08',
    dueDate: '2026-01-22',
    disputedAmountPkr: 85000000,
    status: 'Challenged in Appeal',
    summary: 'Demanding 5% deemed income on capital value of commercial plaza under construction.'
  },
  {
    id: 'not-303',
    cnoNumber: 'CNO-2026-554190',
    caseId: 'case-2026-002',
    clientId: 'cli-101',
    clientName: 'Al-Syed Logistics & Transport Pvt Ltd',
    sectionCode: '122(5A)',
    noticeTitle: 'Notice of Reassessment for Disallowance of Vehicle Operational Maintenance',
    issuingOfficer: 'Commissioner Inland Revenue (Appeals), Zone I, Islamabad',
    taxYear: '2023',
    dateReceived: '2026-02-02',
    dueDate: '2026-08-04',
    disputedAmountPkr: 38000000,
    status: 'Order Passed',
    summary: 'Notice enforcing partial disallowance of fleet maintenance logs.'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-501',
    caseId: 'case-2026-001',
    clientId: 'cli-103',
    title: 'Islamabad High Court Stay Order (IHC Writ 89/2026)',
    category: 'Court Order / Stay Order',
    fileSize: '2.4 MB',
    uploadedBy: 'Hafiz Irfan Shabber Kayani',
    uploadedAt: '2026-02-18',
    fileType: 'pdf',
    downloadUrl: '#',
    isClientVisible: true
  },
  {
    id: 'doc-502',
    caseId: 'case-2026-001',
    clientId: 'cli-103',
    title: 'Signed High Court Wakalatnama & Power of Attorney',
    category: 'Wakalatnama / Power of Attorney',
    fileSize: '1.1 MB',
    uploadedBy: 'Hafiz Irfan Shabber Kayani',
    uploadedAt: '2026-01-15',
    fileType: 'pdf',
    downloadUrl: '#',
    isClientVisible: true
  },
  {
    id: 'doc-503',
    caseId: 'case-2026-002',
    clientId: 'cli-101',
    title: 'ATIR Tribunal Memo of Appeal & Stay Petition',
    category: 'Reply & Rebuttal',
    fileSize: '3.8 MB',
    uploadedBy: 'Hafiz Irfan Shabber Kayani',
    uploadedAt: '2026-03-01',
    fileType: 'pdf',
    downloadUrl: '#',
    isClientVisible: true
  },
  {
    id: 'doc-504',
    caseId: 'case-2026-003',
    clientId: 'cli-102',
    title: 'SBP Foreign Proceeds Encashment Certificates (PRCs)',
    category: 'Tax Return & Wealth Statement',
    fileSize: '4.5 MB',
    uploadedBy: 'Hafiz Irfan Shabber Kayani',
    uploadedAt: '2026-03-22',
    fileType: 'pdf',
    downloadUrl: '#',
    isClientVisible: true
  }
];

export const INITIAL_TASKS: InternalTask[] = [
  {
    id: 'task-601',
    caseId: 'case-2026-001',
    title: 'Prepare Briefing Note for High Court Division Bench Hearing on Aug 12',
    assignedTo: 'Hafiz Irfan Shabber Kayani',
    dueDate: '2026-08-08',
    priority: 'Urgent',
    isCompleted: false,
    notes: 'Include cited Supreme Court precedents on Section 7E ultra vires challenge.'
  },
  {
    id: 'task-602',
    caseId: 'case-2026-003',
    title: 'Obtain Certified PSEB IT Export Registration Certificate Copy',
    assignedTo: 'Hafiz Irfan Shabber Kayani',
    dueDate: '2026-07-28',
    priority: 'High',
    isCompleted: true,
    notes: 'Received from software house legal department.'
  },
  {
    id: 'task-603',
    caseId: 'case-2026-002',
    title: 'Verify Bank Payment Challans for ATIR Court Filing Fee',
    assignedTo: 'Hafiz Irfan Shabber Kayani',
    dueDate: '2026-08-01',
    priority: 'Normal',
    isCompleted: false,
    notes: 'Ensure NBP treasury receipt attached with main paper book.'
  }
];

export const INITIAL_NOTES: InternalNote[] = [
  {
    id: 'note-701',
    caseId: 'case-2026-001',
    author: 'Hafiz Irfan Shabber Kayani',
    date: '2026-02-18',
    text: 'Met with Chief Executive of Apex Builders. Relying on IHC Division Bench landmark ruling staying Section 7E recovery across all commercial real estate portfolios.',
    isPrivileged: true
  },
  {
    id: 'note-702',
    caseId: 'case-2026-003',
    author: 'Hafiz Irfan Shabber Kayani',
    date: '2026-03-21',
    text: 'Client provided all 12 bank export realization receipts. Reconciled perfectly with FBR portal records. Ready to file formal written reply.',
    isPrivileged: true
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-801',
    invoiceNumber: 'HISK-INV-2026-012',
    caseId: 'case-2026-001',
    clientId: 'cli-103',
    clientName: 'Apex Builders & Commercial Developers',
    clientNtn: '2847593-4',
    serviceDescription: 'High Court Constitutional Writ Retainer & Stay Order Representation (Section 7E Challenge)',
    issueDate: '2026-02-20',
    dueDate: '2026-03-05',
    retainerFeePkr: 500000,
    hearingFeePkr: 150000,
    salesTaxPkr: 104000,
    totalAmountPkr: 754000,
    paidAmountPkr: 754000,
    status: 'Paid',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'inv-802',
    invoiceNumber: 'HISK-INV-2026-038',
    caseId: 'case-2026-002',
    clientId: 'cli-101',
    clientName: 'Al-Syed Logistics & Transport Pvt Ltd',
    clientNtn: '3948572-9',
    serviceDescription: 'Appellate Tribunal ATIR Appeal Filing & Stay Petition Retainer Fee',
    issueDate: '2026-03-02',
    dueDate: '2026-03-20',
    retainerFeePkr: 350000,
    hearingFeePkr: 75000,
    salesTaxPkr: 68000,
    totalAmountPkr: 493000,
    paidAmountPkr: 250000,
    status: 'Partially Paid',
    paymentMethod: 'PayOrder / Cheque'
  },
  {
    id: 'inv-803',
    invoiceNumber: 'HISK-INV-2026-054',
    caseId: 'case-2026-003',
    clientId: 'cli-102',
    clientName: 'Tariq Tech Solutions & Software Ltd',
    clientNtn: '7483920-1',
    serviceDescription: 'FBR Section 154A Audit Rebuttal Drafting & LTO Representation',
    issueDate: '2026-03-18',
    dueDate: '2026-04-02',
    retainerFeePkr: 200000,
    hearingFeePkr: 50000,
    salesTaxPkr: 40000,
    totalAmountPkr: 290000,
    paidAmountPkr: 0,
    status: 'Pending',
    paymentMethod: 'Online PKR'
  }
];

export const INITIAL_HEARINGS: HearingEvent[] = [
  {
    id: 'hear-901',
    caseId: 'case-2026-003',
    caseTitle: 'IT Export Tax Concession Audit u/s 154A',
    clientName: 'Tariq Tech Solutions & Software Ltd',
    date: '2026-07-30',
    time: '10:30 AM',
    forum: 'FBR LTO Rawalpindi',
    bench: 'Additional Commissioner Audit Bench',
    counselAssigned: 'Hafiz Irfan Shabber Kayani',
    purpose: 'Submission of Bank PRC & PSEB Certificates',
    priority: 'High'
  },
  {
    id: 'hear-902',
    caseId: 'case-2026-002',
    caseTitle: 'Disallowance of Fuel & Fleet Operating Expenses u/s 122(5A)',
    clientName: 'Al-Syed Logistics & Transport Pvt Ltd',
    date: '2026-08-04',
    time: '11:15 AM',
    forum: 'Appellate Tribunal Inland Revenue (ATIR)',
    bench: 'Division Bench II, ATIR Islamabad',
    counselAssigned: 'Hafiz Irfan Shabber Kayani',
    purpose: 'Hearing on Stay Application & Main Appeal Grounds',
    priority: 'High'
  },
  {
    id: 'hear-903',
    caseId: 'case-2026-001',
    caseTitle: 'High Court Writ: Challenge Against Section 7E Deemed Property Tax Demand',
    clientName: 'Apex Builders & Commercial Developers',
    date: '2026-08-12',
    time: '09:00 AM',
    forum: 'Islamabad High Court (IHC)',
    bench: 'Honourable Division Bench Court 03',
    counselAssigned: 'Hafiz Irfan Shabber Kayani',
    purpose: 'Arguments on Confirmation of Interim Stay Order',
    priority: 'High'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-1001',
    clientId: 'cli-103',
    clientName: 'Apex Builders & Commercial Developers',
    caseId: 'case-2026-001',
    type: 'WhatsApp',
    recipientPhoneOrEmail: '+92 333 5129800',
    title: 'IHC High Court Hearing Reminder',
    message: 'HISK LEGAL Alert: Dear Client, your High Court Writ (Section 7E) hearing is scheduled for 12-Aug-2026 at IHC Court 03. Senior Advocate Hafiz Irfan Shabber Kayani will represent your case.',
    sentAt: '2026-07-24 10:15 AM',
    status: 'Delivered'
  },
  {
    id: 'notif-1002',
    clientId: 'cli-102',
    clientName: 'Tariq Tech Solutions & Software Ltd',
    caseId: 'case-2026-003',
    type: 'Email',
    recipientPhoneOrEmail: 'tax@tariqtech.io',
    title: 'FBR Audit Reply Draft Ready for Approval',
    message: 'Dear Tariq Tech Team, Advocate Hafiz Irfan Shabber Kayani has finalized the audit reply for FBR Section 154A notice. Please log in to your Client Portal to review and approve.',
    sentAt: '2026-07-22 03:40 PM',
    status: 'Read'
  }
];

export const INITIAL_CLIENT_CREDENTIALS = [
  {
    id: 'cred-101',
    clientId: 'cli-101',
    clientName: 'Al-Syed Logistics & Transport Pvt Ltd',
    email: 'finance@alsyedlogistics.com.pk',
    password: 'Password123!',
    createdAt: '2025-01-15'
  },
  {
    id: 'cred-102',
    clientId: 'cli-102',
    clientName: 'Tariq Tech Solutions & Software Ltd',
    email: 'tax@tariqtech.io',
    password: 'Password123!',
    createdAt: '2025-03-10'
  },
  {
    id: 'cred-103',
    clientId: 'cli-103',
    clientName: 'Apex Builders & Commercial Developers',
    email: 'legal@apexbuilders.pk',
    password: 'Password123!',
    createdAt: '2024-11-20'
  },
  {
    id: 'cred-104',
    clientId: 'cli-104',
    clientName: 'Dr. Sarah Ahmed (Consolidated Medical)',
    email: 'dr.sarah@clinic.pk',
    password: 'Password123!',
    createdAt: '2025-06-05'
  }
];

export const INITIAL_PRACTICE_AREAS: PracticeArea[] = [
  // 1. LITIGATION & DISPUTES
  {
    id: 'litigation-arbitration-white-collar',
    title: 'Civil, Commercial & Trial Litigation',
    category: 'Litigation & Disputes',
    shortDesc: 'High Court civil suits, commercial disputes, domestic/international arbitration (ADR), and banking recovery defense.',
    fullDesc: 'Tenacious courtroom advocacy and dispute resolution before District Courts, Special Banking Courts, and High Courts across Pakistan. We specialize in commercial contract breaches, recovery of finances, domestic & international arbitration under the Arbitration Act, and trial defense in white-collar accountability matters (NAB / FIA).',
    subServices: [
      'Civil & Commercial Court Suits',
      'Commercial Arbitration & ADR',
      'Banking Court Recovery & Defense',
      'White-Collar Crime (NAB & FIA)'
    ],
    keyHighlights: [
      'High Court & District Court Civil and Commercial Trials',
      'Domestic & International Commercial Arbitration (ADR)',
      'Banking Court Recovery Defense & Financial Suits',
      'NAB & FIA Accountability Trial & Investigation Defense'
    ],
    iconName: 'Gavel',
    badge: 'Trial & Arbitration'
  },
  {
    id: 'constitutional-public-law',
    title: 'Constitutional Writs & Public Law',
    category: 'Litigation & Disputes',
    shortDesc: 'High Court Constitutional Writ Petitions under Article 199, emergency stay orders, and challenging unlawful government actions.',
    fullDesc: 'Defending fundamental constitutional rights and commercial operations against executive excess before the High Courts of Pakistan. We draft and argue high-impact Article 199 constitutional petitions, secure urgent stay orders against coercive actions, challenge arbitrary FBR notifications/SROs, and litigate public procurement (PPRA) disputes.',
    subServices: [
      'High Court Writs (Article 199)',
      'Emergency Stay Orders & Injunctions',
      'Challenging Unlawful SROs & Circulars',
      'Public Procurement (PPRA) Disputes'
    ],
    keyHighlights: [
      'High Court Article 199 Writs Against Arbitrary Executive Orders',
      'Emergency Injunctions Against Coercive Bank Attachment',
      'Challenging Ultra Vires FBR Rules, Statutory SROs & Notices',
      'Government Tender Invalidation & PPRA Compliance Appeals'
    ],
    iconName: 'Scale',
    badge: 'Constitutional Writs'
  },

  // 2. CORPORATE & ADVISORY
  {
    id: 'corporate-secp-advisory',
    title: 'Corporate, SECP & Business Advisory',
    category: 'Corporate & Advisory',
    shortDesc: 'SECP company incorporation, annual statutory compliance (Form A/29), shareholder agreements, and corporate governance.',
    fullDesc: 'Full-spectrum corporate legal counsel for startups, mid-sized enterprises, and multinational corporations. We oversee entity incorporation (Private Limited, SMC, LLP) with SECP, statutory annual filings, board governance, shareholder pacts, capital restructuring, and regulatory compliance.',
    subServices: [
      'Company Formation (Pvt Ltd / SMC / LLP)',
      'SECP Statutory Filings (Form A / Form 29)',
      'Corporate Governance & Structuring',
      'Shareholder & Joint Venture Agreements'
    ],
    keyHighlights: [
      'SECP Incorporation, Licensing & Name Reservations',
      'Annual Statutory Compliance & Regulatory Returns',
      'Drafting Articles of Association & Board Resolutions',
      'Corporate Restructuring, Amalgamations & Dissolutions'
    ],
    iconName: 'Building2',
    badge: 'Corporate'
  },
  {
    id: 'commercial-contracts-advisory',
    title: 'Commercial Contracts & Transaction Advisory',
    category: 'Corporate & Advisory',
    shortDesc: 'Strategic commercial agreements, M&A due diligence, IPO trademark registrations, and labor law compliance.',
    fullDesc: 'Safeguarding commercial operations with precision legal drafting and transaction advisory. We structure multi-party commercial contracts, lead legal due diligence for mergers & acquisitions (M&A), register and defend trademarks and patents with IPO Pakistan, and advise on labor laws, EOBI, and employment contracts.',
    subServices: [
      'Commercial Contract Drafting & Vetting',
      'Mergers, Acquisitions (M&A) & Due Diligence',
      'IPO Trademark & Intellectual Property',
      'Employment, Labor & EOBI Compliance'
    ],
    keyHighlights: [
      'High-Stakes Vendor, Distribution & Franchise Agreements',
      'M&A Legal Due Diligence & Share Purchase Contracts',
      'Trademark, Brand & Copyright Registration with IPO Pakistan',
      'Employment Agreements, Workplace Policies & Labor Law Compliance'
    ],
    iconName: 'Briefcase',
    badge: 'Advisory'
  },

  // 3. TAX & COMPLIANCE
  {
    id: 'taxation-fbr-advisory',
    title: 'Taxation & FBR Legal Defense',
    category: 'Tax & Compliance',
    shortDesc: 'Direct & indirect taxation, high-stakes FBR show-cause defense, tax audit rebuttals, and High Court tax writs.',
    fullDesc: 'Premier tax litigation and contentious defense for corporations, manufacturers, and high-net-worth individuals. We represent clients against FBR show-cause notices, Section 122 reassessments, sales tax audits across provincial authorities (PRA, SRB, KPRA, BRA), and lead appeals before CIR-A, ATIR, and High Courts.',
    subServices: [
      'Direct & Indirect Taxation',
      'FBR Notice & Audit Defense',
      'Appellate Tribunal (ATIR) Appeals',
      'High Court Tax Writ Litigation'
    ],
    keyHighlights: [
      'Rebutting FBR Section 122 & Section 111 Audit Show-Cause Notices',
      'Stay Orders Against Bank Account Attachments & Coercive Recovery',
      'Appeals Before Commissioner (Appeals) & ATIR Tribunal',
      'High Court Reference Applications on Substantial Questions of Law'
    ],
    iconName: 'FileText',
    badge: 'Core Specialty'
  },
  {
    id: 'tax-compliance-returns-bookkeeping',
    title: 'Tax Compliance, Returns & Bookkeeping',
    category: 'Tax & Compliance',
    shortDesc: 'Annual income tax filings, monthly sales tax returns, Active Taxpayer List (ATL) status, and tax-compliant bookkeeping.',
    fullDesc: 'Meticulous, proactive tax compliance designed to insulate businesses from scrutiny and penalties. We manage timely annual income tax returns, monthly sales tax e-filing, Active Taxpayer List (ATL) maintenance, withholding tax statements, exemption certificates (Section 153/159), and computerized ledger bookkeeping.',
    subServices: [
      'Annual Return Filing & ATL Status',
      'Monthly Sales Tax Returns (FBR & Provinces)',
      'Withholding Tax Statements & Exemptions',
      'Computerized Ledger & Bookkeeping'
    ],
    keyHighlights: [
      'Active Taxpayer List (ATL) Restoration & Surcharge Immunity',
      'Tax Exemption Certificates (u/s 153 & 159) Filing & Approval',
      'Sales Tax Invoice Auditing & Input-Tax Reconciliations',
      'Compliant Double-Entry Bookkeeping & Financial Statements'
    ],
    iconName: 'Landmark',
    badge: 'Compliance'
  }
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = ATTORNEYS.map((attorney, index) => ({
  ...attorney,
  order: index + 1,
  createdAt: '2025-01-01',
  stickToLeft: attorney.stickToLeft ?? (attorney.isCeo || index === 0)
}));

export const INITIAL_REVIEWS: ReviewItem[] = TESTIMONIALS.map((rev) => ({
  ...rev,
  status: 'published',
  featured: true,
  createdAt: '2026-01-01'
}));

export const INITIAL_INSIGHTS: LegalInsightItem[] = BLOG_POSTS.map((post) => ({
  ...post,
  status: 'published',
  createdAt: '2026-01-01'
}));

export const INITIAL_PARTNERS: PartnerItem[] = [
  {
    id: 'partner-fbr',
    name: 'Federal Board of Revenue (FBR)',
    logoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=300',
    websiteUrl: 'https://fbr.gov.pk',
    category: 'Tax & Regulatory Body',
    description: 'Federal Revenue & Tax Statutory Authority of Pakistan',
    status: 'published',
    order: 1
  },
  {
    id: 'partner-ihcba',
    name: 'Islamabad High Court Bar Association',
    logoUrl: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&q=80&w=300',
    websiteUrl: 'https://ihcbar.org.pk',
    category: 'Bar Association',
    description: 'High Court Advocates Governing Bar Association',
    status: 'published',
    order: 2
  },
  {
    id: 'partner-pbc',
    name: 'Pakistan Bar Council (PBC)',
    logoUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300',
    websiteUrl: 'https://pakistanbarcouncil.org',
    category: 'Apex Governing Body',
    description: 'Supreme Regulatory Body of Legal Profession in Pakistan',
    status: 'published',
    order: 3
  },
  {
    id: 'partner-secp',
    name: 'Securities & Exchange Commission of Pakistan',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300',
    websiteUrl: 'https://secp.gov.pk',
    category: 'Corporate Regulator',
    description: 'Financial & Corporate Sector Regulatory Authority',
    status: 'published',
    order: 4
  },
  {
    id: 'partner-scbap',
    name: 'Supreme Court Bar Association of Pakistan',
    logoUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=300',
    websiteUrl: 'https://scbap.org.pk',
    category: 'Bar Association',
    description: 'Apex Court Advocates Statutory Association',
    status: 'published',
    order: 5
  },
  {
    id: 'partner-lhcba',
    name: 'Lahore High Court Bar Association',
    logoUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=300',
    websiteUrl: 'https://lhcba.org',
    category: 'Bar Association',
    description: 'High Court Bar Association',
    status: 'published',
    order: 6
  },
  {
    id: 'partner-ipo',
    name: 'Intellectual Property Organization of Pakistan',
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300',
    websiteUrl: 'https://ipo.gov.pk',
    category: 'IP Statutory Body',
    description: 'Trademarks, Patents & Copyright Authority',
    status: 'published',
    order: 7
  },
  {
    id: 'partner-itba',
    name: 'Islamabad Tax Bar Association',
    logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300',
    websiteUrl: '#',
    category: 'Tax Bar Association',
    description: 'Professional Association of Tax Advocates & Consultants',
    status: 'published',
    order: 8
  }
];




