import React, { useState } from 'react';
import { X, User, Calendar, ShieldCheck, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

interface AddJuniorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddJuniorModal: React.FC<AddJuniorModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // 1. Sprawdzenie czy pola nie są puste
        if (!firstName.trim() || !lastName.trim() || !dob) {
            setError("All fields are required.");
            return;
        }

        // 2. Walidacja Imienia i Nazwiska (min. 2 znaki, tylko litery)
        const nameRegex = /^[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ\s-]+$/;
        if (firstName.trim().length < 2 || lastName.trim().length < 2) {
            setError("First and last name must be at least 2 characters long.");
            return;
        }
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            setError("Names can only contain letters, spaces, or hyphens.");
            return;
        }

        // 3. Walidacja Wieku (7-13 lat)
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 7 || age > 13) {
            setError("Junior account is strictly for children between 7 and 13 years old.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/accounts/junior/', { 
                first_name: firstName.trim(), 
                last_name: lastName.trim(), 
                date_of_birth: dob 
            });
            
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
                setIsSuccess(false);
                setFirstName('');
                setLastName('');
                setDob('');
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error("Failed to create junior account", err);
            // Wyświetlenie błędu z backendu (jeśli jakiś cwaniak oszuka frontend)
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to create account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#161B22] border border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">

                {isSuccess && (
                    <div className="absolute inset-0 bg-[#161B22] z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <CheckCircle2 size={64} className="text-[#00FF85] mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold text-white text-center">
                            Junior Account<br />Created Successfully!
                        </h3>
                    </div>
                )}

                <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                                Add Junior Account
                            </h2>
                            <p className="text-gray-500 text-xs mt-1">
                                Create a secure sub-account for your child.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleConfirm}>
                    <div className="space-y-5 mb-8">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">
                                First Name
                            </label>
                            <div className="relative group">
                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl py-4 pr-5 pl-12 text-white font-medium focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">
                                Last Name
                            </label>
                            <div className="relative group">
                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl py-4 pr-5 pl-12 text-white font-medium focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">
                                Date of Birth
                            </label>
                            <div className="relative group">
                                <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-2xl py-4 pr-5 pl-12 text-gray-300 font-medium focus:outline-none focus:border-purple-500/50 transition-all [&::-webkit-calendar-picker-indicator]:hidden"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 flex gap-4 items-start">
                        <div className="text-purple-400 mt-0.5">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-purple-400 font-bold text-sm mb-1">
                                Safe & Secure
                            </h4>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                A default spending limit of <span className="text-white font-bold">£50 on card</span> will be applied automatically. You can change it later.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full py-5 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]
                            ${loading
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
                                : 'bg-[#00FF85] text-black shadow-[0_0_20px_rgba(0,255,133,0.2)] hover:shadow-[0_0_30px_rgba(0,255,133,0.4)] hover:bg-[#00e074]'}
                        `}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                Create Junior Account
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddJuniorModal;