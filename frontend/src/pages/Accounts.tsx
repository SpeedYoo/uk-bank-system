import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';

const Accounts = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [greeting, setGreeting] = useState('Good morning');

    // Prawdziwe dane z bazy
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    useEffect(() => {
        // Logika powitania z Dashboardu
        const currentHour = new Date().getHours();
        if (currentHour < 12) setGreeting('Good morning');
        else if (currentHour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const fetchData = async () => {
            try {
                // 1. Pobieramy dane o profilu użytkownika
                const userRes = await api.get('/me/');
                setFirstName(userRes.data.firstName);
                setLastName(userRes.data.lastName);

                // 2. Pobieramy wszystkie konta (Główne + Juniorzy)
                const accountsRes = await api.get('/accounts/');
                const fetchedAccounts = accountsRes.data;
                setAccounts(fetchedAccounts);

                // 3. Domyślnie zaznaczamy pierwsze konto na liście
                if (fetchedAccounts.length > 0) {
                    setSelectedAccount(fetchedAccounts[0]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Błąd podczas pobierania danych:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper do formatowania waluty
    const formatCurrency = (amount: string, currency: string = 'GBP') => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency
        }).format(parseFloat(amount));
    };

    // ==========================================
    // NOWA LOGIKA LIMITÓW
    // ==========================================
    const [txLimit, setTxLimit] = useState('');
    const [dailyLimit, setDailyLimit] = useState('');
    const [isSavingLimits, setIsSavingLimits] = useState(false);

    // Kiedy przełączasz konto, zaktualizuj wartości w inputach
   useEffect(() => {
        if (selectedAccount?.limits?.CARD) {
            setTxLimit(selectedAccount.limits.CARD.per_transaction_limit || '0.00');
            setDailyLimit(selectedAccount.limits.CARD.daily_limit || '0.00');
        } else {
            setTxLimit('0.00');
            setDailyLimit('0.00');
        }
    }, [selectedAccount]);

    // Funkcja uderzająca do nowego endpointu
    const handleSaveLimits = async () => {
        if (!selectedAccount) return;
        
        setIsSavingLimits(true);
        try {
            await api.patch('/accounts/limits/', {
                account_id: selectedAccount.id,
                channel: 'CARD', // Mówimy backendowi, że zmieniamy limity karty
                per_transaction_limit: txLimit,
                daily_limit: dailyLimit
            });
            
            // Po udanym zapisie aktualizujemy UI
            setSelectedAccount((prev: any) => ({
                ...prev,
                limits: {
                    ...prev.limits,
                    CARD: {
                        per_transaction_limit: txLimit,
                        daily_limit: dailyLimit
                    }
                }
            }));
            
        } catch (error) {
            console.error("Błąd zapisu limitów:", error);
        } finally {
            setIsSavingLimits(false);
        }
    };
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0B0E14] text-white font-sans overflow-hidden relative">
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                firstName={firstName}
                lastName={lastName}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">

                {/* Właściwy Header z powitaniem */}
                <Header
                    title={
                        <p className="text-gray-400 text-base">
                            {greeting}, <span className="text-white font-bold">{firstName} 👋</span>
                        </p>
                    }
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                    firstName={firstName}
                    lastName={lastName}
                />

                <div className="flex-1 p-4 sm:p-6 md:p-8 text-white flex gap-6 md:gap-8 overflow-y-auto">

                    {/* LEWA KOLUMNA: Dynamiczna lista kont */}
                    <div className="hidden md:flex w-52 shrink-0 flex-col gap-2">
                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">My Accounts</h2>

                        {accounts.map((acc) => {
                            const isJunior = acc.account_type === 'JUNIOR';
                            const isSelected = selectedAccount?.id === acc.id;
                            const displayName = isJunior ? acc.owner_first_name : firstName;

                            return (
                                <button
                                    key={acc.id}
                                    onClick={() => setSelectedAccount(acc)}
                                    className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all border ${isSelected
                                        ? (isJunior ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]')
                                        : 'hover:bg-white/5 border-transparent'
                                        }`}
                                >
                                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${isSelected
                                        ? (isJunior ? 'bg-purple-500 text-white' : 'bg-[#00FF85] text-black')
                                        : 'bg-white/5 text-gray-400'
                                        }`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {isJunior
                                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            }
                                        </svg>
                                    </div>
                                    <div className="text-left flex-1 overflow-hidden">
                                        <div className="flex items-center gap-1.5">
                                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>{displayName}</p>
                                            <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded shrink-0 ${isJunior ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                                                }`}>
                                                {isJunior ? 'Junior' : 'Main'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* PRAWA KOLUMNA: Szczegóły wybranego konta */}
                    <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 pb-10">
                        {selectedAccount ? (
                            <div className="flex flex-col h-full animate-fadeIn max-w-6xl w-full mx-auto md:mx-0">

                                {/* HEADER KONTA */}
                                <div className="bg-[#161B22] border border-gray-800 rounded-3xl p-6 md:p-8 mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shadow-lg">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl font-bold text-gray-200">
                                                {selectedAccount.account_type === 'JUNIOR' ? `${selectedAccount.owner_first_name}'s Account` : `${firstName}'s Account`}
                                            </h2>
                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                                Active
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                                                {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                                            </h1>
                                        </div>
                                    </div>

                                    {/* DETALE KONTA */}
                                    <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5 w-full xl:w-auto xl:min-w-[320px]">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account Details</span>
                                            <button className="text-gray-500 hover:text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Name</span>
                                                <span className="font-mono text-gray-300 font-medium tracking-wide text-xs md:text-sm uppercase">
                                                    {selectedAccount.account_type === 'JUNIOR' 
                                                        ? `${selectedAccount.owner_first_name} ${lastName}`
                                                        : `${firstName} ${lastName}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Sort Code</span>
                                                <span className="font-mono text-gray-300 font-medium tracking-wide text-xs md:text-sm">
                                                    {selectedAccount.sort_code?.match(/.{1,2}/g)?.join('-') || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Account Number</span>
                                                <span className="font-mono text-gray-300 font-medium tracking-wide text-xs md:text-sm">
                                                    {selectedAccount.account_number || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-gray-800/50">
                                                <span className="text-gray-500">IBAN</span>
                                                <span className="font-mono text-gray-300 font-medium tracking-wide text-[10px] md:text-xs">
                                                    {selectedAccount.iban?.replace(/(.{4})/g, '$1 ').trim() || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TYLKO DLA JUNIORA POKAZUJEMY KARTĘ I LIMITY */}
                                {selectedAccount.account_type === 'JUNIOR' ? (
                                    <>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                                            {/* WIDŻET KARTY (z danymi konta) */}
                                            <div className="bg-[#161B22] border border-gray-800 p-6 md:p-8 rounded-3xl flex flex-col shadow-lg">
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Virtual Card</h3>
                                                <div className="w-full aspect-[1.58/1] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(168,85,247,0.2)] relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                                    <div className="z-10 mt-auto">
                                                        <p className="text-white text-xl md:text-2xl font-mono tracking-[0.15em] mb-2 drop-shadow-sm">
                                                            **** **** **** {selectedAccount.iban ? selectedAccount.iban.slice(-4) : '0000'}
                                                        </p>
                                                        <div className="flex justify-between items-end">
                                                            <p className="text-white/80 text-xs md:text-sm uppercase font-bold tracking-wider">{selectedAccount.owner_first_name} {lastName}</p>
                                                            <p className="text-white/80 text-sm font-mono font-bold">12/28</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* PRZYCISKI AKCJI */}
                                                <div className="grid grid-cols-4 gap-3 mt-8">
                                                    {['ADD', 'VIEW', 'FREEZE', 'DELETE'].map(btn => (
                                                        <button key={btn} className="flex flex-col items-center justify-center gap-2 bg-[#0B0E14] hover:bg-white/5 p-3 rounded-xl transition-colors border border-gray-800 group text-[10px] font-bold text-gray-400 hover:text-white">
                                                            <span className="uppercase">{btn}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* WIDŻET LIMITÓW */}
                                            <div className="bg-[#161B22] border border-gray-800 p-6 md:p-8 rounded-3xl flex flex-col shadow-lg">
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Spending Rules</h3>

                                                <div className="space-y-6 flex-1 flex flex-col justify-center">

                                                    <div className="bg-[#0B0E14] rounded-2xl p-5 border border-gray-800">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center gap-2 text-gray-300">
                                                                <span className="text-sm font-semibold">Per Transaction Limit</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors shadow-inner">
                                                            <span className="pl-4 pr-2 text-gray-500 font-bold">£</span>
                                                            <input
                                                                type="number"
                                                                value={txLimit}
                                                                onChange={(e) => setTxLimit(e.target.value)}
                                                                className="bg-transparent text-white font-bold w-full py-3.5 outline-none"
                                                            />
                                                            <button
                                                                onClick={handleSaveLimits}
                                                                disabled={isSavingLimits}
                                                                className="px-5 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                                            >
                                                                <span className="text-xs font-bold uppercase tracking-wider">{isSavingLimits ? '...' : 'Save'}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#0B0E14] rounded-2xl p-5 border border-gray-800">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center gap-2 text-gray-300">
                                                                <span className="text-sm font-semibold">Daily Limit</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors mb-5 shadow-inner">
                                                            <span className="pl-4 pr-2 text-gray-500 font-bold">£</span>
                                                            <input
                                                                type="number"
                                                                value={dailyLimit}
                                                                onChange={(e) => setDailyLimit(e.target.value)}
                                                                className="bg-transparent text-white font-bold w-full py-3.5 outline-none"
                                                            />
                                                            <button
                                                                onClick={handleSaveLimits}
                                                                disabled={isSavingLimits}
                                                                className="px-5 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                                            >
                                                                <span className="text-xs font-bold uppercase tracking-wider">{isSavingLimits ? '...' : 'Save'}</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-between text-xs font-medium mb-2.5">
                                                            <span className="text-gray-400">£0.00 spent today</span>
                                                            <span className="text-purple-400 font-bold">£{dailyLimit} remaining</span>
                                                        </div>
                                                        <div className="w-full bg-[#161B22] h-2 rounded-full overflow-hidden border border-gray-800">
                                                            <div className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: '0%' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-[#161B22] border border-gray-800 p-10 rounded-3xl text-center text-gray-500 shadow-lg">
                                        Pełne statystyki Twojego konta głównego pojawią się wkrótce.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-20 text-gray-600">No account selected.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Accounts;