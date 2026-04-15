import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '../../shared/layouts/AppLayout';
import ProtectedRoute from '../../shared/router/ProtectedRoute';
import PublicRoute from '../../shared/router/PublicRoute';
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from './routeConfig';

function AppRoutes() {
    return (
        <Routes>
            {PUBLIC_ROUTES.map((route) => {
                if (route.isGuestOnly) {
                    return (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <PublicRoute>
                                    {route.element}
                                </PublicRoute>
                            }
                        />
                    );
                }

                return (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                    />
                );
            })}

            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                {PRIVATE_ROUTES.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            <ProtectedRoute permissionKey={route.permissionKey}>
                                {route.element}
                            </ProtectedRoute>
                        }
                    />
                ))}
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}