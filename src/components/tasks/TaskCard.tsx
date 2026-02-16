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
import { formatDate } from '@/lib/utils';
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

  // Mutation para toggle complete
  const toggleCompleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(`/tasks/${taskId}/toggle`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(
        task.status === 'completed' 
          ? 'Tarefa reaberta!' 
          : '✅ Tarefa concluída!'
      );
    },
    onError: () => {
      toast.error('Erro ao atualizar tarefa');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('🗑️ Tarefa deletada!');
    },
    onError: () => {
      toast.error('Erro ao deletar tarefa');
    },
  });

  const handleToggleComplete = () => {
    toggleCompleteMutation.mutate(task.id);
  };

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
    const labels = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  // ✅ Verificação de data atrasada
  const isOverdue = task.due_date && task.status !== 'completed' && (() => {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  })();

  const isCompleted = task.status === 'completed';

  // ✅ FIX 3: Formatar tempo real
  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-white/5 border-white/5 opacity-75'
          : isOverdue
          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
          : 'bg-white/5 border-white/10 hover:border-purple-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={toggleCompleteMutation.isPending}
          className="mt-1 flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className={`w-5 h-5 ${isOverdue ? 'text-red-400' : 'text-purple-400'}`} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`text-white font-medium mb-1 ${
              isCompleted ? 'line-through opacity-60' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-purple-200 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category */}
            {task.category && (
              <span
                className="px-2 py-1 rounded-lg font-medium"
                style={{
                  backgroundColor: `${task.category.color}20`,
                  color: task.category.color,
                }}
              >
                {task.category.icon} {task.category.name}
              </span>
            )}

            {/* Priority */}
            <span className={`px-2 py-1 rounded-lg font-medium border ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3 inline mr-1" />
              {getPriorityLabel(task.priority)}
            </span>

            {/* Due Date */}
            {task.due_date && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                isOverdue
                  ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                  : 'text-purple-300 bg-purple-500/10'
              }`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                {formatDate(task.due_date)}
                {isOverdue && <span className="font-bold ml-1">ATRASADA</span>}
              </span>
            )}

            {/* ✅ FIX 3: Mostrar TEMPO REAL se completada, ou ESTIMADO se pendente */}
            {isCompleted && (task as any).tempo_real ? (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-green-400 bg-green-500/10 border border-green-500/20">
                <Timer className="w-3 h-3" />
                Tempo gasto: {formatTimeSpent((task as any).tempo_real)}
              </span>
            ) : task.estimated_time ? (
              <span className="flex items-center gap-1 text-purple-300">
                <Clock className="w-3 h-3" />
                {task.estimated_time}min estimado
              </span>
            ) : null}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-purple-400" />
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-purple-300 bg-purple-500/10 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-purple-400">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5 text-purple-300" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-36 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(task);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-purple-200 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-50"
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