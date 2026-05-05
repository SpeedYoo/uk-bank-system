import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import logoImg from '../assets/logo.png';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!agreeTerms) {
            setError('You must accept the Terms & Conditions.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register/', {
                email: email.trim(),
                password,
                agree_terms: agreeTerms,
            });
            navigate('/login');
        } catch (err: any) {
            const serverErrors = err.response?.data;

            if (serverErrors) {
                const firstErrorKey = Object.keys(serverErrors)[0];
                const errorMessage = serverErrors[firstErrorKey];

                if (Array.isArray(errorMessage)) {
                    setError(errorMessage[0]);
                } else {
                    setError('Registration failed. Please check your data.');
                }
            } else {
                setError('Server is not responding. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1a] flex flex-col md:flex-row text-white font-sans overflow-x-hidden">

            <div className="w-full md:w-3/5 flex flex-col p-8 sm:p-12 lg:p-20 justify-center relative overflow-hidden bg-[#0a0f1a] border-b md:border-b-0 md:border-r border-white/5">
                <div className="absolute top-6 left-8 md:top-10 md:left-12 z-20">
                    <span className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
                        Lyo Bank
                    </span>
                </div>

                <div className="flex flex-col items-start max-w-2xl mx-auto w-full z-10 mt-16 md:mt-0">
                    <div className="relative flex justify-center items-center w-full mb-10 md:mb-16 scale-75 sm:scale-90 md:scale-100">
                        <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-emerald-500/10 rounded-full blur-[80px] md:blur-[100px]"></div>
                        <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 bg-[#162033]/80 rounded-[2rem] md:rounded-[2.5rem] -rotate-6 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
                            <div className="bg-emerald-500/10 p-2 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                                <img src={logoImg} alt="Lyo Icon" className="w-28 h-28 md:w-40 md:h-40 object-contain" />
                            </div>
                        </div>
                        <div className="absolute w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-[2rem] md:rounded-[2.5rem] rotate-6 border border-white/5"></div>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-left leading-tight w-full">
                        Join the Future of Banking
                    </h2>
                    <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 md:mb-12 text-left max-w-lg">
                        Open your account in minutes and experience next-generation financial services.
                    </p>
                </div>
            </div>

            <div className="w-full md:w-2/5 bg-[#0f172a] flex items-center justify-center p-8 sm:p-12 lg:p-20 relative min-h-screen">
                <div className="w-full max-w-sm py-12 md:py-0">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Create Account</h1>
                    <p className="text-slate-400 text-lg mb-8">Start your journey with Lyo Bank.</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5" noValidate>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#0a101f] border border-white/10 rounded-2xl py-4 px-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                                />
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#0a101f] border border-white/10 rounded-2xl py-4 px-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500 transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Confirm Password</label>
                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#0a101f] border border-white/10 rounded-2xl py-4 px-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500 transition-colors z-10"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-2 text-left">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded-md border-white/10 bg-[#0a101f] text-emerald-500 focus:ring-emerald-500/20 transition-all cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer select-none">
                                I agree to the <span className="text-blue-500 hover:underline">Terms & Conditions</span> and <span className="text-blue-500 hover:underline">Privacy Policy</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#10b981] hover:bg-[#0fb37a] text-[#0a0f1a] font-extrabold py-4 rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(16,185,129,0.3)] transform active:scale-[0.98] flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-[#0a0f1a]/30 border-t-[#0a0f1a] rounded-full animate-spin"></div>
                            ) : 'Create Account'}
                        </button>

                        <p className="text-center text-slate-500 text-sm mt-6">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-500 font-semibold hover:underline transition-colors"
                            >
                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;