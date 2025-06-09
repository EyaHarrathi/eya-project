"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  LoaderCircle,
  Users,
  Star,
  MapPin,
  Award,
  Calendar,
} from "lucide-react";

const REcommendForFree = ({ initialCategoryId }) => {
  const [categoryId, setCategoryId] = useState(initialCategoryId || "");
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // Changé à false par défaut
  const [animateIn, setAnimateIn] = useState(false);

  // CSS Styles
  const styles = {
    cardAnimation: {
      transition: "all 0.3s ease-in-out",
      transform: "translateY(0)",
      boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    },
    cardHover: {
      transform: "translateY(-10px)",
      boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
    },
    imageZoom: {
      transition: "transform 0.5s ease",
    },
    imageZoomHover: {
      transform: "scale(1.05)",
    },
    fadeIn: {
      opacity: 0,
      transition: "opacity 0.5s ease-in-out",
    },
    fadeInActive: {
      opacity: 1,
    },
    selectCustom: {
      cursor: "pointer",
      border: "1px solid #dee2e6",
      borderRadius: "8px",
      padding: "12px 15px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      transition: "all 0.2s ease",
    },
    selectCustomFocus: {
      borderColor: "#6366f1",
      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
    },
    badge: {
      display: "inline-block",
      padding: "0.35em 0.65em",
      fontSize: "0.75em",
      fontWeight: "700",
      lineHeight: "1",
      color: "#fff",
      textAlign: "center",
      whiteSpace: "nowrap",
      verticalAlign: "baseline",
      borderRadius: "50rem",
      backgroundColor: "#6366f1",
    },
    badgeOutline: {
      backgroundColor: "transparent",
      color: "#6366f1",
      border: "1px solid #6366f1",
    },
    loadingAnimation: {
      animation: "spin 1s linear infinite",
      "@keyframes spin": {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
    },
    shimmer: {
      background:
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      borderRadius: "4px",
    },
    "@keyframes shimmer": {
      "0%": { backgroundPosition: "200% 0" },
      "100%": { backgroundPosition: "-200% 0" },
    },
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();

    // Trigger animation after component mounts
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  useEffect(() => {
    if (!categoryId) {
      // Si aucune catégorie n'est sélectionnée, ne pas charger les recommandations
      setRecommendations([]);
      return;
    }

    console.log("Fetching recommendations for category:", categoryId);

    const fetchRecommendations = async () => {
      setLoading(true); // Activer le chargement uniquement quand une catégorie est sélectionnée
      setAnimateIn(false);

      try {
        const url =
          categoryId === "all"
            ? "http://localhost:8080/api/intermediaries/around-median/all"
            : `http://localhost:8080/api/intermediaries/around-median/${categoryId}`;

        const response = await axios.get(url);

        // Utiliser uniquement les données de l'API sans ajouter de données statiques
        setRecommendations(response.data);

        setTimeout(() => {
          setLoading(false);
          setTimeout(() => setAnimateIn(true), 100);
        }, 500);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [categoryId]);

  // Card hover effect handlers
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="container mt-5">
      {/* Custom CSS for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .card-hover-effect {
            transition: all 0.3s ease;
          }
          
          .card-hover-effect:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
          }
          
          .image-zoom {
            transition: transform 0.5s ease;
            overflow: hidden;
          }
          
          .image-zoom:hover img {
            transform: scale(1.08);
          }
          
          .animate-in {
            animation: fadeIn 0.6s ease-out forwards;
          }
          
          .animate-pulse {
            animation: pulse 2s infinite;
          }
          
          .shimmer-effect {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
          }
          
          .custom-select:focus {
            border-color: #6366f1 !important;
            box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.25) !important;
          }
          
          .category-badge {
            background-color: #6366f1;
            transition: all 0.2s ease;
          }
          
          .category-badge:hover {
            background-color: #4f46e5;
            transform: translateY(-2px);
          }
          
          .spin-animation {
            animation: spin 1s linear infinite;
          }
          
          .title-underline::after {
            content: '';
            display: block;
            width: 50px;
            height: 3px;
            background-color: #6366f1;
            margin-top: 8px;
            transition: width 0.3s ease;
          }
          
          .title-underline:hover::after {
            width: 100px;
          }
        `}
      </style>

      <div
        className={`d-flex align-items-center gap-3 mb-4 ${
          animateIn ? "animate-in" : ""
        }`}
        style={{ animationDelay: "0.1s" }}
      >
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
          <Users size={28} className="text-primary" />
        </div>
        <h2 className="m-0 title-underline">Top Recommendations</h2>
      </div>

      {/* Category Selector */}
      <div
        className={`mb-5 ${animateIn ? "animate-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <label htmlFor="categorySelect" className="form-label fw-semibold mb-2">
          Filter by Category:
        </label>
        <div className="position-relative">
          <select
            id="categorySelect"
            className="form-select shadow-sm rounded"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">-- Choose a category --</option>
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="position-absolute end-0 top-50 translate-middle-y me-3 text-primary">
            <i className="bi bi-chevron-down"></i>
          </div>
        </div>
      </div>

      {/* Recommendations Display */}
      {!categoryId ? (
        // Message quand aucune catégorie n'est sélectionnée
        <div
          className={`text-center mt-5 py-5 border border-2 border-dashed rounded-4 ${
            animateIn ? "animate-in" : ""
          }`}
        >
          <div className="py-4">
            <div className="mb-3 text-muted opacity-50">
              <Users size={50} strokeWidth={1.5} />
            </div>
            <h4 className="mb-2">Veuillez sélectionner une catégorie</h4>
            <p
              className="text-muted mb-4 mx-auto"
              style={{ maxWidth: "500px" }}
            >
              Choisissez une catégorie dans le menu déroulant ci-dessus pour
              voir les recommandations.
            </p>
          </div>
        </div>
      ) : loading ? (
        // Affichage du chargement
        <div
          className={`text-center mt-5 py-5 ${animateIn ? "animate-in" : ""}`}
        >
          <div className="position-relative d-inline-block mb-4">
            <LoaderCircle
              className="text-primary spin-animation"
              size={50}
              strokeWidth={2}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
              <div
                className="bg-white rounded-circle"
                style={{ width: "30px", height: "30px" }}
              ></div>
            </div>
          </div>
          <p className="text-muted fs-5">Chargement des recommandations...</p>
          <div className="mt-4 d-flex justify-content-center gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="shimmer-effect"
                style={{ width: "50px", height: "6px", borderRadius: "3px" }}
              ></div>
            ))}
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        // Affichage des recommandations
        <div className="row">
          {recommendations.map((user, index) => (
            <div
              className={`col-md-4 mb-4 ${animateIn ? "animate-in" : ""}`}
              key={user.userId}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div
                className="card border-0 h-100 card-hover-effect"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={() => setHoveredCard(user.userId)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="position-relative image-zoom">
                  <img
                    src={user.photoUrl || "/placeholder.svg"}
                    className="card-img-top"
                    alt={`${user.prenom} ${user.nom}`}
                    style={{
                      objectFit: "cover",
                      height: "240px",
                      transition: "transform 0.5s ease",
                    }}
                  />
                  {user.rating && (
                    <div className="position-absolute top-0 end-0 m-3">
                      <span
                        className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Star
                          size={14}
                          className="text-warning"
                          fill="#ffc107"
                        />
                        <span
                          className="fw-bold"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {user.rating}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title fw-bold mb-0">
                      {user.prenom} {user.nom}
                    </h5>
                    {user.isTopRated && (
                      <span className="badge rounded-pill category-badge">
                        Top Rated
                      </span>
                    )}
                  </div>

                  {user.location && (
                    <div className="d-flex align-items-center text-muted mb-3">
                      <MapPin size={14} className="me-1" />
                      <small>{user.location}</small>
                    </div>
                  )}

                  <div className="d-flex flex-column gap-2 mt-3">
                    {user.specialty && (
                      <div className="d-flex align-items-center">
                        <Award size={16} className="text-primary me-2" />
                        <span className="text-dark">{user.specialty}</span>
                      </div>
                    )}
                    {user.experience && (
                      <div className="d-flex align-items-center">
                        <Calendar size={16} className="text-primary me-2" />
                        <span className="text-dark">{user.experience}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Message quand aucune recommandation n'est trouvée
        <div
          className={`text-center mt-5 py-5 border border-2 border-dashed rounded-4 ${
            animateIn ? "animate-in" : ""
          }`}
        >
          <div className="py-4">
            <div className="mb-3 text-muted opacity-50">
              <Users size={50} strokeWidth={1.5} />
            </div>
            <h4 className="mb-2">Aucune recommandation trouvée</h4>
            <p
              className="text-muted mb-4 mx-auto"
              style={{ maxWidth: "500px" }}
            >
              Nous n'avons trouvé aucune recommandation pour cette catégorie.
              Essayez de sélectionner une catégorie différente ou revenez plus
              tard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default REcommendForFree;
