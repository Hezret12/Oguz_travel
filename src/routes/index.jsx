import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import ScrollToTop from '../components/ScrollToTop';
import ProtectedRoute from '../components/ProtectedRoute';
import PlaceholderPage from '../components/PlaceholderPage';
import LoginPage from '../pages/Login';
import DashboardPage from '../pages/AdminDashboard';
import EmployeePage from '../pages/Employee';
import ClientsPage from '../pages/Clients';
import UsersPage from '../pages/Users';
import TicketPage from '../pages/Ticket';
import TicketB2BPage from '../pages/Ticket/B2B';
import TicketTurkishAirlinesPage from '../pages/Ticket/TurkishAirlines';
import NotFoundPage from '../pages/NotFound';
import UnauthorizedPage from '../pages/Unauthorized';
import VisaPage from '../pages/Visa';
import ReferralLetter from '../pages/ReferralLetter/index';
import PackagePage from '../pages/Visa/Package/Package';
import TranslatePage from '../pages/Translate';
import OutboundPage from '../pages/Outbound/Outbound';
import VisaIntakePage from '../pages/VisaIntake';

const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <Outlet />
      </>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true,            element: <DashboardPage /> },
              { path: 'employee',       element: <EmployeePage /> },
              { path: 'employee/users', element: <UsersPage /> },
              { path: 'clients',        element: <ClientsPage /> },
              { path: 'visa/applications', element: <VisaPage /> },
              { path: 'visa/referal-letters', element: <ReferralLetter /> },
              { path: 'visa/package',      element: <PackagePage /> },
              { path: 'translation',       element: <TranslatePage /> },
              { path: 'visa/intake',       element: <VisaIntakePage /> },
              { path: 'outbound',          element: <OutboundPage /> },
              {
                path: 'ticket',
                element: <TicketPage />,
                children: [
                  { index: true, element: <Navigate to="b2b" replace /> },
                  { path: 'b2b', element: <TicketB2BPage /> },
                  { path: 'turkish-airlines', element: <TicketTurkishAirlinesPage /> },
                ],
              },
              { path: 'agents',         element: <PlaceholderPage title="Agents Directory" /> },
              { path: 'bookings',       element: <PlaceholderPage title="All Bookings" /> },
              { path: 'planner',        element: <PlaceholderPage title="Trip Planner" /> },
              { path: 'search',         element: <PlaceholderPage title="Search Flights" /> },
              { path: 'profile',        element: <PlaceholderPage title="My Profile" /> },
              { path: 'logs',           element: <PlaceholderPage title="System Logs" /> },
              { path: 'settings',       element: <PlaceholderPage title="System Settings" /> },
              { path: 'unauthorized',   element: <UnauthorizedPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
