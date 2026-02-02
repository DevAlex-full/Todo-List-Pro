import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
 * Verificar se a data está atrasada
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
 * Formatar tempo em minutos para horas e minutos
 */
export function formatTime(minutes: number | null): string {
  if (!minutes) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
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
