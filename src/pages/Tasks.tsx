import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';
import { 
  Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, X
} from 'lucide-react';
import type { Task, TaskStatus, Priority } from '@/types';

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', searchQuery, statusFilter, priorityFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (categoryFilter !== 'all') params.append('category_id', categoryFilter);
      const { data } = await api.get(`/tasks?${params.toString()}`);
      return data.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data || [];
    },
  });

  const handleEditTask = (task: Task) => { setSelectedTask(task); setIsModalOpen(true); };
  const handleNewTask = () => { setSelectedTask(null); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedTask(null); };
  const clearFilters = () => { setStatusFilter('all'); setPriorityFilter('all'); setCategoryFilter('all'); setSearchQuery(''); };
  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery;

  const groupedTasks = {
    pending: tasks?.filter((t: Task) => t.status === 'pending') || [],
    in_progress: tasks?.filter((t: Task) => t.status === 'in_progress') || [],
    completed: tasks?.filter((t: Task) => t.status === 'completed') || [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      <main className="lg:ml-64 p-4 lg:p-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Minhas Tarefas</h1>
            <p className="text-xs lg:text-base text-purple-200">
              {tasks?.length || 0} tarefa{tasks?.length !== 1 ? 's' : ''} encontrada{tasks?.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Botão: ícone no mobile, texto no desktop */}
          <button
            onClick={handleNewTask}
            className="flex items-center gap-2 px-3 sm:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30 text-sm lg:text-base shrink-0"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </button>
        </div>

        {/* Search + Filtros */}
        <div className="mb-5 lg:mb-6 space-y-3">
          <div className="flex gap-2 lg:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tarefas..."
                className="w-full pl-9 lg:pl-11 pr-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all text-sm shrink-0 ${
                showFilters || hasActiveFilters
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-purple-200 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && <span className="w-2 h-2 bg-purple-400 rounded-full"></span>}
            </button>
          </div>

          {showFilters && (
            <div className="p-3 lg:p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm lg:text-base text-white font-semibold">Filtros</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs lg:text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                    <X className="w-3 h-3 lg:w-4 lg:h-4" />
                    Limpar
                  </button>
                )}
              </div>

              {/* 1 col mobile → 3 cols tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendentes</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="completed">Concluídas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5">Prioridade</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="all">Todas</option>
                    <option value="urgent">🔴 Urgente</option>
                    <option value="high">🟠 Alta</option>
                    <option value="medium">🟡 Média</option>
                    <option value="low">🟢 Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5">Categoria</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="all">Todas</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm lg:text-base text-purple-200">Carregando tarefas...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-6 lg:space-y-8">
                {groupedTasks.pending.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                      <div className="w-9 h-9 lg:w-10 lg:h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h2 className="text-lg lg:text-xl font-bold text-white">Pendentes</h2>
                        <p className="text-xs lg:text-sm text-purple-300">{groupedTasks.pending.length} tarefas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      {groupedTasks.pending.map((task: Task) => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                      ))}
                    </div>
                  </div>
                )}

                {groupedTasks.in_progress.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                      <div className="w-9 h-9 lg:w-10 lg:h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg lg:text-xl font-bold text-white">Em Progresso</h2>
                        <p className="text-xs lg:text-sm text-purple-300">{groupedTasks.in_progress.length} tarefas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      {groupedTasks.in_progress.map((task: Task) => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                      ))}
                    </div>
                  </div>
                )}

                {groupedTasks.completed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                      <div className="w-9 h-9 lg:w-10 lg:h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-lg lg:text-xl font-bold text-white">Concluídas</h2>
                        <p className="text-xs lg:text-sm text-purple-300">{groupedTasks.completed.length} tarefas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      {groupedTasks.completed.map((task: Task) => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 lg:py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <CheckCircle2 className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                  {hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
                </h3>
                <p className="text-sm lg:text-base text-purple-200 mb-6">
                  {hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Comece criando sua primeira tarefa!'}
                </p>
                {hasActiveFilters ? (
                  <button onClick={clearFilters} className="px-5 py-2.5 bg-white/5 border border-white/10 text-purple-200 font-medium rounded-xl hover:bg-white/10 transition-all text-sm">
                    Limpar Filtros
                  </button>
                ) : (
                  <button onClick={handleNewTask} className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30 text-sm">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Nova Tarefa
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <TaskModal isOpen={isModalOpen} onClose={handleCloseModal} task={selectedTask} />
    </div>
  );
}