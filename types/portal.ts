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

export type FileCategoryCode = 'IT' | 'ST' | 'INC' | 'CF';

export type ClientCategory =
  | 'Tax Client'
  | 'Income Tax (IT)'
  | 'Sales Tax (ST)'
  | 'Incorporation (INC)'
  | 'Court File (CF)'
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

export interface ClientVaultSecret {
  clientId: string;
  irisPassword?: string; // Income Tax IRIS PW
  fbrPstPassword?: string; // Sales Tax FBR/PST PW
  secpPassword?: string; // Incorporation SECP Password
  secpPin?: string; // Incorporation SECP PIN
  updatedAt?: string;
}

export interface Client {
  id: string;
  fileNumber?: string; // e.g., AI-IT-001, AI-ST-001, AI-INC-001, AI-CF-001
  fileCategoryCode?: FileCategoryCode; // 'IT' | 'ST' | 'INC' | 'CF'
  name: string; // Name of Business/Individual (IT/ST/INC) or Name of Client (CF)
  businessName?: string;
  cnic: string; // CNIC / Login ID
  ntn: string;
  clientType?: ClientType;
  category: ClientCategory;
  entityStatus?: string; // Sheet column 'Status' e.g. FREELANCER, BUS IND, COMPANY, AOP, NPO
  activeClosed?: 'Active' | 'Closed'; // Sheet column 'Active/Closed' or CF Contacts Status
  authority?: string; // Sales Tax 'Authority (FBR/PRA/KPRA/SRB/BRA)'
  regIncorpNo?: string; // INC 'Reg./Incorp. No.'
  rtoCto?: string; // RTO/CTO / Station
  contactPerson?: string; // Contact Person (1)
  referralContact?: string; // REFERRAL CONTACT
  pendingBeforeCourt?: string; // CF 'Pending Before Court of Law'
  natureOfCase?: string; // Cover Page 'NATURE OF CASE' for CF (e.g. WRIT PETITION, APPEAL)
  volumeNo?: string; // Cover Page 'Volume No.' e.g. VOL-I
  coverSubjectYear?: string; // Cover Page 'Year if so required:'
  propMdCeoName?: string; // Cover Page 'Name of Prop./MD/CEO OR Employer' or 'On behalf of'
  whatsapp?: string; // Cover Page WhatsApp No.
  landline?: string; // Cover Page Land Line No.
  contactPerson2?: string; // Cover Page Contact Person (2)
  whatsapp2?: string; // Cover Page Contact Person (2) WhatsApp
  email2?: string; // Cover Page Contact Person (2) Email
  chargeType?: 'CHARGE' | 'COMPLEMENTARY'; // Cover Page 'To be charged or Complementary:'
  phone: string; // Mobile No.
  email: string; // E-mail address
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
  fileNumber?: string;
  fileCategoryCode?: FileCategoryCode;
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

export type StaffPermission =
  | 'dashboard'
  | 'data_entry'
  | 'document_management'
  | 'tasks_notes'
  | 'billing'
  | 'notifications'
  | 'content_cms'
  | 'staff_management';

export type StaffRolePreset =
  | 'Super Admin'
  | 'Senior Partner'
  | 'Data Entry Operator'
  | 'Document Manager'
  | 'Case & Calendar Clerk'
  | 'Billing & Accounts'
  | 'Custom Access';

export interface StaffAccount {
  id: string; // normalized lowercase email
  name: string;
  email: string;
  designation: string;
  phone?: string;
  role: StaffRolePreset;
  permissions: StaffPermission[];
  status: 'Active' | 'Suspended';
  notes?: string;
  authorizedBy?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}




