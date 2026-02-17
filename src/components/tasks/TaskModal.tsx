import { useState, useEffect, FormEvent } from 'react';
import type { Task, CreateTaskDTO, UpdateTaskDTO, Priority } from '@/types';
import { 
  X, Calendar, Clock, Flag, Tag, AlignLeft, Folder, Loader2
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export default function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState('');

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/categories');
        return data.data || [];
      } catch (error) {
        console.error('❌ Erro ao buscar categorias:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  useEffect(() => {
    if (categories) {
      console.log('📦 Categorias disponíveis:', categories);
    }
    if (categoriesError) {
      console.error('⚠️ Erro nas categorias:', categoriesError);
    }
  }, [categories, categoriesError]);

  const createMutation = useMutation({
    mutationFn: async (taskData: CreateTaskDTO) => {
      const response = await api.post('/tasks', taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('✅ Tarefa criada com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Erro ao criar tarefa');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDTO }) => {
      const response = await api.patch(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('✅ Tarefa atualizada!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar tarefa');
    },
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategoryId(task.category_id || '');
      setPriority(task.priority);
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setEstimatedTime(task.estimated_time?.toString() || '');
      setTags(task.tags?.join(', ') || '');
    } else {
      resetForm();
    }
  }, [task]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategoryId('');
    setPriority('medium'); setDueDate(''); setEstimatedTime(''); setTags('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('O título é obrigatório'); return; }

    let dueDateFormatted = undefined;
    if (dueDate) {
      const [year, month, day] = dueDate.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      dueDateFormatted = localDate.toISOString();
    }

    const taskData: CreateTaskDTO = {
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId || undefined,
      priority,
      due_date: dueDateFormatted,
      estimated_time: estimatedTime ? parseInt(estimatedTime) : undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    };

    if (isEditing && task) {
      updateMutation.mutate({ id: task.id, data: taskData });
    } else {
      createMutation.mutate(taskData);
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      {/*
        Mobile: slide up da parte inferior (items-end), ocupa quase tela toda
        Tablet+: centralizado (items-center), max-w-2xl
      */}
      <div className="
        w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-2xl
        rounded-t-2xl sm:rounded-2xl
        max-h-[92dvh] sm:max-h-[90vh] sm:max-w-2xl
        flex flex-col
        overflow-hidden
      ">
        {/* Handle bar no mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg lg:text-2xl font-bold text-white">
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-purple-300" />
          </button>
        </div>

        {/* Form — scrollável */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-5 space-y-4 lg:space-y-5">
          {/* Título */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que você precisa fazer?"
              required
              autoFocus={false}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">
              <AlignLeft className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione mais detalhes..."
              rows={3}
              className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none text-sm lg:text-base"
            />
          </div>

          {/* Grid: 1 col mobile, 2 cols md+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            {/* Categoria */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">
                <Folder className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                Categoria
              </label>
              {categoriesLoading ? (
                <div className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-purple-300 flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </div>
              ) : categoriesError ? (
                <div className="w-full px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  ⚠️ Erro ao carregar categorias.
                </div>
              ) : !categories || categories.length === 0 ? (
                <div className="w-full px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs">
                  ⚠️ Nenhuma categoria encontrada.
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              )}
              {categories && categories.length > 0 && (
                <p className="text-xs text-green-400 mt-1">✅ {categories.length} categorias</p>
              )}
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">
                <Flag className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
                style={{ colorScheme: 'dark' }}
              >
                <option value="low">🟢 Baixa</option>
                <option value="medium">🟡 Média</option>
                <option value="high">🟠 Alta</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            {/* Data de Vencimento */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">
                <Calendar className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Tempo Estimado */}
            <div>
              <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">
                <Clock className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                Tempo Estimado (min)
              </label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="Ex: 30"
                min="1"
                inputMode="numeric"
                className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
              />
              <p className="text-xs text-green-400 mt-1">⏱️ Tempo real calculado ao concluir</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-purple-100 mb-1.5 lg:mb-2">
              <Tag className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="trabalho, urgente, importante"
              className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm lg:text-base"
            />
            {tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.split(',').map((tag, index) => (
                  tag.trim() && (
                    <span key={index} className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-lg">
                      {tag.trim()}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Botões — sticky no fundo no mobile */}
          <div className="flex gap-2 lg:gap-3 pt-3 lg:pt-4 border-t border-white/10 pb-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 bg-white/5 border border-white/10 text-purple-200 font-medium rounded-xl hover:bg-white/10 active:bg-white/15 transition-all disabled:opacity-50 text-sm lg:text-base touch-manipulation"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 active:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30 text-sm lg:text-base touch-manipulation"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Salvando...' : 'Criando...'}
                </span>
              ) : (
                isEditing ? 'Salvar' : 'Criar Tarefa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}