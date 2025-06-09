"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LoaderCircle,
  Users,
  Star,
  MapPin,
  Award,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Clock,
  ThumbsUp,
  MessageCircle,
  Shield,
  CheckCircle,
  ChevronDown,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react";

const Recommendations = ({ initialCategoryId }) => {
  const [categoryId, setCategoryId] = useState(initialCategoryId || "");
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      setAnimateIn(false);

      try {
        const url =
          categoryId === "all"
            ? "http://localhost:8080/api/intermediaries/recommendations/all"
            : `http://localhost:8080/api/intermediaries/recommendations/${categoryId}`;

        const response = await axios.get(url);
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

  const toggleExpandInfo = (userId) => {
    setExpandedInfo(expandedInfo === userId ? null : userId);
  };

  const handleContactClick = (user) => {
    const searchTerm = `${user.prenom} ${user.nom}`;
    navigate("/network", { state: { searchTerm } });
  };

  const handleCategorySelect = (selectedCategoryId) => {
    setCategoryId(selectedCategoryId);
    setDropdownOpen(false);
    setSearchTerm("");
  };

  const getSelectedCategoryName = () => {
    if (!categoryId) return "Choisir catégorie";
    if (categoryId === "all") return "Toutes les catégories";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Choisir catégorie";
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="recommendations-wrapper">
      <style jsx>{`
        .recommendations-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .header-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 0 4rem 0;
          position: relative;
          overflow: hidden;
        }

        .header-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        .header-content {
          text-align: center;
        }

        .header-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .header-title {
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 400;
        }

        .controls-section {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          margin: -2rem auto 3rem auto;
          max-width: 1000px;
          padding: 2rem;
          position: relative;
          z-index: 2;
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .controls-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .view-toggle {
          display: flex;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 4px;
        }

        .view-btn {
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }

        .view-btn.active {
          background: white;
          color: #1e293b;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .filter-controls {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          align-items: end;
        }

        .dropdown-wrapper {
          position: relative;
        }

        .dropdown-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .dropdown-trigger {
          width: 100%;
          min-width: 300px;
          padding: 1rem 1.25rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
          color: #1f2937;
        }

        .dropdown-trigger:hover {
          border-color: #d1d5db;
        }

        .dropdown-trigger.active {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .dropdown-trigger.placeholder {
          color: #9ca3af;
        }

        .dropdown-text {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dropdown-icon {
          transition: transform 0.2s;
          color: #9ca3af;
        }

        .dropdown-trigger.active .dropdown-icon {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.2s;
          pointer-events: none;
          overflow: hidden;
        }

        .dropdown-menu.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        .dropdown-search {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
          background: #f9fafb;
        }

        .search-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .dropdown-options {
          max-height: 300px;
          overflow-y: auto;
        }

        .dropdown-option {
          padding: 0.875rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dropdown-option:hover {
          background: #f8fafc;
          border-left-color: #e5e7eb;
        }

        .dropdown-option.selected {
          background: #eff6ff;
          border-left-color: #667eea;
          color: #667eea;
          font-weight: 600;
        }

        .filter-btn {
          padding: 1rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .filter-btn:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .results-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .results-count {
          font-size: 1.125rem;
          color: #64748b;
        }

        .results-count strong {
          color: #1e293b;
          font-weight: 700;
        }

        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .masonry-grid.list-view {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: #e2e8f0;
        }

        .card.list-view {
          display: flex;
          align-items: stretch;
          min-height: 200px;
        }

        .card.list-view:hover {
          transform: translateY(-2px);
        }

        .card.list-view .card-image {
          width: 280px;
          min-width: 280px;
          height: auto;
          padding-top: 0;
          flex-shrink: 0;
        }

        .card.list-view .card-image img {
          position: static;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card.list-view .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2rem;
        }

        .card.list-view .main-info {
          flex: 1;
        }

        .card.list-view .actions-section {
          margin-top: auto;
          padding-top: 1rem;
        }

        .card-image {
          position: relative;
          padding-top: 60%;
          overflow: hidden;
        }

        .card-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .card:hover .card-image img {
          transform: scale(1.05);
        }

        .rating-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          font-size: 0.875rem;
          backdrop-filter: blur(10px);
        }

        .verification-badge {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(16, 185, 129, 0.9);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          font-size: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .card-content {
          padding: 1.5rem;
        }

        .name-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .card.list-view .name {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .top-rated {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .card.list-view .location {
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #475569;
          font-size: 0.875rem;
        }

        .card.list-view .info-item {
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        .info-section {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease, opacity 0.3s ease;
          opacity: 0;
        }

        .info-section.expanded {
          max-height: 400px;
          opacity: 1;
        }

        .stats-section {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
        }

        .card.list-view .stats-section {
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .stats-title {
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .card.list-view .stats-title {
          font-size: 1rem;
        }

        .stats-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .card.list-view .stats-item {
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        .verification-section {
          margin-bottom: 1rem;
        }

        .card.list-view .verification-section {
          margin-bottom: 1.5rem;
        }

        .verification-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .verification-badge-small {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          font-weight: 600;
        }

        .card.list-view .verification-badge-small {
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
        }

        .contact-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .card.list-view .contact-actions {
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .contact-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          color: white;
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .card.list-view .contact-btn {
          padding: 1rem 1.5rem;
          font-size: 1rem;
        }

        .contact-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .toggle-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.875rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #667eea;
          transition: all 0.2s ease;
          cursor: pointer;
          margin-top: 0.75rem;
        }

        .card.list-view .toggle-btn {
          padding: 1rem;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .toggle-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin: 2rem auto;
          max-width: 600px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem auto;
          color: #9ca3af;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .empty-description {
          color: #64748b;
          margin: 0;
        }

        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 2rem auto;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #667eea;
          margin-bottom: 1rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .header-title {
            font-size: 2rem;
          }

          .controls-section {
            margin: -1rem 1rem 2rem 1rem;
            padding: 1.5rem;
          }

          .filter-controls {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .dropdown-trigger {
            min-width: auto;
          }

          .controls-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .masonry-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .results-section {
            padding: 0 1rem;
          }

          .card.list-view {
            flex-direction: column;
          }

          .card.list-view .card-image {
            width: 100%;
            min-width: auto;
            padding-top: 60%;
          }

          .card.list-view .card-image img {
            position: absolute;
            top: 0;
            left: 0;
          }

          .card.list-view .card-content {
            padding: 1.5rem;
          }

          .card.list-view .name {
            font-size: 1.25rem;
          }

          .card.list-view .location,
          .card.list-view .info-item {
            font-size: 0.875rem;
          }

          .card.list-view .contact-btn {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>

      <div className="header-section">
        <div className="header-container">
          <div className={`header-content ${animateIn ? "animate-in" : ""}`}>
            <div className="header-icon">
              <Users size={40} />
            </div>
            <h1 className="header-title">Recommandations Professionnelles</h1>
            <p className="header-subtitle">
              Découvrez les meilleurs profils recommandés par notre communauté
            </p>
          </div>
        </div>
      </div>

      <div
        className={`controls-section ${animateIn ? "animate-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="controls-header">
          <h2 className="controls-title">Filtrer les recommandations</h2>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="filter-controls">
          <div className="dropdown-wrapper" ref={dropdownRef}>
            <label className="dropdown-label">Catégorie</label>
            <div
              className={`dropdown-trigger ${dropdownOpen ? "active" : ""} ${
                !categoryId ? "placeholder" : ""
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="dropdown-text">
                <Filter size={18} />
                <span>{getSelectedCategoryName()}</span>
              </div>
              <ChevronDown size={20} className="dropdown-icon" />
            </div>

            <div className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
              <div className="dropdown-search">
                <div style={{ position: "relative" }}>
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher une catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div className="dropdown-options">
                <div
                  className={`dropdown-option ${
                    categoryId === "all" ? "selected" : ""
                  }`}
                  onClick={() => handleCategorySelect("all")}
                >
                  <Users size={16} />
                  <span>Toutes les catégories</span>
                </div>

                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`dropdown-option ${
                      categoryId === cat.id ? "selected" : ""
                    }`}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    <Award size={16} />
                    <span>{cat.name}</span>
                  </div>
                ))}

                {filteredCategories.length === 0 && searchTerm && (
                  <div
                    className="dropdown-option"
                    style={{ cursor: "default", opacity: 0.6 }}
                  >
                    <span>Aucune catégorie trouvée</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        {!categoryId && !loading ? (
          <div className={`empty-state ${animateIn ? "animate-in" : ""}`}>
            <div className="empty-icon">
              <Users size={64} />
            </div>
            <h3 className="empty-title">Sélectionnez une catégorie</h3>
            <p className="empty-description">
              Choisissez une catégorie pour découvrir les professionnels
              recommandés
            </p>
          </div>
        ) : loading ? (
          <div className={`loading-state ${animateIn ? "animate-in" : ""}`}>
            <LoaderCircle size={48} className="spinner" />
            <p>Chargement des recommandations...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-count">
                <strong>{recommendations.length}</strong> professionnel
                {recommendations.length > 1 ? "s" : ""} recommandé
                {recommendations.length > 1 ? "s" : ""}
              </div>
            </div>

            <div
              className={`masonry-grid ${
                viewMode === "list" ? "list-view" : ""
              }`}
            >
              {recommendations.map((user, index) => (
                <div
                  className={`card ${viewMode === "list" ? "list-view" : ""} ${
                    animateIn ? "animate-in" : ""
                  }`}
                  key={user.userId}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  onMouseEnter={() => setHoveredCard(user.userId)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="card-image">
                    <img
                      src={
                        user.photoUrl
                          ? user.photoUrl
                          : "https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg"
                      }
                      alt={`${user.prenom} ${user.nom}`}
                    />

                    {user.rating && (
                      <div className="rating-badge">
                        <Star size={14} fill="currentColor" />
                        <span>{user.rating}</span>
                      </div>
                    )}
                    {user.isVerified && (
                      <div className="verification-badge">
                        <CheckCircle size={12} />
                        <span>Vérifié</span>
                      </div>
                    )}
                  </div>

                  <div className="card-content">
                    <div className="main-info">
                      <div className="name-section">
                        <h3 className="name">
                          {user.prenom} {user.nom}
                        </h3>
                        {user.isTopRated && (
                          <span className="top-rated">
                            <Award size={12} />
                            <span>Expert</span>
                          </span>
                        )}
                      </div>

                      {user.location && (
                        <div className="location">
                          <MapPin size={16} />
                          <span>{user.location}</span>
                        </div>
                      )}

                      {user.specialty && (
                        <div className="info-item">
                          <Award size={16} />
                          <span>{user.specialty}</span>
                        </div>
                      )}

                      {user.experience && (
                        <div className="info-item">
                          <Calendar size={16} />
                          <span>{user.experience}</span>
                        </div>
                      )}

                      <div
                        className={`info-section ${
                          expandedInfo === user.userId ? "expanded" : ""
                        }`}
                      >
                        {user.stats && (
                          <div className="stats-section">
                            <div className="stats-title">Performance</div>
                            {user.stats.completedProjects && (
                              <div className="stats-item">
                                <Briefcase size={14} />
                                <span>
                                  {user.stats.completedProjects} projets
                                  complétés
                                </span>
                              </div>
                            )}
                            {user.stats.clientSatisfaction && (
                              <div className="stats-item">
                                <ThumbsUp size={14} />
                                <span>
                                  {user.stats.clientSatisfaction} satisfaction
                                  client
                                </span>
                              </div>
                            )}
                            {user.stats.responseRate && (
                              <div className="stats-item">
                                <MessageCircle size={14} />
                                <span>
                                  {user.stats.responseRate} taux de réponse
                                </span>
                              </div>
                            )}
                            {user.stats.responseTime && (
                              <div className="stats-item">
                                <Clock size={14} />
                                <span>
                                  {user.stats.responseTime} temps de réponse
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {user.verification && (
                          <div className="verification-section">
                            <div className="stats-title">Vérifications</div>
                            <div className="verification-badges">
                              {user.verification.identityVerified && (
                                <span className="verification-badge-small">
                                  <Shield size={12} />
                                  <span>Identité</span>
                                </span>
                              )}
                              {user.verification.expertiseVerified && (
                                <span className="verification-badge-small">
                                  <Award size={12} />
                                  <span>Expertise</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {user.languages && user.languages.length > 0 && (
                          <div className="verification-section">
                            <div className="stats-title">Langues</div>
                            <div className="verification-badges">
                              {user.languages.map((lang, i) => (
                                <span
                                  key={i}
                                  className="verification-badge-small"
                                >
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {user.contactInfo && (
                          <div className="contact-actions">
                            {user.contactInfo.email && (
                              <a
                                href={`mailto:${user.contactInfo.email}`}
                                className="contact-btn"
                                style={{ textDecoration: "none" }}
                              >
                                <Mail size={14} />
                                <span>Email</span>
                              </a>
                            )}
                            {user.contactInfo.phone && (
                              <a
                                href={`tel:${user.contactInfo.phone}`}
                                className="contact-btn"
                                style={{ textDecoration: "none" }}
                              >
                                <Phone size={14} />
                                <span>Appeler</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="actions-section">
                      <div className="contact-actions">
                        <button
                          onClick={() => handleContactClick(user)}
                          className="contact-btn"
                        >
                          <MessageCircle size={16} />
                          <span>Contacter</span>
                        </button>
                      </div>

                      {(user.stats ||
                        user.verification ||
                        (user.languages && user.languages.length > 0) ||
                        user.contactInfo) && (
                        <button
                          className="toggle-btn"
                          onClick={() => toggleExpandInfo(user.userId)}
                        >
                          {expandedInfo === user.userId
                            ? "Voir moins"
                            : "Voir plus d'informations"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={`empty-state ${animateIn ? "animate-in" : ""}`}>
            <div className="empty-icon">
              <Users size={64} />
            </div>
            <h3 className="empty-title">Aucune recommandation trouvée</h3>
            <p className="empty-description">
              Essayez de sélectionner une autre catégorie ou revenez plus tard
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
