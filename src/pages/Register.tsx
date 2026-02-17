import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) { toast.error('Preencha todos os campos obrigatórios'); return; }
    if (password.length < 6) { toast.error('A senha deve ter no mínimo 6 caracteres'); return; }
    if (password !== confirmPassword) { toast.error('As senhas não coincidem'); return; }
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName || null } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Usuário não foi criado');
      const userId = authData.user.id;
      await new Promise(resolve => setTimeout(resolve, 2000));
      await supabase.from('profiles').upsert({
        id: userId, email: authData.user.email || email, full_name: fullName || null,
        avatar_url: null, theme_preference: 'dark', custom_color: '#8B5CF6', notifications_enabled: true,
      }, { onConflict: 'id' });
      await supabase.from('categories').upsert([
        { user_id: userId, name: 'Trabalho', color: '#3B82F6', icon: '💼' },
        { user_id: userId, name: 'Pessoal', color: '#10B981', icon: '🏠' },
        { user_id: userId, name: 'Estudos', color: '#8B5CF6', icon: '📚' },
        { user_id: userId, name: 'Urgente', color: '#EF4444', icon: '🔥' },
      ], { onConflict: 'user_id,name', ignoreDuplicates: true });
      setRegisteredEmail(email);
      setShowSuccessMessage(true);
      toast.success('✅ Conta criada com sucesso!', { duration: 5000 });
    } catch (error: any) {
      if (error.message?.includes('already registered') || error.message?.includes('already been registered') || error.message?.includes('User already registered'))
        toast.error('📧 Este email já está cadastrado. Tente fazer login.');
      else if (error.message?.includes('Invalid email')) toast.error('📧 Email inválido.');
      else if (error.message?.includes('Password')) toast.error('🔒 Senha inválida. Use no mínimo 6 caracteres.');
      else toast.error(`Erro: ${error.message}`);
    } finally { setIsLoading(false); }
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen overflow-y-auto flex items-center justify-center p-4 relative">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom" style={{ backgroundImage: "url('/fundo3.jpeg')" }} />
        <div className="fixed inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20" />
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50" />
        <div className="w-full max-w-md relative z-10 py-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/20 text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg shadow-green-500/50">
              <CheckCircle className="w-9 h-9 lg:w-12 lg:h-12 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4">Conta Criada! 🎉</h1>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="text-sm lg:text-base text-yellow-200 font-semibold mb-1.5">📧 Confirme seu email para continuar</h3>
                  <p className="text-xs lg:text-sm text-yellow-100">Enviamos um email de confirmação para:</p>
                  <p className="text-xs lg:text-sm text-yellow-200 font-medium mt-1 bg-yellow-500/10 px-3 py-1.5 rounded-lg break-all">{registeredEmail}</p>
                  <p className="text-xs text-yellow-100 mt-2">Clique no link de confirmação para ativar sua conta.</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs lg:text-sm text-purple-200 text-left">
                  <strong className="text-purple-100">Não recebeu o email?</strong><br />
                  • Verifique a pasta de SPAM<br />
                  • Aguarde alguns minutos<br />
                  • Verifique se digitou corretamente
                </p>
              </div>
            </div>
            <div className="space-y-2 lg:space-y-3">
              <button onClick={() => navigate('/login')} className="w-full py-2.5 lg:py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/50 text-sm lg:text-base">
                Ir para Login
              </button>
              <button
                onClick={() => { setShowSuccessMessage(false); setEmail(''); setPassword(''); setConfirmPassword(''); setFullName(''); }}
                className="w-full py-2.5 lg:py-3 bg-white/5 border border-white/10 text-purple-200 font-medium rounded-xl hover:bg-white/10 transition-all text-sm lg:text-base"
              >
                Criar outra conta
              </button>
            </div>
          </div>
          <p className="mt-6 text-center text-xs lg:text-sm text-purple-300/70">© 2026 TaskFlow • Desenvolvido por DevAlex</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom" style={{ backgroundImage: "url('/fundo3.jpeg')" }} />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20" />
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50" />

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Logo */}
        <div className="text-center mb-6 lg:mb-8">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 lg:w-24 lg:h-24 object-contain drop-shadow-[0_0_35px_rgba(139,92,246,0.9)] mx-auto" />
          <h1 className="mt-3 lg:mt-4 text-3xl lg:text-4xl font-bold text-white">Criar Conta</h1>
          <p className="mt-1 text-sm lg:text-base text-purple-200">Comece a organizar suas tarefas agora</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/20">
          <form onSubmit={handleRegister} className="space-y-4 lg:space-y-5">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5">
                Nome Completo <span className="text-purple-400 text-xs">(opcional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome"
                  className="w-full pl-9 lg:pl-11 pr-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base" />
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required
                  className="w-full pl-9 lg:pl-11 pr-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base" />
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required minLength={6}
                  className="w-full pl-9 lg:pl-11 pr-12 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5">
                Confirmar Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente" required
                  className="w-full pl-9 lg:pl-11 pr-12 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 lg:py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/50 text-sm lg:text-base">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Criando conta...</span> : 'Criar Conta'}
            </button>
          </form>

          <p className="mt-5 lg:mt-6 text-center text-xs lg:text-sm text-purple-200">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Fazer login</Link>
          </p>
        </div>

        <p className="mt-6 lg:mt-8 text-center text-xs lg:text-sm text-purple-300/70">© 2026 TaskFlow • Desenvolvido por DevAlex</p>
      </div>
    </div>
  );
}