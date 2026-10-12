import { lazy, Suspense, useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { Box } from '@mui/material';
import OguzLogo from '../assets/icons/OguzLogo';
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
const ReferralLetterPage = lazyRetry(() => import('../pages/ReferralLetter/ReferralLetterTabs'));
const PackagePage = lazyRetry(() => import('../pages/Visa/Package/Package'));
const PackagesViewPage = lazyRetry(() => import('../pages/Packages'));
const TranslatePage = lazyRetry(() => import('../pages/Translate'));
const OutboundPage = lazyRetry(() => import('../pages/Outbound/Outbound'));
const InboundPage = lazyRetry(() => import('../pages/Inbound'));
const VisaIntakePage = lazyRetry(() => import('../pages/VisaIntake'));
const TurkishAirlinesReportPage = lazyRetry(() => import('../pages/Reports/TurkishAirlinesReport'));
const TaskFlowPage = lazyRetry(() => import('../pages/TaskFlow'));
const NotificationPage = lazyRetry(() => import('../pages/Notification'));
const ProfilePage = lazyRetry(() => import('../pages/Profile/index'));
const CafeteriaPage = lazyRetry(() => import('../pages/Cafeteria'));
const FinanceCashFlowPage = lazyRetry(() => import('../pages/Finance/CashFlow'));
const FinanceOfficesPage = lazyRetry(() => import('../pages/Finance/Offices'));
const FinanceOfficeCashPage = lazyRetry(() => import('../pages/Finance/OfficeCash'));
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
      role="status"
      aria-busy="true"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        width: '100%',
        minHeight: '60vh',
        animation: 'pageLoaderIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        '@keyframes pageLoaderIn': {
          from: { opacity: 0, transform: 'scale(0.94)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes pageLoaderSpin': { to: { transform: 'rotate(360deg)' } },
        '@keyframes pageLoaderBreathe': {
          '0%, 100%': { opacity: 0.75, transform: 'scale(0.96)' },
          '50%': { opacity: 1, transform: 'scale(1)' },
        },
      }}
    >
      {/* Brand emblem inside a thin orbiting arc */}
      <Box
        sx={{
          position: 'relative',
          width: 76,
          height: 76,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 76 76"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animation: 'pageLoaderSpin 1.1s linear infinite',
          }}
        >
          <circle cx="38" cy="38" r="36" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="2" />
          <circle
            cx="38"
            cy="38"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="62 164"
          />
        </Box>
        <OguzLogo
          iconOnly
          sx={{
            width: 36,
            height: 'auto',
            animation: 'pageLoaderBreathe 1.8s ease-in-out infinite',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      </Box>
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
const Package = Loadable(PackagePage);
const PackagesView = Loadable(PackagesViewPage);
const Translate = Loadable(TranslatePage);
const Outbound = Loadable(OutboundPage);
const Inbound = Loadable(InboundPage);
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
const FinanceOffices = Loadable(FinanceOfficesPage);
const FinanceOfficeCash = Loadable(FinanceOfficeCashPage);
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
              { path: 'inbound', element: <Inbound /> },
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
              // The letter stock report is now a tab of the referral letters page.
              { path: 'reports/referral-letter', element: <Navigate to="/referal-letters?tab=stock" replace /> },
              { path: 'cafeteria', element: <Cafeteria /> },
              { path: 'finance', element: <Navigate to="/finance/cash-flow" replace /> },
              { path: 'finance/cash-flow', element: <FinanceCashFlow /> },
              // The finance report was merged into the dashboard; old links land there.
              { path: 'finance/overview', element: <Navigate to="/" replace /> },
              { path: 'finance/offices', element: <FinanceOffices /> },
              { path: 'finance/office-cash', element: <FinanceOfficeCash /> },
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
