import React, { useState, useEffect, useCallback } from 'react';
import { Send, Trash2, UserPlus, ChevronRight, Globe, Zap, Clock, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
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

interface JuniorApproval {
    id: number;
    junior_name: string;
    from_account: string;
    recipient_name: string;
    recipient_account: string;
    amount: string;
    title: string;
    routing_method: string;
    created_at: string;
}

const methodLabel: Record<string, string> = {
    FPS: 'Faster Payments',
    BACS: 'BACS',
    CHAPS: 'CHAPS',
    SWIFT: 'SWIFT',
    INTERNAL: 'Internal',
};

const methodColor: Record<string, string> = {
    FPS: 'bg-emerald-500/20 text-emerald-400',
    BACS: 'bg-blue-500/20 text-blue-400',
    CHAPS: 'bg-amber-500/20 text-amber-400',
    SWIFT: 'bg-purple-500/20 text-purple-400',
    INTERNAL: 'bg-gray-500/20 text-gray-400',
};

const statusColor: Record<string, string> = {
    COMPLETED: 'text-emerald-400',
    PENDING: 'text-amber-400',
    FAILED: 'text-red-400',
};

const Payments: React.FC = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [approvals, setApprovals] = useState<JuniorApproval[]>([]);
    const [decidingId, setDecidingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);

    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [prefilled, setPrefilled] = useState<{ recipientName: string; recipientAccount: string; routingMethod: string } | null>(null);

    // Add recipient form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAccount, setNewAccount] = useState('');
    const [newMethod, setNewMethod] = useState('FPS');
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const fetchAll = useCallback(async (resetPage = true) => {
        try {
            const [accRes, recRes, txRes, aprRes] = await Promise.all([
                api.get('/accounts/'),
                api.get('/recipients/'),
                api.get('/transfers/', { params: { page: resetPage ? 1 : page } }),
                api.get('/junior/approvals/').catch(() => ({ data: [] })),
            ]);
            setAccounts(accRes.data);
            setRecipients(recRes.data);
            setApprovals(aprRes.data);
            if (resetPage) {
                setTransfers(txRes.data.results);
                setPage(1);
            } else {
                setTransfers(prev => [...prev, ...txRes.data.results]);
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

    const handleDecide = async (id: number, action: 'approve' | 'reject') => {
        setDecidingId(id);
        try {
            await api.post(`/junior/approvals/${id}/decide/`, { action });
            setApprovals(prev => prev.filter(a => a.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setDecidingId(null);
        }
    };

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const formatIban = (iban: string) => iban.replace(/(.{4})/g, '$1 ').trim();

    if (loading) return (
        <div className="flex-1 h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]" />
        </div>
    );

    return (
        <>
            <div className="p-4 sm:p-6 md:p-10 w-full animate-fadeIn">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Page header */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Payments</h1>
                        <button
                            onClick={openFresh}
                            className="flex items-center gap-2 bg-[#00FF85] hover:bg-[#00e074] text-black font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
                        >
                            <Send size={16} /> Send money
                        </button>
                    </div>

                    {/* ── Junior approval panel (parents only) ── */}
                    {approvals.length > 0 && (
                        <section className="rounded-3xl p-5 sm:p-6 border-2 border-amber-500/30" style={{ backgroundColor: 'var(--bg-surface)' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldAlert size={16} className="text-amber-400 shrink-0" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                    Pending Junior Approvals ({approvals.length})
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {approvals.map(a => (
                                    <div
                                        key={a.id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl"
                                        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                                    >
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {a.junior_name}
                                                </p>
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                                    {methodLabel[a.routing_method] || a.routing_method}
                                                </span>
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {a.title} → {a.recipient_name}
                                            </p>
                                            <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                {a.recipient_account.replace(/(.{4})/g, '$1 ').trim()}
                                            </p>
                                        </div>

                                        {/* Amount + buttons */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <p className="text-sm font-black text-amber-400">
                                                £{parseFloat(a.amount).toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() => handleDecide(a.id, 'approve')}
                                                disabled={decidingId === a.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle2 size={14} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleDecide(a.id, 'reject')}
                                                disabled={decidingId === a.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                            >
                                                <XCircle size={14} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Saved recipients */}
                    <section className="rounded-3xl p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Saved Recipients</h2>
                            <button
                                onClick={() => setShowAddForm(v => !v)}
                                className="flex items-center gap-1.5 text-xs font-bold transition-colors"
                                style={{ color: showAddForm ? '#00FF85' : 'var(--text-muted)' }}
                            >
                                <UserPlus size={14} /> {showAddForm ? 'Cancel' : 'Add new'}
                            </button>
                        </div>

                        {/* Add form */}
                        {showAddForm && (
                            <form onSubmit={handleAddRecipient} className="mb-4 p-4 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Recipient name"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                                        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    />
                                    <input
                                        required
                                        type="text"
                                        placeholder="IBAN / Account number"
                                        value={newAccount}
                                        onChange={e => setNewAccount(e.target.value)}
                                        className="px-3 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                                        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    />
                                    <select
                                        value={newMethod}
                                        onChange={e => setNewMethod(e.target.value)}
                                        className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF85]/50"
                                        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="FPS">Faster Payments</option>
                                        <option value="BACS">BACS</option>
                                        <option value="CHAPS">CHAPS</option>
                                        <option value="SWIFT">SWIFT</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={addLoading}
                                        className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#00FF85] hover:bg-[#00e074] text-black transition-colors disabled:opacity-50"
                                    >
                                        {addLoading ? 'Saving...' : 'Save recipient'}
                                    </button>
                                </div>
                                {addError && <p className="text-xs text-red-400">{addError}</p>}
                            </form>
                        )}

                        {/* Recipients list */}
                        {recipients.length === 0 ? (
                            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No saved recipients yet.</p>
                        ) : (
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                {recipients.map(r => {
                                    const isIntl = !r.account.startsWith('GB');
                                    return (
                                        <div
                                            key={r.id}
                                            className="flex-shrink-0 flex flex-col gap-2 p-3 rounded-2xl w-44 group relative"
                                            style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIntl ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {isIntl ? <Globe size={15} /> : <Zap size={15} />}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteRecipient(r.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                                                <p className="text-[10px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>****{r.account.slice(-4)}</p>
                                            </div>
                                            <button
                                                onClick={() => openWithRecipient(r)}
                                                className="flex items-center justify-center gap-1 w-full py-1.5 rounded-xl text-[10px] font-bold transition-colors bg-[#00FF85]/10 text-[#00FF85] hover:bg-[#00FF85]/20"
                                            >
                                                Send <ChevronRight size={11} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Transfer history */}
                    <section className="rounded-3xl p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)' }}>Transfer History</h2>

                        {transfers.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transfers yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {transfers.map(t => (
                                    <div
                                        key={t.id}
                                        className="flex items-center gap-4 p-3 sm:p-4 rounded-2xl"
                                        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
                                    >
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-400">
                                            <Send size={15} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                                    {t.recipient_name}
                                                </p>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${methodColor[t.routing_method] || 'bg-gray-500/20 text-gray-400'}`}>
                                                    {methodLabel[t.routing_method] || t.routing_method}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                {t.title} · {formatDate(t.created_at)} {formatTime(t.created_at)}
                                            </p>
                                            {t.routing_method !== 'INTERNAL' && (
                                                <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                    {formatIban(t.recipient_account)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-red-400">
                                                -{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(parseFloat(t.amount))}
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
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                                    style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </section>

                </div>
            </div>

            <TransferModal
                isOpen={isTransferOpen}
                onClose={() => { setIsTransferOpen(false); setPrefilled(null); }}
                accounts={accounts}
                onSuccess={() => { setIsTransferOpen(false); setPrefilled(null); fetchAll(true); }}
                prefilled={prefilled}
            />
        </>
    );
};

export default Payments;
