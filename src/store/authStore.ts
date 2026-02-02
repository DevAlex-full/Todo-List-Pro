import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { User, Profile } from '@/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setProfile: (profile) =>
        set({ profile }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      signOut: async () => {
        await supabase.auth.signOut();
        set({ 
          user: null, 
          profile: null, 
          isAuthenticated: false 
        });
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Verificar sessão atual
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
              },
              isAuthenticated: true,
            });

            // Buscar perfil
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              set({ profile });
            }
          } else {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Erro ao inicializar auth:', error);
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
