import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Calendar, Phone, MapPin, Building2, Hash } from 'lucide-react';
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

const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | undefined;
}) => (
    <div
        className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
    >
        <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p
                className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: 'var(--text-muted)' }}
            >
                {label}
            </p>
            <p
                className="text-sm font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
            >
                {value || '—'}
            </p>
        </div>
    </div>
);

const formatDob = (dob: string) => {
    if (!dob) return '';
    const [year, month, day] = dob.split('-');
    return `${day}/${month}/${year}`;
};

const Profile = () => {
    const context = useOutletContext<ContextType>();
    const firstName = context?.firstName || '';
    const lastName = context?.lastName || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'JD';

    const [data, setData] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/customers/me/');
                setData(res.data);
            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-10 w-full animate-fadeIn">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* AVATAR + NAME */}
                <div
                    className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-lg"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 bg-[#00FF85] text-black select-none">
                        {initials}
                    </div>
                    <div className="text-center sm:text-left">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-1"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Account holder
                        </p>
                        <h1
                            className="text-3xl font-black tracking-tight"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {firstName} {lastName}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {data?.email || ''}
                        </p>
                    </div>
                </div>

                {/* PERSONAL INFO */}
                <div
                    className="rounded-3xl p-5 sm:p-6 shadow-lg"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                    <h2
                        className="text-[10px] font-bold uppercase tracking-widest mb-4"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Personal information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoRow
                            icon={<User size={16} />}
                            label="First name"
                            value={data?.firstName}
                        />
                        <InfoRow
                            icon={<User size={16} />}
                            label="Last name"
                            value={data?.lastName}
                        />
                        <InfoRow
                            icon={<Mail size={16} />}
                            label="Email"
                            value={data?.email}
                        />
                        <InfoRow
                            icon={<Calendar size={16} />}
                            label="Date of birth"
                            value={data?.dob ? formatDob(data.dob) : undefined}
                        />
                        <InfoRow
                            icon={<Phone size={16} />}
                            label="Phone"
                            value={data?.phone}
                        />
                    </div>
                </div>

                {/* ADDRESS */}
                <div
                    className="rounded-3xl p-5 sm:p-6 shadow-lg"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                    <h2
                        className="text-[10px] font-bold uppercase tracking-widest mb-4"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Address
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoRow
                            icon={<MapPin size={16} />}
                            label="Street"
                            value={data?.street}
                        />
                        <InfoRow
                            icon={<Building2 size={16} />}
                            label="City"
                            value={data?.city}
                        />
                        <InfoRow
                            icon={<Hash size={16} />}
                            label="Postcode"
                            value={data?.postcode}
                        />
                        <InfoRow
                            icon={<MapPin size={16} />}
                            label="Country"
                            value={data?.country}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
