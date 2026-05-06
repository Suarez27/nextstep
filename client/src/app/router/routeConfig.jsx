import HomePage from '../../modules/home/pages/HomePage';
import LoginPage from '../../modules/auth/pages/LoginPage';
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import InternshipsPage from '../../modules/internships/pages/InternshipsPage';
import ApplicationsPage from '../../modules/applications/pages/ApplicationsPage';
import ProfilePage from '../../modules/profile/pages/ProfilePage';
import StudentsPage from '../../modules/students/pages/StudentsPage';
import InterviewsPage from '../../modules/interviews/pages/InterviewsPage';
import AgreementsPage from '../../modules/agreements/pages/AgreementsPage';
import AdminPage from '../../modules/admin/pages/AdminPage';

export const PUBLIC_ROUTES = [
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
        isGuestOnly: true,
    },
];

export const PRIVATE_ROUTES = [
    {
        path: 'dashboard',
        element: <DashboardPage />,
        permissionKey: 'dashboard',
    },
    {
        path: 'internships',
        element: <InternshipsPage />,
        permissionKey: 'internships',
    },
    {
        path: 'applications',
        element: <ApplicationsPage />,
        permissionKey: 'applications',
    },
    {
        path: 'profile',
        element: <ProfilePage />,
        permissionKey: 'profile',
    },
    {
        path: 'students',
        element: <StudentsPage />,
        permissionKey: 'students',
    },
    {
        path: 'interviews',
        element: <InterviewsPage />,
        permissionKey: 'interviews',
    },
    {
        path: 'agreements',
        element: <AgreementsPage />,
        permissionKey: 'agreements',
    },
    {
        path: 'admin/*',
        element: <AdminPage />,
        permissionKey: 'adminPanel',
    },
];