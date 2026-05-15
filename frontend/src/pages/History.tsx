import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import TransactionHistory from '../components/TransactionHistory';

const History = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/accounts/');
                setAccounts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
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
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Transaction History</h1>
                <TransactionHistory accounts={accounts} />
            </div>
        </div>
    );
};

export default History;
