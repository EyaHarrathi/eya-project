import React, { useEffect, useState } from "react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) =>
        console.error("Erreur lors du chargement des catégories :", err)
      );
  }, []);

  const displayedCategories = showAll ? categories : categories.slice(0, 7);

  return (
    <>
      <style>
        {`
          .category-pill {
            background-color: #f1f1f1;
            color: #333;
            font-weight: 500;
            cursor: pointer;
            padding: 6px 12px;  /* Réduit le padding */
            border-radius: 25px;  /* Réduit la bordure arrondie */
            display: inline-block;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 2px solid transparent;
            font-size: 0.9rem;  /* Réduit la taille de la police */
            min-width: 100px;  /* Réduit la largeur minimale */
            text-align: center;
          }

          .category-pill:hover {
            transform: scale(1.05);  /* Légère réduction de l'effet de zoom */
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);  /* Réduit l'ombre */
          }

          .category-pill.active {
            background-color: rgb(30, 164, 106);
            color: white;
            border-color: rgb(30, 164, 106);
          }

          .view-all-btn {
            font-weight: 500;  /* Réduit le poids de la police */
            color: rgb(30, 164, 106);
            border: none;
            background: none;
            cursor: pointer;
            transition: transform 0.3s ease, border 0.4s ease;
            font-size: 1.1rem;  /* Réduit la taille de la police */
          }

          .view-all-btn:hover {
            text-decoration: underline;
            transform: scale(1.03);  /* Réduit légèrement l'effet de zoom */
            border-bottom: 2px solid rgb(30, 164, 106);
          }

          .categories-section {
            width: 100%;
            max-width: 100%;
            padding: 0 3vw;  /* Réduit les marges */
          }

          @media (min-width: 1200px) {
            .category-pill {
              font-size: 1rem;  /* Réduit la taille de la police */
              padding: 8px 16px;  /* Réduit le padding */
            }
          }
        `}
      </style>

      <section className="py-4 categories-section">  {/* Réduit le padding */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">  {/* Réduit l'espacement */}
          <h3 className="mb-0" style={{ fontSize: "1.75rem", fontWeight: "600" }}>  {/* Réduit la taille du titre */}
            Parcourir les catégories
          </h3>
          {categories.length > 7 && (
            <button
              className="view-all-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Réduire" : "Voir tout"}{" "}
              <i className="bi bi-arrow-right"></i>
            </button>
          )}
        </div>

        <div className="d-flex flex-wrap gap-3 justify-content-start">  {/* Réduit l'espacement */}
          <div
            className={`category-pill ${
              activeCategory === "all" ? "active" : ""
            }`}
            onClick={() => setActiveCategory("all")}
          >
            Tous les produits
          </div>

          {displayedCategories.map((category) => (
            <div
              key={category.id}
              className={`category-pill ${
                activeCategory === category.id ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Categories;
