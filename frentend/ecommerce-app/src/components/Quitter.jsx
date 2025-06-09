
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../Services/auth"; // Adjust path as needed

const Quitter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await logout(); // Your logout service function
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    };

    handleLogout();
  }, [navigate]);

  return <div>Déconnexion en cours...</div>;
};

export default Quitter;
