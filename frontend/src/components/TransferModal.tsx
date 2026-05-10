import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Send, CheckCircle2, Globe, Zap } from 'lucide-react';
import api from '../api/axios';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: any[];
    onSuccess: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, accounts, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'EXTERNAL' | 'OWN'>('EXTERNAL');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [fromAccountId, setFromAccountId] = useState('');
    const [amount, setAmount] = useState('');
    
    // Pola "External Transfer"
    const [recipientName, setRecipientName] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [title, setTitle] = useState('');
    const [routingMethod, setRoutingMethod] = useState('FPS'); 

    // Pola "Own Transfer"
    const [toAccountId, setToAccountId] = useState('');

    const formatBalance = (val: string) => {
        return parseFloat(val).toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const availableFromAccounts = activeTab === 'EXTERNAL' 
        ? accounts.filter(acc => acc.account_type === 'CURRENT')
        : accounts;

    const cleanIban = recipientAccount.replace(/\s+/g, '').toUpperCase();
    const isInternational = cleanIban.length >= 2 && !cleanIban.startsWith('GB');

    useEffect(() => {
        if (isInternational) {
            setRoutingMethod('SWIFT');
        } else if (routingMethod === 'SWIFT') {
            setRoutingMethod('FPS');
        }
    }, [isInternational]);

    useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setAmount('');
            setRecipientName('');
            setRecipientAccount('');
            setSwiftCode('');
            setTitle('');
            setRoutingMethod('FPS');
            
            if (availableFromAccounts.length > 0) {
                setFromAccountId(availableFromAccounts[0].id);
            } else {
                setFromAccountId('');
            }
        }
    }, [isOpen, activeTab, accounts]);

    if (!isOpen) return null;

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fromAccountId) return;

        setLoading(true);
        try {
            const endpoint = activeTab === 'OWN' ? '/transfers/own/' : '/transfers/national/';
            
            const payload = activeTab === 'OWN' 
                ? { 
                    from_account: fromAccountId, 
                    to_account: toAccountId, 
                    amount: parseFloat(amount) 
                  }
                : { 
                    from_account: fromAccountId, 
                    recipient_name: recipientName,
                    recipient_account: cleanIban,
                    routing_method: routingMethod,
                    swift_bic: isInternational ? swiftCode.trim() : null,
                    amount: parseFloat(amount), 
                    title
                  };

            await api.post(endpoint, payload);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Transfer failed:", error);
            alert("Transfer failed. Please check your balance and details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-[#161B22] border border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1c222a] shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Send className="text-[#00FF85]" size={24} />
                        New Transfer
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex p-1.5 bg-[#0B0E14] mx-6 mt-6 rounded-2xl border border-gray-800 shrink-0">
                    <button 
                        onClick={() => setActiveTab('EXTERNAL')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'EXTERNAL' ? 'bg-[#161B22] text-[#00FF85] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        External Transfer
                    </button>
                    <button 
                        onClick={() => setActiveTab('OWN')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'OWN' ? 'bg-[#161B22] text-[#00FF85] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Own Transfer
                    </button>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 flex-1">
                        <div className="w-20 h-20 bg-[#00FF85]/10 rounded-full flex items-center justify-center border border-[#00FF85]/20">
                            <CheckCircle2 size={40} className="text-[#00FF85]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Transfer Sent!</h3>
                        <p className="text-gray-500 font-medium">Your request is being processed.</p>
                    </div>
                ) : (
                    <form onSubmit={handleTransfer} className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
                        
                        {/* FROM ACCOUNT */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1">From Account</label>
                            <select 
                                value={fromAccountId}
                                onChange={(e) => setFromAccountId(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00FF85] outline-none appearance-none"
                                required
                            >
                                {availableFromAccounts.length > 0 ? (
                                    availableFromAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.account_type} · £{formatBalance(acc.balance)}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No eligible accounts available</option>
                                )}
                            </select>
                        </div>

                        {activeTab === 'EXTERNAL' ? (
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1">Recipient Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Full Name / Company"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#00FF85] outline-none transition-colors"
                                        required
                                    />
                                </div>
                                
                                {/* IBAN INPUT */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1 flex justify-between">
                                        <span>Account Number (IBAN)</span>
                                        {cleanIban.length >= 2 && (
                                            isInternational 
                                            ? <span className="text-blue-400 font-bold flex items-center gap-1"><Globe size={12}/> International</span>
                                            : <span className="text-emerald-400 font-bold flex items-center gap-1"><Zap size={12}/> UK Domestic</span>
                                        )}
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="GB89 LYOB 0000..."
                                        value={recipientAccount}
                                        onChange={(e) => setRecipientAccount(e.target.value)}
                                        className={`w-full bg-[#0B0E14] border rounded-xl px-4 py-3 text-white font-mono outline-none transition-colors ${isInternational ? 'border-blue-500/50 focus:border-blue-500' : 'border-gray-700 focus:border-[#00FF85]'}`}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1">Transfer Network</label>
                                        <select 
                                            value={routingMethod}
                                            onChange={(e) => setRoutingMethod(e.target.value)}
                                            disabled={isInternational}
                                            className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00FF85] outline-none appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isInternational ? (
                                                <option value="SWIFT">SWIFT Network</option>
                                            ) : (
                                                <>
                                                    <option value="FPS">Faster Payments (Instant)</option>
                                                    <option value="BACS">BACS (2-3 days)</option>
                                                    <option value="CHAPS">CHAPS (Same day - £20)</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    
                                    {isInternational && (
                                        <div className="animate-fadeIn">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 block px-1">
                                                BIC / SWIFT Code
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder="Bank Code"
                                                value={swiftCode}
                                                onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                                                className="w-full bg-[#0B0E14] border border-blue-500/50 rounded-xl px-4 py-3 text-white font-mono uppercase focus:border-blue-500 outline-none transition-colors"
                                                required={isInternational}
                                            />
                                        </div>
                                    )}

                                    <div className={!isInternational ? 'col-span-1' : 'col-span-1 md:col-span-2'}>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">£</span>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:border-[#00FF85] outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1">Title</label>
                                    <input 
                                        type="text"
                                        placeholder="Transfer title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#00FF85] outline-none transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            /* OWN TRANSFER UI */
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1">To Account</label>
                                    <select 
                                        value={toAccountId}
                                        onChange={(e) => setToAccountId(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00FF85] outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Select target account</option>
                                        {accounts.filter(acc => acc.id !== fromAccountId).map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.account_type} ({acc.owner_first_name || 'Main'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block px-1">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">£</span>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:border-[#00FF85] outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading || !amount || !fromAccountId}
                            className="w-full bg-[#00FF85] hover:bg-[#00e074] disabled:opacity-50 disabled:hover:bg-[#00FF85] text-black font-black py-4 rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,255,133,0.15)] mt-4 uppercase tracking-widest text-xs shrink-0"
                        >
                            {loading ? 'Processing...' : 'Confirm Transfer'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TransferModal;