import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clusterBySender } from '../lib/clustering';
import { categorize } from '../lib/categorizer';

// IndexedDB storage — no 5MB limit like localStorage
const DB_NAME = 'gmail-analyzer';
const STORE_NAME = 'state';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const idbStorage = {
  getItem: async (name) => {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(name);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(value, name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  },
  removeItem: async (name) => {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  },
};

const useEmailStore = create(
  persist(
    (set, get) => ({
      emails: [],
      clusters: [],
      scanProgress: null, // { phase, fetched, total, percent, message }
      isScanning: false,
      lastScanDate: null,

      // Filters for sender list
      filters: {
        category: null,
        search: '',
        sortBy: 'count', // count | unread | name
        sortDir: 'desc',
      },

      setFilters: (updates) =>
        set((s) => ({ filters: { ...s.filters, ...updates } })),

      startScan: () => {
        set({ emails: [], clusters: [], isScanning: true, scanProgress: null });

        const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const eventSource = new EventSource(`${baseUrl}/api/scan`, {
          withCredentials: true,
        });

        eventSource.addEventListener('status', (e) => {
          const data = JSON.parse(e.data);
          set({ scanProgress: data });
        });

        eventSource.addEventListener('listing', (e) => {
          const data = JSON.parse(e.data);
          set({
            scanProgress: {
              phase: 'listing',
              message: `Raccogliendo ID: ${data.collected} trovati...`,
              collected: data.collected,
            },
          });
        });

        eventSource.addEventListener('progress', (e) => {
          const data = JSON.parse(e.data);
          set((s) => {
            const newEmails = [...s.emails, ...data.batch];
            return {
              emails: newEmails,
              scanProgress: {
                phase: 'fetching',
                fetched: data.fetched,
                total: data.total,
                percent: data.percent,
                message: `Scaricando metadata: ${data.fetched}/${data.total}`,
              },
            };
          });
        });

        eventSource.addEventListener('complete', (e) => {
          const data = JSON.parse(e.data);
          const emails = get().emails;
          const categorized = emails.map((email) => ({
            ...email,
            category: categorize(email),
          }));
          const clusters = clusterBySender(categorized);

          set({
            emails: categorized,
            clusters,
            isScanning: false,
            lastScanDate: new Date().toISOString(),
            scanProgress: {
              phase: 'complete',
              message: `Scan completata: ${data.total} email analizzate`,
              total: data.total,
              percent: 100,
            },
          });
          eventSource.close();
        });

        eventSource.addEventListener('error', (e) => {
          // SSE errors can be reconnection attempts or actual errors
          if (e.data) {
            const data = JSON.parse(e.data);
            set((s) => ({
              scanProgress: { ...s.scanProgress, error: data.message },
            }));
          }
        });

        eventSource.onerror = () => {
          if (get().isScanning) {
            const emails = get().emails;
            if (emails.length > 0) {
              const categorized = emails.map((email) => ({
                ...email,
                category: email.category || categorize(email),
              }));
              const clusters = clusterBySender(categorized);
              set({
                emails: categorized,
                clusters,
                isScanning: false,
                lastScanDate: new Date().toISOString(),
                scanProgress: {
                  phase: 'complete',
                  message: `Scan completata: ${emails.length} email analizzate`,
                  total: emails.length,
                  percent: 100,
                },
              });
            } else {
              set({ isScanning: false, scanProgress: null });
            }
            eventSource.close();
          }
        };

        return eventSource;
      },

      // Remove sender cluster (after delete action)
      // Works from clusters directly — no need for raw emails
      removeEmailsBySender: (senderEmail) => {
        set((s) => {
          // If raw emails are in memory, filter them too
          const emails = s.emails.length > 0
            ? s.emails.filter((e) => extractEmail(e.from) !== senderEmail)
            : s.emails;

          const clusters = s.clusters.filter(
            (c) => c.email !== senderEmail
          );

          return { emails, clusters };
        });
      },

      // Mark sender as read
      // Works from clusters directly — no need for raw emails
      markReadBySender: (senderEmail) => {
        set((s) => {
          // If raw emails are in memory, update them too
          const emails = s.emails.length > 0
            ? s.emails.map((e) =>
                extractEmail(e.from) === senderEmail
                  ? { ...e, labelIds: e.labelIds.filter((l) => l !== 'UNREAD') }
                  : e
              )
            : s.emails;

          const clusters = s.clusters.map((c) =>
            c.email === senderEmail
              ? { ...c, unread: 0, unreadRatio: 0 }
              : c
          );

          return { emails, clusters };
        });
      },

      clearData: () =>
        set({
          emails: [],
          clusters: [],
          scanProgress: null,
          isScanning: false,
          lastScanDate: null,
        }),
    }),
    {
      name: 'gmail-analyzer-data',
      storage: idbStorage,
      partialize: (state) => ({
        clusters: state.clusters,
        lastScanDate: state.lastScanDate,
      }),
    }
  )
);

// Clean up old localStorage entry from previous storage backend
try { localStorage.removeItem('gmail-analyzer-emails'); } catch { /* ignore */ }

function extractEmail(from) {
  const match = from.match(/<(.+?)>/);
  return match ? match[1].toLowerCase() : from.toLowerCase().trim();
}

export default useEmailStore;
