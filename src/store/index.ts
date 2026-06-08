import { create } from 'zustand';
import type { User, DeviceInfoResponse } from '../../shared/types.js';

interface AppState {
  user: User | null;
  token: string | null;
  currentDevice: DeviceInfoResponse | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setCurrentDevice: (device: DeviceInfoResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  currentDevice: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setCurrentDevice: (device) => set({ currentDevice: device }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
    }
  },
}));

export default useAppStore;
