import { AuthProvider } from '../../modules/auth/context/AuthContext';

export default function AppProviders({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}