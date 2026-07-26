import { create } from 'zustand';
import type { AppView, AuthUser, ConversionJob, Notification, ToolCategory } from '@/types';

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  
  // Auth
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Auth modal
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  
  // Conversions
  activeConversions: ConversionJob[];
  addConversion: (job: ConversionJob) => void;
  updateConversion: (id: string, updates: Partial<ConversionJob>) => void;
  removeConversion: (id: string) => void;
  
  // Active tool category
  activeCategory: ToolCategory;
  setActiveCategory: (category: ToolCategory) => void;
  
  // Active tool
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Language
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'landing',
  setCurrentView: (view) => set({ currentView: view }),
  
  // Auth
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  isAuthenticated: false,
  isLoadingSession: true,

  checkSession: async () => {
    set({ isLoadingSession: true });
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          currentView: 'dashboard',
          isLoadingSession: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          currentView: 'landing',
          isLoadingSession: false,
        });
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        currentView: 'landing',
        isLoadingSession: false,
      });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // Ignore errors
    }
    set({
      user: null,
      isAuthenticated: false,
      currentView: 'landing',
      activeConversions: [],
      activeTool: null,
      notifications: [],
    });
  },
  
  // Auth modal
  authModalOpen: false,
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  authModalTab: 'login',
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  openAuthModal: (tab) => set({ authModalOpen: true, authModalTab: tab || 'login' }),
  
  // Conversions
  activeConversions: [],
  addConversion: (job) => 
    set((state) => ({ activeConversions: [...state.activeConversions, job] })),
  updateConversion: (id, updates) =>
    set((state) => ({
      activeConversions: state.activeConversions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  removeConversion: (id) =>
    set((state) => ({
      activeConversions: state.activeConversions.filter((c) => c.id !== id),
    })),
  
  // Active category
  activeCategory: 'pdf',
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  // Active tool
  activeTool: null,
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: crypto.randomUUID(), createdAt: new Date() },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
  
  // Command palette
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  
  // Mobile menu
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  
  // Language
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
}));
