import React from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

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
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    juniorTheme?: boolean;
}

const TransactionDetailModal: React.FC<Props> = ({ isOpen, onClose, transaction: tx, juniorTheme = false }) => {
    if (!isOpen || !tx) return null;

    const isCredit = tx.type === 'CREDIT';
    const amount = parseFloat(tx.amount);
    const fmt = (n: number) =>
        new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
    const formattedAmount = fmt(Math.abs(amount));
    const date = new Date(tx.created_at);
    const formattedDate = date.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    /* ── theme tokens ── */
    const modal    = juniorTheme ? 'bg-white border-purple-200'                              : 'border border-[var(--border)]';
    const modalBg  = juniorTheme ? {}                                                         : { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' };
    const closeBtn = juniorTheme ? 'bg-purple-100 text-purple-400 hover:bg-purple-200'       : '';
    const closeBtnStyle = juniorTheme ? {} : { color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' };
    const titleColor = juniorTheme ? 'text-gray-700'                                          : '';
    const titleStyle = juniorTheme ? {} : { color: 'var(--text-secondary)' };
    const rowBorder  = juniorTheme ? 'border-purple-100'                                      : '';
    const rowBorderStyle = juniorTheme ? {} : { borderBottom: '1px solid var(--border)' };
    const labelColor = juniorTheme ? 'text-purple-400'                                        : '';
    const labelStyle = juniorTheme ? {} : { color: 'var(--text-muted)' };
    const valueColor = juniorTheme ? 'text-gray-800'                                          : '';
    const valueStyle = juniorTheme ? {} : { color: 'var(--text-primary)' };
    const footerBtn  = juniorTheme ? 'bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100' : '';
    const footerBtnStyle = juniorTheme ? {} : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

    const Row = ({ label, value }: { label: string; value: string }) => (
        <div className={`flex justify-between items-start gap-4 py-3 border-b ${rowBorder}`} style={rowBorderStyle}>
            <span className={`text-xs font-bold uppercase tracking-widest shrink-0 ${labelColor}`} style={labelStyle}>{label}</span>
            <span className={`text-sm font-semibold text-right ${valueColor}`} style={valueStyle}>{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl border ${modal}`} style={modalBg}>
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${closeBtn}`}
                    style={closeBtnStyle}
                >
                    <X size={18} />
                </button>

                {/* Icon + amount */}
                <div className="flex flex-col items-center text-center mb-6 pt-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isCredit ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {isCredit
                            ? <ArrowDownLeft size={28} className="text-emerald-500" />
                            : <ArrowUpRight size={28} className="text-red-400" />}
                    </div>
                    <p className={`text-3xl font-black tracking-tight ${isCredit ? 'text-emerald-500' : 'text-red-400'}`}>
                        {isCredit ? '+' : '-'}{formattedAmount}
                    </p>
                    <p className={`text-sm mt-1 font-semibold ${titleColor}`} style={titleStyle}>{tx.title}</p>
                    <span className={`mt-2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCredit ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-400'
                    }`}>
                        {isCredit ? 'Money in' : 'Money out'}
                    </span>
                </div>

                {/* Details */}
                <div>
                    <Row label="Date" value={formattedDate} />
                    <Row label="Time" value={formattedTime} />
                    <Row label="Account" value={`****${tx.account_number.slice(-4)}`} />
                    {tx.balance_after !== null && (
                        <Row label="Balance after" value={fmt(parseFloat(tx.balance_after))} />
                    )}
                    {tx.recipient_name && <Row label="Recipient" value={tx.recipient_name} />}
                    {tx.recipient_account && (
                        <Row label="To account" value={tx.recipient_account.replace(/(.{4})/g, '$1 ').trim()} />
                    )}
                    {tx.routing_method && <Row label="Payment method" value={tx.routing_method} />}
                </div>

                <button
                    onClick={onClose}
                    className={`w-full mt-5 py-3 rounded-2xl font-bold text-sm transition-colors ${footerBtn}`}
                    style={footerBtnStyle}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
