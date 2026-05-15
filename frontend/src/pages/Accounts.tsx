import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom'; // DODANO useLocation
import api from '../api/axios';
import ConfirmActionModal from '../components/ConfirmActionModal';
import CardDetailsModal from '../components/CardDetailsModal';
import CardManager from '../components/CardManager';
import TopUpModal from '../components/TopUpModal';

interface ContextType {
    firstName: string;
    lastName: string;
}

const Accounts = () => {
    const context = useOutletContext<ContextType>();
    const firstName = context?.firstName || '';
    const lastName = context?.lastName || '';
    
    const location = useLocation(); 

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    const [activeTab, setActiveTab] = useState<'VIRTUAL' | 'PHYSICAL' | 'PREPAID'>('VIRTUAL');
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    const [txLimit, setTxLimit] = useState('');
    const [dailyLimit, setDailyLimit] = useState('');
    const [blikTxLimit, setBlikTxLimit] = useState('');
    const [blikDailyLimit, setBlikDailyLimit] = useState('');
    const [isSavingLimits, setIsSavingLimits] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false); 

    
    const refreshData = async () => {
        try {
            const accountsRes = await api.get('/accounts/');
            const fetchedAccounts = accountsRes.data;
            setAccounts(fetchedAccounts);

            if (selectedAccount) {
                const updatedAccount = fetchedAccounts.find((a: any) => a.id === selectedAccount.id);
                if (updatedAccount) setSelectedAccount(updatedAccount);
            }
        } catch (err) {
            console.error("Błąd odświeżania:", err);
        }
    };

    
    useEffect(() => {
        const initData = async () => {
            try {
                const accountsRes = await api.get('/accounts/');
                if (accountsRes.data.length > 0) {
                    setAccounts(accountsRes.data);
                }
            } catch (err) {
                console.error("Błąd ładowania:", err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    
    useEffect(() => {
        if (accounts.length > 0) {
            
            if (location.state?.selectedAccountId) {
                const preselectedAccount = accounts.find(a => a.id === location.state.selectedAccountId);
                setSelectedAccount(preselectedAccount || accounts[0]);
            } 
            
            else if (!selectedAccount) {
                setSelectedAccount(accounts[0]);
            }
        }
    }, [accounts, location.state]);

    
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

    const formatCurrency = (amount: string, currency: string = 'GBP') => {
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency }).format(parseFloat(amount));
    };

    const handleSaveLimits = async (channel: 'CARD' | 'BLIK') => {
        setIsSavingLimits(true);
        try {
            const payload = channel === 'CARD'
                ? { account_id: selectedAccount.id, channel: 'CARD', per_transaction_limit: txLimit, daily_limit: dailyLimit }
                : { account_id: selectedAccount.id, channel: 'BLIK', per_transaction_limit: blikTxLimit, daily_limit: blikDailyLimit };

            await api.patch('/accounts/limits/', payload);
            await refreshData();
        } catch (error) { console.error(error); }
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]"></div>
            </div>
        );
    }

    return (
        
        <>
            <div className="flex-1 p-4 sm:p-5 md:p-6 text-[var(--text-primary)] flex flex-col lg:flex-row gap-5 md:gap-6 w-full">
                
                {/* LEWA KOLUMNA: LISTA KONT */}
                <div className="flex w-full lg:w-64 shrink-0 flex-col gap-2">
                    <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 px-1">My Accounts</h2>
                    <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                        {accounts.map((acc) => {
                            const isJunior = acc.account_type === 'JUNIOR';
                            const isSelected = selectedAccount?.id === acc.id;
                            return (
                                <button key={acc.id} onClick={() => setSelectedAccount(acc)} 
                                    className={`flex items-center gap-3 shrink-0 lg:shrink w-[220px] lg:w-full p-2.5 rounded-xl transition-all border 
                                    ${isSelected ? (isJunior ? 'bg-purple-500/10 border-purple-500/50' : 'bg-emerald-500/10 border-emerald-500/30') : 'bg-[var(--bg-surface)] lg:bg-transparent hover:bg-[var(--bg-elevated)] border-[var(--border)] lg:border-transparent'}`}>
                                    
                                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${isSelected ? (isJunior ? 'bg-purple-500 text-white' : 'bg-[#00FF85] text-black') : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{isJunior ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}</svg>
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

                {/* SZCZEGÓŁY KONTA I KARTY */}
                <div className="flex-1 flex flex-col h-full pr-2 pb-6 w-full">
                    {selectedAccount ? (
                        <div className="flex flex-col h-full animate-fadeIn max-w-6xl w-full mx-auto lg:mx-0">
                            
                            {/* NAGŁÓWEK KONTA */}
                            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 mb-4 md:mb-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-6 shadow-lg w-full">
                                
                                <div className="w-full flex-1 min-w-0">
                                    <h2 className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                                        {selectedAccount.account_type === 'JUNIOR' ? `${selectedAccount.owner_first_name}'s Account` : `${firstName}'s Account`}
                                    </h2>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-[var(--text-primary)] break-words w-full">
                                        {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                                    </h1>
                                </div>
                                
                                <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 w-full xl:w-[400px] shrink-0">
                                    <div className="space-y-2.5 w-full">
                                        <div className="flex justify-between items-center gap-4 border-b border-[var(--border)]/50 pb-2">
                                            <span className="text-[var(--text-muted)] font-bold text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap">Account Holder</span>
                                            <span className="font-bold text-[var(--text-secondary)] text-xs sm:text-sm text-right truncate">
                                                {selectedAccount.account_type === 'JUNIOR' ? `${selectedAccount.owner_first_name} ${selectedAccount.owner_last_name}` : `${firstName} ${lastName}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 border-b border-[var(--border)]/50 pb-2">
                                            <span className="text-[var(--text-muted)] font-bold text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap">Sort Code</span>
                                            <span className="font-mono text-[var(--text-secondary)] text-xs sm:text-sm text-right">{selectedAccount.sort_code?.match(/.{1,2}/g)?.join('-') || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 border-b border-[var(--border)]/50 pb-2">
                                            <span className="text-[var(--text-muted)] font-bold text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap">Account Number</span>
                                            <span className="font-mono text-[var(--text-secondary)] text-xs sm:text-sm text-right">{selectedAccount.account_number || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-4 pt-0.5">
                                            <span className="text-[var(--text-muted)] font-bold text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap">IBAN</span>
                                            <span className="font-mono text-[9px] sm:text-[10px] text-[var(--text-muted)] sm:text-right break-all">
                                                {selectedAccount.iban?.match(/.{1,4}/g)?.join(' ') || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CARD MANAGER COMPONENT */}
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
                        <div className="text-center p-20 text-gray-600">No account selected.</div>
                    )}
                </div>
            </div>

            <ConfirmActionModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteCard} loading={isDeleting} title="Delete Card" message="Are you sure you want to permanently delete this card?" />
            <CardDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} card={selectedAccount?.cards?.find((c: any) => c.id === activeCardId)} />

            <TopUpModal 
                isOpen={isTopUpModalOpen} 
                onClose={() => setIsTopUpModalOpen(false)} 
                cardId={activeCardId}
                onSuccess={() => {
                    setIsTopUpModalOpen(false);
                    refreshData(); 
                }} 
            />
        </>
    );
};
    
        
export default Accounts;