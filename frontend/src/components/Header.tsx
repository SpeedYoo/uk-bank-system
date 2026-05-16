import React, { type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

interface HeaderProps {
    title?: ReactNode;
    onMenuClick?: () => void;
    firstName?: string;
    lastName?: string;
}

const Header: React.FC<HeaderProps> = ({
    title,
    onMenuClick,
    firstName = '',
    lastName = '',
}) => {
    const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'JD';
    const navigate = useNavigate();

    return (
        <header
            className="h-20 flex items-center justify-between px-4 sm:px-8 backdrop-blur-md border-b transition-colors duration-300"
            style={{
                backgroundColor: 'color-mix(in srgb, var(--bg-base) 80%, transparent)',
                borderColor: 'var(--border)',
            }}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden transition-colors p-1"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block">
                    {title || (
                        <h2
                            className="uppercase tracking-widest text-[10px] font-bold"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Lyo Bank
                        </h2>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                {/* Bell + dropdown */}
                <NotificationBell />

                {/* Avatar → profile */}
                <button
                    onClick={() => navigate('/profile')}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all hover:ring-2 hover:ring-emerald-500/50"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                    }}
                    title="Profile"
                >
                    {initials}
                </button>
            </div>
        </header>
    );
};

export default Header;
