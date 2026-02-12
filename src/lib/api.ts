import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL não definida nas variáveis de ambiente.');
}

// Criar instância do axios
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ========================================
// TOKEN CACHE
// ========================================

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Função para obter token
async function getAuthToken(): Promise<string | null> {
  const now = Date.now();

  // Se token válido em cache
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const { data } = await supabase.auth.getSession();

    const token = data?.session?.access_token;

    if (token) {
      cachedToken = token;

      // Expira em 50 minutos
      tokenExpiry = now + 50 * 60 * 1000;

      return token;
    }
  } catch (error) {
    console.warn('Erro ao buscar token:', error);
  }

  return null;
}

// Limpar cache (usar no logout)
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}

// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearTokenCache();

      // Evitar loop de logout
      if (!window.location.pathname.includes('/login')) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn('Erro ao deslogar:', err);
        }

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;