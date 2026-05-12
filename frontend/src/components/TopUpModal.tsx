import React, { useState } from 'react';
import { X, Loader2, Plus, CreditCard } from 'lucide-react';
import api from '../api/axios';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    cardId: string | null;
    onSuccess: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, cardId, onSuccess }) => {
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleQuickAdd = (val: number) => {
        const current = parseFloat(amount) || 0;
        setAmount((current + val).toFixed(2));
    };

    const handleConfirm = async () => {
        setError('');
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) return;

        setLoading(true);
        try {
            await api.post('/cards/topup/', {
                card_id: cardId,
                amount: parsedAmount
            });
            setAmount('');
            onSuccess(); 
        } catch (err: any) {
            console.error("Topup failed", err);
            setError(err.response?.data?.error || "Top up failed. Check account balance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#161B22] border border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00FF85]/10 flex items-center justify-center border border-[#00FF85]/20">
                            <CreditCard className="text-[#00FF85]" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Top Up Card</h2>
                            <p className="text-gray-500 text-xs mt-0.5">Transfer from main balance</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                        {error}
                    </div>
                )}

                <div className="mb-8">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Amount</label>
                    <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold text-[#00FF85]">£</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 pl-14 text-4xl font-bold text-white focus:outline-none focus:border-[#00FF85]/50 transition-all placeholder:text-gray-700/40"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Quick Add</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[10, 50, 100].map(val => (
                            <button key={val} onClick={() => handleQuickAdd(val)} className="bg-[#1F262E] hover:bg-[#2a343f] text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 border border-gray-800">
                                +£{val}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className={`w-full py-5 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center active:scale-[0.98] ${(loading || !amount || parseFloat(amount) <= 0) ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#00FF85] text-black shadow-[0_0_20px_rgba(0,255,133,0.2)] hover:shadow-[0_0_30px_rgba(0,255,133,0.4)] hover:bg-[#00e074]'}`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm Top Up'}
                </button>
            </div>
        </div>
    );
};

export default TopUpModal;