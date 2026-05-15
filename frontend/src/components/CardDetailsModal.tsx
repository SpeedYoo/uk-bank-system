import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, ShieldCheck, CreditCard } from 'lucide-react';

interface Card {
    full_number: string;
    expiry_date: string;
    cvv: string;
    pin: string;
    cardholder_name: string;
    card_type: string;
}

interface CardDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card | null;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ isOpen, onClose, card }) => {
    const [showFullNumber, setShowFullNumber] = useState(false);
    const [showCVV, setShowCVV] = useState(false);
    const [showPIN, setShowPIN] = useState(false);

    if (!isOpen || !card) return null;

    const formatFullNumber = (num: string) => {
        if (!num) return "**** **** **** ****";
        return num.replace(/(.{4})/g, '$1 ').trim();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <ShieldCheck className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Security Details</h2>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{card.card_type} Card</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Card Number */}
                    <div className="bg-[var(--bg-base)] p-5 rounded-2xl border border-[var(--border)]">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Full Card Number</label>
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-lg text-[var(--text-primary)] tracking-wider">
                                {showFullNumber ? formatFullNumber(card.full_number) : "**** **** **** " + (card.full_number?.slice(-4) || "0000")}
                            </span>
                            <button onClick={() => setShowFullNumber(!showFullNumber)} className="text-purple-400 hover:text-purple-300 transition-colors">
                                {showFullNumber ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Expiry */}
                        <div className="bg-[var(--bg-base)] p-5 rounded-2xl border border-[var(--border)]">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">Expiry Date</label>
                            <span className="font-mono text-lg text-[var(--text-primary)]">{card.expiry_date}</span>
                        </div>
                        
                        {/* CVV */}
                        <div className="bg-[var(--bg-base)] p-5 rounded-2xl border border-[var(--border)]">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2">CVV Code</label>
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-lg text-[var(--text-primary)]">{showCVV ? card.cvv : "***"}</span>
                                <button onClick={() => setShowCVV(!showCVV)} className="text-purple-400 hover:text-purple-300">
                                    {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PIN Section - Specjalnie wyróżniona */}
                    <div className="bg-purple-500/5 p-6 rounded-2xl border border-purple-500/20 mt-2">
                        <div className="flex items-center gap-2 mb-3">
                            <Lock size={14} className="text-purple-400" />
                            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Card PIN</label>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-3xl text-[var(--text-primary)] tracking-[0.4em]">
                                {showPIN ? card.pin : "••••"}
                            </span>
                            <button 
                                onClick={() => setShowPIN(!showPIN)}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                            >
                                {showPIN ? "Hide PIN" : "Reveal PIN"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border)]/50">
                    <p className="text-gray-500 text-[10px] text-center leading-relaxed">
                        For security reasons, never share these details. <br/> 
                        Lyo Bank staff will never ask for your PIN or CVV.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CardDetailsModal;