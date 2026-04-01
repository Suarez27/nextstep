import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Internships from './pages/Internships';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Students from './pages/Students';
import Interviews from './pages/Interviews';
import Agreements from './pages/Agreements';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash" aria-label="loading" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash" aria-label="loading" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="internships" element={<Internships />} />
        <Route path="applications" element={<Applications />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="students"
          element={
            <ProtectedRoute roles={['admin', 'centro']}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route path="interviews" element={<Interviews />} />
        <Route path="agreements" element={<Agreements />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
