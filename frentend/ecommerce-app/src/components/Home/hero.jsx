import React, { useState } from "react";
import PremiumBanner from "./PremiumBanner";

const HeroSection = ({ isPremium, onViewShops }) => {
  const [showBanner, setShowBanner] = useState(false);

  const handleManageShop = () => {
    if (isPremium) {
      onViewShops(); // Redirige vers la liste des boutiques
    } else {
      setShowBanner(true); // Affiche le popup Premium
    }
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  return (
    <>
      <style>
        {`
          .hero-section {
            background-color: rgb(30, 164, 106);
            color: white;
            padding: 80px 0;
          }
          .hero-heading { font-size: 2.5rem; font-weight: bold; }
          .hero-subheading { font-size: 1.25rem; margin-top: 20px; margin-bottom: 30px; color: #dce4f9; }
          .btn-accent {
            background-color: rgb(216, 169, 30);
            color: #000;
            border: none;
            font-weight: 600;
            padding: 12px 24px;
            font-size: 1rem;
          }
          .btn-accent:hover {
            background-color: #e0a800;
            color: #000;
          }
          .btn-outline-light {
            font-weight: 600;
            padding: 12px 24px;
            font-size: 1rem;
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-image {
            max-height: 400px;
            object-fit: cover;
          }
        `}
      </style>

      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 animate-fade-in">
              <h1 className="hero-heading">Lancez votre entreprise en ligne avec EcoMarket</h1>
              <p className="hero-subheading">
                Créez, gérez et développez votre boutique en ligne grâce à notre plateforme puissante.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-accent btn-lg me-2 mb-2 mb-md-0" onClick={handleManageShop}>
                  <i className="bi bi-shop me-2"></i>Gérer votre boutique
                </button>
                <button className="btn btn-outline-light btn-lg">
                  <i className="bi bi-play-circle me-2"></i>Comment ça marche
                </button>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img
                src="https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg"
                alt="Achat en ligne"
                className="img-fluid rounded-3 shadow animate-fade-in hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popup pour utilisateurs non-premium */}
      {showBanner && (
  <div
    className="modal d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
  >
    <div
      className="modal-dialog modal-dialog-centered"
      style={{
        maxWidth: "1200px",    // ⬅️ Largeur augmentée
        width: "95%",         // ⬅️ Largeur réactive
        maxHeight: "200px"    // ⬅️ Hauteur réduite
      }}
    >
      <div className="modal-content" style={{ maxHeight: "500px", overflowY: "auto" }}>
        <div className="modal-header">
          <h5 className="modal-title">Accès réservé aux utilisateurs Premium</h5>
          <button type="button" className="btn-close" onClick={closeBanner}></button>
        </div>
        <div className="modal-body">
          <PremiumBanner />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeBanner}>Fermer</button>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default HeroSection;
