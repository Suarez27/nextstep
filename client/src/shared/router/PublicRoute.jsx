import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';

export default function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="splash" aria-label="loading" />;
    if (user) return <Navigate to="/dashboard" replace />;

    return children;
}