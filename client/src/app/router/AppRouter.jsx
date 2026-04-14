import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import HomePage from '../../modules/home/pages/HomePage';
import LoginPage from '../../modules/auth/pages/LoginPage';
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import InternshipsPage from '../../modules/internships/pages/InternshipsPage';
import ApplicationsPage from '../../modules/applications/pages/ApplicationsPage';
import ProfilePage from '../../modules/profile/pages/ProfilePage';
import StudentsPage from '../../modules/students/pages/StudentsPage';
import InterviewsPage from '../../modules/interviews/pages/InterviewsPage';
import AgreementsPage from '../../modules/agreements/pages/AgreementsPage';

import AppLayout from '../../shared/layouts/AppLayout';
import ProtectedRoute from '../../shared/router/ProtectedRoute';
import PublicRoute from '../../shared/router/PublicRoute';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="internships" element={<InternshipsPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="profile" element={<ProfilePage />} />

                <Route
                    path="students"
                    element={
                        <ProtectedRoute roles={['admin', 'centro']}>
                            <StudentsPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="interviews" element={<InterviewsPage />} />
                <Route path="agreements" element={<AgreementsPage />} />
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