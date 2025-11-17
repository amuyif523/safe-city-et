import { Navigate, Outlet, useLocation } from "react-router-dom";

import type { RoleName } from "../types/user";
import useAuth from "../hooks/useAuth";

interface Props {
  allowedRoles?: RoleName[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const location = useLocation();
  const { token, user, hasRole, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
