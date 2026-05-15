import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import ConfirmActionModal from '../components/ConfirmActionModal';
import CardDetailsModal from '../components/CardDetailsModal';
import CardManager from '../components/CardManager';
import TopUpModal from '../components/TopUpModal';

interface ContextType {
    firstName: string;
}

const Cards = () => {
    const context = useOutletContext<ContextType>();
    const firstName = context?.firstName || '';

    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<'VIRTUAL' | 'PHYSICAL' | 'PREPAID'>('VIRTUAL');
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    const [txLimit, setTxLimit] = useState('');
    const [dailyLimit, setDailyLimit] = useState('');
    const [blikTxLimit, setBlikTxLimit] = useState('');
    const [blikDailyLimit, setBlikDailyLimit] = useState('');
    const [isSavingLimits, setIsSavingLimits] = useState(false);

    const refreshData = async () => {
        try {
            const res = await api.get('/accounts/');
            const fetched = res.data;
            setAccounts(fetched);
            if (selectedAccount) {
                const updated = fetched.find((a: any) => a.id === selectedAccount.id);
                if (updated) setSelectedAccount(updated);
            }
        } catch (err) {
            console.error('Refresh error:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/accounts/');
                setAccounts(res.data);
                if (res.data.length > 0) setSelectedAccount(res.data[0]);
            } catch (err) {
                console.error('Load error:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!selectedAccount) return;

        setTxLimit(selectedAccount.limits?.CARD?.per_transaction_limit || '0.00');
        setDailyLimit(selectedAccount.limits?.CARD?.daily_limit || '0.00');
        setBlikTxLimit(selectedAccount.limits?.BLIK?.per_transaction_limit || '0.00');
        setBlikDailyLimit(selectedAccount.limits?.BLIK?.daily_limit || '0.00');

        if (selectedAccount.account_type === 'JUNIOR') {
            setActiveTab('PREPAID');
        } else if (activeTab === 'PREPAID') {
            setActiveTab('VIRTUAL');
        }
    }, [selectedAccount?.id]);

    const handleSaveLimits = async (channel: 'CARD' | 'BLIK') => {
        setIsSavingLimits(true);
        try {
            const payload = channel === 'CARD'
                ? { account_id: selectedAccount.id, channel: 'CARD', per_transaction_limit: txLimit, daily_limit: dailyLimit }
                : { account_id: selectedAccount.id, channel: 'BLIK', per_transaction_limit: blikTxLimit, daily_limit: blikDailyLimit };
            await api.patch('/accounts/limits/', payload);
            await refreshData();
        } catch (err) { console.error(err); }
        finally { setIsSavingLimits(false); }
    };

    const handleToggleFreeze = async () => {
        if (!activeCardId) return;
        const card = selectedAccount?.cards?.find((c: any) => c.id === activeCardId);
        const newStatus = card.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
        try {
            await api.patch('/cards/manage/', { card_id: activeCardId, status: newStatus });
            await refreshData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteCard = async () => {
        if (!activeCardId) return;
        setIsDeleting(true);
        try {
            await api.delete('/cards/manage/', { data: { card_id: activeCardId } });
            setIsDeleteModalOpen(false);
            await refreshData();
        } catch (err) { console.error(err); }
        finally { setIsDeleting(false); }
    };

    const handleIssueCard = async () => {
        try {
            await api.post('/cards/create/', { account_id: selectedAccount.id, card_type: activeTab });
            await refreshData();
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return (
            <div className="flex-1 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]" />
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 p-4 sm:p-5 md:p-6 text-[var(--text-primary)] flex flex-col lg:flex-row gap-5 md:gap-6 w-full">

                {/* LEFT COLUMN: account selector */}
                <div className="flex w-full lg:w-64 shrink-0 flex-col gap-2">
                    <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 px-1">Select Account</h2>
                    <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                        {accounts.map((acc) => {
                            const isJunior = acc.account_type === 'JUNIOR';
                            const isSelected = selectedAccount?.id === acc.id;
                            return (
                                <button
                                    key={acc.id}
                                    onClick={() => { setSelectedAccount(acc); setActiveCardId(null); }}
                                    className={`flex items-center gap-3 shrink-0 lg:shrink w-[220px] lg:w-full p-2.5 rounded-xl transition-all border
                                    ${isSelected
                                        ? (isJunior ? 'bg-purple-500/10 border-purple-500/50' : 'bg-emerald-500/10 border-emerald-500/30')
                                        : 'bg-[var(--bg-surface)] lg:bg-transparent hover:bg-[var(--bg-elevated)] border-[var(--border)] lg:border-transparent'}`}
                                >
                                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${isSelected ? (isJunior ? 'bg-purple-500 text-white' : 'bg-[#00FF85] text-black') : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {isJunior
                                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
                                        </svg>
                                    </div>
                                    <div className="text-left flex-1 overflow-hidden flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold truncate">
                                            {isJunior ? acc.owner_first_name : firstName}
                                        </span>
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 border ${
                                            isJunior
                                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                            {isJunior ? 'Junior' : 'Current'}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: CardManager */}
                <div className="flex-1 flex flex-col h-full pr-2 pb-6 w-full">
                    {selectedAccount ? (
                        <div className="animate-fadeIn w-full">
                            <CardManager
                                selectedAccount={selectedAccount}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                activeCardId={activeCardId}
                                setActiveCardId={setActiveCardId}
                                cardsInTab={selectedAccount.cards?.filter((c: any) => c.card_type === activeTab) || []}
                                onIssueCard={handleIssueCard}
                                onFreeze={handleToggleFreeze}
                                onDelete={() => setIsDeleteModalOpen(true)}
                                onDetails={() => setIsDetailsModalOpen(true)}
                                txLimit={txLimit}
                                dailyLimit={dailyLimit}
                                blikTxLimit={blikTxLimit}
                                blikDailyLimit={blikDailyLimit}
                                setTxLimit={setTxLimit}
                                setDailyLimit={setDailyLimit}
                                setBlikTxLimit={setBlikTxLimit}
                                setBlikDailyLimit={setBlikDailyLimit}
                                onSaveLimits={handleSaveLimits}
                                isSavingLimits={isSavingLimits}
                                onTopUpClick={() => setIsTopUpModalOpen(true)}
                            />
                        </div>
                    ) : (
                        <div className="text-center p-20" style={{ color: 'var(--text-muted)' }}>No account selected.</div>
                    )}
                </div>
            </div>

            <ConfirmActionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCard}
                loading={isDeleting}
                title="Delete Card"
                message="Are you sure you want to permanently delete this card?"
            />
            <CardDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                card={selectedAccount?.cards?.find((c: any) => c.id === activeCardId)}
            />
            <TopUpModal
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
                cardId={activeCardId}
                onSuccess={() => { setIsTopUpModalOpen(false); refreshData(); }}
            />
        </>
    );
};

export default Cards;
