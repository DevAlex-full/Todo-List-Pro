import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import {
  TrendingUp, CheckCircle2, Clock, Target,
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react';
import { useState } from 'react';

type Period = 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics', period],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/statistics?period=${period}`);
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/tasks');
      return data.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const timeMetrics = (() => {
    if (!tasksData || tasksData.length === 0) return { totalMinutes: 0, averageMinutes: 0, completedWithTime: 0 };
    const completedTasks = tasksData.filter((t: any) => t.status === 'completed' && t.tempo_real);
    const totalMinutes = completedTasks.reduce((sum: number, t: any) => sum + (t.tempo_real || 0), 0);
    const averageMinutes = completedTasks.length > 0 ? Math.round(totalMinutes / completedTasks.length) : 0;
    return { totalMinutes, averageMinutes, completedWithTime: completedTasks.length };
  })();

  const formatTime = (minutes: number) => {
    if (minutes === 0) return '0h';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getPeriodLabel = (p: Period) => ({ week: 'Esta Semana', month: 'Este Mês', year: 'Este Ano' }[p]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      <main className="lg:ml-64 p-4 lg:p-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Analytics</h1>
            <p className="text-sm lg:text-base text-purple-200">Acompanhe seu desempenho e produtividade</p>
          </div>

          {/* Period selector — scroll horizontal no mobile */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 self-start sm:self-auto overflow-x-auto">
            {(['week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium transition-all text-xs lg:text-sm whitespace-nowrap ${
                  period === p
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                {getPeriodLabel(p)}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm lg:text-base text-purple-200">Carregando dados...</p>
            </div>
          </div>
        )}

        {!isLoading && stats && (
          <div className="space-y-4 lg:space-y-6">
            {/* Stats — 2 cols mobile, 4 desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-purple-200">Total</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats.total_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 lg:w-6 lg:h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-purple-200">Concluídas</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats.completed_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: `${stats.completion_rate || 0}%` }} />
                </div>
                <p className="text-xs text-green-400 mt-1.5">{stats.completion_rate || 0}% de conclusão</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 lg:w-6 lg:h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-purple-200">Progresso</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats.in_progress_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                    style={{ width: `${stats.total_tasks > 0 ? ((stats.in_progress_tasks || 0) / stats.total_tasks) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-purple-200">Pendentes</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats.pending_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-600"
                    style={{ width: `${stats.total_tasks > 0 ? ((stats.pending_tasks || 0) / stats.total_tasks) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Charts — stack no mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                  </div>
                  <h2 className="text-base lg:text-xl font-bold text-white">Produtividade</h2>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs lg:text-sm text-purple-200">Taxa de Conclusão</span>
                      <span className="text-xs lg:text-sm font-semibold text-white">{stats.completion_rate || 0}%</span>
                    </div>
                    <div className="h-2 lg:h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${stats.completion_rate || 0}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 pt-3 lg:pt-4 border-t border-white/10">
                    <div className="text-center p-3 lg:p-4 bg-white/5 rounded-xl">
                      <p className="text-xl lg:text-2xl font-bold text-white">{formatTime(timeMetrics.totalMinutes)}</p>
                      <p className="text-xs text-purple-200 mt-1">Tempo Total Real</p>
                    </div>
                    <div className="text-center p-3 lg:p-4 bg-white/5 rounded-xl">
                      <p className="text-xl lg:text-2xl font-bold text-white">{formatTime(timeMetrics.averageMinutes)}</p>
                      <p className="text-xs text-purple-200 mt-1">Tempo Médio Real</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <PieChart className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                  </div>
                  <h2 className="text-base lg:text-xl font-bold text-white">Distribuição de Status</h2>
                </div>
                <div className="space-y-2 lg:space-y-3">
                  {[
                    { label: 'Concluídas', value: stats.completed_tasks || 0, icon: CheckCircle2, colorClass: 'text-green-400', bgClass: 'bg-green-500/10 border-green-500/20' },
                    { label: 'Em Progresso', value: stats.in_progress_tasks || 0, icon: Activity, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/20' },
                    { label: 'Pendentes', value: stats.pending_tasks || 0, icon: Clock, colorClass: 'text-yellow-400', bgClass: 'bg-yellow-500/10 border-yellow-500/20' },
                    { label: 'Atrasadas', value: stats.overdue_tasks || 0, icon: Calendar, colorClass: 'text-red-400', bgClass: 'bg-red-500/10 border-red-500/20' },
                  ].map(({ label, value, icon: Icon, colorClass, bgClass }) => (
                    <div key={label} className={`flex items-center justify-between p-2.5 lg:p-3 border rounded-xl ${bgClass}`}>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${colorClass}`} />
                        <span className="text-xs lg:text-sm font-medium text-white">{label}</span>
                      </div>
                      <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-2xl p-4 lg:p-6">
              <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base lg:text-xl font-bold text-white">Meta de Produtividade</h2>
                  <p className="text-xs lg:text-sm text-purple-200">Seu objetivo é manter 80% de conclusão</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="text-center p-3 lg:p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-purple-200 mb-1">Atual</p>
                  <p className={`text-xl lg:text-3xl font-bold ${(stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {stats.completion_rate || 0}%
                  </p>
                </div>
                <div className="text-center p-3 lg:p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-purple-200 mb-1">Meta</p>
                  <p className="text-xl lg:text-3xl font-bold text-purple-400">80%</p>
                </div>
                <div className="text-center p-3 lg:p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-purple-200 mb-1">Diferença</p>
                  <p className={`text-xl lg:text-3xl font-bold ${(stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                    {(stats.completion_rate || 0) >= 80 ? '+' : ''}{(stats.completion_rate || 0) - 80}%
                  </p>
                </div>
              </div>
              <div className={`mt-3 lg:mt-4 p-3 border rounded-xl text-center ${(stats.completion_rate || 0) >= 80 ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                <p className={`text-xs lg:text-sm font-semibold ${(stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {(stats.completion_rate || 0) >= 80 ? '🎉 Parabéns! Você atingiu sua meta!' : `💪 Continue assim! Faltam ${80 - (stats.completion_rate || 0)}% para a meta!`}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}