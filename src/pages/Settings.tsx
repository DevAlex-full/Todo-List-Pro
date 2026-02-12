import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import {
  User,
  Bell,
  Palette,
  Trash2,
  Save,
  Loader2,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { profile, setProfile } = useAuthStore();
  const queryClient = useQueryClient();

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notifications_enabled ?? true);
  const [customColor, setCustomColor] = useState(profile?.custom_color || '#8B5CF6');

  // Atualizar estados quando profile mudar
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setNotificationsEnabled(profile.notifications_enabled ?? true);
      setCustomColor(profile.custom_color || '#8B5CF6');
    }
  }, [profile]);

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.patch('/profile', data);
      return data;
    },
    onSuccess: async (variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Atualizar perfil localmente COM os dados enviados
      if (profile) {
        const updatedProfile = {
          ...profile,
          ...variables,
        };
        setProfile(updatedProfile);
      }
      
      toast.success('✅ Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
    },
  });

  // Mutation para atualizar email
  const updateEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      
      if (error) throw error;
      
      await api.patch('/profile', { email: newEmail });
      
      return newEmail;
    },
    onSuccess: (newEmail) => {
      toast.success('✅ Email atualizado! Verifique seu novo email para confirmar a mudança.', {
        duration: 5000,
      });
      
      if (profile) {
        setProfile({
          ...profile,
          email: newEmail,
        });
      }
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar email:', error);
      toast.error(error.message || 'Erro ao atualizar email');
    },
  });

  const handleSaveProfile = () => {
    const updates: any = {
      full_name: fullName,
      notifications_enabled: notificationsEnabled,
      custom_color: customColor,
    };

    updateProfileMutation.mutate(updates);
  };

  const handleUpdateEmail = () => {
    if (!email || email === profile?.email) {
      toast.error('Digite um novo email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }

    if (window.confirm('Tem certeza que deseja alterar seu email? Você precisará confirmar o novo email.')) {
      updateEmailMutation.mutate(email);
    }
  };

  const colors = [
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Violeta', value: '#7C3AED' },
    { name: 'Púrpura', value: '#A855F7' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Azul Escuro', value: '#2563EB' },
    { name: 'Azul Claro', value: '#60A5FA' },
    { name: 'Ciano', value: '#06B6D4' },
    { name: 'Índigo', value: '#6366F1' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Esmeralda', value: '#059669' },
    { name: 'Verde Limão', value: '#84CC16' },
    { name: 'Verde Água', value: '#14B8A6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Rosa Quente', value: '#F43F5E' },
    { name: 'Vermelho', value: '#EF4444' },
    { name: 'Carmesim', value: '#DC2626' },
    { name: 'Laranja', value: '#F59E0B' },
    { name: 'Âmbar', value: '#D97706' },
    { name: 'Amarelo', value: '#EAB308' },
    { name: 'Cinza', value: '#6B7280' },
    { name: 'Ardósia', value: '#64748B' },
    { name: 'Zinc', value: '#71717A' },
  ];

  const emailChanged = email !== profile?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-purple-200">Gerencie suas preferências e conta</p>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Profile Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Perfil</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                  style={{ backgroundColor: customColor }}
                >
                  {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-sm text-purple-300">{profile?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  {emailChanged && (
                    <button
                      onClick={handleUpdateEmail}
                      disabled={updateEmailMutation.isPending}
                      className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {updateEmailMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Alterar Email'
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-purple-300 mt-1">
                  {emailChanged 
                    ? '⚠️ Você precisará confirmar o novo email'
                    : 'Digite um novo email para alterá-lo'}
                </p>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Aparência</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-3">
                  Cor do Tema ({colors.length} opções disponíveis)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCustomColor(color.value)}
                      className={`relative p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        customColor === color.value
                          ? 'border-white scale-105 ring-2 ring-white/50'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: `${color.value}20` }}
                      title={color.name}
                    >
                      <div
                        className="w-full h-10 rounded-lg shadow-lg"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-[10px] text-white mt-2 text-center truncate">
                        {color.name}
                      </p>
                      {customColor === color.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Notificações</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-medium">Ativar Notificações</p>
                  <p className="text-sm text-purple-300 mt-1">
                    Receba lembretes sobre tarefas e prazos
                  </p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Zona de Perigo</h2>
            </div>

            <p className="text-sm text-purple-200 mb-4">
              Ações irreversíveis que afetam permanentemente sua conta
            </p>

            <button
              onClick={() => {
                if (window.confirm('Tem certeza? Esta ação não pode ser desfeita!')) {
                  toast.error('Funcionalidade em desenvolvimento');
                }
              }}
              className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all"
            >
              Deletar Conta Permanentemente
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}