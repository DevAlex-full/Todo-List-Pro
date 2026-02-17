import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setProfile, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Preencha todos os campos'); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles').select('*').eq('id', data.user.id).maybeSingle();
          if (profile && !profileError) setProfile(profile);
        } catch {}
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) toast.error('Email ou senha incorretos');
      else if (error.message.includes('Email not confirmed')) toast.error('Por favor, confirme seu email antes de fazer login');
      else toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard`, queryParams: { access_type: 'offline', prompt: 'consent' } },
      });
      if (error) throw error;
    } catch (error: any) {
      setGoogleLoading(false);
      if (error.message.includes('provider') || error.message.includes('not enabled'))
        toast.error('Login com Google não está disponível no momento. Use email e senha.', { duration: 4000 });
      else toast.error('Erro ao fazer login com Google');
    }
  };

  const backgrounds = ['/fundo.jpeg', '/fundo1.jpeg', '/fundo2.jpeg', '/fundo3.jpeg'];
  const getNextBackground = () => {
    let lastIndex = parseInt(localStorage.getItem('loginBgIndex') || '-1', 10);
    if (isNaN(lastIndex)) lastIndex = -1;
    const nextIndex = (lastIndex + 1) % backgrounds.length;
    localStorage.setItem('loginBgIndex', String(nextIndex));
    return backgrounds[nextIndex];
  };
  const [background] = useState<string>(() => { try { return getNextBackground(); } catch { return backgrounds[0]; } });

  return (
    /* min-h-screen + overflow-y-auto = scroll no mobile se o conteúdo não couber */
    <div className="min-h-screen overflow-y-auto flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom" style={{ backgroundImage: `url(${background})` }} />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20" />
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50" />
      <div className="noise-overlay" />

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Logo */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 lg:w-24 lg:h-24 object-contain drop-shadow-[0_0_35px_rgba(139,92,246,0.9)]" />
          </div>
          <h1 className="mt-4 lg:mt-6 text-3xl lg:text-4xl font-bold text-white tracking-tight">TaskFlow</h1>
          <p className="mt-2 text-sm lg:text-base text-purple-200">Organize suas tarefas com eficiência</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/20">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-5 lg:mb-6">Entrar</h2>

          <form onSubmit={handleLogin} className="space-y-4 lg:space-y-5">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 lg:pl-11 pr-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 lg:pl-11 pr-12 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 lg:py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/50 text-sm lg:text-base"
            >
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />Entrando...</span> : 'Entrar'}
            </button>
          </form>

          <div className="relative my-5 lg:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs lg:text-sm">
              <span className="px-4 bg-transparent text-purple-200">ou</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-2.5 lg:py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm lg:text-base"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : (
              <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? 'Conectando...' : 'Continuar com Google'}
          </button>

          <p className="mt-5 lg:mt-6 text-center text-xs lg:text-sm text-purple-200">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Criar conta grátis
            </Link>
          </p>
        </div>

        <p className="mt-6 lg:mt-8 text-center text-xs lg:text-sm text-purple-300/70">
          © 2026 TaskFlow • Desenvolvido por DevAlex
        </p>
      </div>
    </div>
  );
}