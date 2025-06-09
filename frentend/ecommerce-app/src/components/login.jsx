"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWalkingAnimation, setShowWalkingAnimation] = useState(true);
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Handle signup navigation with animation
  const handleSignupClick = (e) => {
    e.preventDefault();
    setIsAnimating(true);

    setTimeout(() => {
      navigate("/signup");
    }, 800);
  };

  // Traditional login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Animate button
    if (formRef.current) {
      formRef.current.classList.add("form-submitting");
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/utilisateur/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Login successful:", response.data);

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("userId", response.data.id);

      // Success animation
      setLoading(false);
      setIsAnimating(true);

      setTimeout(() => {
        navigate("/home");
      }, 800);
    } catch (err) {
      console.error(
        "Login failed:",
        err.response ? err.response.data : err.message
      );
      setLoading(false);
      setError("Invalid email or password");

      // Error animation
      if (formRef.current) {
        formRef.current.classList.add("form-error");
        setTimeout(() => {
          formRef.current.classList.remove("form-error", "form-submitting");
        }, 500);
      }
    }
  };

  // Google login callback
  const loginCallback = async (response) => {
    console.log("Google Response:", response);
    if (response?.credential) {
      // Decode JWT token from Google
      const user = JSON.parse(atob(response.credential.split(".")[1]));
      console.log("User Info from Google:", user);

      // Build user data object
      const userData = {
        nom: user.given_name || user.name,
        prenom: user.family_name || "",
        email: user.email,
        photoUrl: user.picture,
        googleId: user.sub,
      };

      try {
        // Send data to backend
        const res = await axios.post(
          "http://localhost:8080/utilisateur/googleLogin",
          userData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Google Login Successful:", res.data);

        // Store user data
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem("userId", res.data.id);

        // Success animation
        setIsAnimating(true);

        setTimeout(() => {
          navigate("/home");
        }, 800);
      } catch (err) {
        console.error(
          "Google login failed:",
          err.response ? err.response.data : err.message
        );
        setError("Erreur de connexion via Google");
      }
    }
  };

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id:
          "324074826650-qb3kj60r29bujjtjots270b16ufpeb5q.apps.googleusercontent.com",
        callback: loginCallback,
      });
      window.google.accounts.id.renderButton(
        document.querySelector(".g_id_signin"),
        {
          theme: "filled_blue",
          size: "large",
          shape: "pill",
          width: 280,
        }
      );
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Effect to handle the one-time walking animation
  useEffect(() => {
    if (showWalkingAnimation) {
      // Hide the animation after it completes
      const timer = setTimeout(() => {
        setShowWalkingAnimation(false);
      }, 8000); // Animation duration + a little buffer

      return () => clearTimeout(timer);
    }
  }, [showWalkingAnimation]);

  return (
    <div
      className={`login-container ${
        isAnimating ? "exit-animation" : "enter-animation"
      }`}
    >
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="container position-relative">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-8 col-lg-6 col-xl-5 mx-auto">
            <motion.div
              className="login-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              ref={formRef}
            >
              <div className="login-header">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center mb-4"
                >
                  <span className="gradient-text">CONNEXION</span>
                </motion.h2>
              </div>

              {error && (
                <motion.div
                  className="alert alert-danger"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </motion.div>
              )}

              <motion.form
                className="login-form"
                onSubmit={handleLogin}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="form-floating mb-4">
                  <input
                    type="email"
                    id="email"
                    className="form-control input-field"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email">Email</label>
                  <div className="input-focus-effect"></div>
                </div>

                <div className="form-floating mb-4">
                  <input
                    type="password"
                    id="password"
                    className="form-control input-field"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="password">Mot de passe</label>
                  <div className="input-focus-effect"></div>
                </div>

                <div className="d-flex justify-content-end mb-4">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/password"
                    className="forgot-password"
                  >
                    Mot de passe oublié ?
                  </motion.a>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn login-btn w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-container">
                      <div className="spinner"></div>
                      <span>Connexion en cours...</span>
                    </div>
                  ) : (
                    <>
                      <span className="btn-text">Se connecter</span>
                      <span className="btn-icon">
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
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </span>
                    </>
                  )}
                </motion.button>
              </motion.form>

              <div className="divider">
                <span>ou</span>
              </div>

              <motion.div
                className="g_id_signin d-flex justify-content-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              ></motion.div>

              <motion.div
                className="text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <p className="mb-0">
                  Pas encore de compte ?{" "}
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/signup"
                    className="signup-link"
                    onClick={handleSignupClick}
                  >
                    S'inscrire
                  </motion.a>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* One-time walking animation */}
      {showWalkingAnimation && (
        <div className="walking-animation-container">
          <div className="walking-figure"></div>
        </div>
      )}

      <style jsx>{`
        /* Base Styles */
        .login-container {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
        }

        /* Background Animation */
        .background-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(
            45deg,
            rgba(15, 80, 17, 0.2),
            rgba(15, 80, 17, 0.1)
          );
          animation: float 15s infinite ease-in-out;
        }

        .shape-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          right: -100px;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 300px;
          height: 300px;
          bottom: -150px;
          left: -100px;
          animation-delay: 3s;
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          bottom: 30%;
          right: 10%;
          animation-delay: 6s;
        }

        .shape-4 {
          width: 150px;
          height: 150px;
          top: 30%;
          left: 10%;
          animation-delay: 9s;
        }

        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.6;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
        }

        /* Login Card */
        .login-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1),
            0 5px 15px rgba(0, 0, 0, 0.05);
          position: relative;
          z-index: 1;
          overflow: hidden;
          transition: all 0.5s ease;
        }

        .login-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(90deg, #0f5011, #4caf50);
          z-index: 2;
        }

        /* Header */
        .login-header {
          margin-bottom: 30px;
        }

        .gradient-text {
          background: linear-gradient(90deg, #0f5011, #4caf50);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 700;
          font-size: 2.2rem;
          letter-spacing: 1px;
          position: relative;
        }

        /* Form Elements */
        .login-form {
          position: relative;
        }

        .input-field {
          height: 60px;
          border-radius: 10px;
          border: 2px solid #e0e0e0;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          font-size: 1rem;
          box-shadow: none;
        }

        .input-field:focus {
          border-color: #0f5011;
          box-shadow: 0 0 0 3px rgba(15, 80, 17, 0.2);
        }

        .form-floating label {
          padding: 1rem 1.25rem;
          color: #666;
        }

        .input-focus-effect {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #0f5011, #4caf50);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .input-field:focus ~ .input-focus-effect {
          width: 100%;
        }

        /* Button */
        .login-btn {
          height: 56px;
          border-radius: 10px;
          background: linear-gradient(90deg, #0f5011, #4caf50);
          border: none;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .login-btn::before {
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

        .login-btn:hover::before {
          left: 100%;
        }

        .btn-icon {
          display: inline-flex;
          transition: transform 0.3s ease;
        }

        .login-btn:hover .btn-icon {
          transform: translateX(5px);
        }

        /* Spinner */
        .spinner-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Links */
        .forgot-password {
          color: #0f5011;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .forgot-password::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #0f5011;
          transition: all 0.3s ease;
        }

        .forgot-password:hover::after {
          width: 100%;
        }

        .signup-link {
          color: #0f5011;
          text-decoration: none;
          font-weight: 600;
          position: relative;
          transition: all 0.3s ease;
        }

        .signup-link::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #0f5011;
          transition: all 0.3s ease;
        }

        .signup-link:hover::after {
          width: 100%;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          margin: 25px 0;
          color: #666;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }

        .divider span {
          padding: 0 15px;
          font-size: 0.9rem;
        }

        /* One-time Walking Animation */
        .walking-animation-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 120px;
          z-index: 10;
          pointer-events: none;
          overflow: hidden;
        }

        .walking-figure {
          position: absolute;
          bottom: 0;
          right: -100px;
          width: 100px;
          height: 100px;
          background-image: url("../images/1.png");
          background-size: contain;
          background-position: bottom center;
          background-repeat: no-repeat;
          animation: walk-once 10s forwards;
        }

        @keyframes walk-once {
          0% {
            right: -100px;
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            right: calc(100% + 100px);
            opacity: 0;
            transform: translateY(50px); /* Disappear at the bottom */
          }
        }

        /* Animations */
        .enter-animation {
          animation: slideInUp 1s ease-out forwards;
        }

        .exit-animation {
          animation: slideOutDown 0.8s ease-in forwards;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(30px);
          }
        }

        /* Form Animations */
        .form-submitting {
          transform: scale(0.98);
          transition: transform 0.3s ease;
        }

        .form-error {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-card {
            padding: 30px 20px;
          }

          .gradient-text {
            font-size: 1.8rem;
          }

          .walking-figure {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
