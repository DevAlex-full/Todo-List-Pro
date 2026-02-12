import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import TasksPage from './pages/Tasks';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';

function App() {
  const { initialize, isLoading, isAuthenticated } = useAuthStore();
  const { applyTheme } = useUIStore();
  const [initTimeout, setInitTimeout] = useState(false);

  useEffect(() => {
    // Inicializar auth
    initialize();
    applyTheme();

    // TIMEOUT DE SEGURANÇA: se não inicializar em 5s, força continuar
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ TIMEOUT: Forçando fim do loading');
        useAuthStore.setState({ isLoading: false });
        setInitTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  // Se deu timeout, mostrar mensagem de erro
  if (initTimeout && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Erro de Inicialização</h2>
          <p className="text-purple-200 mb-4">
            A aplicação não conseguiu inicializar corretamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">Carregando...</p>
          <p className="text-purple-300 text-sm mt-2">Iniciando aplicação</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Rotas públicas */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />}
        />

        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/tasks"
          element={isAuthenticated ? <TasksPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/analytics"
          element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />}
        />

        {/* Rota raiz */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;