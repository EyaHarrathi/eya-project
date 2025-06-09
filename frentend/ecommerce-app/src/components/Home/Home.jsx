import React, { useEffect, useState } from 'react';
import NavbarComponent from '../Home/NavbarComponent';
import Hero from '../Home/hero';
import Footer from '../Home/footer';
import FloatingButtons from './FloatingButtons';
import ListeProducts from './ProductListPopup';
import Recommendations from '../recomend/Recommendation';
import REcommendForFree from '../recomend/REcommendForFree';
import Lboutique from '../boutique/listeboutique';
import * as bootstrap from 'bootstrap';

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [view, setView] = useState("home");
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initBootstrap = () => {
      const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));

      const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
      popoverTriggerList.forEach((el) => new bootstrap.Popover(el));
    };

    if (typeof bootstrap !== 'undefined') {
      initBootstrap();
    }
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) return;

        const response = await fetch(
          `http://localhost:8080/utilisateur/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error("Erreur récupération rôle:", error);
      }
    };

    fetchUserRole();
  }, []);

  const renderRecommendations = () => {
    return userRole === "PREMIUM_USER" ? <Recommendations /> : <REcommendForFree />;
  };

  const scrollToProducts = () => {
    const productsSection = document.querySelector(".recommended-products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="main-container">
      <NavbarComponent Search={setSearchQuery} onEnterPress={scrollToProducts} />

      {view === "home" ? (
        <>
          <Hero
            isPremium={userRole === "PREMIUM_USER"}
            onViewShops={() => setView("shops")}
          />
          <FloatingButtons />
          <ListeProducts searchQuery={searchQuery} />

          <section className="recommendation-section">
            {renderRecommendations()}
          </section>
        </>
      ) : (
        <div className="container py-5">
          {userRole === "PREMIUM_USER" ? (
            <>
              <Lboutique />
              <button className="btn btn-secondary mt-4" onClick={() => setView("home")}>
                Retour à l'accueil
              </button>
            </>
          ) : (
            <>
              <p className="text-danger">
                ⚠️ Cette section est réservée aux utilisateurs Premium.
              </p>
              <button className="btn btn-secondary mt-3" onClick={() => setView("home")}>
                Retour à l'accueil
              </button>
            </>
          )}
        </div>
      )}

      <Footer id="about-us-section" />

      <div className="toast-container"></div>

      <style jsx>{`
        .main-container {
          width: 100%;
        }

        .recommendation-section {
          width: 100vw;
          margin-left: calc(-1 * var(--bs-container-padding-x));
          margin-right: calc(-1 * var(--bs-container-padding-x));
          padding: 0;
          background: transparent;
        }

        @media (max-width: 768px) {
          .recommendation-section {
            width: 100vw;
            margin-left: calc(-1 * var(--bs-container-padding-x));
            margin-right: calc(-1 * var(--bs-container-padding-x));
            padding: 0;
          }
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default App;