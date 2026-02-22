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
  applyCustomColor: (color: string) => void; // ✅ NOVO
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      customColor: '#8B5CF6', // roxo padrão
      sidebarOpen: true,
      taskModalOpen: false,
      categoryModalOpen: false,
      pomodoroDrawerOpen: false,

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },

      // ✅ NOVO: Aplica cor customizada imediatamente
      applyCustomColor: (color: string) => {
        console.log('🎨 Aplicando cor customizada:', color);
        
        // Aplicar no root
        document.documentElement.style.setProperty('--color-primary', color);
        document.documentElement.style.setProperty('--color-custom', color);
        
        // Forçar repaint
        document.body.style.display = 'none';
        document.body.offsetHeight; // trigger reflow
        document.body.style.display = '';
      },

      setCustomColor: (customColor) => {
        set({ customColor });
        get().applyCustomColor(customColor);
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
        
        // ✅ CORRIGIDO: Aplicar cor customizada COM DELAY
        if (state?.customColor) {
          // Delay pequeno para garantir que o DOM está pronto
          setTimeout(() => {
            console.log('🎨 Inicializando cor customizada:', state.customColor);
            state.applyCustomColor(state.customColor);
          }, 100);
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