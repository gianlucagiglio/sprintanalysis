import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  selectedSenders: new Set(),
  activeModal: null, // 'delete-confirm' | 'filter-creator' | null
  modalData: null,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  selectSender: (email) =>
    set((s) => {
      const next = new Set(s.selectedSenders);
      next.add(email);
      return { selectedSenders: next };
    }),

  deselectSender: (email) =>
    set((s) => {
      const next = new Set(s.selectedSenders);
      next.delete(email);
      return { selectedSenders: next };
    }),

  toggleSender: (email) =>
    set((s) => {
      const next = new Set(s.selectedSenders);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return { selectedSenders: next };
    }),

  selectAll: (emails) => set({ selectedSenders: new Set(emails) }),
  deselectAll: () => set({ selectedSenders: new Set() }),

  openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  addToast: (toast) =>
    set((s) => {
      const id = Date.now();
      setTimeout(() => {
        set((s2) => ({ toasts: s2.toasts.filter((t) => t.id !== id) }));
      }, toast.duration || 4000);
      return { toasts: [...s.toasts, { ...toast, id }] };
    }),
}));

export default useUiStore;
