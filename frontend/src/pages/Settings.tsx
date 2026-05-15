import React, { useEffect, useState } from 'react';
import { Sun, Moon, User, Mail, Shield, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const isDark = theme === 'dark';

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/me/');
                setFirstName(res.data.firstName);
                setLastName(res.data.lastName);

                setEmail(res.data.email || '');
            } catch {}
        };
        load();
    }, []);

    const surface = {
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
    };

    return (
        <div className="p-4 sm:p-6 md:p-10 w-full animate-fadeIn">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Settings
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage your preferences and account details.
                    </p>
                </div>

                {/* ── Appearance ───────────────────────────────── */}
                <section
                    className="rounded-3xl border p-6 transition-colors duration-300"
                    style={surface}
                >
                    <h2
                        className="text-[11px] font-black uppercase tracking-widest mb-5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Appearance
                    </h2>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: isDark ? '#1F2937' : '#f1f5f9' }}
                            >
                                {isDark
                                    ? <Moon size={20} className="text-indigo-400" />
                                    : <Sun size={20} className="text-amber-500" />
                                }
                            </div>
                            <div>
                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {isDark ? 'Dark mode' : 'Light mode'}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {isDark
                                        ? 'Easy on the eyes at night'
                                        : 'Clean and bright interface'}
                                </p>
                            </div>
                        </div>

                        {/* Toggle switch */}
                        <button
                            onClick={toggleTheme}
                            className={`
                                relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none
                                focus:ring-2 focus:ring-emerald-500/50
                                ${isDark ? 'bg-indigo-600' : 'bg-amber-400'}
                            `}
                            aria-label="Toggle theme"
                        >
                            <span
                                className={`
                                    absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md
                                    transition-transform duration-300
                                    ${isDark ? 'translate-x-0.5' : 'translate-x-7'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Preview strip */}
                    <div
                        className="mt-6 rounded-2xl p-4 flex items-center gap-3 border"
                        style={{
                            backgroundColor: isDark ? '#0B0E14' : '#f8fafc',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Theme applied · Saved automatically
                        </p>
                    </div>
                </section>

                {/* ── Account info ─────────────────────────────── */}
                <section
                    className="rounded-3xl border p-6 transition-colors duration-300"
                    style={surface}
                >
                    <h2
                        className="text-[11px] font-black uppercase tracking-widest mb-5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Account
                    </h2>

                    <div className="space-y-1">
                        <SettingsRow
                            icon={<User size={18} />}
                            label="Full name"
                            value={firstName && lastName ? `${firstName} ${lastName}` : '—'}
                        />
                        <SettingsRow
                            icon={<Mail size={18} />}
                            label="Email"
                            value={email || '—'}
                        />
                        <SettingsRow
                            icon={<Shield size={18} />}
                            label="Account type"
                            value="Standard"
                        />
                    </div>
                </section>

                {/* ── Coming soon ──────────────────────────────── */}
                <section
                    className="rounded-3xl border p-6 transition-colors duration-300 opacity-50"
                    style={surface}
                >
                    <h2
                        className="text-[11px] font-black uppercase tracking-widest mb-5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Notifications · Coming soon
                    </h2>
                    <div className="space-y-1">
                        <SettingsRow icon={<ChevronRight size={18} />} label="Push notifications" value="Off" disabled />
                        <SettingsRow icon={<ChevronRight size={18} />} label="Email alerts" value="Off" disabled />
                    </div>
                </section>

            </div>
        </div>
    );
};

interface SettingsRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    disabled?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, value, disabled }) => (
    <div
        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors ${disabled ? '' : 'hover:opacity-80 cursor-default'}`}
        style={{ backgroundColor: 'var(--bg-elevated)' }}
    >
        <div className="flex items-center gap-3">
            <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {label}
            </span>
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
        </span>
    </div>
);

export default Settings;
