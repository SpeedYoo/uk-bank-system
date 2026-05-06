import React, { type ReactNode } from 'react';
import { Bell, Menu } from 'lucide-react'; // Usunięto import Search

interface HeaderProps {
  title?: ReactNode;
  onMenuClick?: () => void; 
  firstName?: string; // DODANE
  lastName?: string;  // DODANE
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onMenuClick, 
  firstName = "", 
  lastName = "" 
}) => {
  // Dynamiczne generowanie inicjałów
  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'JD';

  return (
    <header className="h-20 border-b border-gray-800 flex items-center justify-between px-4 sm:px-8 bg-[#0B0E14]/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:block">
          {title || (
            <h2 className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">
              NovaPay Platform
            </h2>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Usunięto lupkę (Search) */}
        <div className="relative cursor-pointer">
          <Bell className="text-gray-500 hover:text-white transition-colors" size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00FF85] border-2 border-[#0B0E14] rounded-full"></span>
        </div>
        <div className="w-8 h-8 bg-[#1F262E] rounded-full border border-gray-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {/* Wyświetlanie prawdziwych inicjałów */}
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;