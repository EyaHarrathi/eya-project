"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {  UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignupForm() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Évaluer la force du mot de passe
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Longueur minimale
    if (password.length >= 8) strength += 1;
    // Contient des chiffres
    if (/\d/.test(password)) strength += 1;
    // Contient des lettres minuscules et majuscules
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    // Contient des caractères spéciaux
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

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

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError("La confirmation du mot de passe est requise");
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setStatusMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("http://localhost:8080/utilisateur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          rawPassword: password,
          telephone: "",
          adresse: "",
          pays: "",
          etat: "",
          photoUrl: "",
          role: "ADMIN",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      setStatus("success");
      setStatusMessage(
        "Inscription réussie ! Vérifiez votre email pour activer votre compte."
      );

      // Redirection vers la page de connexion après un délai
      setTimeout(() => {
        window.location.href = "/admin-login";
      }, 2000);
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
          className="col-md-6 image-side"
          initial={{ opacity: 0, x: -50 }}
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
                <i className="bi bi-person-plus-fill"></i>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Rejoignez l'Équipe d'Administration
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                Créez votre compte administrateur pour accéder à toutes les
                fonctionnalités
              </motion.p>
              <motion.div
                className="features"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <div className="feature">
                  <i className="bi bi-shield-check"></i>
                  <span>Accès sécurisé</span>
                </div>
                <div className="feature">
                  <i className="bi bi-sliders"></i>
                  <span>Contrôle total</span>
                </div>
                <div className="feature">
                  <i className="bi bi-bar-chart"></i>
                  <span>Analyses avancées</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="col-md-6 form-side"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="signup-container">
            <div className="form-card">
              <div className="form-header">
                <h2>Créer un Compte Admin</h2>
                <p>
                  Inscrivez-vous pour accéder au tableau de bord administrateur
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

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nom">Nom</label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          id="nom"
                          placeholder="Votre nom"
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="prenom">Prénom</label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          id="prenom"
                          placeholder="Votre prénom"
                          value={prenom}
                          onChange={(e) => setPrenom(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Adresse Email</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        id="email"
                        className={emailError ? "error" : ""}
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        required
                      />
                    </div>
                    {emailError && (
                      <div className="error-message">{emailError}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Mot de Passe</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className={passwordError ? "error" : ""}
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                          if (confirmPassword)
                            validateConfirmPassword(confirmPassword);
                        }}
                        required
                      />
                    
                    </div>
                    {passwordError && (
                      <div className="error-message">{passwordError}</div>
                    )}

                    <div className="password-strength">
                      <div className="strength-bars">
                        <div
                          className={`strength-bar ${
                            passwordStrength >= 1 ? "active level-1" : ""
                          }`}
                        ></div>
                        <div
                          className={`strength-bar ${
                            passwordStrength >= 2 ? "active level-2" : ""
                          }`}
                        ></div>
                        <div
                          className={`strength-bar ${
                            passwordStrength >= 3 ? "active level-3" : ""
                          }`}
                        ></div>
                        <div
                          className={`strength-bar ${
                            passwordStrength >= 4 ? "active level-4" : ""
                          }`}
                        ></div>
                      </div>
                      <span className="strength-text">
                        {passwordStrength === 0 && "Très faible"}
                        {passwordStrength === 1 && "Faible"}
                        {passwordStrength === 2 && "Moyen"}
                        {passwordStrength === 3 && "Fort"}
                        {passwordStrength === 4 && "Très fort"}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirmer le Mot de Passe
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        className={confirmPasswordError ? "error" : ""}
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmPasswordError)
                            validateConfirmPassword(e.target.value);
                        }}
                        required
                      />
                      
                    </div>
                    {confirmPasswordError && (
                      <div className="error-message">
                        {confirmPasswordError}
                      </div>
                    )}
                  </div>

                  <div className="form-group terms-group">
                    <div className="checkbox-wrapper">
                      <input type="checkbox" id="termsAgreement" required />
                      <label htmlFor="termsAgreement">
                        J'accepte les <a href="#">conditions d'utilisation</a>{" "}
                        et la <a href="#">politique de confidentialité</a>
                      </label>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus size={20} />
                        <span>S'inscrire</span>
                      </>
                    )}
                  </motion.button>

                  <div className="form-footer">
                    <div className="secure-badge">
                      <i className="bi bi-shield-check"></i>
                      <span>Accès sécurisé avec SSL</span>
                    </div>
                    <p className="login-link">
                      Vous avez déjà un compte?{" "}
                      <Link to="/admin-login">Se connecter</Link>
                    </p>
                  </div>
                </form>
              </div>
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
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
            sans-serif;
        }

        .row {
          min-height: 100vh;
          display: flex;
          margin: 0;
        }

        /* Form Side */
        .form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-color: #fff;
          width: 50%;
        }

        /* Image Side */
        .image-side {
          width: 50%;
          background-color: #2563eb;
        }

        .admin-image-container {
          height: 100%;
          width: 100%;
          position: relative;
          background-image: url("https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");
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
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .icon-container i {
          font-size: 2.5rem;
        }

        .content h2 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
          border-radius: 12px;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
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

        /* Signup Form Styles */
        .signup-container {
          max-width: 550px;
          width: 100%;
        }

        .form-card {
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          background: white;
          border: none;
        }

        .form-header {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          padding: 30px;
          color: white;
          text-align: center;
          position: relative;
        }

        .form-header h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px;
        }

        .form-header p {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
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
          padding: 35px;
        }

        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 5px;
        }

        .form-row .form-group {
          flex: 1;
          width: 50%;
        }

        .form-group {
          margin-bottom: 25px;
          width: 100%;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
          font-size: 14px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .input-wrapper:focus-within {
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
          border-color: #3b82f6;
        }

        .input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background-color: white;
          color: #6b7280;
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          padding: 15px;
          font-size: 16px;
          outline: none;
          background: white;
        }

        .input-wrapper input.error {
          border-color: #ef4444;
        }

        .toggle-password {
          background: none;
          border: none;
          padding: 0 15px;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-message {
          color: #ef4444;
          font-size: 13px;
          margin-top: 5px;
        }

        .password-strength {
          margin-top: 10px;
        }

        .strength-bars {
          display: flex;
          gap: 5px;
          margin-bottom: 5px;
        }

        .strength-bar {
          height: 5px;
          flex: 1;
          background-color: #e5e7eb;
          border-radius: 2px;
          transition: background-color 0.3s ease;
        }

        .strength-bar.active.level-1 {
          background-color: #ef4444; /* red */
        }

        .strength-bar.active.level-2 {
          background-color: #f59e0b; /* amber */
        }

        .strength-bar.active.level-3 {
          background-color: #10b981; /* green */
        }

        .strength-bar.active.level-4 {
          background-color: #059669; /* emerald */
        }

        .strength-text {
          font-size: 13px;
          color: #6b7280;
        }

        .terms-group {
          margin-bottom: 30px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-top: 2px;
        }

        .checkbox-wrapper label {
          font-weight: 400;
          font-size: 14px;
          margin: 0;
          line-height: 1.4;
        }

        .checkbox-wrapper a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .checkbox-wrapper a:hover {
          text-decoration: underline;
        }

        .submit-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 15px 20px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .form-footer {
          margin-top: 30px;
          text-align: center;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .login-link {
          font-size: 15px;
          color: #4b5563;
        }

        .login-link a {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        .status-message {
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
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

        /* Responsive */
        @media (max-width: 992px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }

        @media (max-width: 768px) {
          .image-side {
            display: none;
          }

          .form-side {
            width: 100%;
          }

          .signup-container {
            max-width: 100%;
          }

          .form-body {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
}
