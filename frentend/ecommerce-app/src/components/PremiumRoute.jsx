
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const PremiumRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user) {
          setIsPremium(false);
          setIsLoading(false);
          return;
        }

        // Vérifier le statut premium via l'API
        const response = await fetch(
          "http://localhost:8080/utilisateur/check-premium",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium);
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error("Premium check error:", error);
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPremiumStatus();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isPremium) {
    // Rediriger vers la page premium si non abonné
    return <Navigate to="/premium" state={{ from: location }} replace />;
  }

  return children;
};

export default PremiumRoute;
