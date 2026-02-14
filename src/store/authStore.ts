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
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
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

      // ✅ MÉTODO DE INICIALIZAÇÃO
      initialize: async () => {
        console.log('🚀 [AuthStore] Inicializando...');
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ [AuthStore] Erro ao buscar sessão:', error);
            set({ isLoading: false, user: null, profile: null, isAuthenticated: false });
            return;
          }
          
          if (session?.user) {
            console.log('✅ [AuthStore] Sessão encontrada');
            
            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
              },
              isAuthenticated: true,
            });
            
            // Buscar perfil
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (profile) {
                console.log('✅ [AuthStore] Perfil carregado');
                set({ profile });
              }
            } catch (err) {
              console.warn('⚠️ [AuthStore] Erro ao carregar perfil:', err);
            }
          } else {
            console.log('ℹ️ [AuthStore] Nenhuma sessão ativa');
            set({ user: null, profile: null, isAuthenticated: false });
          }
          
          set({ isLoading: false });
          console.log('✅ [AuthStore] Inicialização completa');
          
        } catch (error) {
          console.error('❌ [AuthStore] Erro crítico:', error);
          set({ isLoading: false, user: null, profile: null, isAuthenticated: false });
        }
      },

      signOut: async () => {
        console.log('🚪 Iniciando logout...');

        try {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });

          localStorage.removeItem('auth-storage');

          await supabase.auth.signOut();

          console.log('✅ Logout completo');
          window.location.href = '/login';

        } catch (error) {
          console.error('❌ Erro no logout:', error);
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
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ========================================
// INICIALIZAÇÃO IMEDIATA
// ========================================
useAuthStore.getState().initialize();

// ========================================
// LISTENER DE EVENTOS
// ========================================
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();

  console.log('🔔 Auth event:', event);

  if (event === 'SIGNED_IN' && session) {
    console.log('✅ SIGNED_IN: Usuário fez login');
    
    try {
      store.setUser({
        id: session.user.id,
        email: session.user.email || '',
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        console.log('✅ Perfil carregado');
        store.setProfile(profile);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar perfil:', err);
    } finally {
      store.setLoading(false);
    }
  }

  if (event === 'SIGNED_OUT') {
    console.log('🚪 SIGNED_OUT');
    store.setUser(null);
    store.setProfile(null);
    store.setLoading(false);
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token atualizado');
  }
});