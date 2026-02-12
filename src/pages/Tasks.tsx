import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';
import { 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
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

  // Buscar tarefas
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

  // Buscar categorias para filtro
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data || [];
    },
  });

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery;

  const groupedTasks = {
    pending: tasks?.filter((t: Task) => t.status === 'pending') || [],
    in_progress: tasks?.filter((t: Task) => t.status === 'in_progress') || [],
    completed: tasks?.filter((t: Task) => t.status === 'completed') || [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />

      <main className="lg:ml-64 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Minhas Tarefas</h1>
            <p className="text-purple-200">
              {tasks?.length || 0} tarefa{tasks?.length !== 1 ? 's' : ''} encontrada{tasks?.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={handleNewTask}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tarefas..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-purple-200 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Filtros</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendentes</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="completed">Concluídas</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-2">Prioridade</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todas</option>
                    <option value="urgent">🔴 Urgente</option>
                    <option value="high">🟠 Alta</option>
                    <option value="medium">🟡 Média</option>
                    <option value="low">🟢 Baixa</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-2">Categoria</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todas</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-200">Carregando tarefas...</p>
            </div>
          </div>
        )}

        {/* Tasks Grid */}
        {!isLoading && (
          <>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-8">
                {/* Pendentes */}
                {groupedTasks.pending.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Pendentes</h2>
                        <p className="text-sm text-purple-300">{groupedTasks.pending.length} tarefas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {groupedTasks.pending.map((task: Task) => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Em Progresso */}
                {groupedTasks.in_progress.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Em Progresso</h2>
                        <p className="text-sm text-purple-300">{groupedTasks.in_progress.length} tarefas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {groupedTasks.in_progress.map((task: Task) => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Concluídas */}
                {groupedTasks.completed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Concluídas</h2>
                        <p className="text-sm text-purple-300">{groupedTasks.completed.length} tarefas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {groupedTasks.completed.map((task: Task) => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
                </h3>
                <p className="text-purple-200 mb-6">
                  {hasActiveFilters 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece criando sua primeira tarefa!'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-purple-200 font-medium rounded-xl hover:bg-white/10 transition-all"
                  >
                    Limpar Filtros
                  </button>
                ) : (
                  <button
                    onClick={handleNewTask}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Nova Tarefa
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
      />
    </div>
  );
}