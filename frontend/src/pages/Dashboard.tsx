import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';


const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
               
                const response = await api.get('/setup/status/');
                
                if (!response.data.is_setup_complete) {
                 
                    navigate('/setup', { replace: true });
                } else {
                    setLoading(false);
                }
            } catch (err) {
                
                navigate('/login', { replace: true });
            }
        };
        checkStatus();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-10 text-2xl">
            Witaj w Dashboardzie! Twój profil jest w pełni zweryfikowany.
        </div>
    );
};

export default Dashboard;