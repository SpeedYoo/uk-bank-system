import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, Search, X } from 'lucide-react';
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

const TransactionHistory: React.FC<Props> = ({ accounts }) => {
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(String(accounts[0].id));
        }
    }, [accounts]);

    /* Debounce search input — 300 ms */
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    const buildParams = useCallback((pg: number): Record<string, string> => {
        const params: Record<string, string> = { page: String(pg) };
        if (typeFilter !== 'ALL') params.type = typeFilter;
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
        if (debouncedSearch) params.search = debouncedSearch;
        return params;
    }, [typeFilter, fromDate, toDate, debouncedSearch]);

    const fetchTransactions = useCallback(async (resetPage = true) => {
        if (!selectedAccountId) return;
        setLoading(true);
        const pg = resetPage ? 1 : page;
        try {
            const res = await api.get(`/accounts/${selectedAccountId}/transactions/`, { params: buildParams(pg) });
            if (resetPage) {
                setTransactions(res.data.results);
                setPage(1);
            } else {
                setTransactions(prev => [...prev, ...res.data.results]);
            }
            setTotal(res.data.count);
            setHasMore(!!res.data.next);
        } catch (err) {
            console.error('Failed to load transactions:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedAccountId, buildParams, page]);

    useEffect(() => {
        fetchTransactions(true);
    }, [selectedAccountId, typeFilter, fromDate, toDate, debouncedSearch]);

    const loadMore = async () => {
        const nextPage = page + 1;
        setPage(nextPage);
        setLoading(true);
        try {
            const res = await api.get(`/accounts/${selectedAccountId}/transactions/`, { params: buildParams(nextPage) });
            setTransactions(prev => [...prev, ...res.data.results]);
            setHasMore(!!res.data.next);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: string) => {
        const num = parseFloat(amount);
        return (num >= 0 ? '+' : '-') + new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(num));
    };

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <div className="rounded-3xl p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-5">

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

                    {/* Type pills */}
                    <div className="flex p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
                        {(['ALL', 'CREDIT', 'DEBIT'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                                style={typeFilter === t
                                    ? { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }
                                    : { color: 'var(--text-muted)' }}
                            >
                                {t === 'ALL' ? 'All' : t === 'CREDIT' ? 'Money in' : 'Money out'}
                            </button>
                        ))}
                    </div>

                    {/* Date range */}
                    <div className="flex gap-2 items-center flex-wrap">
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                            style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                        <span style={{ color: 'var(--text-muted)' }} className="text-xs">to</span>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                            style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                        {(fromDate || toDate) && (
                            <button onClick={() => { setFromDate(''); setToDate(''); }}
                                className="text-xs px-2 py-1 rounded-lg"
                                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-base)' }}>
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-48">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by title or recipient…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                            style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Count */}
                {total > 0 && (
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                        {total} transaction{total !== 1 ? 's' : ''}
                        {debouncedSearch && <span> matching <strong>"{debouncedSearch}"</strong></span>}
                    </p>
                )}

                {/* List */}
                {loading && transactions.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00FF85]" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {debouncedSearch ? `No transactions matching "${debouncedSearch}".` : 'No transactions found.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map(tx => {
                            const isCredit = tx.type === 'CREDIT';
                            return (
                                <button
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className="w-full flex items-center gap-4 p-3 sm:p-4 rounded-2xl transition-all text-left hover:scale-[1.01] active:scale-[0.99]"
                                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {isCredit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{tx.title}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {formatDate(tx.created_at)} · {formatTime(tx.created_at)}
                                            {tx.recipient_name ? ` · ${tx.recipient_name}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-black ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatAmount(tx.amount)}
                                        </p>
                                        {tx.balance_after !== null && (
                                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                Bal: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(parseFloat(tx.balance_after))}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {hasMore && (
                    <div className="mt-4 text-center">
                        <button onClick={loadMore} disabled={loading}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                            {loading ? 'Loading...' : 'Load more'}
                        </button>
                    </div>
                )}
            </div>

            <TransactionDetailModal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} transaction={selectedTx} />
        </>
    );
};

export default TransactionHistory;
