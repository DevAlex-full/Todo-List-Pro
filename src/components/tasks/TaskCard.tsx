import { useState } from 'react';
import type { Task } from '@/types';
import { 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Trash2, 
  Edit, 
  CheckCircle2,
  Circle,
  MoreVertical,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { formatDate, isTaskOverdue, formatTimeFromMinutes } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const toggleCompleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(`/tasks/${taskId}/toggle`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(task.status === 'completed' ? 'Tarefa reaberta!' : '✅ Tarefa concluída!');
    },
    onError: () => toast.error('Erro ao atualizar tarefa'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('🗑️ Tarefa deletada!');
    },
    onError: () => toast.error('Erro ao deletar tarefa'),
  });

  const handleToggleComplete = () => toggleCompleteMutation.mutate(task.id);

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      deleteMutation.mutate(task.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      low: 'text-green-400 bg-green-500/10 border-green-500/20',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa' };
    return labels[priority as keyof typeof labels] || priority;
  };

  // ✅ NOVA LÓGICA: usar isTaskOverdue() do utils
  const isOverdue = isTaskOverdue(task);
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`group relative p-3 lg:p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-white/5 border-white/5 opacity-75'
          : isOverdue
          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
          : 'bg-white/5 border-white/10 hover:border-purple-500/30'
      }`}
    >
      <div className="flex items-start gap-2 lg:gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={toggleCompleteMutation.isPending}
          className="mt-0.5 flex-shrink-0 transition-transform active:scale-95 hover:scale-110 disabled:opacity-50 touch-manipulation"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className={`w-5 h-5 ${isOverdue ? 'text-red-400' : 'text-purple-400'}`} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm lg:text-base text-white font-medium mb-1 leading-snug ${isCompleted ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs lg:text-sm text-purple-200 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 text-xs">
            {task.category && (
              <span
                className="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg font-medium"
                style={{ backgroundColor: `${task.category.color}20`, color: task.category.color }}
              >
                {task.category.icon} {task.category.name}
              </span>
            )}

            <span className={`px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg font-medium border ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3 inline mr-0.5" />
              {getPriorityLabel(task.priority)}
            </span>

            {/* ✅ ALTERADO: start_date ao invés de due_date */}
            {task.start_date && (
              <span className={`flex items-center gap-1 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg ${
                isOverdue
                  ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                  : 'text-purple-300 bg-purple-500/10'
              }`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                {formatDate(task.start_date)}
                {isOverdue && <span className="font-bold ml-0.5 hidden sm:inline">ATRASADA</span>}
              </span>
            )}

            {/* ✅ NOVO: Mostrar tempo_real se completo, senão estimated_time */}
            {isCompleted && task.tempo_real ? (
              <span className="flex items-center gap-1 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg text-green-400 bg-green-500/10 border border-green-500/20">
                <Timer className="w-3 h-3" />
                {formatTimeFromMinutes(task.tempo_real)}
              </span>
            ) : task.estimated_time ? (
              <span className="flex items-center gap-1 text-purple-300">
                <Clock className="w-3 h-3" />
                {formatTimeFromMinutes(task.estimated_time)}
              </span>
            ) : null}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-purple-400" />
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-1.5 py-0.5 text-purple-300 bg-purple-500/10 rounded-lg">
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && <span className="text-purple-400">+{task.tags.length - 2}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors touch-manipulation lg:opacity-0 lg:group-hover:opacity-100 opacity-100"
          >
            <MoreVertical className="w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-32 lg:w-36 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={() => { onEdit(task); setShowMenu(false); }}
                  className="w-full px-3 lg:px-4 py-2.5 text-left text-sm text-purple-200 hover:bg-white/5 active:bg-white/10 transition-colors flex items-center gap-2 touch-manipulation"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                  disabled={deleteMutation.isPending}
                  className="w-full px-3 lg:px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50 touch-manipulation"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}