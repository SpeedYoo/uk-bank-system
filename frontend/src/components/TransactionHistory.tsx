import React, { useState, useEffect, useCallback } from 'react';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/axios';

interface Transaction {
    id: number;
    title: string;
    amount: string;
    balance_after: string | null;
    created_at: string;
    type: 'CREDIT' | 'DEBIT';
}

interface Props {
    accounts: any[];
}

const TransactionHistory: React.FC<Props> = ({ accounts }) => {
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    // Set default account when accounts load
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            const current = accounts.find(a => a.account_type === 'CURRENT') || accounts[0];
            setSelectedAccountId(String(current.id));
        }
    }, [accounts]);

    const fetchTransactions = useCallback(async (resetPage = true) => {
        if (!selectedAccountId) return;
        setLoading(true);
        const currentPage = resetPage ? 1 : page;
        try {
            const params: Record<string, string> = { page: String(currentPage) };
            if (typeFilter !== 'ALL') params.type = typeFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;

            const res = await api.get(`/accounts/${selectedAccountId}/transactions/`, { params });
            const newTxs = res.data.results;
            if (resetPage) {
                setTransactions(newTxs);
                setPage(1);
            } else {
                setTransactions(prev => [...prev, ...newTxs]);
            }
            setTotal(res.data.count);
            setHasMore(!!res.data.next);
        } catch (err) {
            console.error('Failed to load transactions:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedAccountId, typeFilter, fromDate, toDate, page]);

    useEffect(() => {
        fetchTransactions(true);
    }, [selectedAccountId, typeFilter, fromDate, toDate]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        // fetch next page
        const fetchNext = async () => {
            if (!selectedAccountId) return;
            setLoading(true);
            try {
                const params: Record<string, string> = { page: String(nextPage) };
                if (typeFilter !== 'ALL') params.type = typeFilter;
                if (fromDate) params.from = fromDate;
                if (toDate) params.to = toDate;
                const res = await api.get(`/accounts/${selectedAccountId}/transactions/`, { params });
                setTransactions(prev => [...prev, ...res.data.results]);
                setHasMore(!!res.data.next);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNext();
    };

    const formatAmount = (amount: string) => {
        const num = parseFloat(amount);
        const formatted = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(num));
        return num >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <section className="rounded-3xl p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                    <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Transaction History</h2>
                    {total > 0 && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} transaction{total !== 1 ? 's' : ''}</p>}
                </div>
                <button className="text-[#00FF85] hover:text-[#00e074] text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap">
                    <Download size={16} /> Download
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Account selector */}
                {accounts.length > 1 && (
                    <select
                        value={selectedAccountId}
                        onChange={e => setSelectedAccountId(e.target.value)}
                        className="px-3 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.account_type === 'JUNIOR' ? acc.owner_first_name : 'Current'} · ****{acc.account_number?.slice(-4)}
                            </option>
                        ))}
                    </select>
                )}

                {/* Type filter */}
                <div className="flex p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
                    {(['ALL', 'CREDIT', 'DEBIT'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                            style={typeFilter === t
                                ? { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }
                                : { color: 'var(--text-muted)' }
                            }
                        >
                            {t === 'ALL' ? 'All' : t === 'CREDIT' ? 'Money in' : 'Money out'}
                        </button>
                    ))}
                </div>

                {/* Date range */}
                <div className="flex gap-2 items-center">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">to</span>
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    {(fromDate || toDate) && (
                        <button
                            onClick={() => { setFromDate(''); setToDate(''); }}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-base)' }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Transaction list */}
            {loading && transactions.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00FF85]" />
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {transactions.map(tx => {
                        const isCredit = tx.type === 'CREDIT';
                        return (
                            <div
                                key={tx.id}
                                className="flex items-center gap-4 p-3 sm:p-4 rounded-2xl transition-colors"
                                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {isCredit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{tx.title}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                        {formatDate(tx.created_at)} · {formatTime(tx.created_at)}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-black ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatAmount(tx.amount)}
                                    </p>
                                    {tx.balance_after !== null && (
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            Balance: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(parseFloat(tx.balance_after!))}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Load more */}
            {hasMore && (
                <div className="mt-4 text-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                        {loading ? 'Loading...' : 'Load more'}
                    </button>
                </div>
            )}
        </section>
    );
};

export default TransactionHistory;
