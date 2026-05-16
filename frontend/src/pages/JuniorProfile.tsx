import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Calendar, Phone, MapPin, Building2, Hash, Shield } from 'lucide-react';
import api from '../api/axios';

interface ContextType {
    firstName: string;
    lastName: string;
}

interface CustomerData {
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    phone: string;
    country: string;
    city: string;
    postcode: string;
    street: string;
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 text-purple-400">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-purple-400">{label}</p>
            <p className="text-sm font-semibold truncate text-gray-800">{value || '—'}</p>
        </div>
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-[1.5rem] border-2 border-purple-100 p-5 sm:p-6 shadow-sm">
        <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 text-purple-400">{title}</h2>
        {children}
    </div>
);

const formatDob = (dob: string) => {
    if (!dob) return '';
    const [year, month, day] = dob.split('-');
    return `${day}/${month}/${year}`;
};

const JuniorProfile: React.FC = () => {
    const context = useOutletContext<ContextType>();
    const firstName = context?.firstName || '';
    const lastName  = context?.lastName  || '';
    const initials  = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

    const [data, setData]       = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/me/').then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-6">

            {/* Avatar + name hero */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-[2rem] p-7 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 bg-white/20 backdrop-blur-sm border-2 border-white/30 select-none">
                        {initials}
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/60">
                            Junior account holder
                        </p>
                        <h1 className="text-3xl font-black tracking-tight">
                            {firstName} {lastName}
                        </h1>
                        <p className="text-sm mt-1 text-white/70">{data?.email || ''}</p>
                        <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest">
                            <Shield size={11} /> Junior
                        </span>
                    </div>
                </div>
            </div>

            {/* Read-only notice */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] p-4 flex gap-3 items-start">
                <span className="text-xl">🔒</span>
                <div>
                    <p className="font-bold text-amber-800 text-sm">Read-only profile</p>
                    <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                        To change your details, ask your parent to update them from their account.
                    </p>
                </div>
            </div>

            {/* Personal information */}
            <Section title="Personal information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow icon={<User size={16} />}     label="First name"    value={data?.firstName} />
                    <InfoRow icon={<User size={16} />}     label="Last name"     value={data?.lastName} />
                    <InfoRow icon={<Mail size={16} />}     label="Email"         value={data?.email} />
                    <InfoRow icon={<Calendar size={16} />} label="Date of birth" value={data?.dob ? formatDob(data.dob) : undefined} />
                    <InfoRow icon={<Phone size={16} />}    label="Phone"         value={data?.phone} />
                    <InfoRow icon={<Shield size={16} />}   label="Account type"  value="Junior" />
                </div>
            </Section>

            {/* Address */}
            <Section title="Address">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow icon={<MapPin size={16} />}    label="Street"   value={data?.street} />
                    <InfoRow icon={<Building2 size={16} />} label="City"     value={data?.city} />
                    <InfoRow icon={<Hash size={16} />}      label="Postcode" value={data?.postcode} />
                    <InfoRow icon={<MapPin size={16} />}    label="Country"  value={data?.country} />
                </div>
            </Section>

        </div>
    );
};

export default JuniorProfile;
