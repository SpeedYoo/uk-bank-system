import React, { useState, useEffect, useCallback } from 'react';
import { Send, Trash2, UserPlus, ChevronRight, Globe, Zap, Clock } from 'lucide-react';
import api from '../api/axios';
import TransferModal from '../components/TransferModal';

interface Transfer {
    id: number;
    recipient_name: string;
    recipient_account: string;
    from_account_number: string;
    amount: string;
    title: string;
    routing_method: string;
    status: string;
    created_at: string;
}

interface Recipient {
    id: number;
    name: string;
    account: string;
    routing_method: string;
}

const methodLabel: Record<string, string> = {
    FPS: 'Faster Payments',
    BACS: 'BACS',
    CHAPS: 'CHAPS',
    SWIFT: 'SWIFT',
    INTERNAL: 'Internal',
};

const statusColor: Record<string, string> = {
    COMPLETED: 'text-emerald-600',
    PENDING: 'text-amber-500',
    FAILED: 'text-red-500',
};

const JuniorPayments: React.FC = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);

    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [prefilled, setPrefilled] = useState<{ recipientName: string; recipientAccount: string; routingMethod: string } | null>(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAccount, setNewAccount] = useState('');
    const [newMethod, setNewMethod] = useState('FPS');
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const fetchAll = useCallback(async (resetPage = true) => {
        try {
            const [accRes, recRes, txRes] = await Promise.all([
                api.get('/accounts/'),
                api.get('/recipients/'),
                api.get('/transfers/', { params: { page: resetPage ? 1 : page } }),
            ]);
            setAccounts(accRes.data);
            setRecipients(recRes.data);
            if (resetPage) {
                setTransfers(txRes.data.results ?? []);
                setPage(1);
            } else {
                setTransfers(prev => [...prev, ...(txRes.data.results ?? [])]);
            }
            setHasMore(!!txRes.data.next);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchAll(true); }, []);

    const handleDeleteRecipient = async (id: number) => {
        try {
            await api.delete(`/recipients/${id}/`);
            setRecipients(prev => prev.filter(r => r.id !== id));
        } catch (err) { console.error(err); }
    };

    const handleAddRecipient = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');
        setAddLoading(true);
        try {
            const res = await api.post('/recipients/', {
                name: newName,
                account: newAccount.replace(/\s/g, '').toUpperCase(),
                routing_method: newMethod,
            });
            setRecipients(prev => [res.data, ...prev]);
            setNewName(''); setNewAccount(''); setNewMethod('FPS');
            setShowAddForm(false);
        } catch (err: any) {
            setAddError(err.response?.data?.error || 'Failed to save recipient');
        } finally {
            setAddLoading(false);
        }
    };

    const openWithRecipient = (r: Recipient) => {
        setPrefilled({ recipientName: r.name, recipientAccount: r.account, routingMethod: r.routing_method });
        setIsTransferOpen(true);
    };

    const openFresh = () => {
        setPrefilled(null);
        setIsTransferOpen(true);
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fmt = (n: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <>
            <div className="space-y-6 animate-fadeIn pb-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-purple-800 tracking-tight">Payments</h1>
                        <p className="text-sm text-purple-400 font-medium mt-0.5">Send money & manage recipients</p>
                    </div>
                    <button
                        onClick={openFresh}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-purple-200 transition-all hover:shadow-purple-300 text-sm"
                    >
                        <Send size={15} /> Send money
                    </button>
                </div>

                {/* Saved recipients */}
                <div className="bg-white rounded-[1.5rem] border-2 border-purple-100 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-purple-400">Saved Recipients</h2>
                        <button
                            onClick={() => setShowAddForm(v => !v)}
                            className="flex items-center gap-1.5 text-xs font-bold transition-colors text-purple-400 hover:text-purple-600"
                        >
                            <UserPlus size={14} /> {showAddForm ? 'Cancel' : 'Add new'}
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddRecipient} className="mb-4 p-4 rounded-2xl space-y-3 bg-purple-50 border border-purple-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    required
                                    type="text"
                                    placeholder="Recipient name"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="px-3 py-2.5 rounded-xl text-sm border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="IBAN / Account number"
                                    value={newAccount}
                                    onChange={e => setNewAccount(e.target.value)}
                                    className="px-3 py-2.5 rounded-xl text-sm font-mono border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
                                />
                                <select
                                    value={newMethod}
                                    onChange={e => setNewMethod(e.target.value)}
                                    className="px-3 py-2.5 rounded-xl text-sm border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
                                >
                                    <option value="FPS">Faster Payments</option>
                                    <option value="BACS">BACS</option>
                                    <option value="CHAPS">CHAPS</option>
                                    <option value="SWIFT">SWIFT</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={addLoading}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 shadow-sm"
                                >
                                    {addLoading ? 'Saving...' : 'Save recipient'}
                                </button>
                            </div>
                            {addError && <p className="text-xs text-red-500">{addError}</p>}
                        </form>
                    )}

                    {recipients.length === 0 ? (
                        <p className="text-sm text-center py-4 text-purple-300">No saved recipients yet.</p>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                            {recipients.map(r => {
                                const isIntl = !r.account.startsWith('GB');
                                return (
                                    <div
                                        key={r.id}
                                        className="flex-shrink-0 flex flex-col gap-2 p-3 rounded-2xl w-44 group relative bg-purple-50 border border-purple-100"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIntl ? 'bg-blue-100 text-blue-500' : 'bg-purple-100 text-purple-500'}`}>
                                                {isIntl ? <Globe size={15} /> : <Zap size={15} />}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRecipient(r.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-red-400 hover:bg-red-50"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold truncate text-gray-800">{r.name}</p>
                                            <p className="text-[10px] font-mono truncate text-gray-400">****{r.account.slice(-4)}</p>
                                        </div>
                                        <button
                                            onClick={() => openWithRecipient(r)}
                                            className="flex items-center justify-center gap-1 w-full py-1.5 rounded-xl text-[10px] font-bold bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                                        >
                                            Send <ChevronRight size={11} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Transfer history */}
                <div className="bg-white rounded-[1.5rem] border-2 border-purple-100 p-5 shadow-sm">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-5">Transfer History</h2>

                    {transfers.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-4xl mb-2">📭</div>
                            <p className="text-sm text-gray-400">No transfers yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transfers.map(t => (
                                <div
                                    key={t.id}
                                    className="flex items-center gap-4 p-3 sm:p-4 rounded-2xl bg-purple-50 border border-purple-100"
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-100 text-red-400">
                                        <Send size={15} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold truncate text-gray-800">{t.recipient_name}</p>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-500">
                                                {methodLabel[t.routing_method] || t.routing_method}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Clock size={10} className="text-gray-400" />
                                            <p className="text-xs text-gray-400">
                                                {t.title} · {formatDate(t.created_at)} {formatTime(t.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-red-500">
                                            -{fmt(parseFloat(t.amount))}
                                        </p>
                                        <p className={`text-[10px] font-bold uppercase mt-0.5 ${statusColor[t.status] || 'text-gray-400'}`}>
                                            {t.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => { setPage(p => p + 1); fetchAll(false); }}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
                            >
                                Load more
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <TransferModal
                isOpen={isTransferOpen}
                onClose={() => { setIsTransferOpen(false); setPrefilled(null); }}
                accounts={accounts}
                onSuccess={() => { setIsTransferOpen(false); setPrefilled(null); fetchAll(true); }}
                prefilled={prefilled}
                disableAccountTypeFilter={true}
            />
        </>
    );
};

export default JuniorPayments;
