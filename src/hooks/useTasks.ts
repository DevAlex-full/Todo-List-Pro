import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task, TaskFormData, ApiResponse, TaskFilters } from '@/types';
import toast from 'react-hot-toast';

// ========================================
// QUERIES
// ========================================

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));

      const { data } = await api.get<ApiResponse<Task[]>>(`/tasks?${params}`);
      return data.data || [];
    },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useTodayTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task[]>>('/tasks/today');
      return data.data || [];
    },
  });
};

export const useOverdueTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task[]>>('/tasks/overdue');
      return data.data || [];
    },
  });
};

// ========================================
// MUTATIONS
// ========================================

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const { data } = await api.post<ApiResponse<Task>>('/tasks', taskData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar tarefa');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskFormData> }) => {
      const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar tarefa');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa deletada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao deletar tarefa');
    },
  });
};

export const useToggleTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/toggle`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar tarefa');
    },
  });
};

export const useReorderTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      await api.put('/tasks/reorder', { taskIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao reordenar tarefas');
    },
  });
};
