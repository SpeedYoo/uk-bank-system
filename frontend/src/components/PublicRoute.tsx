import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';

const PublicRoute = ({ children }: { children: ReactNode }) => {
    const token = localStorage.getItem('access_token');
    const isJunior = localStorage.getItem('is_junior') === 'true';

    if (token) {
        return <Navigate to={isJunior ? '/junior/dashboard' : '/dashboard'} replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;