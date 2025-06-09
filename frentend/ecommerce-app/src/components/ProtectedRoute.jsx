// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")); // or use your Context/Redux
  const location = useLocation();

  if (!user || user.role !== "ADMIN") {
    localStorage.removeItem("user");
    // Not logged in → redirect to login
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
