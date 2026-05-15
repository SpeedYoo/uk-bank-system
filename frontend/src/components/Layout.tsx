import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [greeting, setGreeting] = useState('Good morning');
    const [isChecking, setIsChecking] = useState(true);

    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) setGreeting('Good morning');
        else if (currentHour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const verifyAndFetch = async () => {
            try {
                const statusRes = await api.get('/setup/status/');
                const isSetupComplete = statusRes.data.is_setup_complete;

                if (!isSetupComplete && location.pathname !== '/setup') {
                    navigate('/setup', { replace: true });
                    return;
                }

                if (isSetupComplete && location.pathname === '/setup') {
                    navigate('/dashboard', { replace: true });
                    return;
                }

                if (isSetupComplete) {
                    const userRes = await api.get('/me/');
                    setFirstName(userRes.data.firstName);
                    setLastName(userRes.data.lastName);
                }
            } catch (err) {
                console.error('Błąd ładowania usera/autoryzacji:', err);
            } finally {
                setIsChecking(false);
            }
        };

        verifyAndFetch();
    }, [location.pathname, navigate]);

    if (isChecking) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-base)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]"></div>
            </div>
        );
    }

    return (
        <div
            className="flex h-screen font-sans overflow-hidden relative transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                firstName={firstName}
                lastName={lastName}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                <Header
                    title={
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {greeting},{' '}
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {firstName} 👋
                            </span>
                        </p>
                    }
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                    firstName={firstName}
                    lastName={lastName}
                />

                <main className="flex-1 overflow-y-auto w-full animate-fadeIn">
                    <Outlet context={{ firstName, lastName, theme }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;
