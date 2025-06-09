"use client";

import { useState, useEffect, useRef } from "react";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [newPhoto, setNewPhoto] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    pays: "",
    etat: "",
    rawPassword: "",
    confirmPassword: "",
    photoUrl: "",
  });

  const [paysList, setPaysList] = useState([]);
  const [etatsList, setEtatsList] = useState([]);
  const [phonePrefix, setPhonePrefix] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bgClass, setBgClass] = useState("bod");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [processingAnimation, setProcessingAnimation] = useState(false);
  const inputRef = useRef(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setBgClass("bodi");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  // Photo Upload Functions
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handlePhotoChange(e.target.files[0]);
    }
  };

  const handlePhotoChange = (file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewPhoto(file);
      setFormData((prev) => ({ ...prev, photoUrl: previewUrl }));
      setShowPhotoModal(false);
    }
  };

  const handlePhotoRemove = () => {
    if (showPhotoModal) {
      setShowRemoveConfirm(true);
    } else {
      confirmPhotoRemoval();
    }
  };

  const confirmPhotoRemoval = () => {
    setNewPhoto(null);
    if (formData.photoUrl) {
      URL.revokeObjectURL(formData.photoUrl);
    }
    setFormData((prev) => ({ ...prev, photoUrl: "" }));
    setShowRemoveConfirm(false);
    setShowPhotoModal(false);
  };

  useEffect(() => {
    setPaysList(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.pays) {
      const states = State.getStatesOfCountry(formData.pays);
      setEtatsList(states);
      setFormData((prev) => ({
        ...prev,
        etat: states.length > 0 ? states[0].isoCode : "",
      }));

      const selectedCountry = paysList.find((p) => p.isoCode === formData.pays);
      setPhonePrefix(selectedCountry ? `+${selectedCountry.phonecode}` : "");
    }
  }, [formData.pays, paysList]);

  const handlePaysChange = (e) => {
    setFormData({ ...formData, pays: e.target.value, etat: "", telephone: "" });
    setEtatsList([]);
    setPhonePrefix("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    setPasswordStrength(score);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, rawPassword: newPassword });
    checkPasswordStrength(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProcessingAnimation(true);

    if (formData.rawPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      setIsLoading(false);
      setProcessingAnimation(false);
      return;
    }

    const finalData = {
      ...formData,
      telephone: phonePrefix
        ? `${phonePrefix} ${formData.telephone}` // Added space here
        : formData.telephone,
      photo: newPhoto || formData.photoUrl,
    };

    try {
      // Simulate backend processing with animation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("http://localhost:8080/utilisateur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      // Lecture de la réponse en texte brut d'abord
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText); // Essayer de parser en JSON
      } catch {
        data = { message: responseText }; // Fallback si ce n'est pas du JSON
      }

      if (response.ok) {
        setSuccess("Compte créé avec succès !");
        setError(null);
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          adresse: "",
          pays: "",
          etat: "",
          rawPassword: "",
          confirmPassword: "",
          photoUrl: "",
        });
        setNewPhoto(null);

        // Redirect after success with animation
        setBgClass("bodi");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        // Gestion des erreurs spécifiques
        if (response.status === 409) {
          setError(
            data.message ||
              "Cet email est déjà utilisé. Veuillez en choisir un autre."
          );
        } else {
          setError(data.message || "Erreur lors de l'inscription.");
        }
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setProcessingAnimation(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="ecommerce-app">
      <div className="floating-leaf-1"></div>
      <div className="floating-leaf-2"></div>
      <div className="floating-leaf-3"></div>

      {/* Main Container */}
      <div
        className={`signup-container ${
          processingAnimation ? "processing" : ""
        }`}
      >
        {/* Left Panel - Branding */}
        <div className="brand-panel">
          <div className="brand-content">
            <div className="brand-logo">
              <i className="bi bi-leaf"></i>
            </div>
            <h1 className="brand-name">EcoMarket</h1>
            <p className="brand-tagline">Commerce durable et responsable</p>

            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="bi bi-truck"></i>
                </div>
                <div className="feature-text">
                  <h3>Livraison Écologique</h3>
                  <p>Emballages 100% recyclables</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="feature-text">
                  <h3>Produits Certifiés</h3>
                  <p>Garantie d'origine éthique</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <i className="bi bi-flower1"></i>
                </div>
                <div className="feature-text">
                  <h3>Impact Positif</h3>
                  <p>Un arbre planté par commande</p>
                </div>
              </div>
            </div>

            <div className="testimonial">
              <div className="quote-mark">"</div>
              <p className="quote-text">
                EcoMarket m'a permis de découvrir des produits locaux et
                écologiques que j'utilise au quotidien. Une vraie révolution!
              </p>
              <div className="quote-author">
                <div className="author-avatar">ML</div>
                <div className="author-name">Marie Laurent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="form-panel">
          <div className="form-header">
            <h2>Créer votre compte</h2>
            <p>Rejoignez notre communauté éco-responsable</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          {/* Photo Upload Button */}
          <div className="photo-upload-wrapper">
            {formData.photoUrl ? (
              <div
                className="photo-preview"
                onClick={() => setShowPhotoModal(true)}
              >
                <img
                  src={formData.photoUrl || "/placeholder.svg"}
                  alt="Profile"
                />
                <div className="photo-overlay">
                  <div className="photo-action-buttons">
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoRemove();
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="photo-upload-btn"
                onClick={() => setShowPhotoModal(true)}
              >
                <i className="bi bi-camera"></i>
                <span>Ajouter une photo</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
                <div className="input-wrapper">
                  <i className="bi bi-person"></i>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <div className="input-wrapper">
                  <i className="bi bi-person"></i>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <i className="bi bi-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pays">Pays</label>
                <div className="input-wrapper">
                  <i className="bi bi-globe"></i>
                  <select
                    id="pays"
                    name="pays"
                    value={formData.pays}
                    onChange={handlePaysChange}
                    required
                  >
                    <option value="" disabled>
                      Sélectionnez un pays
                    </option>
                    {paysList.map((pays) => (
                      <option key={pays.isoCode} value={pays.isoCode}>
                        {pays.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="etat">État/Province</label>
                <div className="input-wrapper">
                  <i className="bi bi-geo-alt"></i>
                  <select
                    id="etat"
                    name="etat"
                    value={formData.etat}
                    onChange={handleChange}
                    required
                    disabled={!formData.pays}
                  >
                    <option value="" disabled>
                      Sélectionnez un état
                    </option>
                    {etatsList.map((etat) => (
                      <option key={etat.isoCode} value={etat.isoCode}>
                        {etat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse de livraison</label>
              <div className="input-wrapper">
                <i className="bi bi-house"></i>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Numéro, rue, code postal, ville"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <div className="input-wrapper phone-wrapper">
                <i className="bi bi-telephone"></i>
                {phonePrefix && (
                  <span className="phone-prefix">{phonePrefix}</span>
                )}
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, telephone: onlyNums });
                  }}
                  placeholder="Votre numéro"
                  required
                  className={phonePrefix ? "has-prefix" : ""}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rawPassword">Mot de passe</label>
                <div className="input-wrapper">
                  <i className="bi bi-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="rawPassword"
                    name="rawPassword"
                    value={formData.rawPassword}
                    onChange={handlePasswordChange}
                    placeholder="Créez un mot de passe"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  ></button>
                </div>
                <div className="password-strength">
                  <div className="strength-bars">
                    <div
                      className={`bar ${passwordStrength >= 1 ? "active" : ""}`}
                    ></div>
                    <div
                      className={`bar ${passwordStrength >= 2 ? "active" : ""}`}
                    ></div>
                    <div
                      className={`bar ${passwordStrength >= 3 ? "active" : ""}`}
                    ></div>
                    <div
                      className={`bar ${passwordStrength >= 4 ? "active" : ""}`}
                    ></div>
                  </div>
                  <span className="strength-text">
                    {passwordStrength === 0 && "Faible"}
                    {passwordStrength === 1 && "Faible"}
                    {passwordStrength === 2 && "Moyen"}
                    {passwordStrength === 3 && "Fort"}
                    {passwordStrength === 4 && "Très fort"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer</label>
                <div className="input-wrapper">
                  <i className="bi bi-lock"></i>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmez le mot de passe"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  ></button>
                </div>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input type="checkbox" required />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  J'accepte les <a href="#">Conditions Générales</a> et la{" "}
                  <a href="#">Politique de Confidentialité</a>
                </span>
              </label>
            </div>

            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                Vous avez déjà un compte?{" "}
                <a href="/login" onClick={handleClick}>
                  Se connecter
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Photo de profil</h3>
              <button
                className="close-modal"
                onClick={() => setShowPhotoModal(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-photo-upload">
                {formData.photoUrl ? (
                  <div className="photo-container">
                    <img
                      src={formData.photoUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="profile-photo"
                    />
                    <div className="photo-actions">
                      <button
                        type="button"
                        className="change-photo-btn"
                        onClick={() => inputRef.current.click()}
                      >
                        <i className="bi bi-camera"></i>
                        <span>Changer</span>
                      </button>
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={handlePhotoRemove}
                      >
                        <i className="bi bi-trash"></i>
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`upload-container ${
                      dragActive ? "drag-active" : ""
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current.click()}
                  >
                    <div className="upload-icon">
                      <i className="bi bi-cloud-upload"></i>
                    </div>
                    <div className="upload-text">
                      <p>Glissez-déposez une photo ici</p>
                      <span>ou</span>
                      <button type="button" className="browse-btn">
                        Parcourir
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="upload-instructions">
                <h4>Conseils pour votre photo</h4>
                <ul>
                  <li>Utilisez une photo claire et professionnelle</li>
                  <li>Assurez-vous que votre visage est bien visible</li>
                  <li>Évitez les arrière-plans trop chargés</li>
                  <li>Formats acceptés: JPG, PNG (max 5MB)</li>
                </ul>
              </div>
              {showRemoveConfirm && (
                <div className="remove-confirmation">
                  <div className="remove-confirmation-content">
                    <i className="bi bi-exclamation-triangle text-warning"></i>
                    <h4>Supprimer la photo?</h4>
                    <p>
                      Êtes-vous sûr de vouloir supprimer cette photo de profil?
                    </p>
                    <div className="confirmation-buttons">
                      <button
                        type="button"
                        className="cancel-remove-btn"
                        onClick={() => setShowRemoveConfirm(false)}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="confirm-remove-btn"
                        onClick={confirmPhotoRemoval}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowPhotoModal(false)}
              >
                Annuler
              </button>
              {formData.photoUrl && (
                <button
                  className="confirm-btn"
                  onClick={() => setShowPhotoModal(false)}
                >
                  Confirmer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Modern E-commerce App Styles */

        /* Base Styles & Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .ecommerce-app {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", sans-serif;
          color: #333;
          background-color: #f8f9fa;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* Main Container */
        .signup-container {
          display: flex;
          width: 100%;
          max-width: 1000px;
          min-height: 550px;
          background-color: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          transition: transform 0.5s ease, box-shadow 0.5s ease;
        }

        /* Backend Processing Animation */
        .signup-container.processing {
          animation: pulse 1.5s infinite alternate;
          box-shadow: 0 20px 80px rgba(45, 106, 79, 0.2);
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 20px 60px rgba(45, 106, 79, 0.1);
          }
          100% {
            box-shadow: 0 20px 80px rgba(45, 106, 79, 0.3);
          }
        }

        /* Brand Panel */
        .brand-panel {
          flex: 0 0 40%;
          background: linear-gradient(135deg, #2d6a4f, #40916c, #52b788);
          color: white;
          padding: 30px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.3;
        }

        .brand-content {
          position: relative;
          z-index: 1;
        }

        .brand-logo {
          font-size: 2.5rem;
          margin-bottom: 10px;
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .brand-logo:hover {
          transform: scale(1.05);
        }

        .brand-name {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 5px;
          background: linear-gradient(90deg, #fff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-tagline {
          font-size: 1rem;
          opacity: 0.8;
          margin-bottom: 40px;
        }

        .brand-features {
          margin-bottom: 40px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }

        .feature-item:hover {
          transform: translateX(5px);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 1.2rem;
        }

        .feature-text h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 3px;
        }

        .feature-text p {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .testimonial {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .testimonial:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .quote-mark {
          position: absolute;
          top: 10px;
          left: 15px;
          font-size: 3rem;
          opacity: 0.2;
          font-family: Georgia, serif;
        }

        .quote-text {
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 15px;
          padding-left: 10px;
        }

        .quote-author {
          display: flex;
          align-items: center;
        }

        .author-avatar {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          margin-right: 10px;
        }

        .author-name {
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Form Panel */
        .form-panel {
          flex: 0 0 60%;
          padding: 30px;
          overflow-y: auto;
        }

        .form-header {
          margin-bottom: 20px;
          text-align: center;
        }

        .form-header h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #666;
          font-size: 0.95rem;
        }

        /* Alerts */
        .alert {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert i {
          margin-right: 10px;
          font-size: 1.1rem;
        }

        .alert-error {
          background-color: #fff2f2;
          color: #e53935;
          border-left: 4px solid #e53935;
        }

        .alert-success {
          background-color: #f0fff4;
          color: #2e7d32;
          border-left: 4px solid #2e7d32;
        }

        /* Photo Upload */
        .photo-upload-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .photo-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .photo-preview:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .photo-preview:hover .photo-overlay {
          opacity: 1;
        }

        .photo-overlay i {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }

        .photo-overlay span {
          font-size: 0.8rem;
        }

        .photo-upload-btn {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #f5f5f5;
          border: 2px dashed #ccc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
        }

        .photo-upload-btn:hover {
          border-color: #2d6a4f;
          color: #2d6a4f;
          transform: scale(1.05);
        }

        .photo-upload-btn i {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }

        .photo-upload-btn span {
          font-size: 0.8rem;
        }

        /* Form Styles */
        .signup-form {
          max-width: 450px;
          margin: 0 auto;
        }

        .form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .form-group {
          flex: 1;
          margin-bottom: 16px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #555;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-size: 1rem;
        }

        input,
        select {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background-color: #f9f9f9;
        }

        input:focus,
        select:focus {
          border-color: #2d6a4f;
          outline: none;
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
          background-color: #fff;
        }

        input::placeholder {
          color: #aaa;
        }

        .phone-wrapper {
          display: flex;
          align-items: center;
        }

        .phone-prefix {
          position: absolute;
          left: 40px;
          color: #666;
          font-size: 0.95rem;
          margin-right: 10px; /* Added space between prefix and number */
        }

        input.has-prefix {
          padding-left: 80px; /* Increased padding to add more space */
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 1rem;
          z-index: 10;
          transition: color 0.2s ease;
        }

        .toggle-password:hover {
          color: #2d6a4f;
        }

        /* Password Strength */
        .password-strength {
          display: flex;
          align-items: center;
          margin-top: 8px;
        }

        .strength-bars {
          display: flex;
          gap: 5px;
          flex: 1;
        }

        .bar {
          height: 4px;
          flex: 1;
          background-color: #eee;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .bar.active:nth-child(1) {
          background-color: #f44336;
        }

        .bar.active:nth-child(2) {
          background-color: #ff9800;
        }

        .bar.active:nth-child(3) {
          background-color: #ffc107;
        }

        .bar.active:nth-child(4) {
          background-color: #4caf50;
        }

        .strength-text {
          font-size: 0.75rem;
          color: #666;
          margin-left: 10px;
          min-width: 60px;
        }

        /* Checkbox */
        .checkbox-group {
          margin-bottom: 15px;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          position: relative;
          padding-left: 30px;
          cursor: pointer;
          font-size: 0.9rem;
          user-select: none;
          color: #555;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .checkbox-container:hover input ~ .checkmark {
          background-color: #eee;
        }

        .checkbox-container input:checked ~ .checkmark {
          background-color: #2d6a4f;
          border-color: #2d6a4f;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .checkbox-container .checkmark:after {
          left: 7px;
          top: 3px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-text {
          line-height: 1.4;
        }

        .checkbox-text a {
          color: #2d6a4f;
          text-decoration: none;
          font-weight: 500;
        }

        .checkbox-text a:hover {
          text-decoration: underline;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #2d6a4f, #40916c, #52b788);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-top: 10px;
        }

        .submit-btn::before {
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

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Form Footer */
        .form-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.9rem;
          color: #666;
        }

        .form-footer a {
          color: #2d6a4f;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .form-footer a:hover {
          text-decoration: underline;
          color: #1b4332;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #333;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: #666;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-modal:hover {
          color: #333;
        }

        .modal-body {
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Profile Photo Upload */
        .profile-photo-upload {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .photo-container {
          position: relative;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .profile-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .change-photo-btn,
        .remove-photo-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .change-photo-btn {
          background: #2d6a4f;
          color: white;
        }

        .change-photo-btn:hover {
          background: #1b4332;
          transform: translateY(-2px);
        }

        .remove-photo-btn {
          background: #f5f5f5;
          color: #666;
        }

        .remove-photo-btn:hover {
          background: #eee;
          color: #e53935;
          transform: translateY(-2px);
        }

        .upload-container {
          width: 100%;
          max-width: 300px;
          height: 200px;
          border: 2px dashed #ccc;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f9f9f9;
        }

        .upload-container:hover,
        .drag-active {
          border-color: #2d6a4f;
          background: #f0f7f4;
        }

        .upload-icon {
          font-size: 3rem;
          color: #2d6a4f;
          margin-bottom: 15px;
        }

        .upload-text {
          text-align: center;
        }

        .upload-text p {
          margin-bottom: 5px;
          color: #555;
        }

        .upload-text span {
          display: block;
          margin: 5px 0;
          color: #999;
          font-size: 0.9rem;
        }

        .browse-btn {
          background: none;
          border: none;
          color: #2d6a4f;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 0.95rem;
        }

        .browse-btn:hover {
          text-decoration: underline;
        }

        .upload-instructions {
          margin-top: 30px;
          width: 100%;
        }

        .upload-instructions h4 {
          font-size: 1rem;
          margin-bottom: 10px;
          color: #333;
        }

        .upload-instructions ul {
          padding-left: 20px;
          color: #666;
          font-size: 0.9rem;
        }

        .upload-instructions li {
          margin-bottom: 8px;
        }

        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .cancel-btn {
          padding: 10px 15px;
          background: #f5f5f5;
          color: #666;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: #eee;
        }

        .confirm-btn {
          padding: 10px 20px;
          background: #2d6a4f;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .confirm-btn:hover {
          background: #1b4332;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .signup-container {
            flex-direction: column;
            max-width: 600px;
          }

          .brand-panel {
            flex: 0 0 auto;
            padding: 30px;
          }

          .form-panel {
            flex: 0 0 auto;
            padding: 30px;
          }

          .brand-features {
            display: none;
          }

          .testimonial {
            display: none;
          }
        }

        @media (max-width: 576px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }

          .form-panel {
            padding: 20px;
          }

          .brand-panel {
            padding: 20px;
          }

          .modal-body {
            padding: 20px;
          }
        }

        /* Background Animations */
        .ecommerce-app {
          position: relative;
          overflow: hidden;
        }

        .ecommerce-app::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            120deg,
            rgba(82, 183, 136, 0.05) 0%,
            rgba(45, 106, 79, 0.05) 100%
          );
          z-index: -2;
        }

        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        @keyframes float-reverse {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(20px) rotate(-5deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        .ecommerce-app::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(82, 183, 136, 0.1) 0%,
            rgba(45, 106, 79, 0.05) 70%,
            transparent 100%
          );
          top: -100px;
          right: -100px;
          z-index: -1;
          animation: float 15s ease-in-out infinite;
        }

        .floating-leaf-1,
        .floating-leaf-2,
        .floating-leaf-3 {
          position: absolute;
          opacity: 0.1;
          z-index: -1;
        }

        .floating-leaf-1 {
          width: 150px;
          height: 150px;
          background: #2d6a4f;
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/%3E%3Cpath d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/%3E%3C/svg%3E");
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          top: 10%;
          left: 5%;
          animation: float 20s ease-in-out infinite;
        }

        .floating-leaf-2 {
          width: 100px;
          height: 100px;
          background: #40916c;
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/%3E%3Cpath d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/%3E%3C/svg%3E");
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          bottom: 15%;
          right: 10%;
          animation: float-reverse 25s ease-in-out infinite;
        }

        .floating-leaf-3 {
          width: 80px;
          height: 80px;
          background: #52b788;
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/%3E%3Cpath d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/%3E%3C/svg%3E");
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          top: 60%;
          left: 15%;
          animation: float 18s ease-in-out infinite;
        }

        /* Enhanced Photo Preview */
        .photo-action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 5px;
        }

        .photo-edit-btn,
        .photo-remove-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .photo-edit-btn:hover {
          background: #2d6a4f;
          color: white;
          transform: scale(1.1);
        }

        .photo-remove-btn:hover {
          background: #e53935;
          color: white;
          transform: scale(1.1);
        }

        .photo-preview .photo-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          background: rgba(0, 0, 0, 0.5);
        }

        .photo-preview:hover .photo-overlay {
          opacity: 1;
        }

        /* Photo Removal Confirmation */
        .remove-confirmation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: fadeIn 0.2s ease;
        }

        .remove-confirmation-content {
          text-align: center;
          padding: 20px;
          max-width: 300px;
        }

        .remove-confirmation-content i {
          font-size: 3rem;
          margin-bottom: 15px;
          color: #f59e0b;
        }

        .remove-confirmation-content h4 {
          margin-bottom: 10px;
          color: #333;
        }

        .remove-confirmation-content p {
          margin-bottom: 20px;
          color: #666;
        }

        .confirmation-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .cancel-remove-btn,
        .confirm-remove-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .cancel-remove-btn {
          background: #f5f5f5;
          color: #333;
        }

        .cancel-remove-btn:hover {
          background: #e0e0e0;
        }

        .confirm-remove-btn {
          background: #e53935;
          color: white;
        }

        .confirm-remove-btn:hover {
          background: #c62828;
        }
      `}</style>
    </div>
  );
};

export default Signup;
