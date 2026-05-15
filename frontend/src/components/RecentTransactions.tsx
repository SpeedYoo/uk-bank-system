import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/axios';
import TransactionDetailModal from './TransactionDetailModal';

interface Transaction {
    id: number;
    title: string;
    amount: string;
    balance_after: string | null;
    created_at: string;
    type: 'CREDIT' | 'DEBIT';
    account_number: string;
    recipient_name: string | null;
    recipient_account: string | null;
    routing_method: string | null;
}

interface Props {
    accounts: any[];
}

const RecentTransactions: React.FC<Props> = ({ accounts }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    useEffect(() => {
        if (accounts.length === 0) return;
        const mainAccount = accounts[0];
        const fetchRecent = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/accounts/${mainAccount.id}/transactions/`, {
                    params: { page: '1', page_size: '10' }
                });
                setTransactions(res.data.results);
            } catch (err) {
                console.error('Failed to load recent transactions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, [accounts]);

    const formatAmount = (amount: string) => {
        const num = parseFloat(amount);
        return (num >= 0 ? '+' : '-') + new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(num));
    };

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    return (
        <>
            <section className="rounded-3xl p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-1 text-sm font-bold text-[#00FF85] hover:text-[#00e074] transition-colors"
                    >
                        View all <ChevronRight size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-[#00FF85]" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map(tx => {
                            const isCredit = tx.type === 'CREDIT';
                            return (
                                <button
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left hover:scale-[1.01] active:scale-[0.99]"
                                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {isCredit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{tx.title}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(tx.created_at)}</p>
                                    </div>
                                    <p className={`text-sm font-black shrink-0 ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatAmount(tx.amount)}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            <TransactionDetailModal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} transaction={selectedTx} />
        </>
    );
};

export default RecentTransactions;
