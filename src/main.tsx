import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Configurar React Query - OTIMIZADO
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry
      retry: 1,
      retryDelay: 1000,
      
      // Refetch - Configuração balanceada
      refetchOnWindowFocus: false,
      refetchOnMount: true,        // ✅ ADICIONADO - Permite F5 funcionar
      refetchOnReconnect: false,   // ✅ ADICIONADO
      
      // Cache - Reduzido para 30s (era 5min)
      staleTime: 30 * 1000,        // ✅ MODIFICADO - 30 segundos
      gcTime: 5 * 60 * 1000,       // ✅ ADICIONADO - 5 minutos no cache
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