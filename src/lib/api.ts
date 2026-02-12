import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Criar instância do axios
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Cache do token
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Função para obter token
async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  
  // Se tem token em cache e não expirou, usar ele
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const { data } = await supabase.auth.getSession();

    if (data?.session?.access_token) {
      cachedToken = data.session.access_token;
      // Cache por 50 minutos
      tokenExpiry = now + 50 * 60 * 1000;
      return cachedToken;
    }
  } catch (error) {
    console.warn('Erro ao buscar token (ignorado):', error);
  }

  return null;
}

// Limpar cache do token (útil no logout)
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}

// Interceptor para adicionar token
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearTokenCache();
      
      // Só fazer logout se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Erro ao fazer logout:', e);
        }
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;