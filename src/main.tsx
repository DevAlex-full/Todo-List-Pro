import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// ✅ CONFIGURAÇÃO OTIMIZADA DO REACT QUERY - PROTEÇÃO GLOBAL CONTRA LOOPS
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configurações de retry
      retry: 1, // Tenta apenas 1 vez
      retryDelay: 1000, // Aguarda 1s entre tentativas
      
      // Configurações de refetch
      refetchOnWindowFocus: false, // NÃO recarrega ao focar na janela
      refetchOnMount: false, // ✅ NÃO recarrega ao montar o componente
      refetchOnReconnect: false, // NÃO recarrega ao reconectar
      
      // Cache
      staleTime: 5 * 60 * 1000, // Dados válidos por 5 minutos
      gcTime: 10 * 60 * 1000, // Mantém no cache por 10 minutos
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);