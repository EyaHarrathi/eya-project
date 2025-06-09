"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("L'email est requis");
      return false;
    } else if (!re.test(email)) {
      setEmailError("Format d'email invalide");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Le mot de passe est requis");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("http://localhost:8080/utilisateur/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email ou mot de passe incorrect");
      }

      // Vérifier si l'utilisateur a le rôle ADMIN
      if (data.role !== "ADMIN") {
        throw new Error("Accès réservé aux administrateurs");
      }

      // Stockage des informations utilisateur
      localStorage.setItem("user", JSON.stringify(data));
      setStatus("success");
      setStatusMessage("Connexion réussie !");

      // Redirection après un court délai
      setTimeout(() => {
        window.location.href = "/dash";
      }, 1000);
    } catch (error) {
      console.error("Erreur:", error);
      setStatus("error");
      setStatusMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="row g-0 h-100">
        <motion.div
          className="col-md-6 form-side"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-container">
            <div className="form-card">
              <div className="form-header">
                <h2 className="text-white m-0 fw-bold">
                  Espace Administrateur
                </h2>
                <p className="text-white-50 m-0 mt-2">
                  Connectez-vous pour accéder à votre tableau de bord
                </p>
              </div>

              <div className="form-body">
                <AnimatePresence>
                  {status && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`status-message ${
                        status === "success" ? "status-success" : "status-error"
                      }`}
                    >
                      {status === "success" ? (
                        <CheckCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      {statusMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="admin-notice">
                  <ShieldAlert size={20} />
                  <span>Accès réservé aux administrateurs</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-floating-label mb-4">
                    <label htmlFor="email">Adresse Email</label>
                    <div className="input-group input-group-lg input-group-custom">
                      <span className="input-group-text input-group-text-custom">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className={`form-control form-control-lg form-control-custom ${
                          emailError ? "is-invalid" : ""
                        }`}
                        id="email"
                        placeholder=""
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        required
                      />
                    </div>
                    {emailError && (
                      <div className="invalid-feedback d-block">
                        {emailError}
                      </div>
                    )}
                  </div>

                  <div className="form-floating-label mb-4">
                    <label htmlFor="password">Mot de Passe</label>
                    <div className="input-group input-group-lg input-group-custom">
                      <span className="input-group-text input-group-text-custom">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg form-control-custom ${
                          passwordError ? "is-invalid" : ""
                        }`}
                        id="password"
                        placeholder=""
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                        }}
                        required
                      />
                      <button
                        className="input-group-text input-group-text-custom"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <div className="invalid-feedback d-block">
                        {passwordError}
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Se souvenir de moi
                      </label>
                    </div>
                    <a
                      href="/password"
                      className="text-decoration-none forgot-password"
                    >
                      Mot de passe oublié?
                    </a>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center btn-login"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <LogIn className="me-2" size={20} />
                        Se Connecter
                      </>
                    )}
                  </motion.button>

                  <div className="text-center mt-4">
                    <p className="text-muted mb-3">
                      Accès sécurisé avec <i className="bi bi-shield-check"></i>{" "}
                      SSL
                    </p>
                    <p className="signup-link">
                      Vous n'avez pas de compte?{" "}
                      <Link to="/admin-signup" className="fw-bold text-primary">
                        S'inscrire
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="col-md-6 image-side"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="admin-image-container">
            <div className="overlay"></div>
            <div className="content">
              <motion.div
                className="icon-container"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <i className="bi bi-shield-lock-fill"></i>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Tableau de Bord Administrateur
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                Gérez votre plateforme en toute sécurité
              </motion.p>
              <motion.div
                className="features"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <div className="feature">
                  <i className="bi bi-graph-up"></i>
                  <span>Statistiques en temps réel</span>
                </div>
                <div className="feature">
                  <i className="bi bi-people"></i>
                  <span>Gestion des utilisateurs</span>
                </div>
                <div className="feature">
                  <i className="bi bi-gear"></i>
                  <span>Configuration avancée</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        /* Base Styles */
        .admin-auth-container {
          min-height: 100vh;
          background-color: #f8f9fa;
          overflow: hidden;
        }

        .row {
          min-height: 100vh;
        }

        /* Form Side */
        .form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-color: #fff;
        }

        /* Image Side */
        .image-side {
          background-color: #2563eb;
        }

        .admin-image-container {
          height: 100%;
          width: 100%;
          position: relative;
          background-image: url("https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(37, 99, 235, 0.9),
            rgba(29, 78, 216, 0.85)
          );
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          padding: 2rem;
          max-width: 500px;
        }

        .icon-container {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .icon-container i {
          font-size: 2.5rem;
        }

        .content h2 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .content p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .feature:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(5px);
        }

        .feature i {
          font-size: 1.25rem;
        }

        .feature span {
          font-weight: 500;
        }

        /* Login Form Styles */
        .login-container {
          max-width: 550px;
          width: 100%;
        }

        .form-card {
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          background: white;
          border: none;
        }

        .form-header {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          padding: 25px;
          position: relative;
        }

        .form-header::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(
            90deg,
            #2563eb,
            #3b82f6,
            #60a5fa,
            #3b82f6,
            #2563eb
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .form-body {
          padding: 30px;
        }

        .admin-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: rgba(37, 99, 235, 0.1);
          border: 1px solid rgba(37, 99, 235, 0.3);
          color: #1e40af;
          padding: 12px 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-weight: 500;
          font-size: 14px;
        }

        .input-group-custom {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .input-group-custom:focus-within {
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
        }

        .form-control-custom {
          border: 1px solid #e5e7eb;
          border-right: none;
          padding: 12px 20px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .form-control-custom:focus {
          box-shadow: none;
          border-color: #3b82f6;
        }

        .input-group-text-custom {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-left: none;
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .btn-login {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border: none;
          border-radius: 12px;
          padding: 12px 20px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .form-check-input:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .forgot-password {
          color: #3b82f6;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .forgot-password:hover {
          color: #2563eb;
          text-decoration: underline !important;
        }

        .status-message {
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status-success {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #065f46;
        }

        .status-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #b91c1c;
        }

        .form-floating-label {
          position: relative;
          margin-bottom: 20px;
        }

        .form-floating-label label {
          position: absolute;
          top: 0;
          left: 15px;
          transform: translateY(-50%);
          background: white;
          padding: 0 8px;
          font-size: 14px;
          color: #6b7280;
          pointer-events: none;
          z-index: 1;
        }

        .signup-link {
          margin-top: 1rem;
        }

        .signup-link a {
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .image-side {
            display: none;
          }

          .form-side {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
