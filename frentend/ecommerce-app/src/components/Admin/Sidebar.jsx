"use client";

import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../theme-context"; // Import useTheme hook

const Sidebar = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const { currentTheme, toggleTheme } = useTheme(); // Use the theme context

  // Manage body overflow
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="sidebar-wrapper">
      <div
        className={`sidebar ${
          currentTheme === "dark" ? "sidebar-dark" : "sidebar-light"
        }`}
      >
        {user && (
          <div className="user-profile">
            <div className="user-avatar">
              {user.prenom?.charAt(0)}
              {user.nom?.charAt(0)}
            </div>
            <div className="user-info">
              <h5>
                {user.prenom} {user.nom}
              </h5>
              <p>Administrateur</p>
            </div>
          </div>
        )}

        <div className="sidebar-content">
          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink
                to="/dash/dashboard"
                className={({ isActive }) =>
                  `nav-link d-flex flex-column align-items-center py-3 ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <i className="bi bi-speedometer2 fs-4"></i>
                <span className="small mt-1">Tableau de bord</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/dash/boutiques"
                className={({ isActive }) =>
                  `nav-link d-flex flex-column align-items-center py-3 ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <i className="bi bi-shop fs-4"></i>
                <span className="small mt-1">Boutiques</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/dash/users"
                className={({ isActive }) =>
                  `nav-link d-flex flex-column align-items-center py-3 ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <i className="bi bi-people fs-4"></i>
                <span className="small mt-1">Utilisateurs</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/dash/settings"
                className={({ isActive }) =>
                  `nav-link d-flex flex-column align-items-center py-3 ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <i className="bi bi-gear fs-4"></i>
                <span className="small mt-1">Paramètres</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* <div className="theme-toggle mt-3 text-center">
          <button
            className={`btn btn-sm ${
              currentTheme === "dark" ? "btn-light" : "btn-dark"
            }`}
            onClick={toggleTheme}
          >
            <i
              className={`bi ${
                currentTheme === "dark" ? "bi-sun" : "bi-moon"
              } me-2`}
            ></i>
            {currentTheme === "dark" ? "Mode Clair" : "Mode Sombre"}
          </button>
        </div> */}

        <div className="logout-button">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            Se déconnecter
          </button>
        </div>
      </div>

      <style jsx>{`
        .sidebar-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 250px;
          z-index: 100;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding-top: 1rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
        }

        .user-info h5 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .user-info p {
          margin: 0;
          font-size: 14px;
          color: #6c757d;
        }

        .nav-link {
          border-radius: 8px;
          margin: 5px 10px;
          transition: all 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          background-color: rgba(13, 110, 253, 0.1);
        }

        .nav-link.active {
          border-left: 3px solid #0d6efd;
        }

        .logout-button {
          padding: 15px;
          margin-top: auto;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 10px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          color: #dc3545;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background-color: #dc3545;
          color: white;
        }

        .logout-btn i {
          margin-right: 8px;
        }

        .theme-toggle {
          padding: 0 15px;
        }

        /* Dark theme styles */
        .sidebar-light {
          background-color: #f8f9fa;
          color: #212529;
        }

        .sidebar-dark {
          background-color: #212529;
          color: #f8f9fa;
        }

        .sidebar-dark .nav-link {
          color: #f8f9fa;
        }

        .sidebar-dark .user-info p {
          color: #adb5bd;
        }

        .sidebar-dark .logout-btn {
          background-color: #343a40;
          border-color: #495057;
        }

        .sidebar-dark .nav-link:hover,
        .sidebar-dark .nav-link.active {
          background-color: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .sidebar-wrapper {
            width: 100%;
            height: 100%;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar-wrapper.show {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
