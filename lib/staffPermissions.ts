import { StaffPermission, StaffRolePreset, StaffAccount } from '@/types/portal';

export const SUPER_ADMIN_EMAILS: string[] = [
  'jamalshah183@gmail.com',
  'adv.kayani@gmail.com',
  'adv.kiyani@gmail.com',
  'aamer222@gmail.com',
  'namias327@gmail.com',
  'rahim.nawaz@i-con.pk',
];

export const ALL_STAFF_PERMISSIONS: StaffPermission[] = [
  'dashboard',
  'data_entry',
  'document_management',
  'tasks_notes',
  'billing',
  'notifications',
  'content_cms',
  'staff_management',
];

export interface StaffPermissionDefinition {
  key: StaffPermission;
  label: string;
  shortLabel: string;
  description: string;
}

export const STAFF_PERMISSION_DEFINITIONS: StaffPermissionDefinition[] = [
  {
    key: 'dashboard',
    label: 'Dashboard & Overview',
    shortLabel: 'Dashboard',
    description: 'View executive dashboard metrics, active cases list, and upcoming hearings.',
  },
  {
    key: 'data_entry',
    label: 'Data Entry (Clients, Cases, Notices & Calendar)',
    shortLabel: 'Data Entry',
    description: 'Register and update Clients, Cases, FBR Notices, and Hearing schedules.',
  },
  {
    key: 'document_management',
    label: 'Document Management (Vault & Case Files)',
    shortLabel: 'Document Vault',
    description: 'Upload, categorize, organize, and manage files in Document Vault.',
  },
  {
    key: 'tasks_notes',
    label: 'Tasks & Privileged Notes',
    shortLabel: 'Tasks & Notes',
    description: 'Create, assign, complete associate tasks, and record case notes.',
  },
  {
    key: 'billing',
    label: 'Billing & Fee Invoices',
    shortLabel: 'Billing',
    description: 'Issue fee invoices, generate PDFs, and mark payments received.',
  },
  {
    key: 'notifications',
    label: 'WhatsApp & Email Alerts',
    shortLabel: 'Alerts',
    description: 'Send hearing notices and compliance alerts via WhatsApp or Email.',
  },
  {
    key: 'content_cms',
    label: 'Website CMS (Practice, Team, Reviews, Insights, Partners)',
    shortLabel: 'Website CMS',
    description: 'Manage public website practice areas, team profiles, reviews, articles, and partners.',
  },
  {
    key: 'staff_management',
    label: 'Staff & Access Control (Admin)',
    shortLabel: 'Staff Access',
    description: 'Authorize team members, modify role permissions, and suspend accounts.',
  },
];

export const ROLE_PERMISSION_PRESETS: Record<StaffRolePreset, StaffPermission[]> = {
  'Super Admin': ALL_STAFF_PERMISSIONS,
  'Senior Partner': [
    'dashboard',
    'data_entry',
    'document_management',
    'tasks_notes',
    'billing',
    'notifications',
    'content_cms',
  ],
  'Data Entry Operator': ['dashboard', 'data_entry', 'tasks_notes'],
  'Document Manager': ['dashboard', 'document_management'],
  'Case & Calendar Clerk': [
    'dashboard',
    'data_entry',
    'document_management',
    'tasks_notes',
    'notifications',
  ],
  'Billing & Accounts': ['dashboard', 'billing'],
  'Custom Access': ['dashboard'],
};

export const STAFF_ROLE_PRESETS: StaffRolePreset[] = [
  'Data Entry Operator',
  'Document Manager',
  'Case & Calendar Clerk',
  'Billing & Accounts',
  'Senior Partner',
  'Super Admin',
  'Custom Access',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function resolveStaffPermissions(
  email?: string | null,
  staffAccounts: StaffAccount[] = []
): {
  authorized: boolean;
  isSuperAdmin: boolean;
  role: StaffRolePreset | 'Unauthorized';
  permissions: StaffPermission[];
  staffAccount: StaffAccount | null;
  status: 'Active' | 'Suspended' | 'Unauthorized';
} {
  const cleanEmail = email?.trim().toLowerCase() || '';
  if (!cleanEmail) {
    return {
      authorized: false,
      isSuperAdmin: false,
      role: 'Unauthorized',
      permissions: [],
      staffAccount: null,
      status: 'Unauthorized',
    };
  }

  if (isSuperAdminEmail(cleanEmail)) {
    return {
      authorized: true,
      isSuperAdmin: true,
      role: 'Super Admin',
      permissions: ALL_STAFF_PERMISSIONS,
      staffAccount: null,
      status: 'Active',
    };
  }

  const matched = staffAccounts.find(
    (acc) => acc.email.trim().toLowerCase() === cleanEmail || acc.id.trim().toLowerCase() === cleanEmail
  );

  if (!matched) {
    return {
      authorized: false,
      isSuperAdmin: false,
      role: 'Unauthorized',
      permissions: [],
      staffAccount: null,
      status: 'Unauthorized',
    };
  }

  if (matched.status !== 'Active') {
    return {
      authorized: false,
      isSuperAdmin: false,
      role: matched.role,
      permissions: [],
      staffAccount: matched,
      status: 'Suspended',
    };
  }

  return {
    authorized: true,
    isSuperAdmin: matched.role === 'Super Admin',
    role: matched.role,
    permissions: Array.isArray(matched.permissions) ? matched.permissions : [],
    staffAccount: matched,
    status: 'Active',
  };
}

export function getRequiredPermissionForTab(tabId: string): StaffPermission {
  switch (tabId) {
    case 'dashboard':
      return 'dashboard';
    case 'clients':
    case 'cases':
    case 'calendar':
      return 'data_entry';
    case 'documents':
      return 'document_management';
    case 'tasks':
      return 'tasks_notes';
    case 'billing':
      return 'billing';
    case 'notifications':
      return 'notifications';
    case 'practiceAreas':
    case 'team':
    case 'reviews':
    case 'insights':
    case 'partners':
      return 'content_cms';
    case 'staffAccess':
      return 'staff_management';
    default:
      return 'dashboard';
  }
}
