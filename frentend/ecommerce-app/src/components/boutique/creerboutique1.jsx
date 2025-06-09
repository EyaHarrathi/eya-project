import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 🚨 Assure-toi que React Router est installé
import CreateShop from "../boutique/crerboutique";

const Indexe = () => {
  const [showCreateShop, setShowCreateShop] = useState(false);
  const navigate = useNavigate(); // 🚀 Pour la redirection

  const handleSkipShop = () => {
    // Rediriger vers la page d'accueil
    navigate("/home"); // ou une autre route selon ta config
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="text-center px-4 max-w-2xl mx-auto bg-white bg-opacity-50 rounded-2xl p-5 shadow-xl border border-white">
        <i className="bi bi-shop h1 text-primary mb-4 animate-fade-in transform transition-all hover:scale-105 duration-300"></i>

        <h1 className="display-4 fw-bold text-dark mb-4 animate-fade-in">
          Bienvenue sur Votre Gestionnaire de Boutique
        </h1>

        <p className="lead text-muted mb-4 animate-fade-in">
          Créez et gérez votre boutique facilement. Vous pouvez commencer maintenant ou plus tard !
        </p>

        <div className="d-flex flex-column gap-3 justify-content-center align-items-center">
          <button
            onClick={() => setShowCreateShop(true)}
            className="btn btn-primary btn-lg shadow-lg"
          >
            <i className="bi bi-shop me-2"></i>
            Créer Votre Boutique
          </button>
          <button
            onClick={handleSkipShop}
            className="btn btn-outline-secondary"
          >
            Continuer sans créer une boutique
          </button>
        </div>
      </div>

      {showCreateShop && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex="-1"
          aria-labelledby="createShopModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="createShopModalLabel">
                  Créer Votre Boutique
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowCreateShop(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreateShop onClose={() => setShowCreateShop(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Indexe;
