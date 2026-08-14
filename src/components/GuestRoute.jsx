import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../utils/auth';

/**
 * GuestRoute — only allows unauthenticated users through.
 *
 * If a valid token + user session already exists the visitor is
 * redirected to their role-based home page instead of showing the
 * login screen.
 *
 * Usage in the router:
 *   { element: <GuestRoute />, children: [{ path: '/login', element: <Login /> }] }
 */
const GuestRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // While initial auth state resolves, return null so App.jsx splash screen covers the transition seamlessly.
  if (loading) return null;

  // Authenticated users should never see the login page.
  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  // Not authenticated — render the child route (Login page).
  return <Outlet />;
};

export default GuestRoute;
