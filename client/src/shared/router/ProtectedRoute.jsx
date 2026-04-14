import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="splash" aria-label="loading" />;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

    return children;
}