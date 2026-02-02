import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemePreference } from '@/types';

interface UIState {
  theme: ThemePreference;
  customColor: string;
  sidebarOpen: boolean;
  taskModalOpen: boolean;
  categoryModalOpen: boolean;
  pomodoroDrawerOpen: boolean;
  
  // Actions
  setTheme: (theme: ThemePreference) => void;
  setCustomColor: (color: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTaskModalOpen: (open: boolean) => void;
  setCategoryModalOpen: (open: boolean) => void;
  setPomodoroDrawerOpen: (open: boolean) => void;
  applyTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      customColor: '#3B82F6',
      sidebarOpen: true,
      taskModalOpen: false,
      categoryModalOpen: false,
      pomodoroDrawerOpen: false,

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },

      setCustomColor: (customColor) => {
        set({ customColor });
        document.documentElement.style.setProperty('--color-primary', customColor);
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      setTaskModalOpen: (taskModalOpen) => set({ taskModalOpen }),
      
      setCategoryModalOpen: (categoryModalOpen) => set({ categoryModalOpen }),
      
      setPomodoroDrawerOpen: (pomodoroDrawerOpen) => set({ pomodoroDrawerOpen }),

      applyTheme: () => {
        const { theme } = get();
        const root = window.document.documentElement;

        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // Auto - detectar preferência do sistema
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (systemPrefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },
    }),
    {
      name: 'ui-storage',
      onRehydrateStorage: () => (state) => {
        // Aplicar tema após carregar do storage
        state?.applyTheme();
        // Aplicar cor customizada
        if (state?.customColor) {
          document.documentElement.style.setProperty('--color-primary', state.customColor);
        }
      },
    }
  )
);

// Listener para mudanças de tema do sistema (quando em modo auto)
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, applyTheme } = useUIStore.getState();
    if (theme === 'auto') {
      applyTheme();
    }
  });
}
