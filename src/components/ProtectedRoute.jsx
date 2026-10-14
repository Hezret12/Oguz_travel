import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { canViewDashboard } from '../utils/auth';
import { PATHS } from '../routes/paths';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;

  // Matched with their sub-paths. Finance is listed page by page (these match
  // the `alwaysVisible` sidebar items) so permission-gated pages under it,
  // like /finance/salary, are not opened to everyone.
  const ALWAYS_ALLOWED_PATHS = [
    '/profile',
    '/notifications',
    '/unauthorized',
    '/packages',
    '/finance/cash-flow',
    '/finance/overview',
  ];
  // Matched exactly: '/finance' only redirects to /finance/cash-flow.
  const ALWAYS_ALLOWED_EXACT_PATHS = ['/finance'];

  const { permissions } = user;
  // An empty list restricts too: such a user has no pages beyond the open ones.
  if (Array.isArray(permissions) && !permissions.includes('*')) {
    const currentPath = location.pathname;

    // '/' is where login, the logo and "go home" land, so a user without the
    // dashboard goes to their profile, which every user can open.
    if (currentPath === PATHS.ROOT) {
      if (!canViewDashboard(user)) {
        return <Navigate to={PATHS.PROFILE} replace />;
      }
      return <Outlet />;
    }

    const isAlwaysAllowed =
      ALWAYS_ALLOWED_EXACT_PATHS.includes(currentPath) ||
      ALWAYS_ALLOWED_PATHS.some(
        (path) => currentPath === path || currentPath.startsWith(path + '/')
      );

    if (!isAlwaysAllowed) {
      const isAllowed = permissions.some(
        (permission) =>
          currentPath === permission || currentPath.startsWith(permission + '/')
      );

      if (!isAllowed) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
