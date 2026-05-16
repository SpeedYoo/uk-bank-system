import React, { type ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Menu, CheckCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface HeaderProps {
    title?: ReactNode;
    onMenuClick?: () => void;
    firstName?: string;
    lastName?: string;
}

interface Notification {
    id: number;
    title: string;
    body: string;
    read: boolean;
    created_at: string;
}

const Header: React.FC<HeaderProps> = ({
    title,
    onMenuClick,
    firstName = '',
    lastName = '',
}) => {
    const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'JD';
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
        } catch { /* silently ignore if not authenticated yet */ }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBellClick = async () => {
        const opening = !isOpen;
        setIsOpen(opening);
        if (opening && unreadCount > 0) {
            try {
                await api.patch('/notifications/read-all/');
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } catch { /* ignore */ }
        }
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffH = Math.floor(diffMin / 60);
        const diffD = Math.floor(diffH / 24);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffH < 24) return `${diffH}h ago`;
        return `${diffD}d ago`;
    };

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
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={handleBellClick}
                        className="relative p-1.5 rounded-xl transition-colors"
                        style={{ color: isOpen ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#00FF85] text-black text-[9px] font-black rounded-full flex items-center justify-center px-1"
                                style={{ border: '2px solid var(--bg-base)' }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown panel */}
                    {isOpen && (
                        <div
                            className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-2">
                                    <Bell size={14} style={{ color: 'var(--text-muted)' }} />
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                        Notifications
                                    </span>
                                </div>
                                <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }}>
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Notification list */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                                        <CheckCheck size={28} style={{ color: 'var(--text-muted)' }} />
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
                                    </div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div
                                            key={n.id}
                                            className="px-4 py-3 transition-colors"
                                            style={{
                                                backgroundColor: !n.read ? 'color-mix(in srgb, var(--bg-elevated) 60%, transparent)' : 'transparent',
                                                borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                                            }}
                                        >
                                            <div className="flex items-start gap-2">
                                                {!n.read && (
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00FF85] shrink-0" />
                                                )}
                                                <div className={!n.read ? '' : 'pl-3.5'}>
                                                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.body}</p>
                                                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{formatTime(n.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
