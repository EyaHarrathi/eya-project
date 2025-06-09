"use client";
import {
  Network,
  ShoppingBag,
  Users,
  TrendingUp,
  Zap,
  UserPlus,
  Gift,
  Store,
  Share2,
  ChevronRight,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as bootstrap from "bootstrap";

const SignupButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };

  return (
    <button
      className="btn btn-success text-white d-flex align-items-center gap-2 px-4 py-2"
      onClick={handleClick}
    >
      <UserPlus size={20} />
      se connecter
    </button>
  );
};

const PricingItem = ({ Icon, text }) => {
  return (
    <li className="d-flex align-items-center gap-3 mb-3">
      <Icon className="text-success" size={20} />
      <span className="fw-medium">{text}</span>
    </li>
  );
};

const FeatureCard = ({ Icon, title, description }) => {
  return (
    <div className="card h-100 p-4 shadow-hover feature-card">
      <div className="bg-success bg-opacity-10 p-3 rounded-3 mb-4 icon-container">
        <Icon className="text-success" size={40} />
      </div>
      <h3 className="h4 fw-bold mb-3">{title}</h3>
      <p className="text-dark">{description}</p>
    </div>
  );
};

const Acceuil = () => {
  const navigate = useNavigate();

  const handleNavClick = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    const navbarCollapse = document.getElementById("navbarNav");
    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      new bootstrap.Collapse(navbarCollapse).hide();
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-vh-100 custom-gradient">
      {/* Navigation */}
      <header className="position-relative z-10 bg-white shadow-sm">
        <nav className="navbar navbar-expand-lg py-3">
          <div className="container">
            <div className="d-flex align-items-center">
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="bg-success p-3 rounded-3 shadow">
                <ShoppingBag className="text-white" size={32} />
              </div>
              <span className="navbar-brand fs-2 fw-bold ms-3 text-success">
                EcoMarket
              </span>
            </div>

            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav ms-auto gap-4">
                <a
                  href="#features"
                  className="nav-link fw-medium text-dark"
                  onClick={(e) => handleNavClick(e, "features")}
                >
                  Fonctionnalités
                </a>
                <a
                  href="#pricing"
                  className="nav-link fw-medium text-dark"
                  onClick={(e) => handleNavClick(e, "pricing")}
                >
                  Tarifs
                </a>
                <a
                  href="#cta"
                  className="nav-link fw-medium text-dark"
                  onClick={(e) => handleNavClick(e, "cta")}
                >
                  Avantages
                </a>
              </div>
              <div className="d-flex gap-3 ms-4">
                <SignupButton />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Section Hero */}
      <section className="position-relative overflow-hidden py-5" id="hero">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-12 text-center">
              <div className="d-inline-flex align-items-center bg-success px-4 py-2 rounded-pill mb-4">
                <Zap size={16} className="text-white me-2" />
                <span className="text-white fw-bold">
                  Innovation E-commerce 2025
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4 text-dark">
                Développez Votre
                <br />
                <span className="text-success">Empire Digital</span>
              </h1>
              <p className="lead mb-4 text-dark fw-medium">
                Une plateforme révolutionnaire qui combine e-commerce et
                marketing de réseau. Créez votre boutique, élargissez votre
                communauté et transformez chaque transaction en opportunité de
                croissance.
              </p>
              <div className="d-flex gap-3 flex-wrap justify-content-center">
                <button
                  className="btn btn-success btn-lg d-flex align-items-center shadow"
                  onClick={goToLogin}
                >
                  Se Connecter
                  <LogIn className="ms-2" size={20} />
                </button>
                <button
                  className="btn btn-outline-success btn-lg d-flex align-items-center"
                  onClick={(e) => handleNavClick(e, "pricing")}
                >
                  Découvrir Premium
                  <ChevronRight className="ms-2" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="py-5 bg-white" id="features">
        <div className="container text-center py-5">
          <div className="mb-5">
            <div className="d-inline-flex align-items-center bg-success px-4 py-2 rounded-pill mb-3">
              <Store size={16} className="text-white me-2" />
              <span className="text-white fw-bold">Notre Écosystème</span>
            </div>
            <h2 className="display-5 fw-bold mb-3 text-dark">
              Une Plateforme Complète
            </h2>
            <p className="lead text-dark fw-medium">
              Notre solution innovante combine e-commerce et marketing de réseau
              pour maximiser votre potentiel de croissance.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <FeatureCard
                Icon={Store}
                title="Boutique Intelligente"
                description="Créez et personnalisez votre boutique en ligne avec nos outils avancés. Gérez vos produits, stocks et commandes en toute simplicité."
              />
            </div>
            <div className="col-md-4">
              <FeatureCard
                Icon={Share2}
                title="Réseau Dynamique"
                description="Développez votre communauté et bénéficiez d'un système de parrainage performant. Chaque nouvelle connexion augmente votre potentiel."
              />
            </div>
            <div className="col-md-4">
              <FeatureCard
                Icon={Gift}
                title="Recommandations de Profils"
                description="Connectez-vous avec des profils influents, leaders dans votre catégorie. Notre système identifie les acteurs clés avec un grand volume de transactions pour optimiser vos opportunités d'achat et de vente."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section className="py-5 custom-gradient" id="pricing">
        <div className="container text-center py-5">
          <div className="mb-5">
            <div className="d-inline-flex align-items-center bg-success px-4 py-2 rounded-pill mb-3">
              <Zap size={16} className="text-white me-2" />
              <span className="text-white fw-bold">Nos Formules</span>
            </div>
            <h2 className="display-5 fw-bold mb-3 text-dark">
              Choisissez Votre Niveau
            </h2>
            <p className="lead text-dark fw-medium">
              Des solutions adaptées à vos ambitions, pour développer votre
              activité à votre rythme.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-5">
              <div className="card h-100 p-4 shadow-hover">
                <h3 className="h2 fw-bold mb-4 text-dark">Découverte</h3>
                <div className="mb-4">
                  <span className="display-5 fw-bold text-success">0 DT</span>
                  <span className="text-dark">/ mois</span>
                </div>
                <ul className="list-unstyled mb-4">
                  <PricingItem Icon={Users} text="Réseau de niveau 1" />
                  <PricingItem Icon={Store} text="Boutique standard" />
                  <PricingItem Icon={Gift} text="Recommandations de profils de base" />
                </ul>
                <button
                  className="btn btn-success w-100 py-3 shadow"
                  onClick={goToSignup}
                >
                  Commencer Gratuitement
                </button>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card h-100 p-4 shadow-hover border-success border-2 position-relative">
                <div className="position-absolute top-0 start-50 translate-middle-y">
                  <span className="badge bg-success py-2 px-4 fw-medium">
                    Recommandé
                  </span>
                </div>
                <h3 className="h2 fw-bold mb-4 text-dark">Expert</h3>
                <div className="mb-4">
                  <span className="display-5 fw-bold text-success">29 DT</span>
                  <span className="text-dark">/ mois</span>
                </div>
                <ul className="list-unstyled mb-4">
                  <PricingItem
                    Icon={Users}
                    text="Réseau multi-niveaux illimité"
                  />
                  <PricingItem
                    Icon={Store}
                    text="Boutique personnalisable premium"
                  />
                  <PricingItem
                    Icon={Gift}
                    text="Recommandations avancées de profils"
                  />
                  <PricingItem
                    Icon={TrendingUp}
                    text="Analytics professionnels"
                  />
                </ul>
                <button
                  className="btn btn-success w-100 py-3 shadow"
                  onClick={goToSignup}
                >
                  Devenir Expert
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-5 bg-white" id="cta">
        <div className="container text-center py-5">
          <div className="mb-5">
            <div className="bg-success bg-opacity-10 p-4 rounded-3 d-inline-block mb-4">
              <Network size={48} className="text-white" />
            </div>
            <h2 className="display-5 fw-bold mb-4 text-dark">
              Rejoignez l'Élite du E-commerce
            </h2>
            <p className="lead mb-4 text-dark fw-medium">
              Soyez parmi les premiers à façonner l'avenir du commerce en ligne. Rejoignez notre plateforme innovante et bâtissez une communauté dynamique dès aujourd'hui.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="btn btn-success btn-lg d-flex align-items-center shadow"
                onClick={goToSignup}
              >
                Créer Mon Compte
                <ArrowRight className="ms-2" size={20} />
              </button>
              <button
                className="btn btn-outline-success btn-lg d-flex align-items-center"
                onClick={() => navigate("/about")}
              >
                En Savoir Plus
                <ChevronRight className="ms-2" size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="bg-white border-top py-5" id="contact">
        <div className="container">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center">
            <div className="d-flex align-items-center mb-4 mb-lg-0">
              <div className="bg-success p-2 rounded-3 me-3">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <span className="fs-3 fw-bold text-success">EcoMarket</span>
            </div>
            <div className="text-dark text-center">
              <p className="mb-1 fw-medium">
                © 2025 EcoMarket. Tous droits réservés.
              </p>
              <p className="small">Une nouvelle ère du commerce en ligne</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Styles personnalisés pour la page d'accueil */
        .custom-gradient {
          background: linear-gradient(
            135deg,
            #ecfdf5 0%,
            #ffffff 50%,
            #ecfdf5 100%
          );
        }

        .shadow-hover {
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.125);
        }

        .shadow-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }

        .icon-container {
          transition: background-color 0.3s ease;
        }

        .feature-card:hover .icon-container {
          background-color: rgba(16, 185, 129, 0.2) !important;
        }

        .text-success {
          color: #10b981 !important;
        }

        .bg-success {
          background-color: #10b981 !important;
        }

        .btn-success {
          background-color: #10b981;
          border-color: #10b981;
        }

        .btn-success:hover {
          background-color: #059669;
          border-color: #059669;
        }

        .btn-outline-success {
          color: #10b981;
          border-color: #10b981;
        }

        .btn-outline-success:hover {
          background-color: #10b981;
          border-color: #10b981;
          color: white;
        }

        .border-success {
          border-color: #10b981 !important;
        }

        .z-10 {
          z-index: 10;
        }

        .text-dark {
          color: #111827 !important;
        }

        .fw-medium {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default Acceuil;