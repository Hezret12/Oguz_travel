import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;

  if (user.permissions && location.pathname !== '/unauthorized') {
    const currentPath = location.pathname;
    const isAllowed = user.permissions.some(
      (permission) =>
        currentPath === permission || permission.startsWith(currentPath + '/')
    );

    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
