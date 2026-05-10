import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [greeting, setGreeting] = useState('Good morning');

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) setGreeting('Good morning');
        else if (currentHour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        // Pobieramy dane użytkownika raz, dla całej aplikacji
        const fetchUserData = async () => {
            try {
                const userRes = await api.get('/me/');
                setFirstName(userRes.data.firstName);
                setLastName(userRes.data.lastName);
            } catch (err) {
                console.error("Błąd ładowania usera:", err);
            }
        };
        fetchUserData();
    }, []);

    return (
        <div className="flex h-screen bg-[#0B0E14] text-white font-sans overflow-hidden relative">
            {/* Sidebar jest renderowany TYLKO RAZ */}
            <Sidebar 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
                firstName={firstName} 
                lastName={lastName} 
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                {/* Header też jest renderowany TYLKO RAZ */}
                <Header
                    title={<p className="text-gray-400 text-base">{greeting}, <span className="text-white font-bold">{firstName} 👋</span></p>}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                    firstName={firstName} 
                    lastName={lastName}
                />

                
            
                <main className="flex-1 overflow-y-auto w-full animate-fadeIn">
                    <Outlet context={{ firstName, lastName }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;