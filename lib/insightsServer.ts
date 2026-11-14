import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore/lite';
import firebaseConfig from '../firebase-applet-config.json';
import { INITIAL_INSIGHTS } from '@/data/portalSeedData';
import { BLOG_POSTS } from '@/data/lawFirmData';
import { LegalInsightItem } from '@/types/portal';

const SERVER_APP_NAME = 'server-insights-reader';

function getServerFirestore() {
  const existing = getApps().find((a) => a.name === SERVER_APP_NAME);
  const app = existing || initializeApp(firebaseConfig, SERVER_APP_NAME);
  return firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

function normalizeInsight(raw: Record<string, any>, fallbackId?: string): LegalInsightItem {
  const id = String(raw.id || fallbackId || '').trim();
  const title = String(raw.title || 'Legal Insight').trim();
  const slug =
    String(raw.slug || '').trim() ||
    id ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const authorObj =
    raw.author && typeof raw.author === 'object'
      ? {
          name: String(raw.author.name || 'HISK LEGAL Counsel'),
          role: String(raw.author.role || 'Advocate High Court'),
          avatar: String(raw.author.avatar || ''),
        }
      : {
          name: String(raw.author || 'HISK LEGAL Counsel'),
          role: 'Advocate High Court',
          avatar: '',
        };

  const content = Array.isArray(raw.content)
    ? raw.content.map((p: unknown) => String(p)).filter(Boolean)
    : typeof raw.content === 'string'
      ? raw.content
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

  const keyTakeaways = Array.isArray(raw.keyTakeaways)
    ? raw.keyTakeaways.map((t: unknown) => String(t)).filter(Boolean)
    : [];

  return {
    id: id || slug,
    title,
    slug,
    category: String(raw.category || 'Legal Insights'),
    date: String(raw.date || '2026'),
    readTime: String(raw.readTime || '5 min read'),
    excerpt: String(raw.excerpt || ''),
    author: authorObj,
    keyTakeaways,
    content,
    featured: raw.featured !== false,
    status: (raw.status as LegalInsightItem['status']) || 'published',
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore server read timeout')), ms)
    ),
  ]);
}

const FALLBACK_POSTS: LegalInsightItem[] = (
  INITIAL_INSIGHTS.length > 0 ? INITIAL_INSIGHTS : BLOG_POSTS
).map((p) => normalizeInsight(p, p.id));

export async function getAllInsightsServer(): Promise<LegalInsightItem[]> {
  try {
    const db = getServerFirestore();
    const snap = await withTimeout(getDocs(collection(db, 'legal_insights')));
    if (!snap.empty) {
      const items = snap.docs.map((d) => normalizeInsight(d.data(), d.id));
      // Sort newest / custom articles first while keeping deterministic ordering
      items.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || '';
        const dateB = b.updatedAt || b.createdAt || '';
        return dateB.localeCompare(dateA);
      });
      return items;
    }
  } catch (err) {
    console.warn('Server insights fetch fallback:', err);
  }
  return FALLBACK_POSTS;
}

export async function getInsightBySlugServer(rawSlug: string): Promise<{
  post: LegalInsightItem | null;
  allPosts: LegalInsightItem[];
}> {
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch {
    decodedSlug = rawSlug;
  }
  decodedSlug = decodedSlug.trim().replace(/\/+$/, '');
  const lowerSlug = decodedSlug.toLowerCase();

  const matchPost = (list: LegalInsightItem[]) =>
    list.find(
      (p) =>
        p.slug === decodedSlug ||
        p.id === decodedSlug ||
        p.slug?.toLowerCase() === lowerSlug ||
        p.id?.toLowerCase() === lowerSlug
    ) || null;

  const allPosts = await getAllInsightsServer();
  let post = matchPost(allPosts);

  // Direct targeted lookup in Firestore if not matched in collection list
  if (!post) {
    try {
      const db = getServerFirestore();
      const q = query(collection(db, 'legal_insights'), where('slug', '==', decodedSlug));
      const qSnap = await withTimeout(getDocs(q));
      if (!qSnap.empty) {
        const firstDoc = qSnap.docs[0];
        post = normalizeInsight(firstDoc.data(), firstDoc.id);
      } else {
        const docSnap = await withTimeout(getDoc(doc(db, 'legal_insights', decodedSlug)));
        if (docSnap.exists()) {
          post = normalizeInsight(docSnap.data(), docSnap.id);
        }
      }
    } catch (err) {
      console.warn('Direct slug lookup error:', err);
    }
  }

  // Fallback to hardcoded seed posts if Firestore didn't return it
  if (!post) {
    post = matchPost(FALLBACK_POSTS);
  }

  return { post, allPosts };
}
