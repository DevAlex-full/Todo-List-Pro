import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import { User, Bell, Palette, Trash2, Save, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { profile, setProfile } = useAuthStore();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notifications_enabled ?? true);
  const [customColor, setCustomColor] = useState(profile?.custom_color || '#8B5CF6');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setNotificationsEnabled(profile.notifications_enabled ?? true);
      setCustomColor(profile.custom_color || '#8B5CF6');
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => { await api.patch('/profile', data); return data; },
    onSuccess: async (variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (profile) setProfile({ ...profile, ...variables });
      toast.success('✅ Perfil atualizado com sucesso!');
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Erro ao atualizar perfil'),
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      await api.patch('/profile', { email: newEmail });
      return newEmail;
    },
    onSuccess: (newEmail) => {
      toast.success('✅ Email atualizado! Verifique seu novo email.', { duration: 5000 });
      if (profile) setProfile({ ...profile, email: newEmail });
    },
    onError: (error: any) => toast.error(error.message || 'Erro ao atualizar email'),
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ full_name: fullName, notifications_enabled: notificationsEnabled, custom_color: customColor });
  };

  const handleUpdateEmail = () => {
    if (!email || email === profile?.email) { toast.error('Digite um novo email'); return; }
    if (!email.includes('@')) { toast.error('Digite um email válido'); return; }
    if (window.confirm('Tem certeza que deseja alterar seu email?')) updateEmailMutation.mutate(email);
  };

  const colors = [
    { name: 'Roxo', value: '#8B5CF6' }, { name: 'Violeta', value: '#7C3AED' },
    { name: 'Púrpura', value: '#A855F7' }, { name: 'Azul', value: '#3B82F6' },
    { name: 'Azul Esc.', value: '#2563EB' }, { name: 'Azul Cl.', value: '#60A5FA' },
    { name: 'Ciano', value: '#06B6D4' }, { name: 'Índigo', value: '#6366F1' },
    { name: 'Verde', value: '#10B981' }, { name: 'Esmeralda', value: '#059669' },
    { name: 'Lima', value: '#84CC16' }, { name: 'Verde Ág.', value: '#14B8A6' },
    { name: 'Rosa', value: '#EC4899' }, { name: 'Rosa Qt.', value: '#F43F5E' },
    { name: 'Vermelho', value: '#EF4444' }, { name: 'Carmesim', value: '#DC2626' },
    { name: 'Laranja', value: '#F59E0B' }, { name: 'Âmbar', value: '#D97706' },
    { name: 'Amarelo', value: '#EAB308' }, { name: 'Cinza', value: '#6B7280' },
    { name: 'Ardósia', value: '#64748B' }, { name: 'Zinc', value: '#71717A' },
  ];

  const emailChanged = email !== profile?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      <main className="lg:ml-64 p-4 lg:p-6 pt-16 lg:pt-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Configurações</h1>
          <p className="text-sm lg:text-base text-purple-200">Gerencie suas preferências e conta</p>
        </div>

        <div className="max-w-4xl space-y-4 lg:space-y-6">
          {/* Perfil */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-white">Perfil</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div
                  className="w-14 h-14 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-semibold shrink-0"
                  style={{ backgroundColor: customColor }}
                >
                  {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm lg:text-base text-white font-medium truncate">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs lg:text-sm text-purple-300 truncate">{profile?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">Email</label>
                {/* Stack vertical no mobile */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-9 lg:pl-11 pr-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
                    />
                  </div>
                  {emailChanged && (
                    <button
                      onClick={handleUpdateEmail}
                      disabled={updateEmailMutation.isPending}
                      className="px-4 py-2.5 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      {updateEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Alterar Email'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-purple-300 mt-1">
                  {emailChanged ? '⚠️ Você precisará confirmar o novo email' : 'Digite um novo email para alterá-lo'}
                </p>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Palette className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-white">Aparência</h2>
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-2 lg:mb-3">
                Cor do Tema ({colors.length} opções)
              </label>
              {/* 4 colunas mobile → 6 tablet → 8 desktop */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 lg:gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setCustomColor(color.value)}
                    className={`relative p-2 lg:p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                      customColor === color.value
                        ? 'border-white scale-105 ring-2 ring-white/50'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: `${color.value}20` }}
                    title={color.name}
                  >
                    <div className="w-full h-6 lg:h-10 rounded-lg shadow-lg" style={{ backgroundColor: color.value }} />
                    <p className="text-[9px] lg:text-[10px] text-white mt-1 lg:mt-2 text-center truncate">{color.name}</p>
                    {customColor === color.value && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-[9px] lg:text-[10px] font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-white">Notificações</h2>
            </div>
            <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm lg:text-base text-white font-medium">Ativar Notificações</p>
                <p className="text-xs lg:text-sm text-purple-300 mt-0.5">Receba lembretes sobre tarefas e prazos</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-11 h-6 lg:w-14 lg:h-8 rounded-full transition-colors shrink-0 ml-3 ${notificationsEnabled ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <div className={`absolute top-0.5 left-0.5 lg:top-1 lg:left-1 w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-5 lg:translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Salvar */}
          <button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 text-sm lg:text-base"
          >
            {updateProfileMutation.isPending ? (
              <><Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />Salvando...</>
            ) : (
              <><Save className="w-4 h-4 lg:w-5 lg:h-5" />Salvar Alterações</>
            )}
          </button>

          {/* Zona de Perigo */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3 lg:mb-4">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-white">Zona de Perigo</h2>
            </div>
            <p className="text-xs lg:text-sm text-purple-200 mb-3 lg:mb-4">Ações irreversíveis que afetam permanentemente sua conta</p>
            <button
              onClick={() => { if (window.confirm('Tem certeza? Esta ação não pode ser desfeita!')) { toast.error('Funcionalidade em desenvolvimento'); } }}
              className="w-full px-4 py-2.5 lg:py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all text-sm lg:text-base"
            >
              Deletar Conta Permanentemente
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}