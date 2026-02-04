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
        console.log('🚪 Iniciando logout...');
        
        try {
          // 1. Fazer logout no Supabase
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Erro ao fazer logout no Supabase:', error);
          }
          
          // 2. Limpar estado SEMPRE (mesmo se der erro)
          set({ 
            user: null, 
            profile: null, 
            isAuthenticated: false 
          });
          
          // 3. Limpar localStorage manualmente (garantia)
          localStorage.removeItem('auth-storage');
          
          // 4. Recarregar página para limpar tudo
          console.log('✅ Logout completo, recarregando...');
          window.location.href = '/login';
          
        } catch (error) {
          console.error('Erro fatal no logout:', error);
          
          // Mesmo com erro, limpa tudo e redireciona
          set({ 
            user: null, 
            profile: null, 
            isAuthenticated: false 
          });
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Verificar sessão atual
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            console.log('✅ Sessão encontrada:', session.user.email);
            
            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
              },
              isAuthenticated: true,
            });

            // Buscar perfil
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              console.log('✅ Perfil encontrado');
              set({ profile });
            } else if (profileError) {
              console.warn('⚠️ Perfil não encontrado, criando...');
              
              // Criar perfil se não existir
              const { data: newProfile } = await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || null,
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                  theme_preference: 'dark',
                  custom_color: '#8B5CF6',
                  notifications_enabled: true,
                })
                .select()
                .single();

              if (newProfile) {
                set({ profile: newProfile });
              }
            }
          } else {
            console.log('❌ Nenhuma sessão encontrada');
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

// Listener para mudanças de autenticação (OAuth)
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 Auth state change:', event);
  
  if (event === 'SIGNED_IN' && session) {
    console.log('✅ Usuário logado:', session.user.email);
    
    const store = useAuthStore.getState();
    store.setUser({
      id: session.user.id,
      email: session.user.email || '',
    });
    
    // Buscar/criar perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      store.setProfile(profile);
    } else {
      // Criar perfil para usuário OAuth
      const { data: newProfile } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          theme_preference: 'dark',
          custom_color: '#8B5CF6',
          notifications_enabled: true,
        })
        .select()
        .single();

      if (newProfile) {
        store.setProfile(newProfile);
      }
    }
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('👋 Usuário deslogado');
    const store = useAuthStore.getState();
    store.setUser(null);
    store.setProfile(null);
  }
});