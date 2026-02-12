import axios from "axios";
import { supabase } from "./supabase";

// ✅ CORRIGIDO: Agora api é uma NAMED EXPORT
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// 🔥 INTERCEPTOR PARA ENVIAR TOKEN JWT
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Também exportar como default para compatibilidade
export default api;