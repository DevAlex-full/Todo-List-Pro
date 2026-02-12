import { useState, useEffect, FormEvent } from 'react';
import type { Task, CreateTaskDTO, UpdateTaskDTO, Priority } from '@/types';
import { 
  X, 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  AlignLeft,
  Folder,
  Loader2
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

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState('');

  // Buscar categorias COM DEBUG
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        console.log('🔍 Buscando categorias...');
        const { data } = await api.get('/categories');
        console.log('✅ Categorias recebidas:', data);
        return data.data || [];
      } catch (error) {
        console.error('❌ Erro ao buscar categorias:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60000, // Cache de 1 minuto
  });

  // Debug de categorias
  useEffect(() => {
    if (categories) {
      console.log('📦 Categorias disponíveis:', categories);
      console.log('📊 Total de categorias:', categories.length);
    }
    if (categoriesError) {
      console.error('⚠️ Erro nas categorias:', categoriesError);
    }
  }, [categories, categoriesError]);

  // Mutation para criar tarefa
  const createMutation = useMutation({
    mutationFn: async (taskData: CreateTaskDTO) => {
      console.log('📤 Enviando tarefa:', taskData);
      const response = await api.post('/tasks', taskData);
      console.log('✅ Tarefa criada:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('✅ Tarefa criada com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('❌ Erro ao criar tarefa:', error);
      console.error('❌ Response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Erro ao criar tarefa');
    },
  });

  // Mutation para atualizar tarefa
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDTO }) => {
      console.log('📤 Atualizando tarefa:', id, data);
      const response = await api.patch(`/tasks/${id}`, data);
      console.log('✅ Tarefa atualizada:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('✅ Tarefa atualizada!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('❌ Erro ao atualizar tarefa:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar tarefa');
    },
  });

  // Preencher form ao editar
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
    setTitle('');
    setDescription('');
    setCategoryId('');
    setPriority('medium');
    setDueDate('');
    setEstimatedTime('');
    setTags('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    const taskData: CreateTaskDTO = {
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId || undefined,
      priority,
      due_date: dueDate || undefined,
      estimated_time: estimatedTime ? parseInt(estimatedTime) : undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    };

    console.log('📋 Dados da tarefa:', taskData);

    if (isEditing && task) {
      updateMutation.mutate({ id: task.id, data: taskData });
    } else {
      createMutation.mutate(taskData);
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-purple-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-purple-100 mb-2">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que você precisa fazer?"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-purple-100 mb-2">
              <AlignLeft className="w-4 h-4 inline mr-1" />
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione mais detalhes..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                <Folder className="w-4 h-4 inline mr-1" />
                Categoria
              </label>
              
              {categoriesLoading ? (
                <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-purple-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando categorias...
                </div>
              ) : categoriesError ? (
                <div className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  ⚠️ Erro ao carregar categorias. Verifique se o backend está rodando.
                </div>
              ) : !categories || categories.length === 0 ? (
                <div className="w-full px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                  ⚠️ Nenhuma categoria encontrada. Execute o SQL no Supabase!
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Debug info */}
              {categories && categories.length > 0 && (
                <p className="text-xs text-green-400 mt-1">
                  ✅ {categories.length} categoria{categories.length !== 1 ? 's' : ''} disponível{categories.length !== 1 ? 'eis' : ''}
                </p>
              )}
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="low">🟢 Baixa</option>
                <option value="medium">🟡 Média</option>
                <option value="high">🟠 Alta</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            {/* Data de Vencimento */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Tempo Estimado */}
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Tempo Estimado (min)
              </label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="Ex: 30"
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-purple-100 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separe por vírgula: trabalho, urgente, importante"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            {tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.split(',').map((tag, index) => (
                  tag.trim() && (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-lg"
                    >
                      {tag.trim()}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-purple-200 font-medium rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isEditing ? 'Salvando...' : 'Criando...'}
                </span>
              ) : (
                isEditing ? 'Salvar Alterações' : 'Criar Tarefa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}