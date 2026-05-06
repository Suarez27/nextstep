import { AuthProvider } from '../../modules/auth/context/AuthContext';
import { LanguageProvider } from '../../shared/context/LanguageContext';

export default function AppProviders({ children }) {
    return (
        <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
    );
}