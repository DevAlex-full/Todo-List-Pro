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
// INTERCEPTOR DE REQUEST
// Adiciona token JWT em todas as requisições
// ========================================
api.interceptors.request.use(
  async (config) => {
    try {
      // Busca sessão atual do Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('⚠️ [API] Erro ao buscar sessão:', error.message);
        return config; // Continua sem token
      }
      
      const token = data.session?.access_token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 [API] Token adicionado ao request');
      } else {
        console.warn('⚠️ [API] Nenhum token disponível');
      }
      
      return config;
      
    } catch (error) {
      console.error('❌ [API] Erro no interceptor:', error);
      return config; // Continua mesmo com erro
    }
  },
  (error) => {
    console.error('❌ [API] Erro no request:', error);
    return Promise.reject(error);
  }
);

// ========================================
// INTERCEPTOR DE RESPONSE
// Trata erros globalmente
// ========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ [API] Token inválido ou expirado');
      // Poderia redirecionar para login aqui se necessário
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('❌ [API] Request timeout');
    }
    
    return Promise.reject(error);
  }
);

// Exporta como default também para compatibilidade
export default api;