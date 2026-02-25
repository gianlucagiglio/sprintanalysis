import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
