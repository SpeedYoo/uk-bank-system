import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { LogOut, Star, Bell, LayoutDashboard, Send } from 'lucide-react';
import api from '../api/axios';

const JuniorLayout = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/me/');
                setFirstName(res.data.firstName);
                setLastName(res.data.lastName);
            } catch {
                navigate('/login', { replace: true });
            }
        };
        load();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            await api.post('/auth/logout/', { refresh: refreshToken });
        } catch {}
        localStorage.clear();
        navigate('/login', { replace: true });
    };

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

    const navItems = [
        { to: '/junior/dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
        { to: '/junior/payments', icon: <Send size={20} />, label: 'Payments' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-blue-100 font-sans">
            {/* Top bar */}
            <header className="bg-white/70 backdrop-blur-md border-b border-purple-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Star size={20} className="text-white fill-white" />
                    </div>
                    <div>
                        <span className="text-lg font-black text-purple-700 tracking-tight">Lyo Jr.</span>
                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest leading-none">Junior Account</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer">
                        <Bell size={22} className="text-purple-400 hover:text-purple-600 transition-colors" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-black text-white shadow">
                        {initials}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors text-sm font-bold"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:block">Log out</span>
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
                <Outlet context={{ firstName, lastName }} />
            </main>

            {/* Bottom tab navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md border-t border-purple-200 flex justify-around items-stretch px-4 py-2 safe-area-inset-bottom">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all text-xs font-bold ${
                                isActive
                                    ? 'text-purple-600 bg-purple-100'
                                    : 'text-purple-300 hover:text-purple-500'
                            }`
                        }
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default JuniorLayout;
