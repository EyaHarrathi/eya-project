"use client";
import { useState, useEffect } from "react";
import {
  User,
  ShoppingCart,
  ChevronDown,
  LogOut,
  Users,
  ShoppingBag,
  Store,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import Notifications from "./Notifications";
import Panier from "../commande/panier";
import { logout } from "../../Services/auth";

const NavbarComponent = ({ Search, onEnterPress }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCartPopup, setShowCartPopup] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const checkAuthStatus = () => {
      const hasUser = !!localStorage.getItem("userId");
      setIsOnline(hasUser);
    };

    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);

    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchCartItemCount = async () => {
      if (!userId) {
        setCartItemCount(0);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/cart/${userId}`);
        if (res.status === 404) {
          setCartItemCount(0);
        } else {
          const data = await res.json();
          if (data.success) {
            const count = data.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            setCartItemCount(count);
          }
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCartItemCount(0);
      }
    };

    fetchCartItemCount();
    const intervalId = setInterval(fetchCartItemCount, 60000);
    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        !event.target.closest(".account-dropdown-container")
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userToken");
    setIsOnline(false);
    window.location.href = "/login";
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg py-2 eco-navbar ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <div className="container-fluid">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <div className="shop-icon me-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="logo-text">
              Eco<span className="logo-accent">Market</span>
            </span>
          </Link>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-5 mb-2 mb-lg-0">
              <li className="nav-item me-3">
                <Link
                  to="/home"
                  className={`nav-link position-relative ${
                    window.location.pathname === "/home" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    if (window.location.pathname === "/home") {
                      e.preventDefault();
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  Accueil
                  <span className="active-indicator"></span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/#about-us"
                  className={`nav-link position-relative ${
                    window.location.hash === "#about-us" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    if (window.location.pathname === "/home") {
                      e.preventDefault();
                      document.getElementById("about-us")?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  À propos
                  <span className="active-indicator"></span>
                </Link>
              </li>
            </ul>
          </div>

          <SearchBar
            placeholder="Rechercher un produit..."
            onSearch={Search}
            onEnterPress={onEnterPress}
          />

          <div className="user-actions d-flex align-items-center">
            <div className="nav-item me-3">
              <Notifications isOnline={isOnline} />
            </div>

            <Link to="/profil" className="nav-link me-3">
              <div className="user-icon-container">
                <User size={20} />
              </div>
            </Link>

            <button
              className="cart-link btn"
              onClick={() => setShowCartPopup(true)}
            >
              <div className="cart-icon-container">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </div>
            </button>

            <div className="account-dropdown-container">
              <button
                className="manage-account-btn d-flex align-items-center"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Gérer le compte
                <ChevronDown
                  size={16}
                  className={`ms-2 ${showDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showDropdown && (
                <div className="account-dropdown">
                  <Link
                    to="/network"
                    className="dropdown-item dropdown-item-animated"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <Users size={18} className="me-2" />
                    Mes amis
                  </Link>
                  <Link
                    to="/commandevendeur"
                    className="dropdown-item dropdown-item-animated"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <Store size={18} className="me-2" />
                    Mes commandes traitées
                  </Link>
                  <Link
                    to="/commandeachteur"
                    className="dropdown-item dropdown-item-animated"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <ShoppingBag size={18} className="me-2" />
                    Mes commandes initiées
                  </Link>
                  <div
                    className="dropdown-divider dropdown-item-animated"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <button
                    onClick={logout}
                    className="dropdown-item text-danger dropdown-item-animated"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <LogOut size={18} className="me-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>

            <button
              className="navbar-toggler ms-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavbar"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>

      {showCartPopup && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            paddingTop: "50px",
          }}
          onClick={() => setShowCartPopup(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "50%",
              borderRadius: "15px",
            }}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "15px",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
                border: "none",
              }}
            >
              <div
                className="modal-header"
                style={{
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "0.5rem",
                }}
              >
                <h5
                  className="modal-title"
                  style={{ fontWeight: "600", color: "#333" }}
                >
                  Mon Panier
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCartPopup(false)}
                  style={{
                    border: "none",
                    color: "#888",
                  }}
                ></button>
              </div>

              <div
                className="modal-body"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  padding: "2rem",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                <Panier />
              </div>

              <div
                className="modal-footer"
                style={{ borderTop: "1px solid #e0e0e0" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCartPopup(false)}
                  style={{
                    backgroundColor: "#28a745",
                    borderColor: "#28a745",
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          html {
            scroll-behavior: smooth;
          }

          /* Navbar Styling */
          .eco-navbar {
            background: transparent;
            color: white;
            padding: 0.75rem 1rem;
            box-shadow: none;
            position: sticky;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
          }

         .eco-navbar.scrolled {
          padding: 0.5rem 0;
          
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

          /* Navigation Links */
          .nav-link {
            color: black !important;
            font-weight: 500;
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            position: relative;
            transform-origin: center;
          }

          .nav-link:hover {
            transform: scale(1.05);
            color: #28a745 !important;
          }

          .nav-link:active {
            transform: scale(0.95);
            transition: transform 0.1s ease;
          }

          .nav-link.active .active-indicator {
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #28a745;
            transform: scaleX(1);
            transition: transform 0.3s ease;
          }

          .nav-link .active-indicator {
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #28a745;
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }

          .nav-link:hover .active-indicator {
            transform: scaleX(1);
          }

          /* Logo */
          .logo-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: black;
            letter-spacing: -0.5px;
            transition: all 0.3s ease;
            position: relative;
          }

          .logo-text::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: #28a745;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s ease;
          }

          .navbar-brand:hover .logo-text::after {
            transform: scaleX(1);
          }

          .logo-accent {
            color: #28a745;
          }

          /* Search Container */
          .search-container-wrapper {
            flex: 1;
            max-width: 600px;
            margin: 0 1.5rem;
          }

          .search-input-wrapper {
            display: flex;
            align-items: center;
            background-color: #f8f9fa;
            border-radius: 25px;
            padding: 0.5rem 1.2rem;
            transition: all 0.3s ease;
            border: 1px solid #dee2e6;
          }

          .search-input-wrapper:focus-within {
            background-color: #fff;
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15);
            border-color: #28a745;
          }

          .search-icon {
            color: #6c757d;
            flex-shrink: 0;
          }

          /* User Actions */
          .user-actions {
            display: flex;
            align-items: center;
          }

          .user-icon-container, .cart-icon-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f5f5f5;
            color: #4b5563;
            transition: all 0.2s ease;
            position: relative; /* Assure que le badge est positionné par rapport à ce conteneur */
          }

          .user-icon-container:hover, .cart-icon-container:hover {
            background-color: #e5e7eb;
            color: #28a745;
            transform: translateY(-2px);
          }

          /* Nouveau style pour que le badge suive le conteneur lors du survol */
          .cart-icon-container:hover .cart-badge {
            transform: translateY(-2px); /* Même transformation que le conteneur */
          }

          /* Cart Badge */
          .cart-link {
            position: relative;
            display: inline-block; /* Assure que le bouton a une taille définie */
          }

          .cart-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
           background-color: #dc3545 !important; /* Rouge vif */
            color: white;   
            font-size: 0.7rem;
            
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            pointer-events: none; /* Empêche le badge de recevoir des événements de souris */
            transform: translate(0, 0); /* Force la position fixe */
            z-index: 2; /* S'assure que le badge reste au-dessus */
          }

          /* Manage Account Button */
          .manage-account-btn {
            padding: 0.5rem 1rem;
            background-color: #f5f5f5;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            color: #4b5563;
            font-weight: 500;
            font-size: 0.9rem;
            text-decoration: none;
            transition: all 0.2s ease;
            white-space: nowrap;
            cursor: pointer;
            display: flex;
            align-items: center;
          }

          .manage-account-btn:hover {
            background-color: #e5e7eb;
            color: #28a745;
            transform: translateY(-2px);
          }

          .rotate-180 {
            transform: rotate(180deg);
            transition: transform 0.2s ease;
          }

          /* Account Dropdown */
          .account-dropdown-container {
            position: relative;
          }

          .account-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 240px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 0.5rem 0;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
            border: 1px solid #f0f0f0;
            overflow: hidden;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .dropdown-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            color: #4b5563;
            font-weight: 500;
            transition: all 0.2s ease;
            text-decoration: none;
            cursor: pointer;
            border: none;
            background: transparent;
            width: 100%;
            text-align: left;
          }

          .dropdown-item:hover {
            background-color: #f9fafb;
            color: #28a745;
          }

          .dropdown-item.text-danger:hover {
            background-color: #fee2e2;
            color: #ef4444;
          }

          .dropdown-divider {
            height: 1px;
            background-color: #f0f0f0;
            margin: 0.5rem 0;
          }

          /* Notification Button */
          .notification-btn {
            color: black !important;
            display: flex;
            align-items: center;
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            border: none;
            background: transparent;
            cursor: pointer;
            position: relative;
          }

          .notification-btn:hover {
            color: #28a745 !important;
            background-color: rgba(40, 167, 69, 0.2);
            transform: translateY(-2px);
          }

          .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #FA5CA6FF !important; /* Même rouge que le panier */
             color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          /* Enhanced Notifications Modal */
          .notifications-modal .modal-content {
            border-radius: 12px;
            border: none;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            overflow: hidden;
          }

          .notifications-dialog {
            max-width: 700px;
          }

          .notifications-header-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .notification-count-badge {
            background-color: #f1f5f9;
            color: #64748b;
            font-size: 12px;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 20px;
          }

          .notifications-body {
            padding: 0;
            max-height: 70vh;
            overflow-y: auto;
          }

          .notifications-container {
            padding: 16px;
          }

          /* Notifications Toolbar */
          .notifications-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #f1f5f9;
          }

          .toolbar-actions {
            display: flex;
            gap: 8px;
          }

          /* Filter Dropdown */
          .filter-dropdown {
            position: relative;
          }

          .filter-button {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .filter-button:hover {
            background-color: #f1f5f9;
          }

          .filter-button .rotate {
            transform: rotate(180deg);
            transition: transform 0.2s ease;
          }

          .filter-menu {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            width: 240px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 10;
            overflow: hidden;
            animation: slideDown 0.2s ease;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .filter-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .filter-option:hover {
            background-color: #f8fafc;
          }

          .filter-option.active {
            background-color: #f1f5f9;
            color: #28a745;
            font-weight: 500;
          }

          .refresh-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .refresh-button:hover {
            background-color: #f1f5f9;
          }

          .mark-all-read-button {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            color: #28a745;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .mark-all-read-button:hover {
            background-color: #d4edda;
          }

          /* Loading State */
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 0;
            color: #94a3b8;
          }

          .loader {
            width: 36px;
            height: 36px;
            border: 3px solid #e2e8f0;
            border-radius: 50%;
            border-top-color: #28a745;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Error State */
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 0;
            text-align: center;
            color: #ef4444;
          }

          .retry-button {
            margin-top: 16px;
            padding: 8px 16px;
            background-color: #fee2e2;
            color: #ef4444;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .retry-button:hover {
            background-color: #fecaca;
          }

          /* Empty State */
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 0;
            text-align: center;
          }

          .empty-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background-color: #f8fafc;
            border-radius: 50%;
            margin-bottom: 16px;
            color: #94a3b8;
          }

          .empty-state h3 {
            font-size: 18px;
            font-weight: 600;
            color: #475569;
            margin: 0 0 8px 0;
          }

          .empty-state p {
            font-size: 14px;
            color: #64748b;
            margin: 0;
          }

          /* Login Prompt */
          .login-prompt {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 0;
            text-align: center;
          }

          .login-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background-color: #f8fafc;
            border-radius: 50%;
            margin-bottom: 16px;
            color: #64748b;
          }

          .login-prompt h3 {
            font-size: 18px;
            font-weight: 600;
            color: #475569;
            margin: 0 0 8px 0;
          }

          .login-prompt p {
            font-size: 14px;
            color: #64748b;
            margin: 0;
          }

          /* Notifications List */
          .notifications-list {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .notification-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .group-header {
            font-size: 14px;
            font-weight: 600;
            color: #64748b;
            padding: 0 0 8px 0;
            border-bottom: 1px solid #f1f5f9;
          }

          .notification-card {
            display: flex;
            align-items: flex-start;
            padding: 16px;
            border-radius: 10px;
            background-color: #ffffff;
            border: 1px solid #f1f5f9;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .notification-card:hover {
            background-color: #f8fafc;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .notification-card.unread {
            background-color: #d4edda;
            border-left: 3px solid #28a745;
          }

          .notification-left {
            margin-right: 16px;
          }

          .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #f8fafc;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .notification-content {
            flex: 1;
          }

          .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .notification-type {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }

          .notification-time {
            font-size: 12px;
            color: #94a3b8;
          }

          .notification-message {
            font-size: 14px;
            color: #334155;
            line-height: 1.5;
          }

          .notification-actions {
            display: flex;
            gap: 8px;
            margin-left: 12px;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .notification-card:hover .notification-actions {
            opacity: 1;
          }

          .action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: none;
            background-color: #f1f5f9;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #64748b;
          }

          .read-button:hover {
            background-color: #d4edda;
            color: #28a745;
          }

          .delete-button:hover {
            background-color: #fee2e2;
            color: #ef4444;
          }

          /* Dropdown Animation */
          .dropdown-item-animated {
            animation: slideInFromLeft 0.5s ease forwards;
            opacity: 0;
            transform: translateX(-30px);
          }

          @keyframes slideInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Responsive Adjustments */
          @media (max-width: 992px) {
            .nav-item {
              margin: 0 0.5rem;
            }

            .nav-text {
              display: none;
            }

            .nav-icon {
              margin-right: 0;
            }

            .filter-button span {
              display: none;
            }

            .filter-button {
              width: 36px;
              height: 36px;
              padding: 0;
              justify-content: center;
            }

            .notification-actions {
              opacity: 1;
            }
          }

          @media (max-width: 768px) {
            .premium-navbar, .eco-navbar {
              padding: 0.5rem;
            }

            .notifications-toolbar {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }

            .toolbar-actions {
              width: 100%;
              justify-content: space-between;
            }

            .notification-card {
              padding: 12px;
            }

            .user-avatar {
              width: 40px;
              height: 40px;
            }
          }
        `}
      </style>
    </>
  );
};

export default NavbarComponent;