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
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, getDocFromServer } from 'firebase/firestore';
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
  const invoicesRef = useRef<Invoice[]>(invoices);
  const hearingsRef = useRef<HearingEvent[]>(hearings);
  const clientCredentialsRef = useRef<ClientCredential[]>(clientCredentials);
  const hasAttemptedBackfillRef = useRef<boolean>(false);

  useEffect(() => {
    clientsRef.current = clients;
    casesRef.current = cases;
    noticesRef.current = notices;
    invoicesRef.current = invoices;
    hearingsRef.current = hearings;
    clientCredentialsRef.current = clientCredentials;
  }, [clients, cases, notices, invoices, hearings, clientCredentials]);

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

  const deleteFromFirestoreDoc = async (colName: string, id: string) => {
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (err) {
      const info = buildFirestoreErrorInfo(err, OperationType.DELETE, `${colName}/${id}`);
      console.warn('Firestore delete error:', JSON.stringify(info));
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
      if (!alreadySeededLocal || (needsSampleSeries && !rawClients.some((c) => Boolean(c.fileNumber)))) {
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
        INITIAL_CLIENTS.forEach((c) => saveToFirestoreDoc('clients', c.id, c));
      } else {
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
        INITIAL_CASES.forEach((c) => saveToFirestoreDoc('cases', c.id, c));
      } else {
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
        INITIAL_NOTICES.forEach((n) => saveToFirestoreDoc('notices', n.id, n));
      } else {
        const items = snap.docs.map((d) => d.data() as FBRNotice);
        rawFirestoreNoticesRef.current = items;
        setNotices(items);
        saveToStorage(STORAGE_KEYS.NOTICES, items);
      }
    }, (err) => console.warn('Notices snapshot error:', err));

    // 4. Documents
    const unsubDocs = onSnapshot(collection(db, 'documents'), (snap) => {
      if (snap.empty) {
        INITIAL_DOCUMENTS.forEach((d) => saveToFirestoreDoc('documents', d.id, d));
      } else {
        const items = snap.docs.map((d) => d.data() as DocumentItem);
        rawFirestoreDocsRef.current = items;
        setDocuments(items);
        saveToStorage(STORAGE_KEYS.DOCUMENTS, items);
      }
    }, (err) => console.warn('Documents snapshot error:', err));

    // 5. Tasks
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
      if (snap.empty) {
        INITIAL_TASKS.forEach((t) => saveToFirestoreDoc('tasks', t.id, t));
      } else {
        const items = snap.docs.map((d) => d.data() as InternalTask);
        rawFirestoreTasksRef.current = items;
        setTasks(items);
        saveToStorage(STORAGE_KEYS.TASKS, items);
      }
    }, (err) => console.warn('Tasks snapshot error:', err));

    // 6. Notes
    const unsubNotes = onSnapshot(collection(db, 'notes'), (snap) => {
      if (snap.empty) {
        INITIAL_NOTES.forEach((n) => saveToFirestoreDoc('notes', n.id, n));
      } else {
        const items = snap.docs.map((d) => d.data() as InternalNote);
        rawFirestoreNotesRef.current = items;
        setNotes(items);
        saveToStorage(STORAGE_KEYS.NOTES, items);
      }
    }, (err) => console.warn('Notes snapshot error:', err));

    // 7. Invoices
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snap) => {
      if (snap.empty) {
        INITIAL_INVOICES.forEach((i) => saveToFirestoreDoc('invoices', i.id, i));
      } else {
        const items = snap.docs.map((d) => d.data() as Invoice);
        rawFirestoreInvoicesRef.current = items;
        setInvoices(items);
        saveToStorage(STORAGE_KEYS.INVOICES, items);
      }
    }, (err) => console.warn('Invoices snapshot error:', err));

    // 8. Hearings
    const unsubHearings = onSnapshot(collection(db, 'hearings'), (snap) => {
      if (snap.empty) {
        INITIAL_HEARINGS.forEach((h) => saveToFirestoreDoc('hearings', h.id, h));
      } else {
        const items = snap.docs.map((d) => d.data() as HearingEvent);
        rawFirestoreHearingsRef.current = items;
        setHearings(items);
        saveToStorage(STORAGE_KEYS.HEARINGS, items);
      }
    }, (err) => console.warn('Hearings snapshot error:', err));

    // 9. Notifications
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snap) => {
      if (snap.empty) {
        INITIAL_NOTIFICATIONS.forEach((n) => saveToFirestoreDoc('notifications', n.id, n));
      } else {
        const items = snap.docs.map((d) => d.data() as NotificationLog);
        rawFirestoreNotifsRef.current = items;
        setNotifications(items);
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, items);
      }
    }, (err) => console.warn('Notifications snapshot error:', err));

    // 10. Client Credentials
    const unsubCreds = onSnapshot(collection(db, 'clientCredentials'), (snap) => {
      if (snap.empty) {
        INITIAL_CLIENT_CREDENTIALS.forEach((c) => saveToFirestoreDoc('clientCredentials', c.id, c));
      } else {
        const items = snap.docs.map((d) => d.data() as ClientCredential);
        rawFirestoreCredsRef.current = items;
        setClientCredentials(items);
        saveToStorage(STORAGE_KEYS.CLIENT_CREDENTIALS, items);
      }
    }, (err) => console.warn('Client Credentials snapshot error:', err));

    // 11. Practice Areas
    const unsubPracticeAreas = onSnapshot(collection(db, 'practice_areas'), (snap) => {
      if (snap.empty) {
        INITIAL_PRACTICE_AREAS.forEach((pa) => saveToFirestoreDoc('practice_areas', pa.id, pa));
      } else {
        const items = snap.docs.map((d) => d.data() as PracticeArea);
        setPracticeAreas(items);
        saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, items);
      }
    }, (err) => console.warn('Practice Areas snapshot error:', err));

    // 12. Team Members
    const unsubTeam = onSnapshot(collection(db, 'team_members'), (snap) => {
      if (snap.empty) {
        INITIAL_TEAM_MEMBERS.forEach((m) => saveToFirestoreDoc('team_members', m.id, m));
      } else {
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
        INITIAL_REVIEWS.forEach((r) => saveToFirestoreDoc('client_reviews', r.id, r));
      } else {
        const items = snap.docs.map((d) => d.data() as ReviewItem);
        setReviews(items);
        saveToStorage(STORAGE_KEYS.REVIEWS, items);
      }
    }, (err) => console.warn('Client Reviews snapshot error:', err));

    // 14. Legal Insights & Blog Articles
    const unsubInsights = onSnapshot(collection(db, 'legal_insights'), (snap) => {
      if (snap.empty) {
        INITIAL_INSIGHTS.forEach((ins) => saveToFirestoreDoc('legal_insights', ins.id, ins));
      } else {
        const items = snap.docs.map((d) => d.data() as LegalInsightItem);
        setInsights(items);
        saveToStorage(STORAGE_KEYS.INSIGHTS, items);
      }
    }, (err) => console.warn('Legal Insights snapshot error:', err));

    // 15. Membership & Partners
    const unsubPartners = onSnapshot(collection(db, 'membership_partners'), (snap) => {
      if (snap.empty) {
        INITIAL_PARTNERS.forEach((p) => saveToFirestoreDoc('membership_partners', p.id, p));
      } else {
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
  const saveClientVaultSecret = (clientId: string, secpPassword?: string, secpPin?: string) => {
    const cleanPass = secpPassword?.trim() || '';
    const cleanPin = secpPin?.trim() || '';
    const secretDoc: ClientVaultSecret = {
      clientId,
      secpPassword: cleanPass,
      secpPin: cleanPin,
      updatedAt: getTodayDateString(),
    };
    setClientVaultSecrets((prev) => {
      const nextMap = { ...prev, [clientId]: secretDoc };
      saveToStorage(STORAGE_KEYS.CLIENT_VAULT_SECRETS, nextMap);
      return nextMap;
    });
    saveToFirestoreDoc('client_vault_secrets', clientId, secretDoc);
  };

  const addClient = (
    client: Omit<Client, 'id' | 'createdAt' | 'activeCasesCount' | 'totalTaxSaved'> & {
      secpPassword?: string;
      secpPin?: string;
    },
    loginEmail?: string,
    loginPassword?: string
  ) => {
    const newId = createUniqueId('cli');
    const { secpPassword, secpPin, ...publicClientFields } = client;
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

    if (secpPassword || secpPin) {
      saveClientVaultSecret(newClient.id, secpPassword, secpPin);
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
    updatedData: Partial<Client> & { secpPassword?: string; secpPin?: string }
  ) => {
    const { secpPassword, secpPin, ...publicUpdates } = updatedData;
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

    if (secpPassword !== undefined || secpPin !== undefined) {
      const existingSecret = clientVaultSecrets[clientId];
      saveClientVaultSecret(
        clientId,
        secpPassword !== undefined ? secpPassword : existingSecret?.secpPassword,
        secpPin !== undefined ? secpPin : existingSecret?.secpPin
      );
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

  const deletePracticeArea = (id: string) => {
    const updated = practiceAreas.filter((pa) => pa.id !== id);
    setPracticeAreas(updated);
    saveToStorage(STORAGE_KEYS.PRACTICE_AREAS, updated);
    deleteFromFirestoreDoc('practice_areas', id);
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

  const deleteTeamMember = (id: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, updated);
    deleteFromFirestoreDoc('team_members', id);
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

  const deleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    saveToStorage(STORAGE_KEYS.REVIEWS, updated);
    deleteFromFirestoreDoc('client_reviews', id);
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

  const deleteInsight = (id: string) => {
    const updated = insights.filter((item) => item.id !== id);
    setInsights(updated);
    saveToStorage(STORAGE_KEYS.INSIGHTS, updated);
    deleteFromFirestoreDoc('legal_insights', id);
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

  const deletePartner = (id: string) => {
    const updated = partners.filter((p) => p.id !== id);
    setPartners(updated);
    saveToStorage(STORAGE_KEYS.PARTNERS, updated);
    deleteFromFirestoreDoc('membership_partners', id);
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
    saveClientVaultSecret,
    addClientCredential,
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
    sendNotification,
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
