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

    // Validações
    if (!email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      // Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Usuário não foi criado');

      const userId = authData.user.id;

      // Aguardar trigger
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Criar perfil
      await supabase.from('profiles').upsert({
        id: userId,
        email: authData.user.email || email,
        full_name: fullName || null,
        avatar_url: null,
        theme_preference: 'dark',
        custom_color: '#8B5CF6',
        notifications_enabled: true,
      }, {
        onConflict: 'id',
      });

      // Criar categorias
      await supabase.from('categories').upsert([
        { user_id: userId, name: 'Trabalho', color: '#3B82F6', icon: '💼' },
        { user_id: userId, name: 'Pessoal', color: '#10B981', icon: '🏠' },
        { user_id: userId, name: 'Estudos', color: '#8B5CF6', icon: '📚' },
        { user_id: userId, name: 'Urgente', color: '#EF4444', icon: '🔥' },
      ], {
        onConflict: 'user_id,name',
        ignoreDuplicates: true
      });

      // Mostrar mensagem de sucesso
      setRegisteredEmail(email);
      setShowSuccessMessage(true);

      toast.success('✅ Conta criada com sucesso!', {
        duration: 5000,
      });

    } catch (error: any) {
      console.error('Erro no registro:', error);

      if (error.message?.includes('already registered') ||
        error.message?.includes('already been registered') ||
        error.message?.includes('User already registered')) {
        toast.error('📧 Este email já está cadastrado. Tente fazer login.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('📧 Email inválido. Verifique e tente novamente.');
      } else if (error.message?.includes('Password')) {
        toast.error('🔒 Senha inválida. Use no mínimo 6 caracteres.');
      } else {
        toast.error(`Erro: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Se conta foi criada, mostra mensagem de confirmação
  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

        {/* Background animado */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom"
          style={{ backgroundImage: "url('/fundo3.jpeg')" }}
        ></div>

        {/* Aura roxa */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20"></div>

        {/* Blur + escurecimento */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/50"></div>

        <div className="w-full max-w-md relative z-10">

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
            {/* Ícone de Sucesso */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Conta Criada com Sucesso! 🎉
            </h1>

            {/* Mensagem de Confirmação */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="text-yellow-200 font-semibold mb-2">
                    📧 Confirme seu email para continuar
                  </h3>
                  <p className="text-yellow-100 text-sm leading-relaxed">
                    Enviamos um email de confirmação para:
                  </p>
                  <p className="text-yellow-200 font-medium text-sm mt-1 bg-yellow-500/10 px-3 py-2 rounded-lg break-all">
                    {registeredEmail}
                  </p>
                  <p className="text-yellow-100 text-sm mt-3 leading-relaxed">
                    Clique no link de confirmação no email para ativar sua conta e fazer login.
                  </p>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-purple-200 text-sm">
                    <strong className="text-purple-100">Não recebeu o email?</strong>
                    <br />
                    • Verifique a pasta de SPAM/Lixo Eletrônico
                    <br />
                    • Aguarde alguns minutos
                    <br />
                    • Verifique se digitou o email corretamente
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/50"
              >
                Ir para Login
              </button>

              <button
                onClick={() => {
                  setShowSuccessMessage(false);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                }}
                className="w-full py-3 bg-white/5 border border-white/10 text-purple-200 font-medium rounded-xl hover:bg-white/10 transition-all"
              >
                Criar outra conta
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-purple-300/70">
            © 2026 TaskFlow • Desenvolvido por DevAlex
          </p>
        </div>
      </div>
    );
  }

  // Formulário de Registro
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background animado */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom"
        style={{ backgroundImage: "url('/fundo3.jpeg')" }}
      ></div>

      {/* Aura roxa */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20"></div>

      {/* Blur + escurecimento */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/50"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-24 h-24 object-contain drop-shadow-[0_0_35px_rgba(139,92,246,0.9)]"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-purple-200">Comece a organizar suas tarefas agora</p>
        </div>

        {/* Card de Registro */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                Nome Completo <span className="text-purple-400 text-xs">(opcional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                Confirmar Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Registrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </span>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Link para login */}
          <p className="mt-6 text-center text-sm text-purple-200">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-purple-300/70">
          © 2026 TaskFlow • Desenvolvido por DevAlex
        </p>
      </div>
    </div>
  );
}