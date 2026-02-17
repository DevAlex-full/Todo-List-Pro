import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
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
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [canFetchData, setCanFetchData] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const timer = setTimeout(() => { setCanFetchData(true); }, 100);
      return () => clearTimeout(timer);
    } else {
      setCanFetchData(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/statistics?period=week');
      return data.data;
    },
    enabled: canFetchData,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: todayTasks, isLoading: todayLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/today');
      return data.data || [];
    },
    enabled: canFetchData,
    retry: 1,
  });

  const { data: overdueTasks, isLoading: overdueLoading } = useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/overdue');
      return data.data || [];
    },
    enabled: canFetchData,
    retry: 1,
  });

  const isLoading = authLoading || !canFetchData || statsLoading || todayLoading || overdueLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      {/* pt-16 = espaço para o botão hamburger no mobile */}
      <main className="lg:ml-64 p-4 lg:p-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Dashboard</h1>
          <p className="text-sm lg:text-base text-purple-200">Bem-vindo de volta! Aqui está um resumo das suas tarefas.</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-200">Carregando dados...</p>
            </div>
          </div>
        )}

        {!isLoading && statsError && (
          <div className="mb-6 p-3 lg:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm lg:text-base text-yellow-400 font-semibold">Não foi possível carregar algumas estatísticas</p>
                <p className="text-xs lg:text-sm text-yellow-300/70 mt-1">Verifique se o backend está rodando ou recarregue a página.</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Stats — 2 colunas no mobile, 4 no desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 lg:w-6 lg:h-6 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-purple-200">Total</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats?.total_tasks || 0}</p>
                  </div>
                </div>
                <p className="text-xs text-purple-300">Esta semana</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 lg:w-6 lg:h-6 text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-purple-200">Concluídas</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats?.completed_tasks || 0}</p>
                  </div>
                </div>
                <p className="text-xs text-green-400">{stats?.completion_rate || 0}% de conclusão</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-purple-200">Pendentes</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats?.pending_tasks || 0}</p>
                  </div>
                </div>
                <p className="text-xs text-yellow-400">Aguardando</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 lg:w-6 lg:h-6 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-purple-200">Atrasadas</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{overdueTasks?.length || 0}</p>
                  </div>
                </div>
                <p className="text-xs text-red-400">Atenção!</p>
              </div>
            </div>

            {/* Listas — stack no mobile, lado a lado no desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Tarefas de Hoje */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-base lg:text-xl font-bold text-white">Tarefas de Hoje</h2>
                      <p className="text-xs lg:text-sm text-purple-300">{todayTasks?.length || 0} tarefas</p>
                    </div>
                  </div>
                  <Link to="/tasks" className="text-xs lg:text-sm px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 rounded-lg transition-all font-medium whitespace-nowrap">
                    Ver todas
                  </Link>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  {todayTasks && todayTasks.length > 0 ? (
                    todayTasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="p-3 lg:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        <div className="flex items-start gap-2 lg:gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            task.priority === 'urgent' ? 'bg-red-400' :
                            task.priority === 'high' ? 'bg-orange-400' :
                            task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm lg:text-base text-white font-medium truncate">{task.title}</h3>
                            {task.description && (
                              <p className="text-xs text-purple-300 line-clamp-1 mt-0.5">{task.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {task.category && (
                                <span className="text-xs px-2 py-0.5 rounded-lg" style={{
                                  backgroundColor: `${task.category.color}20`,
                                  color: task.category.color
                                }}>
                                  {task.category.icon} {task.category.name}
                                </span>
                              )}
                              {task.due_date && (
                                <span className="text-xs text-purple-300 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(task.due_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <CheckCircle2 className="w-10 h-10 lg:w-12 lg:h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-purple-300">Nenhuma tarefa para hoje</p>
                      <p className="text-xs text-purple-400 mt-1">Aproveite para relaxar! 🎉</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tarefas Atrasadas */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-base lg:text-xl font-bold text-white">Atrasadas</h2>
                      <p className="text-xs lg:text-sm text-purple-300">{overdueTasks?.length || 0} tarefas</p>
                    </div>
                  </div>
                  <Link to="/tasks" className="text-xs lg:text-sm px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 rounded-lg transition-all font-medium whitespace-nowrap">
                    Ver todas
                  </Link>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  {overdueTasks && overdueTasks.length > 0 ? (
                    overdueTasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="p-3 lg:p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex items-start gap-2 lg:gap-3">
                          <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm lg:text-base text-white font-medium truncate">{task.title}</h3>
                            {task.due_date && (
                              <p className="text-xs text-red-400 mt-0.5">Venceu em {formatDate(task.due_date)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <TrendingUp className="w-10 h-10 lg:w-12 lg:h-12 text-green-400 mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-purple-300">Sem tarefas atrasadas</p>
                      <p className="text-xs text-purple-400 mt-1">Você está em dia! 👏</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-6 lg:mt-8">
              <Link to="/tasks" className="flex items-center justify-center gap-2 w-full py-3 lg:py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30 text-sm lg:text-base">
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                Nova Tarefa
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}