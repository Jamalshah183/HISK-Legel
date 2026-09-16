'use client';

import { useState, useEffect } from 'react';
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
  PracticeArea
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
  INITIAL_PRACTICE_AREAS
} from '@/data/portalSeedData';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

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
  PRACTICE_AREAS: 'hisk_portal_practice_areas_v2'
};

const createUniqueId = (prefix: string) => `${prefix}-${Date.now().toString().slice(-4)}`;
const createFullTimestampId = (prefix: string) => `${prefix}-${Date.now()}`;
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getCurrentYearNumber = () => new Date().getFullYear();
const getRandom3DigitNum = () => Math.floor(100 + Math.random() * 900);

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

  const [isLoaded, setIsLoaded] = useState<boolean>(true);

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
      await setDoc(doc(db, colName, id), data, { merge: true });
    } catch (err) {
      console.warn(`Firestore write error for ${colName}/${id}:`, err);
    }
  };

  const deleteFromFirestoreDoc = async (colName: string, id: string) => {
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (err) {
      console.warn(`Firestore delete error for ${colName}/${id}:`, err);
    }
  };

  // Setup Firestore Real-time Listeners and Auto-Seed if empty
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Clients
    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      if (snap.empty) {
        INITIAL_CLIENTS.forEach((c) => saveToFirestoreDoc('clients', c.id, c));
      } else {
        const items = snap.docs.map((d) => d.data() as Client);
        setClients(items);
        saveToStorage(STORAGE_KEYS.CLIENTS, items);
      }
    }, (err) => console.warn('Clients snapshot error:', err));

    // 2. Cases
    const unsubCases = onSnapshot(collection(db, 'cases'), (snap) => {
      if (snap.empty) {
        INITIAL_CASES.forEach((c) => saveToFirestoreDoc('cases', c.id, c));
      } else {
        const items = snap.docs.map((d) => d.data() as CaseFile);
        setCases(items);
        saveToStorage(STORAGE_KEYS.CASES, items);
      }
    }, (err) => console.warn('Cases snapshot error:', err));

    // 3. Notices
    const unsubNotices = onSnapshot(collection(db, 'notices'), (snap) => {
      if (snap.empty) {
        INITIAL_NOTICES.forEach((n) => saveToFirestoreDoc('notices', n.id, n));
      } else {
        const items = snap.docs.map((d) => d.data() as FBRNotice);
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
    };
  }, []);

  // --- CLIENT ACTIONS ---
  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'activeCasesCount' | 'totalTaxSaved'>, loginEmail?: string, loginPassword?: string) => {
    const newId = createUniqueId('cli');
    const newClient: Client = {
      ...client,
      id: newId,
      activeCasesCount: 0,
      totalTaxSaved: 'Rs. 0',
      createdAt: getTodayDateString()
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    saveToStorage(STORAGE_KEYS.CLIENTS, updated);
    saveToFirestoreDoc('clients', newClient.id, newClient);

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

  const addClientCredential = (cred: Omit<ClientCredential, 'id' | 'createdAt'>) => {
    const newCred: ClientCredential = {
      ...cred,
      id: createUniqueId('cred'),
      createdAt: getTodayDateString()
    };
    const updated = [
      newCred,
      ...clientCredentials.filter(
        (c) => c.email.toLowerCase() !== cred.email.toLowerCase() && c.clientId !== cred.clientId
      )
    ];
    setClientCredentials(updated);
    saveToStorage(STORAGE_KEYS.CLIENT_CREDENTIALS, updated);
    saveToFirestoreDoc('clientCredentials', newCred.id, newCred);
    return newCred;
  };

  // --- CASE ACTIONS ---
  const addCase = (caseData: {
    title: string;
    clientId: string;
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
    const client = clients.find((c) => c.id === caseData.clientId);
    const newCase: CaseFile = {
      id: `case-${getCurrentYearNumber()}-${getRandom3DigitNum()}`,
      caseRef: `HISK-${caseData.forum.split(' ')[0]}-${createUniqueId('')}`,
      clientId: caseData.clientId,
      clientName: client ? client.name : 'Corporate Client',
      clientNtn: client ? client.ntn : 'N/A',
      caseTitle: caseData.title,
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
    };

    const updatedCases = [newCase, ...cases];
    setCases(updatedCases);
    saveToStorage(STORAGE_KEYS.CASES, updatedCases);
    saveToFirestoreDoc('cases', newCase.id, newCase);

    // Save client login credential if created during case creation
    if (caseData.clientLoginEmail && caseData.clientLoginPassword) {
      addClientCredential({
        clientId: caseData.clientId,
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
      const updatedHearings = [newHearing, ...hearings];
      setHearings(updatedHearings);
      saveToStorage(STORAGE_KEYS.HEARINGS, updatedHearings);
      saveToFirestoreDoc('hearings', newHearing.id, newHearing);
    }

    // Update active case count for client
    if (client) {
      const updatedClients = clients.map((c) =>
        c.id === client.id ? { ...c, activeCasesCount: c.activeCasesCount + 1 } : c
      );
      setClients(updatedClients);
      saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
      const updatedClient = updatedClients.find((c) => c.id === client.id);
      if (updatedClient) {
        saveToFirestoreDoc('clients', updatedClient.id, updatedClient);
      }
    }

    return newCase;
  };

  const updateCase = (caseId: string, updatedData: Partial<CaseFile> & { clientLoginEmail?: string; clientLoginPassword?: string }) => {
    let updatedTargetDoc: CaseFile | null = null;
    const updated = cases.map((c) => {
      if (c.id === caseId) {
        const docObj = {
          ...c,
          ...updatedData
        };
        updatedTargetDoc = docObj;
        return docObj;
      }
      return c;
    });
    setCases(updated);
    saveToStorage(STORAGE_KEYS.CASES, updated);
    if (updatedTargetDoc) {
      saveToFirestoreDoc('cases', caseId, updatedTargetDoc);
    }

    // Sync client login credential if provided
    if (updatedTargetDoc && updatedData.clientLoginEmail && updatedData.clientLoginPassword) {
      const targetCase = updatedTargetDoc as CaseFile;
      addClientCredential({
        clientId: targetCase.clientId,
        clientName: targetCase.clientName,
        email: updatedData.clientLoginEmail,
        password: updatedData.clientLoginPassword
      });
    }

    // Sync hearing if nextHearingDate provided
    if (updatedTargetDoc && updatedData.nextHearingDate) {
      const targetCase = updatedTargetDoc as CaseFile;
      const existingIdx = hearings.findIndex(
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
        const updatedH = [newHearing, ...hearings];
        setHearings(updatedH);
        saveToStorage(STORAGE_KEYS.HEARINGS, updatedH);
        saveToFirestoreDoc('hearings', newHearing.id, newHearing);
      }
    }
  };

  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, newStage?: number) => {
    let updatedTargetDoc: CaseFile | null = null;
    const updated = cases.map((c) => {
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
    setCases(updated);
    saveToStorage(STORAGE_KEYS.CASES, updated);
    if (updatedTargetDoc) {
      saveToFirestoreDoc('cases', caseId, updatedTargetDoc);
    }
  };

  const addTimelineEvent = (caseId: string, event: {
    title: string;
    forum: LegalForum;
    description: string;
    advocateName: string;
    outcome?: string;
  }) => {
    let updatedTargetDoc: CaseFile | null = null;
    const updated = cases.map((c) => {
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
    setCases(updated);
    saveToStorage(STORAGE_KEYS.CASES, updated);
    if (updatedTargetDoc) {
      saveToFirestoreDoc('cases', caseId, updatedTargetDoc);
    }
  };

  // --- NOTICE ACTIONS ---
  const addNotice = (notice: Omit<FBRNotice, 'id' | 'clientName'>) => {
    const client = clients.find((c) => c.id === notice.clientId);
    const newNotice: FBRNotice = {
      ...notice,
      id: createUniqueId('not'),
      clientName: client ? client.name : 'Client'
    };
    const updated = [newNotice, ...notices];
    setNotices(updated);
    saveToStorage(STORAGE_KEYS.NOTICES, updated);
    saveToFirestoreDoc('notices', newNotice.id, newNotice);
    return newNotice;
  };

  const updateNoticeStatus = (noticeId: string, status: FBRNotice['status']) => {
    let updatedDoc: FBRNotice | null = null;
    const updated = notices.map((n) => {
      if (n.id === noticeId) {
        const obj = { ...n, status };
        updatedDoc = obj;
        return obj;
      }
      return n;
    });
    setNotices(updated);
    saveToStorage(STORAGE_KEYS.NOTICES, updated);
    if (updatedDoc) {
      saveToFirestoreDoc('notices', noticeId, updatedDoc);
    }
  };

  // --- DOCUMENT ACTIONS ---
  const addDocument = (docItem: Omit<DocumentItem, 'id' | 'uploadedAt'>) => {
    const newDoc: DocumentItem = {
      ...docItem,
      id: createUniqueId('doc'),
      uploadedAt: getTodayDateString()
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveToStorage(STORAGE_KEYS.DOCUMENTS, updated);
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
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveToStorage(STORAGE_KEYS.TASKS, updated);
    saveToFirestoreDoc('tasks', newTask.id, newTask);
  };

  const toggleTask = (taskId: string) => {
    let updatedDoc: InternalTask | null = null;
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const obj = { ...t, isCompleted: !t.isCompleted };
        updatedDoc = obj;
        return obj;
      }
      return t;
    });
    setTasks(updated);
    saveToStorage(STORAGE_KEYS.TASKS, updated);
    if (updatedDoc) {
      saveToFirestoreDoc('tasks', taskId, updatedDoc);
    }
  };

  // --- NOTE ACTIONS ---
  const addNote = (note: Omit<InternalNote, 'id' | 'date'>) => {
    const newNote: InternalNote = {
      ...note,
      id: createUniqueId('note'),
      date: getTodayDateString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveToStorage(STORAGE_KEYS.NOTES, updated);
    saveToFirestoreDoc('notes', newNote.id, newNote);
  };

  // --- INVOICE ACTIONS ---
  const addInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'clientName' | 'clientNtn'>) => {
    const client = clients.find((c) => c.id === inv.clientId);
    const newInv: Invoice = {
      ...inv,
      id: createUniqueId('inv'),
      invoiceNumber: `HISK-INV-${getCurrentYearNumber()}-${getRandom3DigitNum()}`,
      clientName: client ? client.name : 'Client',
      clientNtn: client ? client.ntn : 'N/A'
    };
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    saveToStorage(STORAGE_KEYS.INVOICES, updated);
    saveToFirestoreDoc('invoices', newInv.id, newInv);
    return newInv;
  };

  const markInvoicePaid = (invId: string, paymentMethod: 'Bank Transfer' | 'PayOrder / Cheque' | 'Online PKR') => {
    let updatedDoc: Invoice | null = null;
    const updated = invoices.map((inv) => {
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
    setInvoices(updated);
    saveToStorage(STORAGE_KEYS.INVOICES, updated);
    if (updatedDoc) {
      saveToFirestoreDoc('invoices', invId, updatedDoc);
    }
  };

  // --- HEARING ACTIONS ---
  const addHearing = (hearing: Omit<HearingEvent, 'id'>) => {
    const newHearing: HearingEvent = {
      ...hearing,
      id: createUniqueId('hear')
    };
    const updated = [newHearing, ...hearings];
    setHearings(updated);
    saveToStorage(STORAGE_KEYS.HEARINGS, updated);
    saveToFirestoreDoc('hearings', newHearing.id, newHearing);

    // Sync back to case if case exists
    const matchedCase = cases.find((c) => c.id === hearing.caseId);
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

      const updatedCases = cases.map((c) =>
        c.id === hearing.caseId
          ? {
              ...c,
              nextHearingDate: hearing.date,
              nextHearingPurpose: hearing.purpose,
              forum: hearing.forum || c.forum,
              timeline: [...newTimelineEvents, ...c.timeline]
            }
          : c
      );
      setCases(updatedCases);
      saveToStorage(STORAGE_KEYS.CASES, updatedCases);
      const targetCase = updatedCases.find((c) => c.id === hearing.caseId);
      if (targetCase) {
        saveToFirestoreDoc('cases', targetCase.id, targetCase);
      }
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
    // 1. Update CaseFile
    const updatedCases = cases.map((c) => {
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

    setCases(updatedCases);
    saveToStorage(STORAGE_KEYS.CASES, updatedCases);
    const targetCase = updatedCases.find((c) => c.id === caseId);
    if (targetCase) {
      saveToFirestoreDoc('cases', targetCase.id, targetCase);
    }

    // 2. Add or update hearing event in hearings list
    const foundCase = cases.find((c) => c.id === caseId);
    if (foundCase) {
      const existingHearingIndex = hearings.findIndex((h) => h.caseId === caseId && h.date === hearingDetails.nextHearingDate);
      let updatedHearings: HearingEvent[];

      if (existingHearingIndex >= 0) {
        updatedHearings = hearings.map((h, idx) =>
          idx === existingHearingIndex
            ? {
                ...h,
                time: hearingDetails.time || h.time || '10:00 AM',
                bench: hearingDetails.bench || h.bench || 'Honourable High Court Bench',
                purpose: hearingDetails.nextHearingPurpose,
                counselAssigned: hearingDetails.counselAssigned || h.counselAssigned || foundCase.assignedCounsel,
                forum: hearingDetails.forum || h.forum || foundCase.forum
              }
            : h
        );
      } else {
        const newHearing: HearingEvent = {
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
        updatedHearings = [newHearing, ...hearings];
      }

      setHearings(updatedHearings);
      saveToStorage(STORAGE_KEYS.HEARINGS, updatedHearings);
      updatedHearings.forEach((h) => saveToFirestoreDoc('hearings', h.id, h));
    }
  };

  const updateHearing = (hearingId: string, updatedData: Partial<HearingEvent>) => {
    let updatedDoc: HearingEvent | null = null;
    const updated = hearings.map((h) => {
      if (h.id === hearingId) {
        const obj = { ...h, ...updatedData };
        updatedDoc = obj;
        return obj;
      }
      return h;
    });
    setHearings(updated);
    saveToStorage(STORAGE_KEYS.HEARINGS, updated);
    if (updatedDoc) {
      saveToFirestoreDoc('hearings', hearingId, updatedDoc);
    }
  };

  // --- NOTIFICATION ACTIONS ---
  const sendNotification = (notif: Omit<NotificationLog, 'id' | 'sentAt' | 'status'>) => {
    const newNotif: NotificationLog = {
      ...notif,
      id: createUniqueId('notif'),
      sentAt: getTodayDateString(),
      status: 'Delivered'
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
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
    addClient,
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
    resetPracticeAreas
  };
}
