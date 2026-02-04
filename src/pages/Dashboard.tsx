import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  // Buscar estatísticas com retry e error handling
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/analytics/statistics?period=week');
        return data.data;
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Buscar tarefas de hoje
  const { data: todayTasks, isLoading: todayLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/tasks/today');
        return data.data || [];
      } catch (error) {
        console.error('Erro ao buscar tarefas de hoje:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Buscar tarefas atrasadas
  const { data: overdueTasks, isLoading: overdueLoading } = useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/tasks/overdue');
        return data.data || [];
      } catch (error) {
        console.error('Erro ao buscar tarefas atrasadas:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isLoading = statsLoading || todayLoading || overdueLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-purple-200">Bem-vindo de volta! Aqui está um resumo das suas tarefas.</p>
        </div>

        {/* Erro de conexão com backend */}
        {statsError && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-200 font-medium">Backend não está respondendo</p>
              <p className="text-yellow-300/80 text-sm mt-1">
                Verifique se o servidor está rodando em http://localhost:3001
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-200">Carregando dados...</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total de Tarefas */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats?.total_tasks || 0}
                  </span>
                </div>
                <h3 className="text-purple-100 font-medium">Total de Tarefas</h3>
                <p className="text-sm text-purple-300 mt-1">Esta semana</p>
              </div>

              {/* Concluídas */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats?.completed_tasks || 0}
                  </span>
                </div>
                <h3 className="text-purple-100 font-medium">Concluídas</h3>
                <p className="text-sm text-green-300 mt-1">
                  {stats?.completion_rate || 0}% de conclusão
                </p>
              </div>

              {/* Pendentes */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats?.pending_tasks || 0}
                  </span>
                </div>
                <h3 className="text-purple-100 font-medium">Pendentes</h3>
                <p className="text-sm text-yellow-300 mt-1">Aguardando conclusão</p>
              </div>

              {/* Atrasadas */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats?.overdue_tasks || 0}
                  </span>
                </div>
                <h3 className="text-purple-100 font-medium">Atrasadas</h3>
                <p className="text-sm text-red-300 mt-1">Precisam de atenção</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tarefas de Hoje */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Tarefas de Hoje</h2>
                  </div>
                  <Link
                    to="/tasks"
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    Ver todas
                  </Link>
                </div>

                <div className="space-y-3">
                  {todayTasks && todayTasks.length > 0 ? (
                    todayTasks.slice(0, 5).map((task: any) => (
                      <div
                        key={task.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="w-5 h-5 rounded border-2 border-purple-400/50"></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-purple-200 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {task.category && (
                                <span
                                  className="px-2 py-1 rounded-lg text-xs font-medium"
                                  style={{
                                    backgroundColor: `${task.category.color}20`,
                                    color: task.category.color,
                                  }}
                                >
                                  {task.category.icon} {task.category.name}
                                </span>
                              )}
                              <span className="text-xs text-purple-300">
                                {task.due_date && formatDate(task.due_date, 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-purple-300/50 mx-auto mb-3" />
                      <p className="text-purple-200">Nenhuma tarefa para hoje</p>
                      <p className="text-sm text-purple-300 mt-1">Aproveite o dia livre! 🎉</p>
                    </div>
                  )}
                </div>

                <Link
                  to="/tasks"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30"
                >
                  <Plus className="w-5 h-5" />
                  Nova Tarefa
                </Link>
              </div>

              {/* Tarefas Atrasadas */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Tarefas Atrasadas</h2>
                  </div>
                  {overdueTasks && overdueTasks.length > 0 && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full">
                      {overdueTasks.length}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {overdueTasks && overdueTasks.length > 0 ? (
                    overdueTasks.slice(0, 5).map((task: any) => (
                      <div
                        key={task.id}
                        className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="w-5 h-5 rounded border-2 border-red-400/50"></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-purple-200 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {task.category && (
                                <span
                                  className="px-2 py-1 rounded-lg text-xs font-medium"
                                  style={{
                                    backgroundColor: `${task.category.color}20`,
                                    color: task.category.color,
                                  }}
                                >
                                  {task.category.icon} {task.category.name}
                                </span>
                              )}
                              <span className="text-xs text-red-400">
                                Atrasada • {task.due_date && formatDate(task.due_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                      <p className="text-purple-200">Nenhuma tarefa atrasada</p>
                      <p className="text-sm text-green-300 mt-1">Continue assim! 👏</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Produtividade</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-white mb-1">
                    {stats?.completion_rate || 0}%
                  </p>
                  <p className="text-sm text-purple-200">Taxa de Conclusão</p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-white mb-1">
                    {Math.round((stats?.total_time_spent || 0) / 60)}h
                  </p>
                  <p className="text-sm text-purple-200">Tempo Total</p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-white mb-1">
                    {stats?.in_progress_tasks || 0}
                  </p>
                  <p className="text-sm text-purple-200">Em Progresso</p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-white mb-1">
                    {Math.round((stats?.average_completion_time || 0) / 60)}h
                  </p>
                  <p className="text-sm text-purple-200">Tempo Médio</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}