import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../../../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const forceStop = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 1500);

        const token = localStorage.getItem('ns_token');
        if (!token) {
            clearTimeout(forceStop);
            setLoading(false);
            return;
        }

        api.me()
            .then((me) => {
                if (isMounted) setUser(me);
            })
            .catch(() => localStorage.removeItem('ns_token'))
            .finally(() => {
                clearTimeout(forceStop);
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
            clearTimeout(forceStop);
        };
    }, []);

    const login = useCallback(async (email, password) => {
        const { token, user } = await api.login({ email, password });
        localStorage.setItem('ns_token', token);
        setUser(user);
    }, []);

    const register = useCallback(async (data) => {
        const { token, user } = await api.register(data);
        localStorage.setItem('ns_token', token);
        setUser(user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('ns_token');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}