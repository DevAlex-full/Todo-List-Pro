import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, Profile } from '@/types';

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
        console.log('🚪 Iniciando logout...');

        try {
          // PRIMEIRO: Limpar estado local
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // SEGUNDO: Limpar localStorage
          localStorage.removeItem('auth-storage');

          // TERCEIRO: Deslogar do Supabase (sem await)
          supabase.auth.signOut().catch(err => {
            console.warn('Erro ao deslogar (ignorado):', err);
          });

          console.log('✅ Logout completo');

          // QUARTO: Redirecionar
          window.location.href = '/login';

        } catch (error) {
          console.error('Erro no logout:', error);

          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      },

    }),
    {
      name: 'auth-storage',
    }
  )
);

// Listener OAuth
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();

  console.log('Auth event:', event);

  if (event === 'INITIAL_SESSION') {
    if (session) {
      store.setUser({
        id: session.user.id,
        email: session.user.email || '',
      });
    }

    store.setLoading(false);
    return;
  }

  if (event === 'SIGNED_IN' && session) {
    try {
      store.setUser({
        id: session.user.id,
        email: session.user.email || '',
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        store.setProfile(profile);
      }
    } catch (err) {
      console.error('Erro ao buscar profile:', err);
    } finally {
      store.setLoading(false);
    }
  }

  if (event === 'SIGNED_OUT') {
    store.setUser(null);
    store.setProfile(null);
    store.setLoading(false);
  }
});


