"use client";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  const [settings, setSettings] = useState({
    applicationName: "EcoMarket",
    email: "contact@ecomarket.com",
    facebookLink: "#",
    twitterLink: "#",
    instagramLink: "#",
    linkedinLink: "#",
    copyright: "2025 EcoMarket. Tous droits réservés.",
  });

  useEffect(() => {
    // Load settings from localStorage on component mount
    const loadSettings = () => {
      const storedSettings = localStorage.getItem("appSettings");
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    };

    // Load settings initially
    loadSettings();

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdate);

    // Clean up event listener
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate);
    };
  }, []);

  return (
    <>
      <footer id="about-us" className="footer bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
              <div className="mb-4">
                <a
                  className="d-flex align-items-center text-decoration-none"
                  href="#"
                >
                  <i
                    className="bi bi-shop"
                    style={{ color: "rgb(30, 164, 106)", fontSize: "1.5rem" }}
                  ></i>
                  <span className="text-white fs-4 fw-bold">
                    {settings.applicationName}
                  </span>
                </a>
              </div>
              <p className="mb-4">
                Votre plateforme e-commerce ultime avec des outils puissants de
                marketing de réseau pour développer votre activité et gagner
                plus.
              </p>
              <div className="social-icons">
                <a href={settings.facebookLink} className="social-icon me-2">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href={settings.twitterLink} className="social-icon me-2">
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href={settings.instagramLink} className="social-icon me-2">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href={settings.linkedinLink} className="social-icon me-2">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
              <h5 className="footer-heading">Boutique</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="footer-link">
                    Tous les produits
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Articles en vedette
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Promotions
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Nouveautés
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Meilleures ventes
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
              <h5 className="footer-heading">Partenaires</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="footer-link">
                    Devenir partenaire
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Programme d'affiliation
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Portail partenaires
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Ressources marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Histoires de succès
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
              <h5 className="footer-heading">Entreprise</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="footer-link">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Carrières
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Presse
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h5 className="footer-heading">Restez informé</h5>
              <p className="mb-3">
                Abonnez-vous à notre newsletter pour recevoir les dernières
                actualités, promotions et conseils.
              </p>
              <form className="mb-3">
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Votre adresse e-mail"
                  />
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "rgb(30, 164, 106)",
                      color: "white",
                    }}
                    type="submit"
                  >
                    S'abonner
                  </button>
                </div>
              </form>
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-shield-check me-2"
                  style={{ color: "rgb(30, 164, 106)" }}
                ></i>
                <small>Vos données sont en sécurité avec nous</small>
              </div>
            </div>
          </div>

          <div className="footer-bottom text-center text-md-start">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <p className="mb-0">&copy; {settings.copyright}</p>
              </div>
              <div className="col-md-6 text-md-end">
                <a href="#" className="footer-link d-inline-block me-3">
                  Politique de confidentialité
                </a>
                <a href="#" className="footer-link d-inline-block me-3">
                  Conditions d'utilisation
                </a>
                <a href="#" className="footer-link d-inline-block">
                  Politique de cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .footer {
          background-color: #343a40;
        }

        .footer-heading {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }

        .footer-link {
          color: white;
          text-decoration: none;
        }

        .footer-link:hover {
          color: white;
        }

        .social-icons .social-icon {
          color: white;
          font-size: 1.5rem;
        }

        .social-icons .social-icon:hover {
          color: white;
        }

        .footer-bottom {
          padding-top: 20px;
          border-top: 1px solid #444;
        }

        .footer p,
        .footer small {
          color: white;
        }
      `}</style>
    </>
  );
};

export default Footer;

