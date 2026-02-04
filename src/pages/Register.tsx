import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev, msg]);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setDebugInfo([]);

    if (!email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      addDebug('🚀 INICIANDO REGISTRO...');
      addDebug(`📧 Email: ${email}`);
      addDebug(`🔐 Senha: ${password.length} caracteres`);
      
      // PASSO 1: Tentar criar usuário
      addDebug('');
      addDebug('PASSO 1: Criando usuário no Supabase Auth...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        addDebug(`❌ ERRO AUTH: ${authError.message}`);
        addDebug(`Código: ${authError.status}`);
        addDebug(`Detalhes: ${JSON.stringify(authError)}`);
        throw authError;
      }

      if (!authData.user) {
        addDebug('❌ ERRO: Nenhum usuário retornado');
        throw new Error('Usuário não foi criado');
      }

      const userId = authData.user.id;
      addDebug(`✅ Usuário criado! ID: ${userId}`);
      addDebug(`Email confirmado: ${authData.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);

      // PASSO 2: Aguardar
      addDebug('');
      addDebug('PASSO 2: Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      addDebug('✅ Aguardou');

      // PASSO 3: Verificar se perfil existe
      addDebug('');
      addDebug('PASSO 3: Verificando se perfil existe...');
      
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        addDebug(`⚠️ Erro ao verificar perfil: ${checkError.message}`);
      }

      if (existingProfile) {
        addDebug(`✅ Perfil JÁ EXISTE (trigger funcionou)`);
        addDebug(`Dados: ${JSON.stringify(existingProfile)}`);
      } else {
        addDebug('⚠️ Perfil NÃO existe, criando...');
        
        // PASSO 4: Criar perfil manualmente
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            full_name: fullName || null,
            avatar_url: null,
            theme_preference: 'dark',
            custom_color: '#8B5CF6',
            notifications_enabled: true,
          })
          .select()
          .single();

        if (profileError) {
          addDebug(`❌ ERRO ao criar perfil: ${profileError.message}`);
          addDebug(`Código: ${profileError.code}`);
          addDebug(`Detalhes: ${JSON.stringify(profileError)}`);
          
          // Tentar de novo com upsert
          addDebug('Tentando com UPSERT...');
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: email,
              full_name: fullName || null,
            });
          
          if (upsertError) {
            addDebug(`❌ UPSERT também falhou: ${upsertError.message}`);
          } else {
            addDebug('✅ UPSERT funcionou!');
          }
        } else {
          addDebug('✅ Perfil criado com sucesso!');
          addDebug(`Dados: ${JSON.stringify(newProfile)}`);
        }
      }

      // PASSO 5: Criar categorias
      addDebug('');
      addDebug('PASSO 5: Criando categorias padrão...');
      
      const { error: catError } = await supabase
        .from('categories')
        .insert([
          { user_id: userId, name: 'Trabalho', color: '#3B82F6', icon: '💼' },
          { user_id: userId, name: 'Pessoal', color: '#10B981', icon: '🏠' },
          { user_id: userId, name: 'Estudos', color: '#8B5CF6', icon: '📚' },
          { user_id: userId, name: 'Urgente', color: '#EF4444', icon: '🔥' },
        ]);

      if (catError) {
        addDebug(`⚠️ Erro ao criar categorias: ${catError.message}`);
      } else {
        addDebug('✅ Categorias criadas!');
      }

      // SUCESSO!
      addDebug('');
      addDebug('🎉 REGISTRO COMPLETO COM SUCESSO!');
      addDebug(`Usuário ID: ${userId}`);
      addDebug(`Email: ${email}`);
      
      toast.success('✅ Conta criada com sucesso!', { duration: 5000 });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      addDebug('');
      addDebug('❌❌❌ ERRO FATAL ❌❌❌');
      addDebug(`Mensagem: ${error.message}`);
      addDebug(`Stack: ${error.stack}`);
      addDebug(`Objeto completo: ${JSON.stringify(error)}`);
      
      toast.error(`Erro: ${error.message}`, { duration: 10000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptLTggMTZjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0em0wIDhjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0em04IDhjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="w-full max-w-4xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div>
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
                <div className="w-12 h-12 flex items-center justify-center text-white text-2xl font-bold">A</div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
              <p className="text-purple-200 text-sm">Modo Debug Ativado</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-1">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-1">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-1">Confirmar *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite novamente"
                      required
                      className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 shadow-lg shadow-purple-500/50 text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </span>
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-purple-200">
                Já tem conta? <Link to="/login" className="text-purple-400 font-semibold">Login</Link>
              </p>
            </div>
          </div>

          {/* Debug Panel */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <h2 className="text-white font-bold">Console de Debug</h2>
            </div>
            
            <div className="bg-black/60 rounded-lg p-3 h-96 overflow-y-auto font-mono text-xs">
              {debugInfo.length === 0 ? (
                <p className="text-gray-400">Aguardando ação...</p>
              ) : (
                debugInfo.map((msg, i) => (
                  <div key={i} className={`mb-1 ${
                    msg.includes('❌') ? 'text-red-400' :
                    msg.includes('✅') ? 'text-green-400' :
                    msg.includes('⚠️') ? 'text-yellow-400' :
                    msg.includes('🎉') ? 'text-purple-400 font-bold' :
                    'text-gray-300'
                  }`}>
                    {msg}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setDebugInfo([])}
              className="mt-2 w-full py-1.5 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30"
            >
              Limpar Console
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-purple-300/70">
          © 2026 TaskFlow • Debug Mode
        </p>
      </div>
    </div>
  );
}