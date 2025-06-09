import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const BoutiqueProtectedRoute = ({ children }) => {
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
        const response = await fetch(
          "http://localhost:8080/utilisateur/check-session",
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          setIsValidSession(true);
        } else {
          localStorage.removeItem("user");
          setIsValidSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        localStorage.removeItem("user");
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  if (isValidSession === null) {
    return <div>Loading...</div>;
  }

  if (!isValidSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  // Only allow PREMIUM_USER access
  if (user.role !== "PREMIUM_USER") {
    // Redirect to unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default BoutiqueProtectedRoute;
