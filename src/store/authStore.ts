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
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      initialize: async () => {
        console.log('🔄 Inicializando autenticação...');
        
        try {
          const currentState = get();
          if (currentState.user && currentState.profile) {
            console.log('✅ Usuário em cache, mantendo login');
            set({ 
              isAuthenticated: true,
              isLoading: false 
            });
            
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (!session) {
                console.warn('⚠️ Sessão expirou, fazendo logout');
                get().signOut();
              }
            }).catch(() => {
              console.warn('⚠️ Erro ao verificar sessão');
            });
            
            return;
          }

          set({ isLoading: true });

          const sessionResult = await Promise.race([
            supabase.auth.getSession(),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            ),
          ]).catch(() => ({ data: { session: null }, error: new Error('Timeout') }));

          const { data: { session }, error } = sessionResult;
          
          if (error || !session) {
            console.log('❌ Sem sessão válida');
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          if (session?.user) {
            console.log('✅ Sessão encontrada:', session.user.email);
            
            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
              },
              isAuthenticated: true,
            });

            try {
              const profileResult = await Promise.race([
                supabase.from('profiles').select('*').eq('id', session.user.id).single(),
                new Promise<any>((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout')), 5000)
                ),
              ]).catch(() => ({ data: null, error: new Error('Timeout') }));

              const { data: profile, error: profileError } = profileResult;

              if (profile && !profileError) {
                console.log('✅ Perfil encontrado');
                set({ profile });
              } else {
                console.warn('⚠️ Perfil não encontrado, criando...');
                
                try {
                  const { data: newProfile, error: createError } = await supabase
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

                  if (newProfile && !createError) {
                    set({ profile: newProfile });
                  }
                } catch (createErr) {
                  console.error('Erro ao criar perfil:', createErr);
                }
              }
            } catch (profileError) {
              console.error('Erro ao buscar perfil:', profileError);
            }
          } else {
            console.log('❌ Nenhuma sessão encontrada');
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
            });
          }
        } catch (error: any) {
          console.error('Erro ao inicializar auth:', error.message);
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        } finally {
          console.log('✅ Autenticação inicializada');
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

// Listener OAuth
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 Auth state change:', event);
  
  if (event === 'SIGNED_IN' && session) {
    console.log('✅ Usuário logado:', session.user.email);
    
    const store = useAuthStore.getState();
    
    store.setUser({
      id: session.user.id,
      email: session.user.email || '',
    });
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile && !profileError) {
        store.setProfile(profile);
      } else {
        const { data: newProfile, error: createError } = await supabase
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

        if (newProfile && !createError) {
          store.setProfile(newProfile);
        }
      }
      
      const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      const hasJustLoggedIn = sessionStorage.getItem('oauth_login_complete');
      
      if (isLoginPage && !hasJustLoggedIn) {
        console.log('🎯 Redirecionando para dashboard...');
        sessionStorage.setItem('oauth_login_complete', 'true');
        setTimeout(() => {
          sessionStorage.removeItem('oauth_login_complete');
        }, 5000);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Erro ao criar perfil OAuth:', error);
    }
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('👋 Usuário deslogado');
    const store = useAuthStore.getState();
    store.setUser(null);
    store.setProfile(null);
  }
});