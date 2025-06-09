// src/components/UserProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const UserProtectedRoute = ({ children }) => {
  const [isValidSession, setIsValidSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setIsValidSession(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/utilisateur/check-session', {
          credentials: 'include' // Ensures cookies are sent
        });
        
        if (response.ok) {
          setIsValidSession(true);
        } else {
          localStorage.removeItem("user");
          setIsValidSession(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem("user");
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  if (isValidSession === null) {
    // Session check in progress
    return <div>Loading...</div>;
  }

  if (!isValidSession) {
    // No valid session → redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (user.role !== "USER" && user.role !== "PREMIUM_USER") {
    // Invalid role → redirect
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserProtectedRoute;