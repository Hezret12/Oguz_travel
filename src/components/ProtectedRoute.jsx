import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;

  if (Array.isArray(user.permissions) && user.permissions.length > 0 && location.pathname !== '/unauthorized') {
    const currentPath = location.pathname;
    const isAllowed = user.permissions.some(
      (permission) =>
        currentPath === permission || currentPath.startsWith(permission + '/')
    );

    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
