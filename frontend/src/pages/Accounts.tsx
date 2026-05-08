import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; 
import Header from '../components/Header'; 
import api from '../api/axios';

const Accounts = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('junior-1');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await api.get('/me/');
                setFirstName(userRes.data.firstName);
                setLastName(userRes.data.lastName);
            } catch (err) {
                console.error("Błąd podczas pobierania danych użytkownika:", err);
            }
        };
        fetchUserData();
    }, []);

    return (
        <div className="flex h-screen bg-[#0B0E14] text-white font-sans overflow-hidden relative">
            
            <Sidebar 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                firstName={firstName}
                lastName={lastName}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                
                <Header
                    title={<h1 className="text-xl font-bold text-white">Accounts</h1>}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                    firstName={firstName}
                    lastName={lastName}
                />

                <div className="flex-1 p-4 sm:p-6 md:p-8 text-white flex gap-6 md:gap-8 overflow-y-auto">
                    
                    <div className="hidden md:flex w-52 shrink-0 flex-col gap-2">
                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">My Accounts</h2>
                        
                        <button 
                            onClick={() => setSelectedAccountId('current')}
                            className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all ${
                                selectedAccountId === 'current' 
                                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${selectedAccountId === 'current' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className={`text-sm font-semibold truncate ${selectedAccountId === 'current' ? 'text-emerald-400' : 'text-gray-300'}`}>Current Account</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setSelectedAccountId('junior-1')}
                            className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all ${
                                selectedAccountId === 'junior-1' 
                                ? 'bg-purple-500/10 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${selectedAccountId === 'junior-1' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="text-left flex-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <p className={`text-sm font-bold truncate ${selectedAccountId === 'junior-1' ? 'text-white' : 'text-gray-300'}`}>Adam</p>
                                    <span className="bg-purple-500/20 text-purple-300 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">Junior</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 pb-10">
                        
                        {selectedAccountId === 'junior-1' ? (
                            <div className="flex flex-col h-full animate-fadeIn max-w-6xl w-full mx-auto md:mx-0">
                                
                                <div className="bg-[#161B22] border border-gray-800 rounded-3xl p-6 md:p-8 mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shadow-lg">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl font-bold text-gray-200">Adam's Account</h2>
                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                                Active
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl md:text-5xl font-black tracking-tighter">£125</span>
                                            <span className="text-2xl font-bold text-purple-400">.00</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5 w-full xl:w-auto xl:min-w-[320px]">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account Details</span>
                                            <button className="text-gray-500 hover:text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">IBAN</span>
                                                <span className="font-mono text-gray-300 font-medium tracking-wide text-xs md:text-sm">GB89 LYOB 1020 3054 4101 54</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Sort Code</span>
                                                <span className="font-mono text-gray-300 font-medium tracking-wide">10-20-30</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Account No.</span>
                                                <span className="font-mono text-gray-300 font-medium tracking-wide">54410154</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                                    
                                    <div className="bg-[#161B22] border border-gray-800 p-6 md:p-8 rounded-3xl flex flex-col shadow-lg">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Virtual Card</h3>
                                        </div>
                                        <div className="w-full aspect-[1.58/1] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(168,85,247,0.2)] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                            <div className="flex justify-between items-start z-10">
                                                <p className="font-black text-white/90 tracking-widest text-xl">Lyo Bank</p>
                                                <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                                            </div>
                                            <div className="z-10 mt-auto">
                                                <p className="text-white text-xl md:text-2xl font-mono tracking-[0.15em] mb-2 drop-shadow-sm">**** **** **** 4101</p>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-white/80 text-xs md:text-sm uppercase font-bold tracking-wider">Adam Johnson</p>
                                                    <p className="text-white/80 text-sm font-mono font-bold">12/28</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-3 mt-8">
                                            <button className="flex flex-col items-center justify-center gap-2 bg-[#0B0E14] hover:bg-white/5 p-3 rounded-xl transition-colors border border-gray-800 group">
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">ADD</span>
                                            </button>
                                            <button className="flex flex-col items-center justify-center gap-2 bg-[#0B0E14] hover:bg-white/5 p-3 rounded-xl transition-colors border border-gray-800 group">
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">VIEW</span>
                                            </button>
                                            <button className="flex flex-col items-center justify-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 p-3 rounded-xl transition-colors border border-sky-500/20">
                                                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                <span className="text-[10px] font-bold text-sky-400">FREEZE</span>
                                            </button>
                                            <button className="flex flex-col items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 p-3 rounded-xl transition-colors border border-red-500/20">
                                                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                <span className="text-[10px] font-bold text-red-400">DELETE</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-[#161B22] border border-gray-800 p-6 md:p-8 rounded-3xl flex flex-col shadow-lg">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Spending Rules</h3>
                                        
                                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                                            
                                            <div className="bg-[#0B0E14] rounded-2xl p-5 border border-gray-800">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <span className="text-sm font-semibold">Per Transaction Limit</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors shadow-inner">
                                                    <span className="pl-4 pr-2 text-gray-500 font-bold">£</span>
                                                    <input type="number" defaultValue="20.00" className="bg-transparent text-white font-bold w-full py-3.5 outline-none" />
                                                    <button className="px-5 text-purple-400 hover:text-purple-300 transition-colors">
                                                        <span className="text-xs font-bold uppercase tracking-wider">Save</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-[#0B0E14] rounded-2xl p-5 border border-gray-800">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <span className="text-sm font-semibold">Daily Limit</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center bg-[#161B22] border border-gray-700 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors mb-5 shadow-inner">
                                                    <span className="pl-4 pr-2 text-gray-500 font-bold">£</span>
                                                    <input type="number" defaultValue="50.00" className="bg-transparent text-white font-bold w-full py-3.5 outline-none" />
                                                    <button className="px-5 text-purple-400 hover:text-purple-300 transition-colors">
                                                        <span className="text-xs font-bold uppercase tracking-wider">Save</span>
                                                    </button>
                                                </div>
                                                <div className="flex justify-between text-xs font-medium mb-2.5">
                                                    <span className="text-gray-400">£15.00 spent today</span>
                                                    <span className="text-purple-400 font-bold">£35.00 remaining</span>
                                                </div>
                                                <div className="w-full bg-[#161B22] h-2 rounded-full overflow-hidden border border-gray-800">
                                                    <div className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: '30%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#161B22] border border-gray-800 p-6 md:p-8 rounded-3xl shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Transactions</h3>
                                        <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">View All &gt;</button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between p-4 bg-[#0B0E14] hover:bg-gray-800/50 rounded-2xl transition-colors cursor-default border border-gray-800 hover:border-gray-600">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-200">McDonald's</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <span>Today, 14:30</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                        <span className="uppercase text-purple-400 font-bold text-[10px]">Card</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="font-bold text-white text-lg">- £6.50</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-4 bg-[#0B0E14] hover:bg-gray-800/50 rounded-2xl transition-colors cursor-default border border-gray-800 hover:border-gray-600">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-200">Cinema City</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <span>Yesterday, 18:15</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                        <span className="uppercase text-purple-400 font-bold text-[10px]">Card</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="font-bold text-white text-lg">- £12.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    <h2 className="text-xl font-bold text-gray-400 mb-2">Current Account Dashboard</h2>
                                    <p className="text-sm">Tutaj zaprojektujemy pełny widok przelewów i salda głównego.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Accounts;