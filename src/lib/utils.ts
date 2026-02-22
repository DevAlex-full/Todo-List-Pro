import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task } from '@/types';

/**
 * Merge classes do Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatar data para exibição
 */
export function formatDate(date: string | Date | null, formatString: string = 'dd/MM/yyyy'): string {
  if (!date) return '';
  return format(new Date(date), formatString, { locale: ptBR });
}

/**
 * Formatar data relativa (há 2 horas, ontem, etc)
 */
export function formatRelativeDate(date: string | Date | null): string {
  if (!date) return '';
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Hoje às ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Amanhã às ${format(dateObj, 'HH:mm')}`;
  }
  
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: ptBR 
  });
}

/**
 * ✅ CORRIGIDO COM DEBUG: Verificar se a tarefa está atrasada
 */
export function isTaskOverdue(task: Task): boolean {
  // Se está completa, nunca está atrasada
  if (task.status === 'completed') {
    return false;
  }
  
  // Se não tem tempo estimado, não pode estar atrasada
  if (!task.estimated_time) {
    return false;
  }
  
  const now = new Date();
  let referenceDate: Date;
  
  // Usar start_date se existir, senão usar created_at
  if (task.start_date) {
    referenceDate = new Date(task.start_date);
  } else {
    referenceDate = new Date(task.created_at);
  }
  
  const estimatedMinutes = task.estimated_time;
  const expectedEndDate = new Date(referenceDate.getTime() + estimatedMinutes * 60000);
  
  // ✅ DEBUG - remover depois de testar
  const isOverdue = expectedEndDate < now;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 isTaskOverdue:', {
      title: task.title,
      referenceDate: referenceDate.toLocaleString('pt-BR'),
      estimatedMinutes,
      expectedEndDate: expectedEndDate.toLocaleString('pt-BR'),
      now: now.toLocaleString('pt-BR'),
      isOverdue,
    });
  }
  
  return isOverdue;
}

/**
 * ✅ DEPRECATED: Manter por compatibilidade, mas usar isTaskOverdue()
 */
export function isOverdue(dueDate: string | Date | null): boolean {
  if (!dueDate) return false;
  return isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
}

/**
 * Cores por prioridade
 */
export const priorityColors = {
  urgent: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    badge: 'bg-red-500',
  },
  high: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-700',
    badge: 'bg-orange-500',
  },
  medium: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
    badge: 'bg-blue-500',
  },
  low: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-300 dark:border-gray-700',
    badge: 'bg-gray-500',
  },
};

/**
 * Labels de prioridade
 */
export const priorityLabels = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

/**
 * Cores por status
 */
export const statusColors = {
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    badge: 'bg-yellow-500',
  },
  in_progress: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-500',
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    badge: 'bg-green-500',
  },
  archived: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    badge: 'bg-gray-500',
  },
};

/**
 * Labels de status
 */
export const statusLabels = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  completed: 'Concluída',
  archived: 'Arquivada',
};

/**
 * ✅ NOVO: Converter string de tempo para minutos
 * Exemplos: "2h" → 120, "30min" → 30, "3d" → 4320
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr.trim() === '') return 0;
  
  const str = timeStr.toLowerCase().trim();
  
  // Remover espaços e capturar número + unidade
  const match = str.match(/^(\d+\.?\d*)\s*(min|m|h|d|dia|dias)?$/);
  
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'min'; // padrão: minutos
  
  switch (unit) {
    case 'min':
    case 'm':
      return Math.round(value);
    case 'h':
      return Math.round(value * 60);
    case 'd':
    case 'dia':
    case 'dias':
      return Math.round(value * 24 * 60);
    default:
      return Math.round(value); // assume minutos
  }
}

/**
 * ✅ NOVO: Converter minutos para string amigável
 * Exemplos: 120 → "2h", 30 → "30min", 4320 → "3d"
 */
export function formatTimeFromMinutes(minutes: number | null): string {
  if (!minutes || minutes === 0) return '0min';
  
  // Dias
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d`;
  }
  
  // Horas
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${hours}h`;
  }
  
  // Minutos
  return `${minutes}min`;
}

/**
 * ✅ DEPRECATED: Usar formatTimeFromMinutes()
 * Mantido por compatibilidade
 */
export function formatTime(minutes: number | null): string {
  return formatTimeFromMinutes(minutes);
}

/**
 * Gerar cor aleatória para categoria
 */
export function getRandomColor(): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#EF4444', // red
    '#F59E0B', // orange
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calcular progresso de subtarefas
 */
export function calculateSubtaskProgress(subtasks: any[] = []): number {
  if (subtasks.length === 0) return 0;
  const completed = subtasks.filter((s) => s.completed).length;
  return Math.round((completed / subtasks.length) * 100);
}

/**
 * Truncar texto
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Copiar para clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erro ao copiar:', err);
    return false;
  }
}

/**
 * Download de arquivo
 */
export function downloadFile(data: any, filename: string, type: string = 'application/json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}