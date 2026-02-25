import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clusterBySender } from '../lib/clustering';
import { categorize } from '../lib/categorizer';

// Custom storage that silently handles quota errors
const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Quota exceeded — silently ignore, data lives in memory
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
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

      // Remove emails by sender (after delete action)
      removeEmailsBySender: (senderEmail) => {
        set((s) => {
          const emails = s.emails.filter(
            (e) => extractEmail(e.from) !== senderEmail
          );
          return {
            emails,
            clusters: clusterBySender(emails),
          };
        });
      },

      // Mark emails as read by sender
      markReadBySender: (senderEmail) => {
        set((s) => {
          const emails = s.emails.map((e) =>
            extractEmail(e.from) === senderEmail
              ? { ...e, labelIds: e.labelIds.filter((l) => l !== 'UNREAD') }
              : e
          );
          return {
            emails,
            clusters: clusterBySender(emails),
          };
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
      name: 'gmail-analyzer-emails',
      storage: safeStorage,
      partialize: (state) => ({
        clusters: state.clusters,
        lastScanDate: state.lastScanDate,
      }),
    }
  )
);

function extractEmail(from) {
  const match = from.match(/<(.+?)>/);
  return match ? match[1].toLowerCase() : from.toLowerCase().trim();
}

export default useEmailStore;
