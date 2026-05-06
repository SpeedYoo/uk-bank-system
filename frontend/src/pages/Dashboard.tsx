import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, Plus, Home, ChevronRight, Download,
    Zap, CreditCard, Building2, LogOut
} from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddMoneyModal from '../components/AddMoneyModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [greeting, setGreeting] = useState('Good morning');
    const [totalBalance, setTotalBalance] = useState(0);
    const [accountCount, setAccountCount] = useState(0);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

    const fetchData = async () => {
        try {
            const statusRes = await api.get('/setup/status/');
            if (!statusRes.data.is_setup_complete) {
                navigate('/setup', { replace: true });
                return;
            }

            const userRes = await api.get('/me/');
            setFirstName(userRes.data.firstName);
            setLastName(userRes.data.lastName);

            const accountsRes = await api.get('/accounts/');
            setAccounts(accountsRes.data);
            setAccountCount(accountsRes.data.length);

            const sum = accountsRes.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.balance), 0);
            setTotalBalance(sum);

            setLoading(false);
        } catch (err) {
            console.error("Błąd:", err);
            navigate('/login', { replace: true });
        }
    };

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) setGreeting('Good morning');
        else if (currentHour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        fetchData();
    }, [navigate]);

    const formattedTotalBalance = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
    }).format(totalBalance);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]"></div>
            </div>
        );
    }

    const formatIBAN = (iban: string) => {
        if (!iban) return '';
        return iban.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    return (
        <div className="flex h-screen bg-[#0B0E14] text-white font-sans overflow-hidden relative">
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                firstName={firstName}
                lastName={lastName}
            />

            <div className="flex-1 flex flex-col overflow-hidden w-full">
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

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
                    <div className="max-w-6xl mx-auto space-y-6">

                        <section className="bg-[#161B22] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{formattedTotalBalance}</h1>
                                <p className="text-gray-500 text-sm mt-3">
                                    Across {accountCount} account{accountCount !== 1 ? 's' : ''} · Updated just now
                                </p>
                            </div>
                            <div className="flex w-full md:w-auto gap-4">
                                <button className="flex-1 md:flex-none bg-[#00FF85] hover:bg-[#00e074] text-black px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                    <Send size={18} /> Send money
                                </button>
                                <button
                                    onClick={() => setIsAddMoneyOpen(true)}
                                    className="flex-1 md:flex-none border border-gray-700 hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus size={18} /> Add money
                                </button>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {accounts.map((account, index) => {
                                const accType = (account.account_type || "").trim().toUpperCase();
                                const isCurrent = accType === 'CURRENT' || index === 0;

                                const formattedIban = (account.iban || "").replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();

                                return (
                                    <div key={account.id} className="bg-[#161B22] border border-gray-800 rounded-3xl p-6 cursor-pointer hover:border-gray-600 transition-all group relative overflow-hidden">
                                        <div className={`absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-10 ${isCurrent ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>

                                        <div className="flex justify-between items-center mb-8">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isCurrent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                <Home size={24} />
                                            </div>
                                            <ChevronRight size={20} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-emerald-400' : 'text-purple-400'}`}>
                                                    {isCurrent ? 'Current Account' : 'Junior Account'}
                                                </p>
                                                {!isCurrent && (
                                                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                                                        Junior
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-3xl font-black text-white tracking-tight">
                                                {new Intl.NumberFormat('en-GB', {
                                                    style: 'currency',
                                                    currency: account.currency || 'GBP'
                                                }).format(parseFloat(account.balance))}
                                            </h2>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-800/50">
                                            <p className="text-gray-500 text-[11px] font-mono tracking-[0.15em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                                                {formattedIban}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <button className="bg-transparent border-2 border-dashed border-gray-700 hover:border-[#00FF85] hover:bg-[#00FF85]/5 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-[#00FF85] transition-all min-h-[180px] group">
                                <div className="w-12 h-12 bg-gray-800 group-hover:bg-[#00FF85]/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                                    <Plus size={24} className="text-gray-400 group-hover:text-[#00FF85] transition-colors" />
                                </div>
                                <span className="font-semibold text-sm">Add Junior Account</span>
                            </button>
                        </section>

                        <section className="bg-[#161B22] border border-gray-800 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-6">
                                <div className="flex bg-[#0B0E14] p-1 rounded-xl">
                                    <button className="px-6 py-2 bg-[#1F262E] text-white rounded-lg text-sm font-medium shadow-sm">All</button>
                                    <button className="px-6 py-2 text-gray-500 hover:text-gray-300 rounded-lg text-sm font-medium transition-colors">Money in</button>
                                    <button className="px-6 py-2 text-gray-500 hover:text-gray-300 rounded-lg text-sm font-medium transition-colors">Money out</button>
                                </div>
                                <button className="text-[#00FF85] hover:text-[#00e074] text-sm font-bold flex items-center gap-2 transition-colors">
                                    <Download size={16} /> Download
                                </button>
                            </div>

                            <div className="space-y-1 text-center py-10 text-gray-600">
                                <p className="text-sm">No transactions yet.</p>
                            </div>
                        </section>

                    </div>
                </main>
            </div>
            <AddMoneyModal 
                isOpen={isAddMoneyOpen} 
                onClose={() => setIsAddMoneyOpen(false)} 
                accounts={accounts}
                onSuccess={() => fetchData()} 
            />
        </div>
    );
};

export default Dashboard;