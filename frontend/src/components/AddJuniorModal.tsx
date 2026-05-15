import React, { useState } from 'react';
import { X, User, Calendar, ShieldCheck, Loader2, CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

interface AddJuniorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddJuniorModal: React.FC<AddJuniorModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'info' | 'credentials' | 'done'>('info');

    // Step 1 fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');

    // Step 2 fields
    const [juniorCustomerId, setJuniorCustomerId] = useState<number | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleClose = () => {
        setStep('info');
        setFirstName(''); setLastName(''); setDob('');
        setEmail(''); setPassword('');
        setJuniorCustomerId(null);
        setError('');
        onClose();
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const nameRegex = /^[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ\s-]+$/;
        if (firstName.trim().length < 2 || lastName.trim().length < 2) {
            setError("First and last name must be at least 2 characters long.");
            return;
        }
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            setError("Names can only contain letters, spaces, or hyphens.");
            return;
        }

        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age < 7 || age > 13) {
            setError("Junior account is strictly for children between 7 and 13 years old.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/accounts/junior/', {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                date_of_birth: dob,
            });
            setJuniorCustomerId(res.data.customer_id);
            setStep('credentials');
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSetCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/junior/setup/', {
                customer_id: juniorCustomerId,
                email: email.trim(),
                password,
            });
            setStep('done');
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to set credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSkipCredentials = () => {
        onSuccess();
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">

                {step === 'done' && (
                    <div className="absolute inset-0 bg-[var(--bg-surface)] z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <CheckCircle2 size={64} className="text-[#00FF85] mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold text-[var(--text-primary)] text-center">
                            Junior Account Ready!
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm mt-2 text-center">
                            {firstName} can now log in independently.
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                                {step === 'info' ? 'Add Junior Account' : 'Set Login Credentials'}
                            </h2>
                            <p className="text-gray-500 text-xs mt-1">
                                {step === 'info'
                                    ? 'Step 1 of 2 — Child details'
                                    : `Step 2 of 2 — Login for ${firstName}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    <div className="h-1 flex-1 rounded-full bg-purple-500" />
                    <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'credentials' || step === 'done' ? 'bg-purple-500' : 'bg-gray-800'}`} />
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                        {error}
                    </div>
                )}

                {step === 'info' && (
                    <form onSubmit={handleCreateAccount}>
                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block ml-1">First Name</label>
                                <div className="relative group">
                                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl py-4 pr-5 pl-12 text-white font-medium focus:outline-none focus:border-purple-500/50 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block ml-1">Last Name</label>
                                <div className="relative group">
                                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl py-4 pr-5 pl-12 text-white font-medium focus:outline-none focus:border-purple-500/50 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block ml-1">Date of Birth</label>
                                <div className="relative group">
                                    <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl py-4 pr-5 pl-12 text-gray-300 font-medium focus:outline-none focus:border-purple-500/50 transition-all [&::-webkit-calendar-picker-indicator]:hidden" />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 flex gap-4 items-start">
                            <ShieldCheck size={20} className="text-purple-400 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-purple-400 font-bold text-sm mb-1">Safe & Secure</h4>
                                <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                                    A default spending limit of <span className="text-white font-bold">£50 on card</span> will be applied automatically.
                                </p>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#00FF85] text-black hover:bg-[#00e074]'}`}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Continue →'}
                        </button>
                    </form>
                )}

                {step === 'credentials' && (
                    <form onSubmit={handleSetCredentials}>
                        <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                            Set up login credentials so <span className="text-white font-bold">{firstName}</span> can sign in independently with their own junior account view.
                        </p>

                        <div className="space-y-5 mb-6">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl py-4 pr-5 pl-12 text-white font-medium focus:outline-none focus:border-purple-500/50 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block ml-1">Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl py-4 pr-12 pl-12 text-white font-medium focus:outline-none focus:border-purple-500/50 transition-all" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-purple-400 transition-colors">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98] mb-3 ${loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#00FF85] text-black hover:bg-[#00e074]'}`}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Login'}
                        </button>

                        <button type="button" onClick={handleSkipCredentials}
                            className="w-full py-3 rounded-2xl font-semibold text-sm text-gray-500 hover:text-gray-300 transition-colors">
                            Skip for now — set up later
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddJuniorModal;
