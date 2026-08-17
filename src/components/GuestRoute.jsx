import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../context/useAuth';
import { getRoleHomePath } from "../utils/auth";

const GuestRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }
  return <Outlet />;
};

export default GuestRoute;
