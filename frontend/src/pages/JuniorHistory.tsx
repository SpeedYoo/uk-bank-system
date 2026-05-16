import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, Search, X } from 'lucide-react';
import api from '../api/axios';
import TransactionDetailModal from '../components/TransactionDetailModal';

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

const JuniorHistory: React.FC = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    /* Debounce search — 300 ms */
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    /* Load accounts once */
    useEffect(() => {
        api.get('/accounts/').then(res => {
            setAccounts(res.data);
            if (res.data.length > 0) setSelectedAccountId(String(res.data[0].id));
        }).catch(console.error);
    }, []);

    const fetchTx = useCallback(async (resetPage = true) => {
        if (!selectedAccountId) return;
        setLoading(true);
        const pg = resetPage ? 1 : page;
        try {
            const params: Record<string, string> = { page: String(pg) };
            if (typeFilter !== 'ALL') params.type = typeFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;
            if (debouncedSearch) params.search = debouncedSearch;

            const res = await api.get(`/accounts/${selectedAccountId}/transactions/`, { params });
            if (resetPage) {
                setTransactions(res.data.results);
                setPage(1);
            } else {
                setTransactions(prev => [...prev, ...res.data.results]);
            }
            setTotal(res.data.count);
            setHasMore(!!res.data.next);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedAccountId, typeFilter, fromDate, toDate, debouncedSearch, page]);

    useEffect(() => { fetchTx(true); }, [selectedAccountId, typeFilter, fromDate, toDate, debouncedSearch]);

    const loadMore = async () => {
        const next = page + 1;
        setPage(next);
        setLoading(true);
        try {
            const params: Record<string, string> = { page: String(next) };
            if (typeFilter !== 'ALL') params.type = typeFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;
            if (debouncedSearch) params.search = debouncedSearch;
            const res = await api.get(`/accounts/${selectedAccountId}/transactions/`, { params });
            setTransactions(prev => [...prev, ...res.data.results]);
            setHasMore(!!res.data.next);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
    const formatAmount = (amount: string) => {
        const n = parseFloat(amount);
        return (n >= 0 ? '+' : '-') + fmt(Math.abs(n));
    };
    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    /* ── shared input style ── */
    const inputCls = 'px-3 py-2 rounded-xl text-sm border border-purple-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300';

    return (
        <>
            <div className="space-y-6 animate-fadeIn pb-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-purple-800 tracking-tight">Transaction History</h1>
                    <p className="text-sm text-purple-400 font-medium mt-0.5">All activity on your account</p>
                </div>

                {/* Filters card */}
                <div className="bg-white rounded-[1.5rem] border-2 border-purple-100 p-5 shadow-sm space-y-3">

                    {/* Account picker (only shown if more than one account) */}
                    {accounts.length > 1 && (
                        <select
                            value={selectedAccountId}
                            onChange={e => setSelectedAccountId(e.target.value)}
                            className={inputCls + ' w-full'}
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.account_type === 'JUNIOR' ? acc.owner_first_name : 'Current'} · ****{acc.account_number?.slice(-4)}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Type filter pills */}
                    <div className="flex p-1 rounded-xl bg-purple-50 border border-purple-100 w-fit">
                        {(['ALL', 'CREDIT', 'DEBIT'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setTypeFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                    typeFilter === f
                                        ? 'bg-white text-purple-600 shadow'
                                        : 'text-purple-300 hover:text-purple-500'
                                }`}
                            >
                                {f === 'ALL' ? 'All' : f === 'CREDIT' ? 'Money in' : 'Money out'}
                            </button>
                        ))}
                    </div>

                    {/* Date range */}
                    <div className="flex gap-2 items-center flex-wrap">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className={inputCls}
                        />
                        <span className="text-xs text-purple-300 font-bold">to</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className={inputCls}
                        />
                        {(fromDate || toDate) && (
                            <button
                                onClick={() => { setFromDate(''); setToDate(''); }}
                                className="text-xs px-3 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-400 hover:bg-purple-100 transition-colors font-bold"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-300" />
                        <input
                            type="text"
                            placeholder="Search by title or recipient…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={inputCls + ' pl-8 pr-8 w-full'}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-500"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Transaction list */}
                <div className="bg-white rounded-[1.5rem] border-2 border-purple-100 p-5 shadow-sm">
                    {total > 0 && (
                        <p className="text-xs text-purple-300 font-bold mb-4">
                            {total} transaction{total !== 1 ? 's' : ''}
                            {debouncedSearch && <span> matching <strong>"{debouncedSearch}"</strong></span>}
                        </p>
                    )}

                    {loading && transactions.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-2">📭</div>
                            <p className="text-sm text-gray-400">
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
                                        className="w-full flex items-center gap-4 p-3 sm:p-4 rounded-2xl transition-all text-left hover:scale-[1.01] active:scale-[0.99] bg-purple-50 border border-purple-100 hover:border-purple-200"
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                            isCredit ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-400'
                                        }`}>
                                            {isCredit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate text-gray-800">{tx.title}</p>
                                            <p className="text-xs mt-0.5 text-gray-400">
                                                {formatDate(tx.created_at)} · {formatTime(tx.created_at)}
                                                {tx.recipient_name ? ` · ${tx.recipient_name}` : ''}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-black ${isCredit ? 'text-emerald-500' : 'text-red-400'}`}>
                                                {formatAmount(tx.amount)}
                                            </p>
                                            {tx.balance_after !== null && (
                                                <p className="text-[10px] mt-0.5 text-gray-400">
                                                    Bal: {fmt(parseFloat(tx.balance_after))}
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
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Load more'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <TransactionDetailModal
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                transaction={selectedTx}
                juniorTheme={true}
            />
        </>
    );
};

export default JuniorHistory;
