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
// LISTENER ÚNICO - PADRÃO OFICIAL SUPABASE
// ========================================
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();

  console.log('🔔 Auth event:', event, session ? '(com sessão)' : '(sem sessão)');

  // INITIAL_SESSION é SEMPRE o primeiro evento ao carregar
  if (event === 'INITIAL_SESSION') {
    if (session?.user) {
      console.log('✅ INITIAL_SESSION: Sessão ativa');
      
      store.setUser({
        id: session.user.id,
        email: session.user.email || '',
      });

      // ✅ Buscar perfil com TIMEOUT
      console.log('🔍 Buscando perfil...');
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile timeout')), 5000)
      );
      
      try {
        const { data: profile } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;
        
        if (profile) {
          console.log('✅ Perfil carregado');
          store.setProfile(profile);
        } else {
          console.log('ℹ️ Perfil não encontrado');
        }
      } catch (profileError: any) {
        console.error('❌ Erro/timeout ao buscar perfil:', profileError.message);
        // Continua sem perfil
      }
    } else {
      console.log('ℹ️ INITIAL_SESSION: Sem sessão');
      
      // ✅ LIMPAR dados antigos do localStorage
      const storedData = localStorage.getItem('auth-storage');
      if (storedData) {
        console.log('🧹 Limpando dados antigos do localStorage');
        localStorage.removeItem('auth-storage');
      }
      
      store.setUser(null);
      store.setProfile(null);
    }
    
    // SEMPRE libera o loading no INITIAL_SESSION
    store.setLoading(false);
    console.log('✅ AuthStore pronto');
    return;
  }

  if (event === 'SIGNED_IN' && session) {
    console.log('✅ SIGNED_IN: Usuário fez login');
    
    try {
      store.setUser({
        id: session.user.id,
        email: session.user.email || '',
      });

      // ✅ Buscar perfil com TIMEOUT
      console.log('🔍 Buscando perfil...');
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile timeout')), 5000)
      );
      
      try {
        const { data: profile } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;
        
        if (profile) {
          console.log('✅ Perfil carregado');
          store.setProfile(profile);
        } else {
          console.log('ℹ️ Perfil não encontrado');
        }
      } catch (profileError: any) {
        console.error('❌ Erro/timeout ao buscar perfil:', profileError.message);
        // Continua sem perfil
      }
      
    } catch (err) {
      console.error('❌ Erro ao processar SIGNED_IN:', err);
    } finally {
      // ✅ SEMPRE libera loading
      store.setLoading(false);
      console.log('✅ AuthStore pronto (via SIGNED_IN)');
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