import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;

  const ALWAYS_ALLOWED_PATHS = ['/profile', '/notifications', '/unauthorized', '/packages', '/finance'];

  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    const currentPath = location.pathname;
    const isAlwaysAllowed = ALWAYS_ALLOWED_PATHS.some(
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
