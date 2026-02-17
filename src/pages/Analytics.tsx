import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Timer,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

type Period = 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week');

  // Buscar estatísticas do backend
  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics', period],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/statistics?period=${period}`);
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  // Buscar TODAS as tarefas para calcular tempo_real localmente
  const { data: tasksData } = useQuery({
    queryKey: ['tasks-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/tasks');
      return data.data || [];
    },
    refetchOnWindowFocus: false,
  });

  // Calcular métricas de tempo a partir das tarefas
  const timeMetrics = (() => {
    if (!tasksData || tasksData.length === 0) {
      return { totalMinutes: 0, averageMinutes: 0, completedWithTime: 0 };
    }

    const completedTasks = tasksData.filter(
      (t: any) => t.status === 'completed' && t.tempo_real
    );

    const totalMinutes = completedTasks.reduce(
      (sum: number, t: any) => sum + (t.tempo_real || 0), 0
    );

    const averageMinutes = completedTasks.length > 0
      ? Math.round(totalMinutes / completedTasks.length)
      : 0;

    return {
      totalMinutes,
      averageMinutes,
      completedWithTime: completedTasks.length,
    };
  })();

  // Formatar tempo
  const formatTime = (minutes: number) => {
    if (minutes === 0) return '0h';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getPeriodLabel = (p: Period) => {
    const labels = { week: 'Esta Semana', month: 'Este Mês', year: 'Este Ano' };
    return labels[p];
  };

  // Distribuição por prioridade
  const priorityMetrics = (() => {
    if (!tasksData) return [];
    const priorities = ['urgent', 'high', 'medium', 'low'];
    const labels: Record<string, string> = {
      urgent: '🔴 Urgente', high: '🟠 Alta', medium: '🟡 Média', low: '🟢 Baixa'
    };
    const colors: Record<string, string> = {
      urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      low: 'text-green-400 bg-green-500/10 border-green-500/20',
    };
    return priorities.map(p => ({
      label: labels[p],
      color: colors[p],
      total: tasksData.filter((t: any) => t.priority === p).length,
      completed: tasksData.filter((t: any) => t.priority === p && t.status === 'completed').length,
    })).filter(p => p.total > 0);
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      <main className="lg:ml-64 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-purple-200">Acompanhe seu desempenho e produtividade</p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
            {(['week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
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

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-purple-200">Carregando dados...</p>
            </div>
          </div>
        )}

        {!isLoading && stats && (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-200">Total de Tarefas</p>
                    <p className="text-3xl font-bold text-white">{stats.total_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-200">Concluídas</p>
                    <p className="text-3xl font-bold text-white">{stats.completed_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: `${stats.completion_rate || 0}%` }} />
                </div>
                <p className="text-xs text-green-400 mt-2">{stats.completion_rate || 0}% de conclusão</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-200">Em Progresso</p>
                    <p className="text-3xl font-bold text-white">{stats.in_progress_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                    style={{ width: `${stats.total_tasks > 0 ? ((stats.in_progress_tasks || 0) / stats.total_tasks) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-200">Pendentes</p>
                    <p className="text-3xl font-bold text-white">{stats.pending_tasks || 0}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-600"
                    style={{ width: `${stats.total_tasks > 0 ? ((stats.pending_tasks || 0) / stats.total_tasks) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* ✅ NOVO: Tempo Real Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Timer className="w-6 h-6 text-green-400" />
                  <p className="text-sm text-purple-200">Tempo Total Gasto</p>
                </div>
                <p className="text-3xl font-bold text-white">{formatTime(timeMetrics.totalMinutes)}</p>
                <p className="text-xs text-green-400 mt-1">em {timeMetrics.completedWithTime} tarefas concluídas</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <p className="text-sm text-purple-200">Tempo Médio por Tarefa</p>
                </div>
                <p className="text-3xl font-bold text-white">{formatTime(timeMetrics.averageMinutes)}</p>
                <p className="text-xs text-blue-400 mt-1">tempo médio de conclusão</p>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <p className="text-sm text-purple-200">Tarefas Atrasadas</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats.overdue_tasks || 0}</p>
                <p className="text-xs text-red-400 mt-1">precisam de atenção</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtividade */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Produtividade</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-200">Taxa de Conclusão</span>
                      <span className="text-sm font-semibold text-white">{stats.completion_rate || 0}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${stats.completion_rate || 0}%` }} />
                    </div>
                  </div>

                  {/* ✅ NOVO: Barra de tempo real vs estimado */}
                  {tasksData && tasksData.filter((t: any) => t.estimated_time).length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-200">Tarefas com Tempo Estimado</span>
                        <span className="text-sm font-semibold text-white">
                          {tasksData.filter((t: any) => t.estimated_time).length}
                        </span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all duration-500"
                          style={{ width: `${stats.total_tasks > 0 ? (tasksData.filter((t: any) => t.estimated_time).length / stats.total_tasks) * 100 : 0}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">{formatTime(timeMetrics.totalMinutes)}</p>
                      <p className="text-xs text-purple-200 mt-1">Tempo Total Real</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">{formatTime(timeMetrics.averageMinutes)}</p>
                      <p className="text-xs text-purple-200 mt-1">Tempo Médio Real</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribuição de Status */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Distribuição de Status</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Concluídas', value: stats.completed_tasks || 0, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                    { label: 'Em Progresso', value: stats.in_progress_tasks || 0, icon: Activity, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Pendentes', value: stats.pending_tasks || 0, icon: Clock, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                    { label: 'Atrasadas', value: stats.overdue_tasks || 0, icon: Calendar, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`flex items-center justify-between p-3 border rounded-xl ${color.split(' ').slice(1).join(' ')}`}>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${color.split(' ')[0]}`} />
                        <span className="text-sm font-medium text-white">{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full bg-current ${color.split(' ')[0]}`}
                            style={{ width: `${stats.total_tasks > 0 ? (value / stats.total_tasks) * 100 : 0}%` }} />
                        </div>
                        <span className={`text-sm font-bold w-4 text-right ${color.split(' ')[0]}`}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ✅ NOVO: Distribuição por Prioridade */}
            {priorityMetrics.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Distribuição por Prioridade</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {priorityMetrics.map(({ label, color, total, completed }) => (
                    <div key={label} className={`p-4 border rounded-xl ${color.split(' ').slice(1).join(' ')}`}>
                      <p className="text-sm font-medium text-white mb-2">{label}</p>
                      <p className={`text-2xl font-bold ${color.split(' ')[0]}`}>{total}</p>
                      <p className="text-xs text-purple-300 mt-1">{completed} concluídas</p>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                        <div className={`h-full bg-current ${color.split(' ')[0]}`}
                          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta de Produtividade */}
            <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Meta de Produtividade</h2>
                  <p className="text-sm text-purple-200">Seu objetivo é manter 80% de conclusão</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-purple-200 mb-1">Atual</p>
                  <p className={`text-3xl font-bold ${(stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {stats.completion_rate || 0}%
                  </p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-purple-200 mb-1">Meta</p>
                  <p className="text-3xl font-bold text-purple-400">80%</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-purple-200 mb-1">Diferença</p>
                  <p className={`text-3xl font-bold ${(stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                    {(stats.completion_rate || 0) >= 80 ? '+' : ''}{(stats.completion_rate || 0) - 80}%
                  </p>
                </div>
              </div>

              <div className={`mt-4 p-3 border rounded-xl text-center ${(stats.completion_rate || 0) >= 80 ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                <p className={`font-semibold ${(stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {(stats.completion_rate || 0) >= 80
                    ? '🎉 Parabéns! Você atingiu sua meta!'
                    : `💪 Continue assim! Faltam ${80 - (stats.completion_rate || 0)}% para a meta!`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !stats && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
              <p className="text-white font-semibold text-lg">Nenhum dado disponível</p>
              <p className="text-purple-300 mt-2">Crie tarefas para ver suas estatísticas aqui!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}