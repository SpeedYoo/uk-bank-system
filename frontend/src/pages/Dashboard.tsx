import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Send, Plus, Home, ChevronRight, Download
} from 'lucide-react';
import api from '../api/axios';
import AddMoneyModal from '../components/AddMoneyModal';
import AddJuniorModal from '../components/AddJuniorModal';
import TransferModal from '../components/TransferModal';


interface ContextType {
    firstName: string;
    lastName: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const context = useOutletContext<ContextType>();

    
    const firstName = context?.firstName || '';

    const [loading, setLoading] = useState(true);
    const [totalBalance, setTotalBalance] = useState(0);
    const [accountCount, setAccountCount] = useState(0);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [isAddJuniorOpen, setIsAddJuniorOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    const fetchData = async () => {
        try {
            
            
            const accountsRes = await api.get('/accounts/');
            setAccounts(accountsRes.data);
            setAccountCount(accountsRes.data.length);

            
            const sum = accountsRes.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.balance), 0);
            setTotalBalance(sum);

        } catch (err) {
            console.error("Błąd podczas pobierania danych konta:", err);
            navigate('/login', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const formattedTotalBalance = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
    }).format(totalBalance);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]"></div>
            </div>
        );
    }

    const formatIBAN = (iban: string) => {
        if (!iban) return '';
        return iban.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    return (

        <>
            <div className="p-4 sm:p-6 md:p-10 w-full animate-fadeIn">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* SEKCJA 1: GŁÓWNE PODSUMOWANIE */}
                    <section className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{formattedTotalBalance}</h1>
                            <p className="text-[var(--text-muted)] text-sm mt-3">
                                Across {accountCount} account{accountCount !== 1 ? 's' : ''} · Updated just now
                            </p>
                        </div>
                        <div className="flex w-full md:w-auto gap-4">
                            <button
                                onClick={() => setIsTransferOpen(true)}
                                className="flex-1 md:flex-none bg-[#00FF85] hover:bg-[#00e074] text-black px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Send size={18} /> Send money
                            </button>
                            <button
                                onClick={() => setIsAddMoneyOpen(true)}
                                className="flex-1 md:flex-none border border-[var(--border)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Plus size={18} /> Add money
                            </button>
                        </div>
                    </section>

                    {/* SEKCJA 2: KAFELKI KONT */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map((account, index) => {
                            const accType = (account.account_type || "").trim().toUpperCase();
                            const isCurrent = accType === 'CURRENT' || index === 0;
                            const formattedIban = formatIBAN(account.iban || "");

                            return (
                                <div
                                    key={account.id}
                                    // DODAJEMY ONCLICK TUTAJ: Przenosi do /accounts i przekazuje ID konta
                                    onClick={() => navigate('/accounts', { state: { selectedAccountId: account.id } })}
                                    className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 cursor-pointer hover:border-gray-600 transition-all group relative overflow-hidden"
                                >
                                    <div className={`absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-10 ${isCurrent ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>

                                    <div className="flex justify-between items-center mb-8">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isCurrent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                            <Home size={24} />
                                        </div>
                                        {/* Strzałka sugerująca klikalność - można ją oprogramować do navigate('/accounts') */}
                                        <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-emerald-400' : 'text-purple-400'}`}>
                                                {isCurrent ? 'Current Account' : 'Junior Account'}
                                            </p>

                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${isCurrent
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-purple-500/20 text-purple-300'
                                                }`}>
                                                {account.owner_first_name || (isCurrent ? 'MAIN' : 'JUNIOR')}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                                            {new Intl.NumberFormat('en-GB', {
                                                style: 'currency',
                                                currency: account.currency || 'GBP'
                                            }).format(parseFloat(account.balance))}
                                        </h2>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[var(--border)]/50">
                                        <p className="text-[var(--text-muted)] text-[11px] font-mono tracking-[0.15em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                                            {formattedIban}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* DODAJ KONTO JUNIOR */}
                        <button
                            onClick={() => setIsAddJuniorOpen(true)}
                            className="bg-transparent border-2 border-dashed border-[var(--border)] hover:border-[#00FF85] hover:bg-[#00FF85]/5 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-[#00FF85] transition-all min-h-[180px] group"
                        >
                            <div className="w-12 h-12 bg-[var(--bg-elevated)] group-hover:bg-[#00FF85]/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                                <Plus size={24} className="text-[var(--text-muted)] group-hover:text-[#00FF85] transition-colors" />
                            </div>
                            <span className="font-semibold text-sm">Add Junior Account</span>
                        </button>
                    </section>

                    {/* SEKCJA 3: TRANSAKCJE */}
                    <section className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[var(--border)] pb-6">
                            <div className="flex bg-[var(--bg-base)] p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                                <button className="px-6 py-2 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg text-sm font-medium shadow-sm whitespace-nowrap">All</button>
                                <button className="px-6 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors whitespace-nowrap">Money in</button>
                                <button className="px-6 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors whitespace-nowrap">Money out</button>
                            </div>
                            <button className="text-[#00FF85] hover:text-[#00e074] text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap">
                                <Download size={16} /> Download
                            </button>
                        </div>

                        <div className="space-y-1 text-center py-10 text-gray-600">
                            <p className="text-sm">No transactions yet.</p>
                        </div>
                    </section>

                </div>
            </div>

            {/* MODALE POZOSTAJĄ BEZ ZMIAN */}
            <AddMoneyModal
                isOpen={isAddMoneyOpen}
                onClose={() => setIsAddMoneyOpen(false)}
                accounts={accounts.filter((acc: any) => acc.account_type === 'CURRENT')}
                onSuccess={() => fetchData()}
            />

            <AddJuniorModal
                isOpen={isAddJuniorOpen}
                onClose={() => setIsAddJuniorOpen(false)}
                onSuccess={() => fetchData()}
            />
            <TransferModal
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                accounts={accounts}
                onSuccess={() => fetchData()}
            />

        </>
    );
};

export default Dashboard;