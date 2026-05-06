import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const useLogout = () => {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            // Informujemy backend o wylogowaniu
            await api.post('/auth/logout/', { refresh: refreshToken });
        } catch (error) {
            console.error("Backend logout failed", error);
        } finally {
            localStorage.clear(); 
            navigate('/login', { replace: true });
        }
    };

    return logout;
};