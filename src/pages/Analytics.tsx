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
  Activity
} from 'lucide-react';
import { useState } from 'react';

type Period = 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week');

  // Buscar estatísticas
  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics', period],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/statistics?period=${period}`);
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  const getPeriodLabel = (p: Period) => {
    const labels = {
      week: 'Esta Semana',
      month: 'Este Mês',
      year: 'Este Ano',
    };
    return labels[p];
  };

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-200">Carregando dados...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && stats && (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Tasks */}
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
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Completed */}
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
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    style={{ width: `${stats.completion_rate || 0}%` }}
                  />
                </div>
                <p className="text-xs text-green-400 mt-2">
                  {stats.completion_rate || 0}% de conclusão
                </p>
              </div>

              {/* In Progress */}
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
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                    style={{
                      width: `${
                        stats.total_tasks > 0
                          ? ((stats.in_progress_tasks || 0) / stats.total_tasks) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Pending */}
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
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-600"
                    style={{
                      width: `${
                        stats.total_tasks > 0
                          ? ((stats.pending_tasks || 0) / stats.total_tasks) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivity Chart */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Produtividade</h2>
                </div>

                <div className="space-y-4">
                  {/* Completion Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-200">Taxa de Conclusão</span>
                      <span className="text-sm font-semibold text-white">
                        {stats.completion_rate || 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${stats.completion_rate || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Time Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">
                        {Math.round((stats.total_time_spent || 0) / 60)}h
                      </p>
                      <p className="text-xs text-purple-200 mt-1">Tempo Total</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">
                        {Math.round((stats.average_completion_time || 0) / 60)}h
                      </p>
                      <p className="text-xs text-purple-200 mt-1">Tempo Médio</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Distribuição de Status</h2>
                </div>

                <div className="space-y-3">
                  {/* Completed */}
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-white">Concluídas</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">
                      {stats.completed_tasks || 0}
                    </span>
                  </div>

                  {/* In Progress */}
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-white">Em Progresso</span>
                    </div>
                    <span className="text-sm font-bold text-blue-400">
                      {stats.in_progress_tasks || 0}
                    </span>
                  </div>

                  {/* Pending */}
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-medium text-white">Pendentes</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-400">
                      {stats.pending_tasks || 0}
                    </span>
                  </div>

                  {/* Overdue */}
                  <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium text-white">Atrasadas</span>
                    </div>
                    <span className="text-sm font-bold text-red-400">
                      {stats.overdue_tasks || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Meta de Produtividade</h2>
                  <p className="text-sm text-purple-200">
                    Seu objetivo é manter 80% de conclusão
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-purple-200 mb-1">Atual</p>
                  <p className={`text-3xl font-bold ${
                    (stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {stats.completion_rate || 0}%
                  </p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-purple-200 mb-1">Meta</p>
                  <p className="text-3xl font-bold text-purple-400">80%</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-purple-200 mb-1">Diferença</p>
                  <p className={`text-3xl font-bold ${
                    (stats.completion_rate || 0) >= 80 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(stats.completion_rate || 0) >= 80 ? '+' : ''}
                    {(stats.completion_rate || 0) - 80}%
                  </p>
                </div>
              </div>

              {(stats.completion_rate || 0) >= 80 ? (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <p className="text-green-400 font-semibold">
                    🎉 Parabéns! Você atingiu sua meta!
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
                  <p className="text-yellow-400 font-semibold">
                    💪 Continue assim! Faltam {80 - (stats.completion_rate || 0)}% para a meta!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}