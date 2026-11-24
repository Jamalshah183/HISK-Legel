'use client';

import { useState, useEffect, useRef } from 'react';
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
  CaseStatus,
  LegalForum,
  RiskLevel,
  ClientCredential,
  PracticeArea,
  TeamMember,
  ReviewItem,
  LegalInsightItem,
  PartnerItem,
  CaseCategory,
  StaffAccount,
  StaffPermission,
  StaffRolePreset,
  ClientVaultSecret
} from '@/types/portal';
import {
  INITIAL_CLIENTS,
  INITIAL_CASES,
  INITIAL_NOTICES,
  INITIAL_DOCUMENTS,
  INITIAL_TASKS,
  INITIAL_NOTES,
  INITIAL_INVOICES,
  INITIAL_HEARINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CLIENT_CREDENTIALS,
  INITIAL_PRACTICE_AREAS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_REVIEWS,
  INITIAL_INSIGHTS,
  INITIAL_PARTNERS
} from '@/data/portalSeedData';
import { db, auth } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, deleteField, getDoc, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { isSuperAdminEmail, resolveStaffPermissions } from './staffPermissions';
import {
  inferClientFileCode,
  getClientTypeFromFileCode,
  parseFileCodeFromFileNumber,
  getNextFileNumber
} from './excelExport';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function buildFirestoreErrorInfo(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        cleaned[k] = stripUndefined(v);
      }
    }
    return cleaned as T;
  }
  return value;
}

const STORAGE_KEYS = {
  CLIENTS: 'hisk_portal_clients_v2',
  CASES: 'hisk_portal_cases_v2',
  NOTICES: 'hisk_portal_notices_v2',
  DOCUMENTS: 'hisk_portal_documents_v2',
  TASKS: 'hisk_portal_tasks_v2',
  NOTES: 'hisk_portal_notes_v2',
  INVOICES: 'hisk_portal_invoices_v2',
  HEARINGS: 'hisk_portal_hearings_v2',
  NOTIFICATIONS: 'hisk_portal_notifications_v2',
  CLIENT_CREDENTIALS: 'hisk_portal_client_credentials_v2',
  PRACTICE_AREAS: 'hisk_portal_practice_areas_v3',
  TEAM_MEMBERS: 'hisk_portal_team_members_v2',
  REVIEWS: 'hisk_portal_reviews_v2',
  INSIGHTS: 'hisk_portal_insights_v2',
  PARTNERS: 'hisk_portal_partners_v2',
  STAFF_ACCOUNTS: 'hisk_portal_staff_accounts_v1',
  CLIENT_VAULT_SECRETS: 'hisk_portal_client_secrets_v1'
};

const createUniqueId = (prefix: string) => {
  const suffix = `${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;
  return prefix ? `${prefix}-${suffix}` : suffix;
};
const createFullTimestampId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getCurrentYearNumber = () => new Date().getFullYear();

const INITIALIZED_COLS_KEY = 'hisk_portal_initialized_cols_v1';

const readInitializedCols = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(INITIALIZED_COLS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

const hasSeededCollection = (colKey: string): boolean => {
  if (typeof window === 'undefined') return false;
  const map = readInitializedCols();
  if (map[colKey]) return true;
  return localStorage.getItem('hisk_registers_seeded_v2') === 'done' && (
    colKey === 'clients' ||
    colKey === 'cases' ||
    colKey === 'notices' ||
    colKey === 'hearings' ||
    colKey === 'clientCredentials'
  );
};

const markCollectionSeeded = (colKey: string) => {
  if (typeof window === 'undefined') return;
  try {
    const map = readInitializedCols();
    if (!map[colKey]) {
      map[colKey] = true;
      localStorage.setItem(INITIALIZED_COLS_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore storage errors
  }
};

function normalizeClientList(rawClients: Client[], currentCases: CaseFile[]): Client[] {
  const seedMap = new Map(INITIAL_CLIENTS.map((c) => [c.id, c]));
  const working: Client[] = rawClients.map((cl) => {
    const seed = seedMap.get(cl.id);
    if (seed && (!cl.fileNumber || !cl.fileCategoryCode)) {
      return {
        ...seed,
        ...cl,
        fileNumber: cl.fileNumber || seed.fileNumber,
        fileCategoryCode: cl.fileCategoryCode || seed.fileCategoryCode,
        clientType: cl.clientType || seed.clientType,
        category:
          !cl.fileCategoryCode && cl.id === 'cli-101' && cl.category === 'Corporate'
            ? seed.category
            : cl.category || seed.category,
        entityStatus: cl.entityStatus || seed.entityStatus,
        activeClosed: cl.activeClosed || seed.activeClosed,
        regIncorpNo: cl.regIncorpNo || seed.regIncorpNo,
        rtoCto: cl.rtoCto || seed.rtoCto,
        contactPerson: cl.contactPerson || seed.contactPerson,
        referralContact: cl.referralContact || seed.referralContact,
        pendingBeforeCourt: cl.pendingBeforeCourt ?? seed.pendingBeforeCourt,
      };
    }
    return { ...cl };
  });

  // Assign deterministic non-colliding fileNumbers to any legacy custom clients missing them
  const result: Client[] = [];
  for (const cl of working) {
    const code = cl.fileCategoryCode || inferClientFileCode(cl);
    const fileNumber =
      cl.fileNumber?.trim().toUpperCase() ||
      getNextFileNumber(code, [...result, ...working.filter((w) => Boolean(w.fileNumber))], currentCases);
    const resolvedCode = parseFileCodeFromFileNumber(fileNumber) || code;
    const linkedCaseCount = currentCases.filter((cs) => cs.clientId === cl.id).length;
    result.push({
      ...cl,
      fileNumber,
      fileCategoryCode: resolvedCode,
      clientType: cl.clientType || getClientTypeFromFileCode(resolvedCode),
      activeCasesCount: currentCases.length > 0 ? linkedCaseCount : cl.activeCasesCount ?? 0,
    });
  }
  return result;
}

function normalizeCaseList(rawCases: CaseFile[], normalizedClients: Client[]): CaseFile[] {
  const seedCaseMap = new Map(INITIAL_CASES.map((c) => [c.id, c]));
  const clientMap = new Map(normalizedClients.map((cl) => [cl.id, cl]));
  return rawCases.map((cs) => {
    const seed = seedCaseMap.get(cs.id);
    const linkedClient = clientMap.get(cs.clientId);
    const resolvedFileNumber =
      linkedClient?.fileNumber || cs.fileNumber || seed?.fileNumber;
    const resolvedCode =
      linkedClient?.fileCategoryCode ||
      cs.fileCategoryCode ||
      parseFileCodeFromFileNumber(resolvedFileNumber || cs.caseRef) ||
      seed?.fileCategoryCode;
    return {
      ...cs,
      fileNumber: resolvedFileNumber,
      fileCategoryCode: resolvedCode,
      caseCategory: cs.caseCategory || seed?.caseCategory || (resolvedCode === 'INC' ? 'Corporate & SECP' : resolvedCode === 'CF' ? 'Civil Litigation' : 'Tax & FBR Litigation'),
      clientName: linkedClient?.name || cs.clientName || 'Client',
      clientNtn: (linkedClient?.ntn && linkedClient.ntn.trim()) ? linkedClient.ntn : (cs.clientNtn ?? 'N/A'),
    };
  });
}

export function usePortalStore() {
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CLIENTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [cases, setCases] = useState<CaseFile[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CASES;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CASES);
      return saved ? JSON.parse(saved) : INITIAL_CASES;
    } catch {
      return INITIAL_CASES;
    }
  });

  const [notices, setNotices] = useState<FBRNotice[]>(() => {
    if (typeof window === 'undefined') return INITIAL_NOTICES;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
      return saved ? JSON.parse(saved) : INITIAL_NOTICES;
    } catch {
      return INITIAL_NOTICES;
    }
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DOCUMENTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [tasks, setTasks] = useState<InternalTask[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TASKS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [notes, setNotes] = useState<InternalNote[]>(() => {
    if (typeof window === 'undefined') return INITIAL_NOTES;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window === 'undefined') return INITIAL_INVOICES;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [hearings, setHearings] = useState<HearingEvent[]>(() => {
    if (typeof window === 'undefined') return INITIAL_HEARINGS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HEARINGS);
      return saved ? JSON.parse(saved) : INITIAL_HEARINGS;
    } catch {
      return INITIAL_HEARINGS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [clientCredentials, setClientCredentials] = useState<ClientCredential[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CLIENT_CREDENTIALS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENT_CREDENTIALS);
      return saved ? JSON.parse(saved) : INITIAL_CLIENT_CREDENTIALS;
    } catch {
      return INITIAL_CLIENT_CREDENTIALS;
    }
  });

  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRACTICE_AREAS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRACTICE_AREAS);
      return saved ? JSON.parse(saved) : INITIAL_PRACTICE_AREAS;
    } catch {
      return INITIAL_PRACTICE_AREAS;
    }
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TEAM_MEMBERS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
      return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
    } catch {
      return INITIAL_TEAM_MEMBERS;
    }
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [insights, setInsights] = useState<LegalInsightItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_INSIGHTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
      return saved ? JSON.parse(saved) : INITIAL_INSIGHTS;
    } catch {
      return INITIAL_INSIGHTS;
    }
  });

  const [partners, setPartners] = useState<PartnerItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PARTNERS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
    } catch {
      return INITIAL_PARTNERS;
    }
  });

  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF_ACCOUNTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [clientVaultSecrets, setClientVaultSecrets] = useState<Record<string, ClientVaultSecret>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENT_VAULT_SECRETS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const clientsRef = useRef<Client[]>(clients);
  const casesRef = useRef<CaseFile[]>(cases);
  const noticesRef = useRef<FBRNotice[]>(notices);
  const documentsRef = useRef<DocumentItem[]>(documents);
  const tasksRef = useRef<InternalTask[]>(tasks);
  const notesRef = useRef<InternalNote[]>(notes);
  const invoicesRef = useRef<Invoice[]>(invoices);
  const hearingsRef = useRef<HearingEvent[]>(hearings);
  const notificationsRef = useRef<NotificationLog[]>(notifications);
  const clientCredentialsRef = useRef<ClientCredential[]>(clientCredentials);
  const hasAttemptedBackfillRef = useRef<boolean>(false);

  useEffect(() => {
    clientsRef.current = clients;
    casesRef.current = cases;
    noticesRef.current = notices;
    documentsRef.current = documents;
    tasksRef.current = tasks;
    notesRef.current = notes;
    invoicesRef.current = invoices;
    hearingsRef.current = hearings;
    notificationsRef.current = notifications;
    clientCredentialsRef.current = clientCredentials;
  }, [clients, cases, notices, documents, tasks, notes, invoices, hearings, notifications, clientCredentials]);

  // Helper to sync to Firestore and local storage
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const saveToFirestoreDoc = async (colName: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, colName, id), stripUndefined(data), { merge: true });
    } catch (err) {
      const info = buildFirestoreErrorInfo(err, OperationType.WRITE, `${colName}/${id}`);
      console.warn('Firestore write error:', JSON.stringify(info));
    }
  };



  const deleteFromFirestoreDoc = async (colName: string, id: string): Promise<{ ok: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return {
        ok: false,
        error: 'Active Firebase sign-in is required to delete records from the database.',
      };
    }
    try {
      await deleteDoc(doc(db, colName, id));
      return { ok: true };
    } catch (err) {
      const info = buildFirestoreErrorInfo(err, OperationType.DELETE, `${colName}/${id}`);
      console.warn('Firestore delete error:', JSON.stringify(info));
      return {
        ok: false,
        error: err instanceof Error ? err.message : `Failed to delete ${colName}/${id} from database.`,
      };
    }
  };

  // Setup Firestore Real-time Listeners and Auto-Seed if empty
  useEffect(() => {
    if (typeof window === 'undefined') return;

    getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration: client is offline.');
      }
    });

    const rawFirestoreClientsRef = { current: null as Client[] | null };
    const rawFirestoreCasesRef = { current: null as CaseFile[] | null };
    const rawFirestoreNoticesRef = { current: null as FBRNotice[] | null };
    const rawFirestoreDocsRef = { current: null as DocumentItem[] | null };
    const rawFirestoreTasksRef = { current: null as InternalTask[] | null };
    const rawFirestoreNotesRef = { current: null as InternalNote[] | null };
    const rawFirestoreInvoicesRef = { current: null as Invoice[] | null };
    const rawFirestoreHearingsRef = { current: null as HearingEvent[] | null };
    const rawFirestoreNotifsRef = { current: null as NotificationLog[] | null };
    const rawFirestoreCredsRef = { current: null as ClientCredential[] | null };
    let activeUserPermsRef: StaffPermission[] = [];

    const maybeBackfillAndSeedRegisters = () => {
      if (!auth.currentUser || hasAttemptedBackfillRef.current) return;
      if (!rawFirestoreClientsRef.current || !rawFirestoreCasesRef.current) return;

      const canDataEntry = activeUserPermsRef.includes('data_entry');
      if (!canDataEntry) return;

      const rawClients = rawFirestoreClientsRef.current;
      const rawCases = rawFirestoreCasesRef.current;
      const normalizedCls = normalizeClientList(rawClients, rawCases);
      const normalizedCzs = normalizeCaseList(rawCases, normalizedCls);

      // 1. Backfill any existing docs missing fileNumber / fileCategoryCode or accurate activeCasesCount
      rawClients.forEach((raw) => {
        const norm = normalizedCls.find((n) => n.id === raw.id);
        if (
          norm &&
          (!raw.fileNumber ||
            !raw.fileCategoryCode ||
            raw.activeCasesCount !== norm.activeCasesCount ||
            (raw.id === 'cli-101' && raw.category === 'Corporate' && !raw.fileCategoryCode))
        ) {
          saveToFirestoreDoc('clients', norm.id, norm);
        }
      });

      rawCases.forEach((raw) => {
        const norm = normalizedCzs.find((n) => n.id === raw.id);
        if (norm && (!raw.fileNumber || !raw.fileCategoryCode || !raw.caseCategory)) {
          saveToFirestoreDoc('cases', norm.id, norm);
        }
      });

      // 2. One-time seed of missing IT/ST/INC/CF sample series & linked records
      const needsSampleSeries =
        !rawClients.some((c) => c.id === 'cli-105') ||
        !rawClients.some((c) => c.id === 'cli-106') ||
        !rawClients.some((c) => c.id === 'cli-107');

      const alreadySeededLocal = localStorage.getItem('hisk_registers_seeded_v2') === 'done';
      if (!alreadySeededLocal && (rawClients.length > 0 && needsSampleSeries && !rawClients.some((c) => Boolean(c.fileNumber)))) {
        hasAttemptedBackfillRef.current = true;
        localStorage.setItem('hisk_registers_seeded_v2', 'done');

        const existingClientIds = new Set(rawClients.map((c) => c.id));
        INITIAL_CLIENTS.forEach((c) => {
          if (!existingClientIds.has(c.id)) saveToFirestoreDoc('clients', c.id, c);
        });

        const existingCaseIds = new Set(rawCases.map((c) => c.id));
        INITIAL_CASES.forEach((c) => {
          if (!existingCaseIds.has(c.id)) saveToFirestoreDoc('cases', c.id, c);
        });

        if (rawFirestoreNoticesRef.current) {
          const existingNoticeIds = new Set(rawFirestoreNoticesRef.current.map((n) => n.id));
          INITIAL_NOTICES.forEach((n) => {
            if (!existingNoticeIds.has(n.id)) saveToFirestoreDoc('notices', n.id, n);
          });
        }

        if (rawFirestoreHearingsRef.current) {
          const existingHearingIds = new Set(rawFirestoreHearingsRef.current.map((h) => h.id));
          INITIAL_HEARINGS.forEach((h) => {
            if (!existingHearingIds.has(h.id)) saveToFirestoreDoc('hearings', h.id, h);
          });
        }

        if (rawFirestoreCredsRef.current) {
          const existingCredIds = new Set(rawFirestoreCredsRef.current.map((c) => c.id));
          INITIAL_CLIENT_CREDENTIALS.forEach((c) => {
            if (!existingCredIds.has(c.id)) saveToFirestoreDoc('clientCredentials', c.id, c);
          });
        }

        if (rawFirestoreNotifsRef.current && activeUserPermsRef.includes('notifications')) {
          const existingNotifIds = new Set(rawFirestoreNotifsRef.current.map((n) => n.id));
          INITIAL_NOTIFICATIONS.forEach((n) => {
            if (!existingNotifIds.has(n.id)) saveToFirestoreDoc('notifications', n.id, n);
          });
        }

        if (rawFirestoreDocsRef.current && activeUserPermsRef.includes('document_management')) {
          const existingDocIds = new Set(rawFirestoreDocsRef.current.map((d) => d.id));
          INITIAL_DOCUMENTS.forEach((d) => {
            if (!existingDocIds.has(d.id)) saveToFirestoreDoc('documents', d.id, d);
          });
        }

        if (rawFirestoreTasksRef.current && (activeUserPermsRef.includes('tasks_notes') || canDataEntry)) {
          const existingTaskIds = new Set(rawFirestoreTasksRef.current.map((t) => t.id));
          INITIAL_TASKS.forEach((t) => {
            if (!existingTaskIds.has(t.id)) saveToFirestoreDoc('tasks', t.id, t);
          });
        }

        if (rawFirestoreNotesRef.current && (activeUserPermsRef.includes('tasks_notes') || canDataEntry)) {
          const existingNoteIds = new Set(rawFirestoreNotesRef.current.map((n) => n.id));
          INITIAL_NOTES.forEach((n) => {
            if (!existingNoteIds.has(n.id)) saveToFirestoreDoc('notes', n.id, n);
          });
        }

        if (rawFirestoreInvoicesRef.current && activeUserPermsRef.includes('billing')) {
          const existingInvIds = new Set(rawFirestoreInvoicesRef.current.map((i) => i.id));
          INITIAL_INVOICES.forEach((i) => {
            if (!existingInvIds.has(i.id)) saveToFirestoreDoc('invoices', i.id, i);
          });
        }
      } else {
        hasAttemptedBackfillRef.current = true;
      }
    };

    // 1. Clients
    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('clients')) {
          markCollectionSeeded('clients');
          INITIAL_CLIENTS.forEach((c) => saveToFirestoreDoc('clients', c.id, c));
        } else {
          rawFirestoreClientsRef.current = [];
          setClients([]);
          saveToStorage(STORAGE_KEYS.CLIENTS, []);
        }
      } else {
        markCollectionSeeded('clients');
        const items = snap.docs.map((d) => d.data() as Client);
        rawFirestoreClientsRef.current = items;
        const currentCases = rawFirestoreCasesRef.current || casesRef.current;
        const normalizedClients = normalizeClientList(items, currentCases);
        setClients(normalizedClients);
        saveToStorage(STORAGE_KEYS.CLIENTS, normalizedClients);
        if (rawFirestoreCasesRef.current) {
          const normalizedCases = normalizeCaseList(rawFirestoreCasesRef.current, normalizedClients);
          setCases(normalizedCases);
          saveToStorage(STORAGE_KEYS.CASES, normalizedCases);
        }
        maybeBackfillAndSeedRegisters();
      }
    }, (err) => console.warn('Clients snapshot error:', err));

    // 2. Cases
    const unsubCases = onSnapshot(collection(db, 'cases'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('cases')) {
          markCollectionSeeded('cases');
          INITIAL_CASES.forEach((c) => saveToFirestoreDoc('cases', c.id, c));
        } else {
          rawFirestoreCasesRef.current = [];
          setCases([]);
          saveToStorage(STORAGE_KEYS.CASES, []);
        }
      } else {
        markCollectionSeeded('cases');
        const items = snap.docs.map((d) => d.data() as CaseFile);
        rawFirestoreCasesRef.current = items;
        const currentClients = rawFirestoreClientsRef.current || clientsRef.current;
        const normalizedClients = normalizeClientList(currentClients, items);
        const normalizedCases = normalizeCaseList(items, normalizedClients);
        setClients(normalizedClients);
        saveToStorage(STORAGE_KEYS.CLIENTS, normalizedClients);
        setCases(normalizedCases);
        saveToStorage(STORAGE_KEYS.CASES, normalizedCases);
        maybeBackfillAndSeedRegisters();
      }
    }, (err) => console.warn('Cases snapshot error:', err));

    // 3. Notices
    const unsubNotices = onSnapshot(collection(db, 'notices'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('notices')) {
          markCollectionSeeded('notices');
          INITIAL_NOTICES.forEach((n) => saveToFirestoreDoc('notices', n.id, n));
        } else {
          rawFirestoreNoticesRef.current = [];
          setNotices([]);
          saveToStorage(STORAGE_KEYS.NOTICES, []);
        }
      } else {
        markCollectionSeeded('notices');
        const items = snap.docs.map((d) => d.data() as FBRNotice);
        rawFirestoreNoticesRef.current = items;
        setNotices(items);
        saveToStorage(STORAGE_KEYS.NOTICES, items);
      }
    }, (err) => console.warn('Notices snapshot error:', err));

    // 4. Documents
    const unsubDocs = onSnapshot(collection(db, 'documents'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('documents')) {
          markCollectionSeeded('documents');
          INITIAL_DOCUMENTS.forEach((d) => saveToFirestoreDoc('documents', d.id, d));
        } else {
          rawFirestoreDocsRef.current = [];
          setDocuments([]);
          saveToStorage(STORAGE_KEYS.DOCUMENTS, []);
        }
      } else {
        markCollectionSeeded('documents');
        const items = snap.docs.map((d) => d.data() as DocumentItem);
        rawFirestoreDocsRef.current = items;
        setDocuments(items);
        saveToStorage(STORAGE_KEYS.DOCUMENTS, items);
      }
    }, (err) => console.warn('Documents snapshot error:', err));

    // 5. Tasks
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('tasks')) {
          markCollectionSeeded('tasks');
          INITIAL_TASKS.forEach((t) => saveToFirestoreDoc('tasks', t.id, t));
        } else {
          rawFirestoreTasksRef.current = [];
          setTasks([]);
          saveToStorage(STORAGE_KEYS.TASKS, []);
        }
      } else {
        markCollectionSeeded('tasks');
        const items = snap.docs.map((d) => d.data() as InternalTask);
        rawFirestoreTasksRef.current = items;
        setTasks(items);
        saveToStorage(STORAGE_KEYS.TASKS, items);
      }
    }, (err) => console.warn('Tasks snapshot error:', err));

    // 6. Notes
    const unsubNotes = onSnapshot(collection(db, 'notes'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('notes')) {
          markCollectionSeeded('notes');
          INITIAL_NOTES.forEach((n) => saveToFirestoreDoc('notes', n.id, n));
        } else {
          rawFirestoreNotesRef.current = [];
          setNotes([]);
          saveToStorage(STORAGE_KEYS.NOTES, []);
        }
      } else {
        markCollectionSeeded('notes');
        const items = snap.docs.map((d) => d.data() as InternalNote);
        rawFirestoreNotesRef.current = items;
        setNotes(items);
        saveToStorage(STORAGE_KEYS.NOTES, items);
      }
    }, (err) => console.warn('Notes snapshot error:', err));

    // 7. Invoices
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('invoices')) {
          markCollectionSeeded('invoices');
          INITIAL_INVOICES.forEach((i) => saveToFirestoreDoc('invoices', i.id, i));
        } else {
          rawFirestoreInvoicesRef.current = [];
          setInvoices([]);
          saveToStorage(STORAGE_KEYS.INVOICES, []);
        }
      } else {
        markCollectionSeeded('invoices');
        const items = snap.docs.map((d) => d.data() as Invoice);
        rawFirestoreInvoicesRef.current = items;
        setInvoices(items);
        saveToStorage(STORAGE_KEYS.INVOICES, items);
      }
    }, (err) => console.warn('Invoices snapshot error:', err));

    // 8. Hearings
    const unsubHearings = onSnapshot(collection(db, 'hearings'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('hearings')) {
          markCollectionSeeded('hearings');
          INITIAL_HEARINGS.forEach((h) => saveToFirestoreDoc('hearings', h.id, h));
        } else {
          rawFirestoreHearingsRef.current = [];
          setHearings([]);
          saveToStorage(STORAGE_KEYS.HEARINGS, []);
        }
      } else {
        markCollectionSeeded('hearings');
        const items = snap.docs.map((d) => d.data() as HearingEvent);
        rawFirestoreHearingsRef.current = items;
        setHearings(items);
        saveToStorage(STORAGE_KEYS.HEARINGS, items);
      }
    }, (err) => console.warn('Hearings snapshot error:', err));

    // 9. Notifications
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('notifications')) {
          markCollectionSeeded('notifications');
          INITIAL_NOTIFICATIONS.forEach((n) => saveToFirestoreDoc('notifications', n.id, n));
        } else {
          rawFirestoreNotifsRef.current = [];
          setNotifications([]);
          saveToStorage(STORAGE_KEYS.NOTIFICATIONS, []);
        }
      } else {
        markCollectionSeeded('notifications');
        const items = snap.docs.map((d) => d.data() as NotificationLog);
        rawFirestoreNotifsRef.current = items;
        setNotifications(items);
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, items);
      }
    }, (err) => console.warn('Notifications snapshot error:', err));

    // 10. Client Credentials
    const unsubCreds = onSnapshot(collection(db, 'clientCredentials'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('clientCredentials')) {
          markCollectionSeeded('clientCredentials');
          INITIAL_CLIENT_CREDENTIALS.forEach((c) => saveToFirestoreDoc('clientCredentials', c.id, c));
        } else {
          rawFirestoreCredsRef.current = [];
          setClientCredentials([]);
          saveToStorage(STORAGE_KEYS.CLIENT_CREDENTIALS, []);
        }
      } else {
        markCollectionSeeded('clientCredentials');
        const items = snap.docs.map((d) => d.data() as ClientCredential);
        rawFirestoreCredsRef.current = items;
        setClientCredentials(items);
        saveToStorage(STORAGE_KEYS.CLIENT_CREDENTIALS, items);
      }
    }, (err) => console.warn('Client Credentials snapshot error:', err));

    // 11. Practice Areas
    const unsubPracticeAreas = onSnapshot(collection(db, 'practice_areas'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('practice_areas')) {
          markCollectionSeeded('practice_areas');
          INITIAL_PRACTICE_AREAS.forEach((pa) => saveToFirestoreDoc('practice_areas', pa.id, pa));
        } else {
          setPracticeAreas([]);
          saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, []);
        }
      } else {
        markCollectionSeeded('practice_areas');
        const items = snap.docs.map((d) => d.data() as PracticeArea);
        setPracticeAreas(items);
        saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, items);
      }
    }, (err) => console.warn('Practice Areas snapshot error:', err));

    // 12. Team Members
    const unsubTeam = onSnapshot(collection(db, 'team_members'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('team_members')) {
          markCollectionSeeded('team_members');
          INITIAL_TEAM_MEMBERS.forEach((m) => saveToFirestoreDoc('team_members', m.id, m));
        } else {
          setTeamMembers([]);
          saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, []);
        }
      } else {
        markCollectionSeeded('team_members');
        const items = snap.docs.map((d) => d.data() as TeamMember);
        // Sort by order or ceo first
        items.sort((a, b) => {
          if (a.isCeo && !b.isCeo) return -1;
          if (!a.isCeo && b.isCeo) return 1;
          return (a.order || 99) - (b.order || 99);
        });
        setTeamMembers(items);
        saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, items);
      }
    }, (err) => console.warn('Team Members snapshot error:', err));

    // 13. Client Reviews & Testimonials
    const unsubReviews = onSnapshot(collection(db, 'client_reviews'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('client_reviews')) {
          markCollectionSeeded('client_reviews');
          INITIAL_REVIEWS.forEach((r) => saveToFirestoreDoc('client_reviews', r.id, r));
        } else {
          setReviews([]);
          saveToStorage(STORAGE_KEYS.REVIEWS, []);
        }
      } else {
        markCollectionSeeded('client_reviews');
        const items = snap.docs.map((d) => d.data() as ReviewItem);
        setReviews(items);
        saveToStorage(STORAGE_KEYS.REVIEWS, items);
      }
    }, (err) => console.warn('Client Reviews snapshot error:', err));

    // 14. Legal Insights & Blog Articles
    const unsubInsights = onSnapshot(collection(db, 'legal_insights'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('legal_insights')) {
          markCollectionSeeded('legal_insights');
          INITIAL_INSIGHTS.forEach((ins) => saveToFirestoreDoc('legal_insights', ins.id, ins));
        } else {
          setInsights([]);
          saveToStorage(STORAGE_KEYS.INSIGHTS, []);
        }
      } else {
        markCollectionSeeded('legal_insights');
        const items = snap.docs.map((d) => d.data() as LegalInsightItem);
        setInsights(items);
        saveToStorage(STORAGE_KEYS.INSIGHTS, items);
      }
    }, (err) => console.warn('Legal Insights snapshot error:', err));

    // 15. Membership & Partners
    const unsubPartners = onSnapshot(collection(db, 'membership_partners'), (snap) => {
      if (snap.empty) {
        if (!hasSeededCollection('membership_partners')) {
          markCollectionSeeded('membership_partners');
          INITIAL_PARTNERS.forEach((p) => saveToFirestoreDoc('membership_partners', p.id, p));
        } else {
          setPartners([]);
          saveToStorage(STORAGE_KEYS.PARTNERS, []);
        }
      } else {
        markCollectionSeeded('membership_partners');
        const items = snap.docs.map((d) => d.data() as PartnerItem);
        items.sort((a, b) => (a.order || 99) - (b.order || 99));
        setPartners(items);
        saveToStorage(STORAGE_KEYS.PARTNERS, items);
      }
    }, (err) => console.warn('Membership Partners snapshot error:', err));

    // 16. Staff & Employee Access Control + Staff-Only Client Vault Secrets
    let unsubStaffList: (() => void) | null = null;
    let unsubSelfStaff: (() => void) | null = null;
    let unsubVaultSecrets: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubStaffList) {
        unsubStaffList();
        unsubStaffList = null;
      }
      if (unsubSelfStaff) {
        unsubSelfStaff();
        unsubSelfStaff = null;
      }
      if (unsubVaultSecrets) {
        unsubVaultSecrets();
        unsubVaultSecrets = null;
      }

      const email = user?.email?.trim().toLowerCase();
      if (!email) return;

      const isSuperAdmin = isSuperAdminEmail(email);
      let canManageStaff = isSuperAdmin;
      let canManageClients = isSuperAdmin;
      activeUserPermsRef = isSuperAdmin
        ? ['dashboard', 'data_entry', 'document_management', 'tasks_notes', 'billing', 'notifications', 'content_cms', 'staff_management']
        : [];

      if (!isSuperAdmin) {
        try {
          const selfSnap = await getDoc(doc(db, 'staff_accounts', email));
          if (selfSnap.exists()) {
            const selfData = selfSnap.data() as StaffAccount;
            const activePerms =
              selfData.status === 'Active' && Array.isArray(selfData.permissions)
                ? selfData.permissions
                : [];
            activeUserPermsRef = activePerms;
            canManageStaff = activePerms.includes('staff_management');
            canManageClients = activePerms.includes('data_entry');
          }
        } catch (err) {
          console.warn('Self staff lookup error:', err);
        }

        unsubSelfStaff = onSnapshot(
          doc(db, 'staff_accounts', email),
          (docSnap) => {
            if (docSnap.exists()) {
              const selfData = docSnap.data() as StaffAccount;
              const resolved = resolveStaffPermissions(email, [selfData]);
              activeUserPermsRef = resolved.permissions;
              setStaffAccounts((prev) => {
                const others = prev.filter((item) => item.id !== selfData.id && item.email.toLowerCase() !== email);
                const merged = [selfData, ...others];
                saveToStorage(STORAGE_KEYS.STAFF_ACCOUNTS, merged);
                return merged;
              });
              maybeBackfillAndSeedRegisters();
            }
          },
          (err) => console.warn('Self staff snapshot error:', err)
        );
      }

      maybeBackfillAndSeedRegisters();

      if (canManageStaff) {
        unsubStaffList = onSnapshot(
          collection(db, 'staff_accounts'),
          (snap) => {
            const items = snap.docs.map((d) => d.data() as StaffAccount);
            items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setStaffAccounts(items);
            saveToStorage(STORAGE_KEYS.STAFF_ACCOUNTS, items);
          },
          (err) => {
            const info = buildFirestoreErrorInfo(err, OperationType.LIST, 'staff_accounts');
            console.error('Firestore Error: ', JSON.stringify(info));
          }
        );
      }

      if (canManageClients) {
        unsubVaultSecrets = onSnapshot(
          collection(db, 'client_vault_secrets'),
          (snap) => {
            const map: Record<string, ClientVaultSecret> = {};
            snap.docs.forEach((d) => {
              const data = d.data() as ClientVaultSecret;
              map[d.id] = { ...data, clientId: data.clientId || d.id };
            });
            setClientVaultSecrets(map);
            saveToStorage(STORAGE_KEYS.CLIENT_VAULT_SECRETS, map);
          },
          (err) => {
            const info = buildFirestoreErrorInfo(err, OperationType.LIST, 'client_vault_secrets');
            console.warn('Client vault secrets snapshot error:', JSON.stringify(info));
          }
        );
      }
    });

    return () => {
      unsubClients();
      unsubCases();
      unsubNotices();
      unsubDocs();
      unsubTasks();
      unsubNotes();
      unsubInvoices();
      unsubHearings();
      unsubNotifs();
      unsubCreds();
      unsubPracticeAreas();
      unsubTeam();
      unsubReviews();
      unsubInsights();
      unsubPartners();
      unsubAuth();
      if (unsubStaffList) unsubStaffList();
      if (unsubSelfStaff) unsubSelfStaff();
      if (unsubVaultSecrets) unsubVaultSecrets();
    };
  }, []);

  // --- CLIENT ACTIONS ---
  const saveClientVaultSecret = (
    clientId: string,
    secretsOrSecpPassword?:
      | string
      | {
          irisPassword?: string;
          fbrPstPassword?: string;
          secpPassword?: string;
          secpPin?: string;
        },
    secpPin?: string
  ) => {
    const existing = clientVaultSecrets[clientId];
    const incoming =
      typeof secretsOrSecpPassword === 'object' && secretsOrSecpPassword !== null
        ? secretsOrSecpPassword
        : {
            secpPassword: secretsOrSecpPassword,
            secpPin,
          };

    const secretDoc: ClientVaultSecret = stripUndefined({
      clientId,
      irisPassword:
        incoming.irisPassword !== undefined ? incoming.irisPassword.trim() : existing?.irisPassword || '',
      fbrPstPassword:
        incoming.fbrPstPassword !== undefined
          ? incoming.fbrPstPassword.trim()
          : existing?.fbrPstPassword || '',
      secpPassword:
        incoming.secpPassword !== undefined ? incoming.secpPassword.trim() : existing?.secpPassword || '',
      secpPin: incoming.secpPin !== undefined ? incoming.secpPin.trim() : existing?.secpPin || '',
      updatedAt: getTodayDateString(),
    });
    setClientVaultSecrets((prev) => {
      const nextMap = { ...prev, [clientId]: secretDoc };
      saveToStorage(STORAGE_KEYS.CLIENT_VAULT_SECRETS, nextMap);
      return nextMap;
    });
    saveToFirestoreDoc('client_vault_secrets', clientId, secretDoc);
  };

  const addClient = (
    client: Omit<Client, 'id' | 'createdAt' | 'activeCasesCount' | 'totalTaxSaved'> & {
      irisPassword?: string;
      fbrPstPassword?: string;
      secpPassword?: string;
      secpPin?: string;
    },
    loginEmail?: string,
    loginPassword?: string
  ) => {
    const newId = createUniqueId('cli');
    const { irisPassword, fbrPstPassword, secpPassword, secpPin, ...publicClientFields } = client;
    const newClient: Client = stripUndefined({
      ...publicClientFields,
      id: newId,
      activeCasesCount: 0,
      totalTaxSaved: 'Rs. 0',
      createdAt: getTodayDateString()
    });
    setClients((prev) => {
      const updated = [newClient, ...prev];
      saveToStorage(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    });
    saveToFirestoreDoc('clients', newClient.id, newClient);

    if (irisPassword || fbrPstPassword || secpPassword || secpPin) {
      saveClientVaultSecret(newClient.id, {
        irisPassword,
        fbrPstPassword,
        secpPassword,
        secpPin,
      });
    }

    // Save client login credential if provided
    if (loginEmail && loginPassword) {
      addClientCredential({
        clientId: newClient.id,
        clientName: newClient.name,
        email: loginEmail,
        password: loginPassword
      });
    }

    return newClient;
  };

  const updateClient = (
    clientId: string,
    updatedData: Partial<Client> & {
      irisPassword?: string;
      fbrPstPassword?: string;
      secpPassword?: string;
      secpPin?: string;
    }
  ) => {
    const { irisPassword, fbrPstPassword, secpPassword, secpPin, ...publicUpdates } = updatedData;
    const existingClient = clientsRef.current.find((c) => c.id === clientId);
    const mergedClient = existingClient
      ? stripUndefined({ ...existingClient, ...publicUpdates })
      : null;

    setClients((prev) => {
      const updated = prev.map((c) => (c.id === clientId && mergedClient ? mergedClient : c));
      saveToStorage(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    });

    if (mergedClient) {
      saveToFirestoreDoc('clients', clientId, mergedClient);

      // Cascade updates to linked Cases, Notices, Invoices, Hearings, and Client Credentials
      const affectedCaseIds = new Set<string>();
      setCases((prev) => {
        let changed = false;
        const nextCases = prev.map((cs) => {
          if (cs.clientId === clientId) {
            affectedCaseIds.add(cs.id);
            const nextCase: CaseFile = stripUndefined({
              ...cs,
              fileNumber: mergedClient.fileNumber,
              fileCategoryCode: mergedClient.fileCategoryCode,
              clientName: mergedClient.name,
              clientNtn: mergedClient.ntn || cs.clientNtn,
            });
            changed = true;
            saveToFirestoreDoc('cases', cs.id, nextCase);
            return nextCase;
          }
          return cs;
        });
        if (changed) saveToStorage(STORAGE_KEYS.CASES, nextCases);
        return changed ? nextCases : prev;
      });

      setNotices((prev) => {
        let changed = false;
        const nextNotices = prev.map((n) => {
          if (n.clientId === clientId && n.clientName !== mergedClient.name) {
            const nextNotice = { ...n, clientName: mergedClient.name };
            changed = true;
            saveToFirestoreDoc('notices', n.id, nextNotice);
            return nextNotice;
          }
          return n;
        });
        if (changed) saveToStorage(STORAGE_KEYS.NOTICES, nextNotices);
        return changed ? nextNotices : prev;
      });

      setInvoices((prev) => {
        let changed = false;
        const nextInvoices = prev.map((inv) => {
          if (inv.clientId === clientId && (inv.clientName !== mergedClient.name || inv.clientNtn !== mergedClient.ntn)) {
            const nextInv = {
              ...inv,
              clientName: mergedClient.name,
              clientNtn: mergedClient.ntn || inv.clientNtn,
            };
            changed = true;
            saveToFirestoreDoc('invoices', inv.id, nextInv);
            return nextInv;
          }
          return inv;
        });
        if (changed) saveToStorage(STORAGE_KEYS.INVOICES, nextInvoices);
        return changed ? nextInvoices : prev;
      });

      setHearings((prev) => {
        const linkedCaseIdSet = new Set(
          casesRef.current.filter((cs) => cs.clientId === clientId).map((cs) => cs.id)
        );
        affectedCaseIds.forEach((id) => linkedCaseIdSet.add(id));
        let changed = false;
        const nextHearings = prev.map((h) => {
          if (linkedCaseIdSet.has(h.caseId) && h.clientName !== mergedClient.name) {
            const nextH = { ...h, clientName: mergedClient.name };
            changed = true;
            saveToFirestoreDoc('hearings', h.id, nextH);
            return nextH;
          }
          return h;
        });
        if (changed) saveToStorage(STORAGE_KEYS.HEARINGS, nextHearings);
        return changed ? nextHearings : prev;
      });

      setClientCredentials((prev) => {
        let changed = false;
        const nextCreds = prev.map((cred) => {
          const emailChanged = Boolean(mergedClient.email && cred.email !== mergedClient.email);
          if (cred.clientId === clientId && (cred.clientName !== mergedClient.name || emailChanged)) {
            const nextCred = {
              ...cred,
              clientName: mergedClient.name,
              email: mergedClient.email || cred.email,
            };
            changed = true;
            saveToFirestoreDoc('clientCredentials', cred.id, nextCred);
            return nextCred;
          }
          return cred;
        });
        if (changed) saveToStorage(STORAGE_KEYS.CLIENT_CREDENTIALS, nextCreds);
        return changed ? nextCreds : prev;
      });
    }

    if (
      irisPassword !== undefined ||
      fbrPstPassword !== undefined ||
      secpPassword !== undefined ||
      secpPin !== undefined
    ) {
      saveClientVaultSecret(clientId, {
        irisPassword,
        fbrPstPassword,
        secpPassword,
        secpPin,
      });
    }
  };

  const addClientCredential = (cred: Omit<ClientCredential, 'id' | 'createdAt'>) => {
    const newCred: ClientCredential = {
      ...cred,
      id: createUniqueId('cred'),
      createdAt: getTodayDateString()
    };
    setClientCredentials((prev) => {
      const updated = [
        newCred,
        ...prev.filter(
          (c) => c.email.toLowerCase() !== cred.email.toLowerCase() && c.clientId !== cred.clientId
        )
      ];
      saveToStorage(STORAGE_KEYS.CLIENT_CREDENTIALS, updated);
      return updated;
    });
    saveToFirestoreDoc('clientCredentials', newCred.id, newCred);
    return newCred;
  };

  // --- CASE ACTIONS ---
  const addCase = (caseData: {
    title: string;
    clientId: string;
    caseCategory?: CaseCategory;
    assignedCounsel: string;
    forum: LegalForum;
    taxYear: string;
    status: CaseStatus;
    riskLevel: RiskLevel;
    demandAmountPkr: number;
    summary: string;
    nextHearingDate?: string;
    nextHearingPurpose?: string;
    clientLoginEmail?: string;
    clientLoginPassword?: string;
  }) => {
    const client =
      clientsRef.current.find((c) => c.id === caseData.clientId) || clientsRef.current[0];
    const resolvedClientId = client ? client.id : caseData.clientId;
    const forumTag =
      caseData.forum
        .replace(/[^A-Za-z]/g, '')
        .slice(0, 4)
        .toUpperCase() || 'CASE';

    const newCase: CaseFile = stripUndefined({
      id: `case-${getCurrentYearNumber()}-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
      caseRef: `HISK-${forumTag}-${createUniqueId('')}`,
      fileNumber: client?.fileNumber,
      fileCategoryCode: client?.fileCategoryCode || (client ? inferClientFileCode(client) : undefined),
      clientId: resolvedClientId,
      clientName: client ? client.name : 'Corporate Client',
      clientNtn: client ? client.ntn || 'N/A' : 'N/A',
      caseTitle: caseData.title,
      caseCategory: caseData.caseCategory || 'Tax & FBR Litigation',
      assignedCounsel: caseData.assignedCounsel,
      assignedCounselTitle: 'Advocate High Court | HISK LEGAL',
      forum: caseData.forum,
      taxYear: caseData.taxYear,
      status: caseData.status,
      riskLevel: caseData.riskLevel,
      demandAmountPkr: caseData.demandAmountPkr,
      savedAmountPkr: 0,
      auditStage: 1,
      summary: caseData.summary,
      nextHearingDate: caseData.nextHearingDate,
      nextHearingPurpose: caseData.nextHearingPurpose,
      createdAt: getTodayDateString(),
      timeline: [
        {
          id: createFullTimestampId('tl'),
          date: getTodayDateString(),
          title: 'Case Registered at HISK LEGAL',
          forum: caseData.forum,
          description: `Case opened under ${caseData.assignedCounsel} lead representation.`,
          advocateName: caseData.assignedCounsel
        }
      ]
    });

    setCases((prev) => {
      const updatedCases = [newCase, ...prev];
      saveToStorage(STORAGE_KEYS.CASES, updatedCases);
      return updatedCases;
    });
    saveToFirestoreDoc('cases', newCase.id, newCase);

    // Save client login credential if created during case creation
    if (caseData.clientLoginEmail && caseData.clientLoginPassword) {
      addClientCredential({
        clientId: resolvedClientId,
        clientName: client ? client.name : 'Client',
        email: caseData.clientLoginEmail,
        password: caseData.clientLoginPassword
      });
    }

    // If initial hearing date is provided, add hearing event to calendar automatically
    if (caseData.nextHearingDate) {
      const newHearing: HearingEvent = {
        id: createFullTimestampId('h'),
        caseId: newCase.id,
        caseTitle: newCase.caseTitle,
        clientName: newCase.clientName,
        date: caseData.nextHearingDate,
        time: '10:00 AM',
        forum: caseData.forum,
        bench: 'Honourable High Court / Appellate Tribunal Bench',
        counselAssigned: caseData.assignedCounsel,
        purpose: caseData.nextHearingPurpose || 'Initial Hearing & Cause List Appearance',
        priority: caseData.riskLevel === 'Critical' ? 'High' : 'Medium'
      };
      setHearings((prev) => {
        const updatedHearings = [newHearing, ...prev];
        saveToStorage(STORAGE_KEYS.HEARINGS, updatedHearings);
        return updatedHearings;
      });
      saveToFirestoreDoc('hearings', newHearing.id, newHearing);
    }

    // Update active case count for client using functional state updater
    if (client) {
      setClients((prev) => {
        const updatedClients = prev.map((c) => {
          if (c.id === client.id) {
            const nextClient = { ...c, activeCasesCount: (c.activeCasesCount || 0) + 1 };
            saveToFirestoreDoc('clients', nextClient.id, nextClient);
            return nextClient;
          }
          return c;
        });
        saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
        return updatedClients;
      });
    }

    return newCase;
  };

  const updateCase = (caseId: string, updatedData: Partial<CaseFile> & { clientLoginEmail?: string; clientLoginPassword?: string }) => {
    const existingCase = casesRef.current.find((c) => c.id === caseId);
    const resolvedClient = updatedData.clientId
      ? clientsRef.current.find((cl) => cl.id === updatedData.clientId)
      : existingCase
      ? clientsRef.current.find((cl) => cl.id === existingCase.clientId)
      : undefined;

    let updatedTargetDoc: CaseFile | null = existingCase
      ? stripUndefined({
          ...existingCase,
          ...updatedData,
          ...(resolvedClient
            ? {
                clientId: resolvedClient.id,
                clientName: resolvedClient.name,
                clientNtn: resolvedClient.ntn || 'N/A',
                fileNumber: resolvedClient.fileNumber,
                fileCategoryCode: resolvedClient.fileCategoryCode,
              }
            : {}),
        })
      : null;

    setCases((prev) => {
      const updated = prev.map((c) => (c.id === caseId && updatedTargetDoc ? updatedTargetDoc : c));
      saveToStorage(STORAGE_KEYS.CASES, updated);
      return updated;
    });
    if (updatedTargetDoc) {
      saveToFirestoreDoc('cases', caseId, updatedTargetDoc);
    }

    // Sync client login credential if provided
    if (updatedTargetDoc && updatedData.clientLoginEmail && updatedData.clientLoginPassword) {
      addClientCredential({
        clientId: updatedTargetDoc.clientId,
        clientName: updatedTargetDoc.clientName,
        email: updatedData.clientLoginEmail,
        password: updatedData.clientLoginPassword
      });
    }

    // Sync hearing if nextHearingDate provided
    if (updatedTargetDoc && updatedData.nextHearingDate) {
      const targetCase = updatedTargetDoc;
      const existingIdx = hearingsRef.current.findIndex(
        (h) => h.caseId === caseId && h.date === updatedData.nextHearingDate
      );
      if (existingIdx === -1) {
        const newHearing: HearingEvent = {
          id: createFullTimestampId('h'),
          caseId,
          caseTitle: targetCase.caseTitle,
          clientName: targetCase.clientName,
          date: updatedData.nextHearingDate,
          time: '10:00 AM',
          forum: targetCase.forum,
          bench: 'Honourable High Court / Appellate Bench',
          counselAssigned: targetCase.assignedCounsel,
          purpose: targetCase.nextHearingPurpose || 'Court Hearing Proceedings',
          priority: targetCase.riskLevel === 'Critical' ? 'High' : 'Medium'
        };
        setHearings((prev) => {
          const updatedH = [newHearing, ...prev];
          saveToStorage(STORAGE_KEYS.HEARINGS, updatedH);
          return updatedH;
        });
        saveToFirestoreDoc('hearings', newHearing.id, newHearing);
      }
    }
  };

  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, newStage?: number) => {
    setCases((prev) => {
      let updatedTargetDoc: CaseFile | null = null;
      const updated = prev.map((c) => {
        if (c.id === caseId) {
          const docObj = {
            ...c,
            status: newStatus,
            auditStage: newStage !== undefined ? newStage : c.auditStage
          };
          updatedTargetDoc = docObj;
          return docObj;
        }
        return c;
      });
      saveToStorage(STORAGE_KEYS.CASES, updated);
      if (updatedTargetDoc) {
        saveToFirestoreDoc('cases', caseId, updatedTargetDoc);
      }
      return updated;
    });
  };

  const addTimelineEvent = (caseId: string, event: {
    title: string;
    forum: LegalForum;
    description: string;
    advocateName: string;
    outcome?: string;
  }) => {
    setCases((prev) => {
      let updatedTargetDoc: CaseFile | null = null;
      const updated = prev.map((c) => {
        if (c.id === caseId) {
          const newItem = {
            id: createFullTimestampId('tl'),
            date: getTodayDateString(),
            ...event
          };
          const docObj = {
            ...c,
            timeline: [newItem, ...c.timeline]
          };
          updatedTargetDoc = docObj;
          return docObj;
        }
        return c;
      });
      saveToStorage(STORAGE_KEYS.CASES, updated);
      if (updatedTargetDoc) {
        saveToFirestoreDoc('cases', caseId, updatedTargetDoc);
      }
      return updated;
    });
  };

  // --- NOTICE ACTIONS ---
  const addNotice = (notice: Omit<FBRNotice, 'id' | 'clientName'>) => {
    const linkedCase = casesRef.current.find((c) => c.id === notice.caseId);
    const resolvedClientId = notice.clientId || linkedCase?.clientId || clientsRef.current[0]?.id || '';
    const client = clientsRef.current.find((c) => c.id === resolvedClientId);
    const newNotice: FBRNotice = {
      ...notice,
      clientId: resolvedClientId,
      id: createUniqueId('not'),
      clientName: client ? client.name : (linkedCase?.clientName || 'Client')
    };
    setNotices((prev) => {
      const updated = [newNotice, ...prev];
      saveToStorage(STORAGE_KEYS.NOTICES, updated);
      return updated;
    });
    saveToFirestoreDoc('notices', newNotice.id, newNotice);
    return newNotice;
  };

  const updateNoticeStatus = (noticeId: string, status: FBRNotice['status']) => {
    setNotices((prev) => {
      let updatedDoc: FBRNotice | null = null;
      const updated = prev.map((n) => {
        if (n.id === noticeId) {
          const obj = { ...n, status };
          updatedDoc = obj;
          return obj;
        }
        return n;
      });
      saveToStorage(STORAGE_KEYS.NOTICES, updated);
      if (updatedDoc) {
        saveToFirestoreDoc('notices', noticeId, updatedDoc);
      }
      return updated;
    });
  };

  // --- DOCUMENT ACTIONS ---
  const addDocument = (docItem: Omit<DocumentItem, 'id' | 'uploadedAt'>) => {
    const newDoc: DocumentItem = {
      ...docItem,
      id: createUniqueId('doc'),
      uploadedAt: getTodayDateString()
    };
    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      saveToStorage(STORAGE_KEYS.DOCUMENTS, updated);
      return updated;
    });
    saveToFirestoreDoc('documents', newDoc.id, newDoc);
    return newDoc;
  };

  // --- TASK ACTIONS ---
  const addTask = (task: Omit<InternalTask, 'id' | 'isCompleted'>) => {
    const newTask: InternalTask = {
      ...task,
      id: createUniqueId('task'),
      isCompleted: false
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      saveToStorage(STORAGE_KEYS.TASKS, updated);
      return updated;
    });
    saveToFirestoreDoc('tasks', newTask.id, newTask);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) => {
      let updatedDoc: InternalTask | null = null;
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const obj = { ...t, isCompleted: !t.isCompleted };
          updatedDoc = obj;
          return obj;
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updated);
      if (updatedDoc) {
        saveToFirestoreDoc('tasks', taskId, updatedDoc);
      }
      return updated;
    });
  };

  // --- NOTE ACTIONS ---
  const addNote = (note: Omit<InternalNote, 'id' | 'date'>) => {
    const newNote: InternalNote = {
      ...note,
      id: createUniqueId('note'),
      date: getTodayDateString()
    };
    setNotes((prev) => {
      const updated = [newNote, ...prev];
      saveToStorage(STORAGE_KEYS.NOTES, updated);
      return updated;
    });
    saveToFirestoreDoc('notes', newNote.id, newNote);
  };

  // --- INVOICE ACTIONS ---
  const addInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'clientName' | 'clientNtn'>) => {
    const linkedCase = casesRef.current.find((c) => c.id === inv.caseId);
    const resolvedClientId = inv.clientId || linkedCase?.clientId || clientsRef.current[0]?.id || '';
    const client = clientsRef.current.find((c) => c.id === resolvedClientId);
    const randomSuffix = String(Math.floor(100 + Math.random() * 900));
    const newInv: Invoice = {
      ...inv,
      clientId: resolvedClientId,
      id: createUniqueId('inv'),
      invoiceNumber: `HISK-INV-${getCurrentYearNumber()}-${randomSuffix}`,
      clientName: client ? client.name : (linkedCase?.clientName || 'Client'),
      clientNtn: client ? (client.ntn || 'N/A') : (linkedCase?.clientNtn || 'N/A')
    };
    setInvoices((prev) => {
      const updated = [newInv, ...prev];
      saveToStorage(STORAGE_KEYS.INVOICES, updated);
      return updated;
    });
    saveToFirestoreDoc('invoices', newInv.id, newInv);
    return newInv;
  };

  const markInvoicePaid = (invId: string, paymentMethod: 'Bank Transfer' | 'PayOrder / Cheque' | 'Online PKR') => {
    setInvoices((prev) => {
      let updatedDoc: Invoice | null = null;
      const updated = prev.map((inv) => {
        if (inv.id === invId) {
          const obj: Invoice = {
            ...inv,
            status: 'Paid' as const,
            paidAmountPkr: inv.totalAmountPkr,
            paymentMethod
          };
          updatedDoc = obj;
          return obj;
        }
        return inv;
      });
      saveToStorage(STORAGE_KEYS.INVOICES, updated);
      if (updatedDoc) {
        saveToFirestoreDoc('invoices', invId, updatedDoc);
      }
      return updated;
    });
  };

  // --- HEARING ACTIONS ---
  const addHearing = (hearing: Omit<HearingEvent, 'id'>) => {
    const matchedCase = casesRef.current.find((c) => c.id === hearing.caseId);
    const newHearing: HearingEvent = {
      ...hearing,
      caseTitle: hearing.caseTitle || matchedCase?.caseTitle || 'Court Hearing',
      clientName: hearing.clientName || matchedCase?.clientName || 'Client',
      id: createUniqueId('hear')
    };
    setHearings((prev) => {
      const updated = [newHearing, ...prev];
      saveToStorage(STORAGE_KEYS.HEARINGS, updated);
      return updated;
    });
    saveToFirestoreDoc('hearings', newHearing.id, newHearing);

    // Sync back to case if case exists
    if (matchedCase) {
      const newTimelineEvents: any[] = [];

      if (hearing.previousHearingOutcome) {
        newTimelineEvents.push({
          id: createFullTimestampId('tl-prev'),
          date: hearing.previousHearingDate || getTodayDateString(),
          title: 'Previous Hearing Order Sheet Record',
          forum: hearing.forum || matchedCase.forum,
          description: `Previous Hearing Date: ${hearing.previousHearingDate || 'N/A'}. Proceedings & Court Outcome: ${hearing.previousHearingOutcome}`,
          advocateName: hearing.counselAssigned || matchedCase.assignedCounsel,
          outcome: hearing.previousHearingOutcome
        });
      }

      newTimelineEvents.push({
        id: createFullTimestampId('tl'),
        date: getTodayDateString(),
        title: 'New Cause List Hearing Scheduled',
        forum: hearing.forum || matchedCase.forum,
        description: `Next hearing set for ${hearing.date} at ${hearing.time || '10:00 AM'}. Bench: ${hearing.bench}. Purpose: ${hearing.purpose}`,
        advocateName: hearing.counselAssigned || matchedCase.assignedCounsel
      });

      setCases((prev) => {
        const updatedCases = prev.map((c) => {
          if (c.id === hearing.caseId) {
            return {
              ...c,
              nextHearingDate: hearing.date,
              nextHearingPurpose: hearing.purpose,
              forum: hearing.forum || c.forum,
              timeline: [...newTimelineEvents, ...c.timeline]
            };
          }
          return c;
        });
        saveToStorage(STORAGE_KEYS.CASES, updatedCases);
        const targetCase = updatedCases.find((c) => c.id === hearing.caseId);
        if (targetCase) {
          saveToFirestoreDoc('cases', targetCase.id, targetCase);
        }
        return updatedCases;
      });
    }

    return newHearing;
  };

  const updateCaseHearing = (
    caseId: string,
    hearingDetails: {
      nextHearingDate: string;
      nextHearingPurpose: string;
      previousHearingDate?: string;
      previousHearingOutcome?: string;
      time?: string;
      bench?: string;
      forum?: LegalForum;
      counselAssigned?: string;
    }
  ) => {
    const foundCase = casesRef.current.find((c) => c.id === caseId);
    // 1. Update CaseFile
    setCases((prev) => {
      const updatedCases = prev.map((c) => {
        if (c.id === caseId) {
          const newTimeline: any[] = [];

          if (hearingDetails.previousHearingOutcome) {
            newTimeline.push({
              id: createFullTimestampId('tl-prev'),
              date: hearingDetails.previousHearingDate || getTodayDateString(),
              title: 'Previous Hearing Order Sheet Record',
              forum: hearingDetails.forum || c.forum,
              description: `Previous Hearing Date: ${hearingDetails.previousHearingDate || 'N/A'}. Court Proceedings & Order Details: ${hearingDetails.previousHearingOutcome}`,
              advocateName: hearingDetails.counselAssigned || c.assignedCounsel,
              outcome: hearingDetails.previousHearingOutcome
            });
          }

          newTimeline.push({
            id: createFullTimestampId('tl'),
            date: getTodayDateString(),
            title: 'Court Hearing Scheduled / Rescheduled',
            forum: hearingDetails.forum || c.forum,
            description: `Hearing set for ${hearingDetails.nextHearingDate}${
              hearingDetails.time ? ` at ${hearingDetails.time}` : ''
            }. Purpose: ${hearingDetails.nextHearingPurpose}. Bench: ${hearingDetails.bench || 'Honourable Bench'}.`,
            advocateName: hearingDetails.counselAssigned || c.assignedCounsel
          });

          return {
            ...c,
            nextHearingDate: hearingDetails.nextHearingDate,
            nextHearingPurpose: hearingDetails.nextHearingPurpose,
            forum: hearingDetails.forum || c.forum,
            assignedCounsel: hearingDetails.counselAssigned || c.assignedCounsel,
            timeline: [...newTimeline, ...c.timeline]
          };
        }
        return c;
      });

      saveToStorage(STORAGE_KEYS.CASES, updatedCases);
      const targetCase = updatedCases.find((c) => c.id === caseId);
      if (targetCase) {
        saveToFirestoreDoc('cases', targetCase.id, targetCase);
      }
      return updatedCases;
    });

    // 2. Add or update hearing event in hearings list
    if (foundCase) {
      setHearings((prev) => {
        const existingHearingIndex = prev.findIndex(
          (h) => h.caseId === caseId && h.date === hearingDetails.nextHearingDate
        );
        let updatedHearings: HearingEvent[];
        let syncedHearing: HearingEvent;

        if (existingHearingIndex >= 0) {
          syncedHearing = {
            ...prev[existingHearingIndex],
            time: hearingDetails.time || prev[existingHearingIndex].time || '10:00 AM',
            bench: hearingDetails.bench || prev[existingHearingIndex].bench || 'Honourable High Court Bench',
            purpose: hearingDetails.nextHearingPurpose,
            counselAssigned:
              hearingDetails.counselAssigned ||
              prev[existingHearingIndex].counselAssigned ||
              foundCase.assignedCounsel,
            forum: hearingDetails.forum || prev[existingHearingIndex].forum || foundCase.forum
          };
          updatedHearings = prev.map((h, idx) => (idx === existingHearingIndex ? syncedHearing : h));
        } else {
          syncedHearing = {
            id: createFullTimestampId('h'),
            caseId,
            caseTitle: foundCase.caseTitle,
            clientName: foundCase.clientName,
            date: hearingDetails.nextHearingDate,
            time: hearingDetails.time || '10:00 AM',
            forum: hearingDetails.forum || foundCase.forum,
            bench: hearingDetails.bench || 'Honourable High Court Bench',
            counselAssigned: hearingDetails.counselAssigned || foundCase.assignedCounsel,
            purpose: hearingDetails.nextHearingPurpose,
            priority: foundCase.riskLevel === 'Critical' ? 'High' : 'Medium'
          };
          updatedHearings = [syncedHearing, ...prev];
        }

        saveToStorage(STORAGE_KEYS.HEARINGS, updatedHearings);
        saveToFirestoreDoc('hearings', syncedHearing.id, syncedHearing);
        return updatedHearings;
      });
    }
  };

  const updateHearing = (hearingId: string, updatedData: Partial<HearingEvent>) => {
    setHearings((prev) => {
      let updatedDoc: HearingEvent | null = null;
      const updated = prev.map((h) => {
        if (h.id === hearingId) {
          const obj = { ...h, ...updatedData };
          updatedDoc = obj;
          return obj;
        }
        return h;
      });
      saveToStorage(STORAGE_KEYS.HEARINGS, updated);
      if (updatedDoc) {
        saveToFirestoreDoc('hearings', hearingId, updatedDoc);
      }
      return updated;
    });
  };

  // --- NOTIFICATION ACTIONS ---
  const sendNotification = (notif: Omit<NotificationLog, 'id' | 'sentAt' | 'status'>) => {
    const newNotif: NotificationLog = {
      ...notif,
      id: createUniqueId('notif'),
      sentAt: getTodayDateString(),
      status: 'Delivered'
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });
    saveToFirestoreDoc('notifications', newNotif.id, newNotif);
    return newNotif;
  };

  // --- PRACTICE AREAS ACTIONS ---
  const addPracticeArea = (pa: Omit<PracticeArea, 'id'> & { id?: string }) => {
    const slugId = pa.id || pa.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || createUniqueId('pa');
    const newArea: PracticeArea = {
      ...pa,
      id: slugId,
      createdAt: getTodayDateString(),
      updatedAt: getTodayDateString()
    };
    const updated = [newArea, ...practiceAreas];
    setPracticeAreas(updated);
    saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, updated);
    saveToFirestoreDoc('practice_areas', newArea.id, newArea);
    return newArea;
  };

  const updatePracticeArea = (id: string, updatedData: Partial<PracticeArea>) => {
    let targetDoc: PracticeArea | null = null;
    const updated = practiceAreas.map((pa) => {
      if (pa.id === id) {
        const obj: PracticeArea = {
          ...pa,
          ...updatedData,
          updatedAt: getTodayDateString()
        };
        targetDoc = obj;
        return obj;
      }
      return pa;
    });
    setPracticeAreas(updated);
    saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, updated);
    if (targetDoc) {
      saveToFirestoreDoc('practice_areas', id, targetDoc);
    }
  };

  const deleteClient = async (clientId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('clients');
    markCollectionSeeded('clientCredentials');
    markCollectionSeeded('cases');
    markCollectionSeeded('notices');
    markCollectionSeeded('hearings');
    markCollectionSeeded('documents');
    markCollectionSeeded('invoices');
    markCollectionSeeded('tasks');
    markCollectionSeeded('notes');
    markCollectionSeeded('notifications');

    const res = await deleteFromFirestoreDoc('clients', clientId);
    if (!res.ok) return res;

    const linkedCases = casesRef.current.filter((cs) => cs.clientId === clientId);
    const linkedCaseIds = new Set(linkedCases.map((cs) => cs.id));

    const credIds = clientCredentialsRef.current.filter((c) => c.clientId === clientId).map((c) => c.id);
    const noticeIds = noticesRef.current
      .filter((n) => n.clientId === clientId || linkedCaseIds.has(n.caseId))
      .map((n) => n.id);
    const hearingIds = hearingsRef.current
      .filter((h) => linkedCaseIds.has(h.caseId))
      .map((h) => h.id);
    const docIds = documentsRef.current
      .filter((d) => d.clientId === clientId || linkedCaseIds.has(d.caseId))
      .map((d) => d.id);
    const invoiceIds = invoicesRef.current
      .filter((i) => i.clientId === clientId || linkedCaseIds.has(i.caseId))
      .map((i) => i.id);
    const taskIds = tasksRef.current.filter((t) => linkedCaseIds.has(t.caseId)).map((t) => t.id);
    const noteIds = notesRef.current.filter((n) => linkedCaseIds.has(n.caseId)).map((n) => n.id);
    const notifIds = notificationsRef.current
      .filter((n) => n.clientId === clientId || (n.caseId ? linkedCaseIds.has(n.caseId) : false))
      .map((n) => n.id);

    await Promise.allSettled([
      deleteFromFirestoreDoc('client_vault_secrets', clientId),
      ...credIds.map((id) => deleteFromFirestoreDoc('clientCredentials', id)),
      ...linkedCases.map((cs) => deleteFromFirestoreDoc('cases', cs.id)),
      ...noticeIds.map((id) => deleteFromFirestoreDoc('notices', id)),
      ...hearingIds.map((id) => deleteFromFirestoreDoc('hearings', id)),
      ...docIds.map((id) => deleteFromFirestoreDoc('documents', id)),
      ...invoiceIds.map((id) => deleteFromFirestoreDoc('invoices', id)),
      ...taskIds.map((id) => deleteFromFirestoreDoc('tasks', id)),
      ...noteIds.map((id) => deleteFromFirestoreDoc('notes', id)),
      ...notifIds.map((id) => deleteFromFirestoreDoc('notifications', id)),
    ]);

    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== clientId);
      saveToStorage(STORAGE_KEYS.CLIENTS, updated);
      return updated;
    });
    setClientVaultSecrets((prev) => {
      const next = { ...prev };
      delete next[clientId];
      saveToStorage(STORAGE_KEYS.CLIENT_VAULT_SECRETS, next);
      return next;
    });
    setClientCredentials((prev) => {
      const updated = prev.filter((c) => c.clientId !== clientId);
      saveToStorage(STORAGE_KEYS.CLIENT_CREDENTIALS, updated);
      return updated;
    });
    setCases((prev) => {
      const updated = prev.filter((cs) => cs.clientId !== clientId);
      saveToStorage(STORAGE_KEYS.CASES, updated);
      return updated;
    });
    setNotices((prev) => {
      const updated = prev.filter((n) => !noticeIds.includes(n.id));
      saveToStorage(STORAGE_KEYS.NOTICES, updated);
      return updated;
    });
    setHearings((prev) => {
      const updated = prev.filter((h) => !hearingIds.includes(h.id));
      saveToStorage(STORAGE_KEYS.HEARINGS, updated);
      return updated;
    });
    setDocuments((prev) => {
      const updated = prev.filter((d) => !docIds.includes(d.id));
      saveToStorage(STORAGE_KEYS.DOCUMENTS, updated);
      return updated;
    });
    setInvoices((prev) => {
      const updated = prev.filter((i) => !invoiceIds.includes(i.id));
      saveToStorage(STORAGE_KEYS.INVOICES, updated);
      return updated;
    });
    setTasks((prev) => {
      const updated = prev.filter((t) => !taskIds.includes(t.id));
      saveToStorage(STORAGE_KEYS.TASKS, updated);
      return updated;
    });
    setNotes((prev) => {
      const updated = prev.filter((n) => !noteIds.includes(n.id));
      saveToStorage(STORAGE_KEYS.NOTES, updated);
      return updated;
    });
    setNotifications((prev) => {
      const updated = prev.filter((n) => !notifIds.includes(n.id));
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });

    return { ok: true };
  };

  const deleteCase = async (caseId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('cases');
    markCollectionSeeded('notices');
    markCollectionSeeded('hearings');
    markCollectionSeeded('documents');
    markCollectionSeeded('invoices');
    markCollectionSeeded('tasks');
    markCollectionSeeded('notes');
    markCollectionSeeded('notifications');

    const targetCase = casesRef.current.find((c) => c.id === caseId);
    const res = await deleteFromFirestoreDoc('cases', caseId);
    if (!res.ok) return res;

    const noticeIds = noticesRef.current.filter((n) => n.caseId === caseId).map((n) => n.id);
    const hearingIds = hearingsRef.current.filter((h) => h.caseId === caseId).map((h) => h.id);
    const docIds = documentsRef.current.filter((d) => d.caseId === caseId).map((d) => d.id);
    const invoiceIds = invoicesRef.current.filter((i) => i.caseId === caseId).map((i) => i.id);
    const taskIds = tasksRef.current.filter((t) => t.caseId === caseId).map((t) => t.id);
    const noteIds = notesRef.current.filter((n) => n.caseId === caseId).map((n) => n.id);
    const notifIds = notificationsRef.current.filter((n) => n.caseId === caseId).map((n) => n.id);

    await Promise.allSettled([
      ...noticeIds.map((id) => deleteFromFirestoreDoc('notices', id)),
      ...hearingIds.map((id) => deleteFromFirestoreDoc('hearings', id)),
      ...docIds.map((id) => deleteFromFirestoreDoc('documents', id)),
      ...invoiceIds.map((id) => deleteFromFirestoreDoc('invoices', id)),
      ...taskIds.map((id) => deleteFromFirestoreDoc('tasks', id)),
      ...noteIds.map((id) => deleteFromFirestoreDoc('notes', id)),
      ...notifIds.map((id) => deleteFromFirestoreDoc('notifications', id)),
    ]);

    const nextCases = casesRef.current.filter((c) => c.id !== caseId);
    setCases(nextCases);
    saveToStorage(STORAGE_KEYS.CASES, nextCases);

    if (targetCase?.clientId) {
      const remainingCount = nextCases.filter((c) => c.clientId === targetCase.clientId).length;
      setClients((prev) => {
        const updated = prev.map((cl) => {
          if (cl.id === targetCase.clientId) {
            const nextClient = { ...cl, activeCasesCount: remainingCount };
            saveToFirestoreDoc('clients', nextClient.id, nextClient);
            return nextClient;
          }
          return cl;
        });
        saveToStorage(STORAGE_KEYS.CLIENTS, updated);
        return updated;
      });
    }

    setNotices((prev) => {
      const updated = prev.filter((n) => !noticeIds.includes(n.id));
      saveToStorage(STORAGE_KEYS.NOTICES, updated);
      return updated;
    });
    setHearings((prev) => {
      const updated = prev.filter((h) => !hearingIds.includes(h.id));
      saveToStorage(STORAGE_KEYS.HEARINGS, updated);
      return updated;
    });
    setDocuments((prev) => {
      const updated = prev.filter((d) => !docIds.includes(d.id));
      saveToStorage(STORAGE_KEYS.DOCUMENTS, updated);
      return updated;
    });
    setInvoices((prev) => {
      const updated = prev.filter((i) => !invoiceIds.includes(i.id));
      saveToStorage(STORAGE_KEYS.INVOICES, updated);
      return updated;
    });
    setTasks((prev) => {
      const updated = prev.filter((t) => !taskIds.includes(t.id));
      saveToStorage(STORAGE_KEYS.TASKS, updated);
      return updated;
    });
    setNotes((prev) => {
      const updated = prev.filter((n) => !noteIds.includes(n.id));
      saveToStorage(STORAGE_KEYS.NOTES, updated);
      return updated;
    });
    setNotifications((prev) => {
      const updated = prev.filter((n) => !notifIds.includes(n.id));
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });

    return { ok: true };
  };

  const deleteNotice = async (noticeId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('notices');
    const res = await deleteFromFirestoreDoc('notices', noticeId);
    if (!res.ok) return res;
    setNotices((prev) => {
      const updated = prev.filter((n) => n.id !== noticeId);
      saveToStorage(STORAGE_KEYS.NOTICES, updated);
      return updated;
    });
    return { ok: true };
  };

  const deleteHearing = async (hearingId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('hearings');
    const isVirtualCaseHearing = hearingId.startsWith('case-h-');

    if (isVirtualCaseHearing) {
      if (!auth.currentUser) {
        return { ok: false, error: 'Active Firebase sign-in is required to update database.' };
      }
      const realCaseId = hearingId.replace(/^case-h-/, '');
      try {
        await updateDoc(doc(db, 'cases', realCaseId), {
          nextHearingDate: deleteField(),
          nextHearingPurpose: deleteField(),
        });
      } catch (err) {
        const info = buildFirestoreErrorInfo(err, OperationType.UPDATE, `cases/${realCaseId}`);
        console.warn('Case hearing clear error:', JSON.stringify(info));
        return { ok: false, error: err instanceof Error ? err.message : 'Failed to clear hearing date.' };
      }
      setCases((prev) => {
        const updated = prev.map((c) => {
          if (c.id === realCaseId) {
            const copy = { ...c };
            delete copy.nextHearingDate;
            delete copy.nextHearingPurpose;
            return copy;
          }
          return c;
        });
        saveToStorage(STORAGE_KEYS.CASES, updated);
        return updated;
      });
      return { ok: true };
    }

    const targetHearing = hearingsRef.current.find((h) => h.id === hearingId);
    const res = await deleteFromFirestoreDoc('hearings', hearingId);
    if (!res.ok) return res;

    setHearings((prev) => {
      const updated = prev.filter((h) => h.id !== hearingId);
      saveToStorage(STORAGE_KEYS.HEARINGS, updated);
      return updated;
    });

    if (targetHearing) {
      const linkedCase = casesRef.current.find((c) => c.id === targetHearing.caseId);
      if (linkedCase && linkedCase.nextHearingDate === targetHearing.date) {
        const otherHearings = hearingsRef.current
          .filter((h) => h.id !== hearingId && h.caseId === linkedCase.id)
          .sort((a, b) => b.date.localeCompare(a.date));
        const nextRemaining = otherHearings[0];
        try {
          if (nextRemaining) {
            await updateDoc(doc(db, 'cases', linkedCase.id), {
              nextHearingDate: nextRemaining.date,
              nextHearingPurpose: nextRemaining.purpose,
            });
          } else {
            await updateDoc(doc(db, 'cases', linkedCase.id), {
              nextHearingDate: deleteField(),
              nextHearingPurpose: deleteField(),
            });
          }
        } catch {
          // ignore secondary case hearing sync failure
        }
        setCases((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== linkedCase.id) return c;
            if (nextRemaining) {
              return { ...c, nextHearingDate: nextRemaining.date, nextHearingPurpose: nextRemaining.purpose };
            }
            const copy = { ...c };
            delete copy.nextHearingDate;
            delete copy.nextHearingPurpose;
            return copy;
          });
          saveToStorage(STORAGE_KEYS.CASES, updated);
          return updated;
        });
      }
    }

    return { ok: true };
  };

  const deleteDocument = async (docId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('documents');
    const res = await deleteFromFirestoreDoc('documents', docId);
    if (!res.ok) return res;
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== docId);
      saveToStorage(STORAGE_KEYS.DOCUMENTS, updated);
      return updated;
    });
    return { ok: true };
  };

  const deleteTask = async (taskId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('tasks');
    const res = await deleteFromFirestoreDoc('tasks', taskId);
    if (!res.ok) return res;
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveToStorage(STORAGE_KEYS.TASKS, updated);
      return updated;
    });
    return { ok: true };
  };

  const deleteNote = async (noteId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('notes');
    const res = await deleteFromFirestoreDoc('notes', noteId);
    if (!res.ok) return res;
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== noteId);
      saveToStorage(STORAGE_KEYS.NOTES, updated);
      return updated;
    });
    return { ok: true };
  };

  const deleteInvoice = async (invoiceId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('invoices');
    const res = await deleteFromFirestoreDoc('invoices', invoiceId);
    if (!res.ok) return res;
    setInvoices((prev) => {
      const updated = prev.filter((i) => i.id !== invoiceId);
      saveToStorage(STORAGE_KEYS.INVOICES, updated);
      return updated;
    });
    return { ok: true };
  };

  const deleteNotification = async (notifId: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('notifications');
    const res = await deleteFromFirestoreDoc('notifications', notifId);
    if (!res.ok) return res;
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== notifId);
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });
    return { ok: true };
  };

  const deletePracticeArea = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('practice_areas');
    const res = await deleteFromFirestoreDoc('practice_areas', id);
    if (!res.ok) return res;
    setPracticeAreas((prev) => {
      const updated = prev.filter((pa) => pa.id !== id);
      saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, updated);
      return updated;
    });
    return { ok: true };
  };

  const resetPracticeAreas = () => {
    setPracticeAreas(INITIAL_PRACTICE_AREAS);
    saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, INITIAL_PRACTICE_AREAS);
    INITIAL_PRACTICE_AREAS.forEach((pa) => saveToFirestoreDoc('practice_areas', pa.id, pa));
  };

  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'createdAt'>) => {
    const id = memberData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `team-${Date.now()}`;
    const newMember: TeamMember = {
      ...memberData,
      id,
      createdAt: getTodayDateString(),
      order: teamMembers.length + 1
    };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, updated);
    saveToFirestoreDoc('team_members', id, newMember);
  };

  const updateTeamMember = (id: string, updatedData: Partial<TeamMember>) => {
    let targetDoc: TeamMember | null = null;
    const updated = teamMembers.map((m) => {
      if (m.id === id) {
        const obj: TeamMember = {
          ...m,
          ...updatedData,
          updatedAt: getTodayDateString()
        };
        targetDoc = obj;
        return obj;
      }
      return m;
    });
    setTeamMembers(updated);
    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, updated);
    if (targetDoc) {
      saveToFirestoreDoc('team_members', id, targetDoc);
    }
  };

  const deleteTeamMember = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('team_members');
    const res = await deleteFromFirestoreDoc('team_members', id);
    if (!res.ok) return res;
    setTeamMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, updated);
      return updated;
    });
    return { ok: true };
  };

  const setStuckTeamMember = (id: string) => {
    const updated = teamMembers.map((m) => {
      const isStuck = m.id === id;
      const updatedMember: TeamMember = {
        ...m,
        stickToLeft: isStuck,
        updatedAt: getTodayDateString()
      };
      saveToFirestoreDoc('team_members', m.id, updatedMember);
      return updatedMember;
    });
    setTeamMembers(updated);
    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, updated);
  };

  const resetTeamMembers = () => {
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, INITIAL_TEAM_MEMBERS);
    INITIAL_TEAM_MEMBERS.forEach((m) => saveToFirestoreDoc('team_members', m.id, m));
  };

  // --- REVIEWS & TESTIMONIALS ACTIONS ---
  const addReview = (reviewData: Omit<ReviewItem, 'id' | 'createdAt'>) => {
    const newId = createUniqueId('rev');
    const newReview: ReviewItem = {
      ...reviewData,
      id: newId,
      status: reviewData.status || 'published',
      createdAt: getTodayDateString(),
      updatedAt: getTodayDateString()
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    saveToStorage(STORAGE_KEYS.REVIEWS, updated);
    saveToFirestoreDoc('client_reviews', newId, newReview);
    return newReview;
  };

  const updateReview = (id: string, updates: Partial<ReviewItem>) => {
    let targetDoc: ReviewItem | null = null;
    const updated = reviews.map((r) => {
      if (r.id === id) {
        targetDoc = { ...r, ...updates, updatedAt: getTodayDateString() };
        return targetDoc;
      }
      return r;
    });
    setReviews(updated);
    saveToStorage(STORAGE_KEYS.REVIEWS, updated);
    if (targetDoc) {
      saveToFirestoreDoc('client_reviews', id, targetDoc);
    }
  };

  const deleteReview = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('client_reviews');
    const res = await deleteFromFirestoreDoc('client_reviews', id);
    if (!res.ok) return res;
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToStorage(STORAGE_KEYS.REVIEWS, updated);
      return updated;
    });
    return { ok: true };
  };

  const resetReviews = () => {
    setReviews(INITIAL_REVIEWS);
    saveToStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    INITIAL_REVIEWS.forEach((r) => saveToFirestoreDoc('client_reviews', r.id, r));
  };

  // --- LEGAL INSIGHTS ACTIONS ---
  const addInsight = (insight: Omit<LegalInsightItem, 'id' | 'createdAt'>) => {
    const slug = (insight.slug?.trim() || insight.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newId = slug || createUniqueId('post');
    const newInsight: LegalInsightItem = {
      ...insight,
      id: newId,
      slug: slug || newId,
      status: insight.status || 'published',
      createdAt: getTodayDateString()
    };
    const updated = [newInsight, ...insights];
    setInsights(updated);
    saveToStorage(STORAGE_KEYS.INSIGHTS, updated);
    saveToFirestoreDoc('legal_insights', newId, newInsight);
    return newInsight;
  };

  const updateInsight = (id: string, updates: Partial<LegalInsightItem>) => {
    let targetDoc: LegalInsightItem | null = null;
    const updated = insights.map((item) => {
      if (item.id === id) {
        targetDoc = { ...item, ...updates, updatedAt: getTodayDateString() };
        return targetDoc;
      }
      return item;
    });
    setInsights(updated);
    saveToStorage(STORAGE_KEYS.INSIGHTS, updated);
    if (targetDoc) {
      saveToFirestoreDoc('legal_insights', id, targetDoc);
    }
  };

  const deleteInsight = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('legal_insights');
    const res = await deleteFromFirestoreDoc('legal_insights', id);
    if (!res.ok) return res;
    setInsights((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(STORAGE_KEYS.INSIGHTS, updated);
      return updated;
    });
    return { ok: true };
  };

  const resetInsights = () => {
    setInsights(INITIAL_INSIGHTS);
    saveToStorage(STORAGE_KEYS.INSIGHTS, INITIAL_INSIGHTS);
    INITIAL_INSIGHTS.forEach((ins) => saveToFirestoreDoc('legal_insights', ins.id, ins));
  };

  // --- MEMBERSHIP & PARTNERS ACTIONS ---
  const addPartner = (partnerData: Omit<PartnerItem, 'id' | 'createdAt'>) => {
    const newId = createUniqueId('partner');
    const newPartner: PartnerItem = {
      ...partnerData,
      id: newId,
      status: partnerData.status || 'published',
      order: partnerData.order || (partners.length + 1),
      createdAt: getTodayDateString(),
      updatedAt: getTodayDateString()
    };
    const updated = [...partners, newPartner];
    setPartners(updated);
    saveToStorage(STORAGE_KEYS.PARTNERS, updated);
    saveToFirestoreDoc('membership_partners', newId, newPartner);
    return newPartner;
  };

  const updatePartner = (id: string, updates: Partial<PartnerItem>) => {
    let targetDoc: PartnerItem | null = null;
    const updated = partners.map((p) => {
      if (p.id === id) {
        targetDoc = { ...p, ...updates, updatedAt: getTodayDateString() };
        return targetDoc;
      }
      return p;
    });
    setPartners(updated);
    saveToStorage(STORAGE_KEYS.PARTNERS, updated);
    if (targetDoc) {
      saveToFirestoreDoc('membership_partners', id, targetDoc);
    }
  };

  const deletePartner = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    markCollectionSeeded('membership_partners');
    const res = await deleteFromFirestoreDoc('membership_partners', id);
    if (!res.ok) return res;
    setPartners((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage(STORAGE_KEYS.PARTNERS, updated);
      return updated;
    });
    return { ok: true };
  };

  const resetPartners = () => {
    setPartners(INITIAL_PARTNERS);
    saveToStorage(STORAGE_KEYS.PARTNERS, INITIAL_PARTNERS);
    INITIAL_PARTNERS.forEach((p) => saveToFirestoreDoc('membership_partners', p.id, p));
  };

  // --- STAFF & EMPLOYEE ACCESS CONTROL ACTIONS ---
  const addOrUpdateStaffAccount = async (staffData: {
    name: string;
    email: string;
    designation: string;
    phone?: string;
    role: StaffRolePreset;
    permissions: StaffPermission[];
    status?: 'Active' | 'Suspended';
    notes?: string;
    authorizedBy?: string;
  }): Promise<{ ok: boolean; staff: StaffAccount; error?: string }> => {
    const normalizedEmail = staffData.email.trim().toLowerCase();
    const existing = staffAccounts.find((s) => s.id === normalizedEmail || s.email.toLowerCase() === normalizedEmail);
    const now = getTodayDateString();
    const staffRecord: StaffAccount = stripUndefined({
      id: normalizedEmail,
      name: staffData.name.trim(),
      email: normalizedEmail,
      designation: staffData.designation.trim() || 'Team Member',
      phone: staffData.phone?.trim() || '',
      role: staffData.role,
      permissions: Array.from(new Set(staffData.permissions)),
      status: staffData.status || existing?.status || 'Active',
      notes: staffData.notes?.trim() || '',
      authorizedBy: staffData.authorizedBy || existing?.authorizedBy || 'Admin Partner',
      ...(existing?.lastLoginAt ? { lastLoginAt: existing.lastLoginAt } : {}),
      createdAt: existing?.createdAt || now,
      updatedAt: now
    });

    if (!auth.currentUser) {
      return {
        ok: false,
        staff: staffRecord,
        error:
          'Active Firebase sign-in is required to save team members permanently. Please Sign Out and sign in with Google (or Firebase Email/Password) first.',
      };
    }

    try {
      await setDoc(doc(db, 'staff_accounts', normalizedEmail), staffRecord, { merge: true });
      const updated = [
        staffRecord,
        ...staffAccounts.filter((s) => s.id !== normalizedEmail && s.email.toLowerCase() !== normalizedEmail)
      ];
      setStaffAccounts(updated);
      saveToStorage(STORAGE_KEYS.STAFF_ACCOUNTS, updated);
      return { ok: true, staff: staffRecord };
    } catch (err) {
      const info = buildFirestoreErrorInfo(err, OperationType.WRITE, `staff_accounts/${normalizedEmail}`);
      console.error('Firestore Error: ', JSON.stringify(info));
      return {
        ok: false,
        staff: staffRecord,
        error:
          err instanceof Error
            ? `Failed to save team member to database: ${err.message}`
            : 'Failed to save team member to database. Please verify your admin permissions.',
      };
    }
  };

  const updateStaffAccount = async (
    staffId: string,
    updates: Partial<StaffAccount>
  ): Promise<{ ok: boolean; error?: string }> => {
    const normalizedId = staffId.trim().toLowerCase();
    const existing = staffAccounts.find((s) => s.id === normalizedId || s.email.toLowerCase() === normalizedId);
    if (!existing) {
      return { ok: false, error: 'Team member record not found.' };
    }

    const targetDoc: StaffAccount = stripUndefined({
      ...existing,
      ...updates,
      email: (updates.email || existing.email).trim().toLowerCase(),
      updatedAt: getTodayDateString(),
    });

    if (!auth.currentUser) {
      return {
        ok: false,
        error: 'Active Firebase sign-in is required to update team permissions.',
      };
    }

    try {
      await setDoc(doc(db, 'staff_accounts', targetDoc.id), targetDoc, { merge: true });
      const updated = staffAccounts.map((s) =>
        s.id === normalizedId || s.email.toLowerCase() === normalizedId ? targetDoc : s
      );
      setStaffAccounts(updated);
      saveToStorage(STORAGE_KEYS.STAFF_ACCOUNTS, updated);
      return { ok: true };
    } catch (err) {
      const info = buildFirestoreErrorInfo(err, OperationType.UPDATE, `staff_accounts/${targetDoc.id}`);
      console.error('Firestore Error: ', JSON.stringify(info));
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to update team member.',
      };
    }
  };

  const toggleStaffStatus = async (staffId: string): Promise<{ ok: boolean; error?: string }> => {
    const normalizedId = staffId.trim().toLowerCase();
    const existing = staffAccounts.find((s) => s.id === normalizedId || s.email.toLowerCase() === normalizedId);
    if (!existing) return { ok: false, error: 'Team member record not found.' };
    const nextStatus = existing.status === 'Active' ? 'Suspended' : 'Active';
    return updateStaffAccount(existing.id, { status: nextStatus });
  };

  const deleteStaffAccount = async (staffId: string): Promise<{ ok: boolean; error?: string }> => {
    const normalizedId = staffId.trim().toLowerCase();
    if (!auth.currentUser) {
      return {
        ok: false,
        error: 'Active Firebase sign-in is required to remove team members.',
      };
    }

    try {
      await deleteDoc(doc(db, 'staff_accounts', normalizedId));
      const updated = staffAccounts.filter((s) => s.id !== normalizedId && s.email.toLowerCase() !== normalizedId);
      setStaffAccounts(updated);
      saveToStorage(STORAGE_KEYS.STAFF_ACCOUNTS, updated);
      return { ok: true };
    } catch (err) {
      const info = buildFirestoreErrorInfo(err, OperationType.DELETE, `staff_accounts/${normalizedId}`);
      console.error('Firestore Error: ', JSON.stringify(info));
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to delete team member.',
      };
    }
  };

  return {
    isLoaded,
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
    practiceAreas,
    teamMembers,
    reviews,
    insights,
    partners,
    staffAccounts,
    clientVaultSecrets,
    addClient,
    updateClient,
    deleteClient,
    saveClientVaultSecret,
    addClientCredential,
    addCase,
    updateCase,
    deleteCase,
    updateCaseStatus,
    addTimelineEvent,
    addNotice,
    updateNoticeStatus,
    deleteNotice,
    addDocument,
    deleteDocument,
    addTask,
    toggleTask,
    deleteTask,
    addNote,
    deleteNote,
    addInvoice,
    markInvoicePaid,
    deleteInvoice,
    addHearing,
    updateCaseHearing,
    updateHearing,
    deleteHearing,
    sendNotification,
    deleteNotification,
    addPracticeArea,
    updatePracticeArea,
    deletePracticeArea,
    resetPracticeAreas,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    resetTeamMembers,
    setStuckTeamMember,
    addReview,
    updateReview,
    deleteReview,
    resetReviews,
    addInsight,
    updateInsight,
    deleteInsight,
    resetInsights,
    addPartner,
    updatePartner,
    deletePartner,
    resetPartners,
    addOrUpdateStaffAccount,
    updateStaffAccount,
    toggleStaffStatus,
    deleteStaffAccount
  };
}
