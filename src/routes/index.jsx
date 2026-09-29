import { lazy, Suspense, useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import ScrollToTop from '../components/ScrollToTop';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import DashboardLayout from '../layouts/DashboardLayout';


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
const ReferralLetterPage = lazyRetry(() => import('../pages/ReferralLetter'));
const ReferralLetterReportPage = lazyRetry(() => import('../pages/Reports/ReferralLetter/index'));
const PackagePage = lazyRetry(() => import('../pages/Visa/Package/Package'));
const PackagesViewPage = lazyRetry(() => import('../pages/Packages'));
const TranslatePage = lazyRetry(() => import('../pages/Translate'));
const OutboundPage = lazyRetry(() => import('../pages/Outbound/Outbound'));
const VisaIntakePage = lazyRetry(() => import('../pages/VisaIntake'));
const TurkishAirlinesReportPage = lazyRetry(() => import('../pages/Reports/TurkishAirlinesReport'));
const TaskFlowPage = lazyRetry(() => import('../pages/TaskFlow'));
const NotificationPage = lazyRetry(() => import('../pages/Notification'));
const ProfilePage = lazyRetry(() => import('../pages/Profile/index'));
const CafeteriaPage = lazyRetry(() => import('../pages/Cafeteria'));
const FinanceCashFlowPage = lazyRetry(() => import('../pages/Finance/CashFlow'));
const FinanceOverviewPage = lazyRetry(() => import('../pages/Finance/Overview'));
const FinanceOfficesPage = lazyRetry(() => import('../pages/Finance/Offices'));
const FinanceSalaryPage = lazyRetry(() => import('../pages/Finance/Salary'));
const ProfessionalTranslationPage = lazyRetry(() => import('../pages/ProfessionalTranslation'));
const OfficePage = lazyRetry(() => import('../pages/ProfessionalTranslation/Office'));
const DepartmentPage = lazyRetry(() => import('../pages/ProfessionalTranslation/Department'));
const PositionPage = lazyRetry(() => import('../pages/ProfessionalTranslation/Position'));
const TranslatorPage = lazyRetry(() => import('../pages/ProfessionalTranslation/Translator'));
const CategoryPage = lazyRetry(() => import('../pages/ProfessionalTranslation/Category'));
const ReferralCountryPage = lazyRetry(() => import('../pages/ProfessionalTranslation/ReferralCountry'));

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
const ReferralLetter = Loadable(ReferralLetterPage);
const ReferralLetterReport = Loadable(ReferralLetterReportPage);
const Package = Loadable(PackagePage);
const PackagesView = Loadable(PackagesViewPage);
const Translate = Loadable(TranslatePage);
const Outbound = Loadable(OutboundPage);
const Ticket = Loadable(TicketPage);
const TicketB2B = Loadable(TicketB2BPage);
const TicketTurkish = Loadable(TicketTurkishAirlinesPage);
const Intake = Loadable(VisaIntakePage);
const TurkishReport = Loadable(TurkishAirlinesReportPage);
const TaskFlow = Loadable(TaskFlowPage);
const Notification = Loadable(NotificationPage);
const Profile = Loadable(ProfilePage);
const Cafeteria = Loadable(CafeteriaPage);
const FinanceCashFlow = Loadable(FinanceCashFlowPage);
const FinanceOverview = Loadable(FinanceOverviewPage);
const FinanceOffices = Loadable(FinanceOfficesPage);
const FinanceSalary = Loadable(FinanceSalaryPage);
const ProfessionalTranslation = Loadable(ProfessionalTranslationPage);
const Office = Loadable(OfficePage);
const Department = Loadable(DepartmentPage);
const Position = Loadable(PositionPage);
const Translator = Loadable(TranslatorPage);
const Category = Loadable(CategoryPage);
const ReferralCountry = Loadable(ReferralCountryPage);
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
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <Login /> },
        ],
      },
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            element: <Layout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'tasks', element: <TaskFlow /> },
              { path: 'profile', element: <Profile /> },
              { path: 'employee', element: <Employee /> },
              { path: 'employee/users', element: <Users /> },
              { path: 'clients', element: <Clients /> },
              { path: 'visa/applications', element: <Visa /> },
              { path: 'referal-letters', element: <ReferralLetter /> },
              { path: 'referral-letters', element: <Navigate to="/referal-letters" replace /> },
              { path: 'visa/package', element: <Package /> },
              { path: 'translation', element: <Translate /> },
              { path: 'outbound', element: <Outbound /> },
              { path: 'packages', element: <PackagesView /> },
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
              { path: 'reports/referral-letter', element: <ReferralLetterReport /> },
              { path: 'cafeteria', element: <Cafeteria /> },
              { path: 'finance', element: <Navigate to="/finance/cash-flow" replace /> },
              { path: 'finance/cash-flow', element: <FinanceCashFlow /> },
              { path: 'finance/overview', element: <FinanceOverview /> },
              { path: 'finance/offices', element: <FinanceOffices /> },
              { path: 'finance/salary', element: <FinanceSalary /> },
              {
                path: 'professional-translation',
                element: <ProfessionalTranslation />,
                children: [
                  { index: true, element: <Navigate to="office" replace /> },
                  { path: 'office', element: <Office /> },
                  { path: 'department', element: <Department /> },
                  { path: 'position', element: <Position /> },
                  { path: 'translator', element: <Translator /> },
                  { path: 'category', element: <Category /> },
                  { path: 'referral-country', element: <ReferralCountry /> },
                ],
              },
              { path: 'notifications', element: <Notification /> },
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
