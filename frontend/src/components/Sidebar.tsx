import React from 'react';
import { LayoutDashboard, Users, CreditCard, PieChart, Wallet, Settings, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
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
          <div className="w-8 h-8 bg-gradient-to-br from-[#00FF85] to-[#00A3FF] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,133,0.1)]">
            <span className="text-black font-extrabold text-xl italic">N</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">NovaPay</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#161B22] text-[#00FF85]">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
          {['Accounts', 'Payments', 'Analytics', 'Cards', 'Settings'].map((item) => (
            <div key={item} className="flex items-center gap-4 px-4 py-3 text-gray-500 cursor-not-allowed">
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </nav>
        
        <div className="mt-auto p-4 bg-[#161B22] rounded-2xl border border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F262E] rounded-full flex items-center justify-center text-[#00FF85] font-bold border border-gray-700">JD</div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Jane Doe</p>
            <p className="text-xs text-gray-500">Personal</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;