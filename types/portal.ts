export type CaseStatus = 
  | 'Notice Received'
  | 'Response Drafted'
  | 'Under Audit'
  | 'CIR Appeal Pending'
  | 'ATIR Tribunal Pending'
  | 'High Court Writ Active'
  | 'Stay Granted'
  | 'Favorable Order Passed'
  | 'Closed & Settled';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type LegalForum = 
  | 'FBR RTO Islamabad'
  | 'FBR LTO Rawalpindi'
  | 'Commissioner Inland Revenue (Appeals)'
  | 'Appellate Tribunal Inland Revenue (ATIR)'
  | 'Islamabad High Court (IHC)'
  | 'Lahore High Court (LHC)'
  | 'Sindh High Court (SHC)'
  | 'Supreme Court of Pakistan'
  | 'Civil Court / District Court'
  | 'Sessions Court / Criminal Court'
  | 'Family & Guardian Court'
  | 'Rent Controller Tribunal'
  | 'Banking Court'
  | 'SECP / Regulatory Tribunal';

export type ClientType = 'Tax Client' | 'Other Category';

export type ClientCategory =
  | 'Tax Client'
  | 'Corporate'
  | 'High Net Worth Individual'
  | 'IT & Freelancer'
  | 'SME'
  | 'Property Owner'
  | 'Civil Litigation'
  | 'Criminal Defense'
  | 'Family Law'
  | 'Rent & Real Estate'
  | 'Banking & Finance'
  | 'Other';

export type CaseCategory =
  | 'Tax & FBR Litigation'
  | 'Corporate & SECP'
  | 'Civil Litigation'
  | 'Criminal Defense'
  | 'Family Law'
  | 'Property & Rent'
  | 'Banking & Finance'
  | 'High Court Writs'
  | 'Other Legal Matter';

export interface Client {
  id: string;
  name: string;
  businessName?: string;
  cnic: string;
  ntn: string;
  clientType?: ClientType;
  category: ClientCategory;
  phone: string;
  email: string;
  city: string;
  registeredAddress: string;
  activeCasesCount: number;
  totalTaxSaved: string;
  status: 'Active' | 'On Hold' | 'Archived';
  createdAt: string;
}

export interface CaseTimelineItem {
  id: string;
  date: string;
  title: string;
  forum: LegalForum;
  description: string;
  advocateName: string;
  outcome?: string;
  nextAction?: string;
  documentsAttached?: string[];
}

export interface FBRNotice {
  id: string;
  cnoNumber: string; // Computerized Notice Order No.
  caseId: string;
  clientId: string;
  clientName: string;
  sectionCode: string; // e.g., '122(5A)', '177', '214C', '7E', '111'
  noticeTitle: string;
  issuingOfficer: string;
  taxYear: string;
  dateReceived: string;
  dueDate: string;
  disputedAmountPkr: number;
  status: 'Pending Reply' | 'Reply Submitted' | 'Extension Granted' | 'Show Cause Issued' | 'Order Passed' | 'Challenged in Appeal';
  summary: string;
  noticePdfUrl?: string;
}

export interface CaseFile {
  id: string;
  caseId?: string;
  clientId: string;
  caseTitle: string;
  caseCategory?: CaseCategory;
  clientName: string;
  clientNtn: string;
  caseRef: string;
  assignedCounsel: string;
  assignedCounselTitle: string;
  forum: LegalForum;
  taxYear: string;
  status: CaseStatus;
  riskLevel: RiskLevel;
  demandAmountPkr: number;
  savedAmountPkr: number;
  auditStage: number; // 1 to 6
  summary: string;
  nextHearingDate?: string;
  nextHearingPurpose?: string;
  clientLoginEmail?: string;
  clientLoginPassword?: string;
  timeline: CaseTimelineItem[];
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  caseId: string;
  clientId: string;
  title: string;
  category: 'FBR Notice' | 'Wakalatnama / Power of Attorney' | 'Reply & Rebuttal' | 'Tax Return & Wealth Statement' | 'Bank Statement' | 'Court Order / Stay Order' | 'Fee Challan';
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  fileType: 'pdf' | 'doc' | 'png' | 'jpg';
  downloadUrl: string;
  isClientVisible: boolean;
}

export interface InternalTask {
  id: string;
  caseId: string;
  title: string;
  assignedTo: string; // Advocate or Para-legal
  dueDate: string;
  priority: 'Urgent' | 'High' | 'Normal';
  isCompleted: boolean;
  notes?: string;
}

export interface InternalNote {
  id: string;
  caseId: string;
  author: string;
  date: string;
  text: string;
  content?: string;
  isPrivileged: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  clientId: string;
  clientName: string;
  clientNtn: string;
  serviceDescription: string;
  issueDate: string;
  dueDate: string;
  retainerFeePkr: number;
  hearingFeePkr: number;
  salesTaxPkr: number;
  totalAmountPkr: number;
  paidAmountPkr: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
  paymentMethod?: 'Bank Transfer' | 'PayOrder / Cheque' | 'Online PKR';
}

export interface NotificationLog {
  id: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  type: 'WhatsApp' | 'Email' | 'System';
  recipientPhoneOrEmail: string;
  title: string;
  message: string;
  sentAt: string;
  status: 'Delivered' | 'Read' | 'Sent';
}

export interface HearingEvent {
  id: string;
  caseId: string;
  caseTitle: string;
  clientName: string;
  date: string;
  time: string;
  forum: LegalForum;
  bench: string;
  counselAssigned: string;
  purpose: string;
  priority: 'High' | 'Medium' | 'Routine';
  previousHearingDate?: string;
  previousHearingOutcome?: string;
}

export interface ClientCredential {
  id: string;
  clientId: string;
  clientName: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface PracticeArea {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  subServices: string[];
  keyHighlights: string[];
  iconName: string;
  badge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  credentials: string[];
  experienceYears: number;
  specialty: string;
  bio: string;
  fullBio?: string[];
  image: string;
  keyWin: string;
  isCeo?: boolean;
  stickToLeft?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewItem {
  id: string;
  clientInitials: string;
  clientRole: string;
  location: string;
  caseType: string;
  dollarSaved: string;
  rating: number;
  reviewText: string;
  verifiedBadge: boolean;
  date: string;
  status?: 'published' | 'pending' | 'archived';
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalInsightItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  keyTakeaways: string[];
  content: string[];
  featured?: boolean;
  status?: 'published' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  category?: string;
  description?: string;
  order?: number;
  status?: 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}



