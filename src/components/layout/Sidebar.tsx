import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { clearTokenCache } from '@/lib/api';

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      console.log('🚪 Logout iniciado pelo usuário');

      // Limpar cache do token
      clearTokenCache();

      // Fazer logout
      await signOut();
    }
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/tasks',
      icon: CheckSquare,
      label: 'Tarefas',
    },
    {
      path: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Configurações',
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="TaskFlow Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-xs text-slate-400">Organize seu dia</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {user?.email?.split('@')[0] || 'Usuário'}
              </p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}