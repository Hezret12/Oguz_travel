import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../utils/auth';
import LoadingScreen from './LoadingScreen';

/**
 * GuestRoute — only allows unauthenticated users through.
 *
 * If a valid token + user session already exists the visitor is
 * redirected to their role-based home page instead of showing the
 * login screen. This prevents the flicker where an authenticated
 * user momentarily sees the login form before being redirected.
 *
 * Usage in the router:
 *   { element: <GuestRoute />, children: [{ path: '/login', element: <Login /> }] }
 */
const GuestRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // While the auth state is being resolved (cookie check + /auth/me),
  // show a full-screen loader to avoid any UI flash.
  if (loading) return <LoadingScreen />;

  // Authenticated users should never see the login page.
  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  // Not authenticated — render the child route (Login page).
  return <Outlet />;
};

export default GuestRoute;
