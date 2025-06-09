"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [activeCodeInput, setActiveCodeInput] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Validation simple de l'email
  const isEmailValid = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Validation du mot de passe
  const isPasswordValid = (password) => {
    return password.length >= 8; // Exemple : au moins 8 caractères
  };

  // Effacer les messages d'erreur et de succès
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Vérifier la force du mot de passe
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setPasswordStrength(score);
  };

  // Gérer le changement de mot de passe
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  // Gérer le changement de code
  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    const newCodeDigits = [...codeDigits];
    newCodeDigits[index] = value;
    setCodeDigits(newCodeDigits);

    // Mettre à jour le code complet
    setCode(newCodeDigits.join(""));

    // Passer au champ suivant si un chiffre est entré
    if (value !== "" && index < 5) {
      setActiveCodeInput(index + 1);
    }
  };

  // Gérer le focus sur les champs de code
  const handleCodeInputFocus = (index) => {
    setActiveCodeInput(index);
  };

  // Gérer les touches spéciales pour les champs de code
  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (codeDigits[index] === "" && index > 0) {
        setActiveCodeInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setActiveCodeInput(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      setActiveCodeInput(index + 1);
    }
  };

  // Mettre à jour le focus sur le champ de code actif
  useEffect(() => {
    const inputElement = document.getElementById(
      `code-input-${activeCodeInput}`
    );
    if (inputElement) {
      inputElement.focus();
    }
  }, [activeCodeInput]);

  // Gérer le compte à rebours pour la réexpédition du code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Étape 1 : Envoyer le code de réinitialisation
  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!isEmailValid(email)) {
      setError("L'email que vous avez entré est invalide.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(
        "http://localhost:8080/api/password/send-reset-link",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de l'envoi du code de réinitialisation."
        );
      }

      setSuccess("Un code de réinitialisation a été envoyé à votre email.");
      setStep(2); // Passer à l'étape 2
      setCountdown(60); // Démarrer le compte à rebours de 60 secondes
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Vérifier le code de réinitialisation
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Veuillez entrer le code de réinitialisation complet.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(
        "http://localhost:8080/api/password/verify-reset-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Code invalide ou expiré.");
      }

      setSuccess("Code vérifié avec succès.");
      setStep(3); // Passer à l'étape 3
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Étape 3 : Réinitialiser le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(
        "http://localhost:8080/api/password/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la réinitialisation du mot de passe."
        );
      }

      setSuccess("Mot de passe réinitialisé avec succès.");
      setTimeout(() => {
        window.location.href = "/login"; // Rediriger vers la page de connexion après 2 secondes
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Revenir à l'étape précédente
  const goBack = () => {
    clearMessages();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Renvoyer le code
  const resendCode = async () => {
    if (countdown > 0) return;

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(
        "http://localhost:8080/api/password/send-reset-link",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de l'envoi du code de réinitialisation."
        );
      }

      setSuccess(
        "Un nouveau code de réinitialisation a été envoyé à votre email."
      );
      setCountdown(60); // Redémarrer le compte à rebours
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le titre de l'étape actuelle
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Réinitialisation du mot de passe";
      case 2:
        return "Vérification du code";
      case 3:
        return "Nouveau mot de passe";
      default:
        return "Réinitialisation du mot de passe";
    }
  };

  // Obtenir la description de l'étape actuelle
  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Entrez votre adresse email pour recevoir un code de réinitialisation.";
      case 2:
        return `Nous avons envoyé un code à ${email}. Veuillez le saisir ci-dessous.`;
      case 3:
        return "Créez un nouveau mot de passe sécurisé pour votre compte.";
      default:
        return "";
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Particules animées */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Vagues animées */}
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
      </div>

      <div className="content-container">
        <motion.div
          className="card-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* En-tête de la carte */}
          <div className="card-header">
            {step > 1 && (
              <button
                className="back-button"
                onClick={goBack}
                disabled={loading}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="step-indicator">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`step-dot ${s === step ? "active" : ""} ${
                    s < step ? "completed" : ""
                  }`}
                >
                  {s < step && <CheckCircle size={16} />}
                </div>
              ))}
            </div>
          </div>

          {/* Corps de la carte */}
          <div className="card-body">
            <h2 className="card-title">{getStepTitle()}</h2>
            <p className="card-description">{getStepDescription()}</p>

            {/* Messages d'erreur et de succès */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="alert alert-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="alert alert-success"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CheckCircle size={20} />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formulaires pour chaque étape */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="email-form"
                  onSubmit={handleSendCode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-group">
                    <label htmlFor="email">Adresse email</label>
                    <div className="input-container">
                      <Mail className="input-icon" size={20} />
                      <input
                        type="email"
                        id="email"
                        placeholder="Entrez votre adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="spinner" size={20} />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      "Recevoir le code"
                    )}
                  </button>

                  <div className="form-footer">
                    <a href="/login" className="link">
                      Retour à la connexion
                    </a>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="code-form"
                  onSubmit={handleVerifyCode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-group">
                    <label htmlFor="code">Code de vérification</label>
                    <div className="code-input-container">
                      {codeDigits.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-input-${index}`}
                          type="text"
                          className="code-input"
                          maxLength={1}
                          pattern="[0-9]"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) =>
                            handleCodeChange(index, e.target.value)
                          }
                          onFocus={() => handleCodeInputFocus(index)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          required
                        />
                      ))}
                    </div>
                    <div className="resend-code">
                      {countdown > 0 ? (
                        <span>Renvoyer le code dans {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          className="resend-button"
                          onClick={resendCode}
                          disabled={loading}
                        >
                          Renvoyer le code
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader className="spinner" size={20} />
                        <span>Vérification en cours...</span>
                      </>
                    ) : (
                      "Vérifier le code"
                    )}
                  </button>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="password-form"
                  onSubmit={handleResetPassword}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-group">
                    <label htmlFor="newPassword">Nouveau mot de passe</label>
                    <div className="input-container">
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        placeholder="Entrez votre nouveau mot de passe"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {/* Indicateur de force du mot de passe */}
                    {newPassword && (
                      <div className="password-strength">
                        <div className="strength-bars">
                          <div
                            className={`strength-bar ${
                              passwordStrength >= 1 ? "active" : ""
                            }`}
                          ></div>
                          <div
                            className={`strength-bar ${
                              passwordStrength >= 2 ? "active" : ""
                            }`}
                          ></div>
                          <div
                            className={`strength-bar ${
                              passwordStrength >= 3 ? "active" : ""
                            }`}
                          ></div>
                          <div
                            className={`strength-bar ${
                              passwordStrength >= 4 ? "active" : ""
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
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </label>
                    <div className="input-container">
                      <Key className="input-icon" size={20} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Confirmez votre nouveau mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {/* Indicateur de correspondance des mots de passe */}
                    {confirmPassword && (
                      <div
                        className={`password-match ${
                          newPassword === confirmPassword ? "match" : "no-match"
                        }`}
                      >
                        {newPassword === confirmPassword ? (
                          <>
                            <CheckCircle size={16} />
                            <span>Les mots de passe correspondent</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} />
                            <span>Les mots de passe ne correspondent pas</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="spinner" size={20} />
                        <span>Réinitialisation en cours...</span>
                      </>
                    ) : (
                      "Réinitialiser le mot de passe"
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        /* Styles de base */
        .forgot-password-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a2e36 0%, #0f5011 100%);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* Particules animées */
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .particle {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: float 15s infinite linear;
        }

        ${[...Array(20)]
          .map(
            (_, i) => `
          .particle-${i + 1} {
            width: ${Math.random() * 10 + 2}px;
            height: ${Math.random() * 10 + 2}px;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.1};
            animation-duration: ${Math.random() * 20 + 10}s;
            animation-delay: ${Math.random() * 5}s;
          }
        `
          )
          .join("")}

        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(
              ${Math.random() * 100 - 50}px,
              ${Math.random() * 100 - 50}px
            );
          }
          50% {
            transform: translate(
              ${Math.random() * 100 - 50}px,
              ${Math.random() * 100 - 50}px
            );
          }
          75% {
            transform: translate(
              ${Math.random() * 100 - 50}px,
              ${Math.random() * 100 - 50}px
            );
          }
          100% {
            transform: translate(0, 0);
          }
        }

        /* Vagues animées */
        .wave-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 200px;
          overflow: hidden;
          z-index: 1;
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fillOpacity='0.1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: repeat-x;
          background-size: 50% 100%;
          animation: wave 20s linear infinite;
        }

        .wave1 {
          opacity: 0.3;
          animation-duration: 20s;
        }

        .wave2 {
          opacity: 0.2;
          animation-duration: 15s;
          animation-direction: reverse;
        }

        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Conteneur principal */
        .content-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 500px;
        }

        /* Carte */
        .card-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          position: relative;
        }

        .card-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .back-button {
          position: absolute;
          left: 20px;
          background: none;
          border: none;
          color: #0f5011;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background-color: rgba(15, 80, 17, 0.1);
        }

        .back-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .step-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          transition: all 0.3s ease;
        }

        .step-dot::before {
          content: "";
          position: absolute;
          top: 50%;
          right: 100%;
          width: 10px;
          height: 2px;
          background-color: #e0e0e0;
          transform: translateY(-50%);
        }

        .step-dot:first-child::before {
          display: none;
        }

        .step-dot.active {
          background-color: #0f5011;
          transform: scale(1.1);
        }

        .step-dot.completed {
          background-color: #4caf50;
        }

        .step-dot.completed::before,
        .step-dot.active::before {
          background-color: #4caf50;
        }

        .card-body {
          padding: 30px;
        }

        .card-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #0f5011;
          margin-bottom: 10px;
          text-align: center;
        }

        .card-description {
          color: #666;
          text-align: center;
          margin-bottom: 25px;
        }

        /* Alertes */
        .alert {
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert-error {
          background-color: rgba(244, 67, 54, 0.1);
          color: #f44336;
          border-left: 4px solid #f44336;
        }

        .alert-success {
          background-color: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          border-left: 4px solid #4caf50;
        }

        /* Formulaires */
        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #0f5011;
        }

        .input-container input {
          width: 100%;
          padding: 15px 15px 15px 45px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-container input:focus {
          border-color: #0f5011;
          box-shadow: 0 0 0 3px rgba(15, 80, 17, 0.2);
          outline: none;
        }

        .toggle-password {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0;
        }

        .toggle-password:hover {
          color: #0f5011;
        }

        /* Code input */
        .code-input-container {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 15px;
        }

        .code-input {
          width: 50px;
          height: 60px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .code-input:focus {
          border-color: #0f5011;
          box-shadow: 0 0 0 3px rgba(15, 80, 17, 0.2);
          outline: none;
        }

        .resend-code {
          text-align: center;
          margin-top: 15px;
          font-size: 0.9rem;
          color: #666;
        }

        .resend-button {
          background: none;
          border: none;
          color: #0f5011;
          cursor: pointer;
          font-weight: 600;
          padding: 0;
          text-decoration: underline;
        }

        .resend-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Password strength */
        .password-strength {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .strength-bars {
          display: flex;
          gap: 5px;
          flex: 1;
        }

        .strength-bar {
          height: 4px;
          flex: 1;
          background-color: #e0e0e0;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-bar.active:nth-child(1) {
          background-color: #f44336;
        }

        .strength-bar.active:nth-child(2) {
          background-color: #ff9800;
        }

        .strength-bar.active:nth-child(3) {
          background-color: #ffeb3b;
        }

        .strength-bar.active:nth-child(4) {
          background-color: #4caf50;
        }

        .strength-text {
          font-size: 0.8rem;
          color: #666;
          min-width: 70px;
        }

        /* Password match */
        .password-match {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 10px;
          font-size: 0.8rem;
        }

        .password-match.match {
          color: #4caf50;
        }

        .password-match.no-match {
          color: #f44336;
        }

        /* Submit button */
        .submit-button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(90deg, #0f5011, #4caf50);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .submit-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: all 0.5s ease;
        }

        .submit-button:hover::before {
          left: 100%;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Form footer */
        .form-footer {
          margin-top: 20px;
          text-align: center;
        }

        .link {
          color: #0f5011;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .link:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .card-body {
            padding: 20px;
          }

          .card-title {
            font-size: 1.5rem;
          }

          .code-input-container {
            gap: 5px;
          }

          .code-input {
            width: 40px;
            height: 50px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
