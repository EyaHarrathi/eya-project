"use client";

import { useState, useEffect } from "react";
import { Country, State } from "country-state-city";

const SignupAdmine = ({ onUserAdded }) => {
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
    role: "USER",
  });

  const [paysList, setPaysList] = useState([]);
  const [etatsList, setEtatsList] = useState([]);
  const [phonePrefix, setPhonePrefix] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewPhoto(file);
      setFormData((prev) => ({ ...prev, photoUrl: previewUrl }));
    }
  };

  const handlePhotoRemove = () => {
    setNewPhoto(null);
    URL.revokeObjectURL(formData.photoUrl);
    setFormData((prev) => ({ ...prev, photoUrl: "" }));
  };

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
    setError(null);
    setSuccess(null);

    if (formData.rawPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      setIsLoading(false);
      return;
    }

    const finalData = {
      ...formData,
      telephone: phonePrefix
        ? `${phonePrefix} ${formData.telephone}`
        : formData.telephone,
      photo: newPhoto || formData.photoUrl,
    };

    try {
      const response = await fetch("http://localhost:8080/utilisateur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      if (response.ok) {
        setSuccess("Utilisateur ajouté avec succès !");
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
          role: "USER",
        });
        setNewPhoto(null);
        if (onUserAdded) {
          onUserAdded(data);
        }
      } else {
        setError(
          response.status === 409
            ? "Cet email est déjà utilisé."
            : data.message || "Erreur lors de l'ajout de l'utilisateur."
        );
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-admin-container">
      <div className="signup-admin-content">
        <div className="form-header">
          <h2>Ajouter un Utilisateur</h2>
          <p>
            Créez un nouveau compte utilisateur avec les informations requises
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle-fill"></i>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-section">
            <h3 className="section-title">
              <i className="bi bi-person-fill"></i>
              Informations Personnelles
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
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
              <div className="form-group">
                <label htmlFor="nom">Nom</label>
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

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-icon-wrapper">
                <i className="bi bi-envelope-fill input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre.email@exemple.com"
                  required
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Rôle</label>
              <div className="select-wrapper">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="USER">Utilisateur</option>
                  <option value="PREMIUM_USER">Utilisateur Premium</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
                <i className="bi bi-chevron-down select-icon"></i>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <i className="bi bi-geo-alt-fill"></i>
              Adresse et Contact
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pays">Pays</label>
                <div className="select-wrapper">
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
                  <i className="bi bi-chevron-down select-icon"></i>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="etat">État/Province</label>
                <div className="select-wrapper">
                  <select
                    id="etat"
                    name="etat"
                    value={formData.etat}
                    onChange={handleChange}
                    required
                    disabled={!formData.pays}
                    className={!formData.pays ? "disabled" : ""}
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
                  <i className="bi bi-chevron-down select-icon"></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse</label>
              <div className="input-icon-wrapper">
                <i className="bi bi-house-fill input-icon"></i>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Numéro, rue, code postal, ville"
                  required
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <div className="phone-wrapper">
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
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <i className="bi bi-shield-lock-fill"></i>
              Sécurité
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rawPassword">Mot de passe</label>
                <div className="input-wrapper">
                  <div className="input-icon-wrapper">
                    <i className="bi bi-key-fill input-icon"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="rawPassword"
                      name="rawPassword"
                      value={formData.rawPassword}
                      onChange={handlePasswordChange}
                      placeholder="Créez un mot de passe"
                      required
                      className="input-with-icon"
                    />
                  </div>
                  
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
                  <div className="input-icon-wrapper">
                    <i className="bi bi-check-circle-fill input-icon"></i>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmez le mot de passe"
                      required
                      className="input-with-icon"
                    />
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <i className="bi bi-image-fill"></i>
              Photo de Profil
            </h3>
            <div className="form-group">
              <div className="photo-upload-container">
                <div className="photo-upload-wrapper">
                  <div className="photo-upload-area">
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="photo-input"
                    />
                    <label htmlFor="photo" className="photo-label">
                      {formData.photoUrl ? (
                        <img
                          src={formData.photoUrl || "/placeholder.svg"}
                          alt="Profile"
                          className="photo-preview-img"
                        />
                      ) : (
                        <>
                          <i className="bi bi-cloud-arrow-up-fill upload-icon"></i>
                          <span>Cliquez ou glissez une image</span>
                          <span className="upload-hint">
                            JPG, PNG ou GIF (max. 5MB)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.photoUrl && (
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={handlePhotoRemove}
                    >
                      <i className="bi bi-trash-fill"></i>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Ajout en cours...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i>
                  <span>Ajouter l'utilisateur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .signup-admin-container {
          display: flex;
          justify-content: center;
          width: 100%;
          background-color: #f9fafb;
        }

        .signup-admin-content {
          width: 100%;
          max-width: 900px;
          padding: 2rem;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          font-size: 1rem;
          color: #6b7280;
        }

        .alert {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          gap: 0.5rem;
        }

        .alert-error {
          background: #fee2e2;
          color: #b91c1c;
          border-left: 4px solid #b91c1c;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
          border-left: 4px solid #065f46;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }

        .form-section {
          background-color: #f9fafb;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title i {
          color: #4f46e5;
        }

        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }

        label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }

        input,
        select {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          background-color: #ffffff;
          transition: all 0.2s ease;
          width: 100%;
          color: #1f2937;
        }

        input:focus,
        select:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        input::placeholder {
          color: #9ca3af;
        }

        .input-icon-wrapper {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .input-with-icon {
          padding-left: 2.5rem;
        }

        .select-wrapper {
          position: relative;
          width: 100%;
        }

        .select-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
        }

        select {
          appearance: none;
          padding-right: 2.5rem;
        }

        select.disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .phone-wrapper {
          position: relative;
          width: 100%;
        }

        .phone-prefix {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #4b5563;
          font-size: 0.95rem;
          font-weight: 500;
        }

        input.has-prefix {
          padding-left: 4rem;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
        }

        .toggle-password {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .toggle-password:hover {
          color: #4f46e5;
          background-color: rgba(79, 70, 229, 0.05);
        }

        .password-strength {
          display: flex;
          align-items: center;
          margin-top: 0.75rem;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }

        .bar {
          height: 4px;
          flex: 1;
          background-color: #e5e7eb;
          border-radius: 2px;
          transition: background-color 0.3s ease;
        }

        .bar.active:nth-child(1) {
          background-color: #ef4444;
        }

        .bar.active:nth-child(2) {
          background-color: #f59e0b;
        }

        .bar.active:nth-child(3) {
          background-color: #10b981;
        }

        .bar.active:nth-child(4) {
          background-color: #059669;
        }

        .strength-text {
          font-size: 0.8rem;
          font-weight: 500;
          margin-left: 0.75rem;
          min-width: 70px;
          text-align: right;
        }

        .photo-upload-container {
          width: 100%;
        }

        .photo-upload-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .photo-upload-area {
          width: 100%;
          position: relative;
        }

        .photo-input {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          z-index: -1;
        }

        .photo-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 200px;
          border: 2px dashed #d1d5db;
          border-radius: 10px;
          background-color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 1rem;
          gap: 0.75rem;
        }

        .photo-label:hover {
          border-color: #4f46e5;
          background-color: rgba(79, 70, 229, 0.02);
        }

        .upload-icon {
          font-size: 2.5rem;
          color: #6b7280;
        }

        .upload-hint {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .photo-preview-img {
          max-width: 100%;
          max-height: 180px;
          border-radius: 8px;
          object-fit: contain;
        }

        .remove-photo-btn {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          color: #ef4444;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .remove-photo-btn:hover {
          background: #fee2e2;
          border-color: #fecaca;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }

        .cancel-btn {
          padding: 0.75rem 1.5rem;
          background: #ffffff;
          color: #4b5563;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .submit-btn {
          padding: 0.75rem 1.5rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          min-width: 200px;
        }

        .submit-btn:hover {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.1);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          width: 18px;
          height: 18px;
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

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }

          .signup-admin-content {
            padding: 1.5rem;
            border-radius: 0;
            box-shadow: none;
          }

          .form-section {
            padding: 1.25rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .submit-btn,
          .cancel-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SignupAdmine;
