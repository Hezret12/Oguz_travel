import { lazy, Suspense, useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import ScrollToTop from '../components/ScrollToTop';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

/**
 * Resilient lazy loader with automatic retry on new production deployments (ChunkLoadError recovery)
 */
function lazyRetry(componentImport) {
  return lazy(() =>
    componentImport().catch((error) => {
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module');

      if (isChunkError && typeof window !== 'undefined') {
        const key = 'chunk_retry_' + window.location.pathname;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, 'true');
          window.location.reload();
        }
      }
      throw error;
    })
  );
}

const LoginPage = lazyRetry(() => import('../pages/Login'));
const DashboardPage = lazyRetry(() => import('../pages/AdminDashboard'));
const EmployeePage = lazyRetry(() => import('../pages/Employee'));
const ClientsPage = lazyRetry(() => import('../pages/Clients'));
const UsersPage = lazyRetry(() => import('../pages/Users'));
const TicketPage = lazyRetry(() => import('../pages/Ticket'));
const TicketB2BPage = lazyRetry(() => import('../pages/Ticket/B2B'));
const TicketTurkishAirlinesPage = lazyRetry(() => import('../pages/Ticket/TurkishAirlines'));
const NotFoundPage = lazyRetry(() => import('../pages/NotFound'));
const UnauthorizedPage = lazyRetry(() => import('../pages/Unauthorized'));
const VisaPage = lazyRetry(() => import('../pages/Visa'));
const ReferralLetter = lazyRetry(() => import('../pages/ReferralLetter/index'));
const PackagePage = lazyRetry(() => import('../pages/Visa/Package/Package'));
const TranslatePage = lazyRetry(() => import('../pages/Translate'));
const OutboundPage = lazyRetry(() => import('../pages/Outbound/Outbound'));
const VisaIntakePage = lazyRetry(() => import('../pages/VisaIntake'));
const TurkishAirlinesReportPage = lazyRetry(() => import('../pages/Reports/TurkishAirlinesReport'));

function PageLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Prevent loader flicker on fast route navigations (<180ms)
    const timer = setTimeout(() => setVisible(true), 180);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        width: '100%',
        minHeight: '60vh',
        opacity: 0.9,
        transition: 'opacity 0.2s ease-in',
      }}
    >
      <CircularProgress
        size={42}
        thickness={4}
        sx={{
          color: (theme) => theme.palette.primary.main,
        }}
      />
    </Box>
  );
}

function Loadable(LazyComponent) {
  return function LoadableWrapper(props) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

const Dashboard = Loadable(DashboardPage);
const Employee = Loadable(EmployeePage);
const Clients = Loadable(ClientsPage);
const Users = Loadable(UsersPage);
const Visa = Loadable(VisaPage);
const Referral = Loadable(ReferralLetter);
const Package = Loadable(PackagePage);
const Translate = Loadable(TranslatePage);
const Outbound = Loadable(OutboundPage);
const Ticket = Loadable(TicketPage);
const TicketB2B = Loadable(TicketB2BPage);
const TicketTurkish = Loadable(TicketTurkishAirlinesPage);
const Intake = Loadable(VisaIntakePage);
const TurkishReport = Loadable(TurkishAirlinesReportPage);
const Unauthorized = Loadable(UnauthorizedPage);
const NotFound = Loadable(NotFoundPage);
const Login = Loadable(LoginPage);
const Layout = DashboardLayout;

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
      { path: '/login', element: <Login /> },
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            element: <Layout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'employee', element: <Employee /> },
              { path: 'employee/users', element: <Users /> },
              { path: 'clients', element: <Clients /> },
              { path: 'visa/applications', element: <Visa /> },
              { path: 'visa/referal-letters', element: <Referral /> },
              { path: 'visa/package', element: <Package /> },
              { path: 'translation', element: <Translate /> },
              { path: 'outbound', element: <Outbound /> },
              {
                path: 'ticket',
                element: <Ticket />,
                children: [
                  { index: true, element: <Navigate to="b2b" replace /> },
                  { path: 'b2b', element: <TicketB2B /> },
                  { path: 'turkish-airlines', element: <TicketTurkish /> },
                ],
              },
              { path: 'intake', element: <Intake /> },
              { path: 'reports/turkish-airlines', element: <TurkishReport /> },
              { path: 'unauthorized', element: <Unauthorized /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
