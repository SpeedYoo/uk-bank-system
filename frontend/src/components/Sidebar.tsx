import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  PieChart, 
  CreditCard, 
  Settings, 
  X, 
  LogOut 
} from 'lucide-react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import api from '../api/axios';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  firstName?: string;
  lastName?: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  firstName = "",
  lastName = "",
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sprawdzamy, czy jesteśmy na stronie setupu
  const isSetupPage = location.pathname.startsWith('/setup');

  const handleLogoutClick = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout failed on backend:", error);
    } finally {
      localStorage.clear();
      navigate('/login', { replace: true });
      if (onLogout) onLogout();
    }
  };

  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Payments', path: '/payments', icon: ArrowRightLeft },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Cards', path: '/cards', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0E14] border-r border-gray-800 flex flex-col h-screen p-6
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <button
          onClick={onClose}
          className="absolute top-6 right-4 text-gray-500 hover:text-white md:hidden"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <img src="/logo.svg" alt="Lyo Bank" className="w-6 h-5 object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Lyo Bank</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            
            if (isSetupPage) {
              return (
                <div key={item.name} className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 cursor-not-allowed opacity-50 border border-transparent">
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
              );
            }

            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sekcja wylogowania - blokujemy ją podczas setupu (opcjonalne, ale logiczne) */}
        <div className="mt-auto pt-4 border-t border-gray-800/50">
          <button
            onClick={handleLogoutClick}
            disabled={isSetupPage}
            className={`flex items-center justify-center gap-3 w-full p-4 rounded-2xl transition-all group ${
              isSetupPage 
                ? 'bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 cursor-pointer'
            }`}
          >
            <LogOut size={20} className={!isSetupPage ? "group-hover:-translate-x-1 transition-transform" : ""} />
            <span className="font-bold text-sm tracking-wide">Log out</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;