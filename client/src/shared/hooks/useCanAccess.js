import { useMemo } from 'react';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { canAccess } from '../config/permissions';

export function useCanAccess(permissionKey) {
    const { user } = useAuth();

    return useMemo(() => {
        return canAccess(permissionKey, user?.role);
    }, [permissionKey, user?.role]);
}

export function useCanAccessAny(permissionKeys = []) {
    const { user } = useAuth();

    return useMemo(() => {
        return permissionKeys.some((key) => canAccess(key, user?.role));
    }, [permissionKeys, user?.role]);
}