import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

// Placeholder components - você vai criar depois
const LoginPage = () => <div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <h1 className="text-4xl font-bold mb-4">🚀 Todo List Pro</h1>
    <p className="text-gray-600 dark:text-gray-400">Login Page - Em construção</p>
    <p className="text-sm mt-2">Crie suas páginas de Login, Dashboard, etc!</p>
  </div>
</div>;

const RegisterPage = () => <div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <h1 className="text-4xl font-bold mb-4">✨ Criar Conta</h1>
    <p className="text-gray-600 dark:text-gray-400">Register Page - Em construção</p>
  </div>
</div>;

const DashboardPage = () => <div className="p-8">
  <h1 className="text-3xl font-bold mb-4">📊 Dashboard</h1>
  <p className="text-gray-600 dark:text-gray-400">Dashboard Page - Em construção</p>
  <p className="text-sm mt-2">Aqui vai ter suas tarefas, analytics, etc!</p>
</div>;

function App() {
  const { initialize, isLoading, isAuthenticated } = useAuthStore();
  const { applyTheme } = useUIStore();

  useEffect(() => {
    initialize();
    applyTheme();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
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
