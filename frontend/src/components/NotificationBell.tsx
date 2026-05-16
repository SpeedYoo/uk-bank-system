import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import api from '../api/axios';

interface Notification {
    id: number;
    title: string;
    body: string;
    read: boolean;
    created_at: string;
}

interface Props {
    juniorTheme?: boolean;
}

const NotificationBell: React.FC<Props> = ({ juniorTheme = false }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
        } catch { /* silently ignore */ }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
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
        const diffMs = Date.now() - new Date(iso).getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffH   = Math.floor(diffMin / 60);
        const diffD   = Math.floor(diffH / 24);
        if (diffMin < 1)  return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffH < 24)   return `${diffH}h ago`;
        return `${diffD}d ago`;
    };

    /* ── theme tokens ── */
    const bellColor   = juniorTheme ? (isOpen ? 'text-purple-600' : 'text-purple-400') : '';
    const bellStyle   = juniorTheme ? {} : { color: isOpen ? 'var(--text-primary)' : 'var(--text-muted)' };
    const badgeCls    = juniorTheme
        ? 'bg-pink-500 text-white border-white'
        : 'bg-[#00FF85] text-black';
    const badgeStyle  = juniorTheme ? {} : { border: '2px solid var(--bg-base)' };

    const panelCls    = juniorTheme
        ? 'bg-white border border-purple-200'
        : '';
    const panelStyle  = juniorTheme ? {} : { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' };

    const panelHdrBorder = juniorTheme ? 'border-purple-100' : '';
    const panelHdrBorderStyle = juniorTheme ? {} : { borderBottom: '1px solid var(--border)' };

    const panelHdrIcon  = juniorTheme ? 'text-purple-400' : '';
    const panelHdrIconStyle = juniorTheme ? {} : { color: 'var(--text-muted)' };
    const panelHdrLabel = juniorTheme ? 'text-purple-400' : '';
    const panelHdrLabelStyle = juniorTheme ? {} : { color: 'var(--text-muted)' };
    const panelCloseBtn = juniorTheme ? 'text-purple-300 hover:text-purple-500' : '';
    const panelCloseBtnStyle = juniorTheme ? {} : { color: 'var(--text-muted)' };

    const emptyIcon   = juniorTheme ? 'text-purple-300' : '';
    const emptyIconStyle = juniorTheme ? {} : { color: 'var(--text-muted)' };
    const emptyText   = juniorTheme ? 'text-purple-300' : '';
    const emptyTextStyle = juniorTheme ? {} : { color: 'var(--text-muted)' };

    const getItemBg = (read: boolean) => {
        if (juniorTheme) return !read ? 'bg-purple-50' : 'bg-white';
        return '';
    };
    const getItemBgStyle = (read: boolean) => {
        if (juniorTheme) return {};
        return { backgroundColor: !read ? 'color-mix(in srgb, var(--bg-elevated) 60%, transparent)' : 'transparent' };
    };
    const getItemBorder = (isLast: boolean) =>
        juniorTheme
            ? (isLast ? '' : 'border-b border-purple-100')
            : '';
    const getItemBorderStyle = (isLast: boolean) =>
        juniorTheme ? {} : { borderBottom: isLast ? 'none' : '1px solid var(--border)' };

    const dotCls       = juniorTheme ? 'bg-pink-500' : 'bg-[#00FF85]';
    const titleCls     = juniorTheme ? 'text-gray-800' : '';
    const titleStyle   = juniorTheme ? {} : { color: 'var(--text-primary)' };
    const bodyCls      = juniorTheme ? 'text-gray-500' : '';
    const bodyStyle    = juniorTheme ? {} : { color: 'var(--text-secondary)' };
    const timeCls      = juniorTheme ? 'text-gray-400' : '';
    const timeStyle    = juniorTheme ? {} : { color: 'var(--text-muted)' };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={handleBellClick}
                className={`relative p-1.5 rounded-xl transition-colors ${bellColor}`}
                style={bellStyle}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span
                        className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 ${badgeCls}`}
                        style={badgeStyle}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div
                    className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden ${panelCls}`}
                    style={panelStyle}
                >
                    {/* Panel header */}
                    <div
                        className={`flex items-center justify-between px-4 py-3 border-b ${panelHdrBorder}`}
                        style={panelHdrBorderStyle}
                    >
                        <div className="flex items-center gap-2">
                            <Bell size={14} className={panelHdrIcon} style={panelHdrIconStyle} />
                            <span
                                className={`text-xs font-bold uppercase tracking-widest ${panelHdrLabel}`}
                                style={panelHdrLabelStyle}
                            >
                                Notifications
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={`transition-colors ${panelCloseBtn}`}
                            style={panelCloseBtnStyle}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <CheckCheck size={28} className={emptyIcon} style={emptyIconStyle} />
                                <p className={`text-xs ${emptyText}`} style={emptyTextStyle}>All caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n, i) => {
                                const isLast = i === notifications.length - 1;
                                return (
                                    <div
                                        key={n.id}
                                        className={`px-4 py-3 transition-colors ${getItemBg(n.read)} ${getItemBorder(isLast)}`}
                                        style={{ ...getItemBgStyle(n.read), ...getItemBorderStyle(isLast) }}
                                    >
                                        <div className="flex items-start gap-2">
                                            {!n.read && (
                                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
                                            )}
                                            <div className={!n.read ? '' : 'pl-3.5'}>
                                                <p className={`text-xs font-bold ${titleCls}`} style={titleStyle}>{n.title}</p>
                                                <p className={`text-xs mt-0.5 ${bodyCls}`} style={bodyStyle}>{n.body}</p>
                                                <p className={`text-[10px] mt-1 ${timeCls}`} style={timeStyle}>{formatTime(n.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
