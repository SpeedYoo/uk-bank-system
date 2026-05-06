import { Navigate } from 'react-router-dom';
import {type ReactNode } from 'react'; 

// Zmieniamy JSX.Element na ReactNode
const PublicRoute = ({ children }: { children: ReactNode }) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>; 
};

export default PublicRoute;