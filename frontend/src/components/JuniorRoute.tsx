import { Navigate, Outlet } from 'react-router-dom';

const JuniorRoute = () => {
    const token = localStorage.getItem('access_token');
    const isJunior = localStorage.getItem('is_junior') === 'true';

    if (!token) return <Navigate to="/login" replace />;
    if (!isJunior) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
};

export default JuniorRoute;
