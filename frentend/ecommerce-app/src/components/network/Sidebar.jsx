import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaEnvelope,
  FaUserFriends,
  FaChevronRight,
  FaChevronLeft,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profils, setProfils] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const activeSection = location.pathname.split("/").pop();

  useEffect(() => {
    const fetchProfils = async () => {
      try {
        const response = await axios.get("http://localhost:8080/utilisateur");
        setProfils(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des profils", error);
      }
    };
    fetchProfils();
  }, []);

  const handleNavigation = (section) => {
    navigate(`/network/${section}`);
  };

  const getButtonStyle = (section) => ({
    display: "flex",
    alignItems: "center",
    borderRadius: "8px",
    padding: "12px 16px",
    margin: "4px 0",
    color: activeSection === section ? "#ffffff" : "#374151",
    backgroundColor: activeSection === section ? "#4F46E5" : "transparent",
    border: "none",
    width: "100%",
    transition: "all 0.2s ease",
    justifyContent: collapsed ? "center" : "flex-start",
    cursor: "pointer",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? "60px" : "240px",
          backgroundColor: "#ffffff",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e5e7eb",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            height: "60px",
          }}
        >
          {!collapsed && (
            <h5 style={{ margin: 0, fontWeight: "600", color: "#4F46E5" }}>
              Réseau
            </h5>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: "0.25rem",
              color: "#6B7280",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {collapsed ? (
              <FaChevronRight size={20} />
            ) : (
              <FaChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: "0.5rem" }}>
          <button
            onClick={() => handleNavigation("accueil")}
            style={getButtonStyle("accueil")}
          >
            <FaHome size={20} />
            {!collapsed && (
              <span style={{ marginLeft: "0.75rem", fontWeight: "500" }}>
                Accueil
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavigation("invitations")}
            style={getButtonStyle("invitations")}
          >
            <FaEnvelope size={20} />
            {!collapsed && (
              <span style={{ marginLeft: "0.75rem", fontWeight: "500" }}>
                Invitations
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavigation("amis")}
            style={getButtonStyle("amis")}
          >
            <FaUserFriends size={20} />
            {!collapsed && (
              <span style={{ marginLeft: "0.75rem", fontWeight: "500" }}>
                Amis
              </span>
            )}
          </button>

          {/* Logout (Quitter) Button */}
          <button
            onClick={() => navigate("/quitter")}
            style={getButtonStyle("quitter")}
          >
            <FaSignOutAlt size={20} />
            {!collapsed && (
              <span style={{ marginLeft: "0.75rem", fontWeight: "500" }}>
                Quitter
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: collapsed ? "60px" : "240px",
          transition: "margin-left 0.3s ease",
          padding: "2rem",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Outlet context={{ profils }} />
      </div>
    </div>
  );
};

export default Sidebar;
