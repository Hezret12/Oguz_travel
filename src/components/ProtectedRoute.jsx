import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

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
  // Matched exactly: '/finance' only redirects to /finance/cash-flow, and the
  // dashboard ('/') shows a user without its permission their own office only.
  const ALWAYS_ALLOWED_EXACT_PATHS = ['/', '/finance'];

  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    const currentPath = location.pathname;
    const isAlwaysAllowed =
      ALWAYS_ALLOWED_EXACT_PATHS.includes(currentPath) ||
      ALWAYS_ALLOWED_PATHS.some(
        (path) => currentPath === path || currentPath.startsWith(path + '/')
      );

    if (!isAlwaysAllowed) {
      const isAllowed = user.permissions.some(
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
