import axios from "axios";
import { supabase } from "./supabase";

// ========================================
// CONFIGURAÇÃO DO AXIOS
// ========================================
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000, // 15 segundos
});

// ========================================
// INTERCEPTOR COM TIMEOUT
// ========================================
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('🔑 [API] Buscando token...');
      
      // ✅ TIMEOUT DE 3 SEGUNDOS
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.warn('⚠️ [API] Erro ao buscar sessão:', error.message);
        return config; // Continua SEM token
      }
      
      const token = data?.session?.access_token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ [API] Token adicionado');
      } else {
        console.warn('⚠️ [API] Sem token disponível');
      }
      
      return config;
      
    } catch (error: any) {
      // TIMEOUT ou erro
      console.error('❌ [API] Timeout ou erro:', error.message);
      // ✅ CONTINUA MESMO SEM TOKEN
      return config;
    }
  },
  (error) => {
    console.error('❌ [API] Erro no request:', error);
    return Promise.reject(error);
  }
);

// ========================================
// INTERCEPTOR DE RESPONSE
// ========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ [API] Token inválido ou expirado');
      // Poderia forçar logout aqui
      // window.location.href = '/login';
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('❌ [API] Request timeout');
    }
    
    return Promise.reject(error);
  }
);

// Exporta como default também
export default api;