import React, { useEffect, useState } from "react";
import { ProductCard } from "../afficheproduit/ProductCard";
import { ProductDetail } from "../afficheproduit/ProductDetail";
import "bootstrap/dist/css/bootstrap.min.css";

const EmptyProducts = () => (
  <div className="text-center py-5 my-5">
    <h4 className="text-muted mb-4" style={{ fontSize: "1.2rem" }}>
      Aucun produit disponible
    </h4>
    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
      Vos amis n'ont pas encore publié d'articles
    </p>
  </div>
);

const ListeProducts = ({ searchQuery }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) throw new Error("Authentification requise");

        const productsResponse = await fetch(
          "http://localhost:8080/api/products/by-users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userIds: [userId] }),
          }
        );

        if (!productsResponse.ok)
          throw new Error("Erreur lors du chargement des produits");

        const responseData = await productsResponse.json();
        const validatedProducts = (responseData.data || []).map((p) => ({
          ...p,
          imageUrl: p.imageName
            ? `http://localhost:8080/api/products/images/${p.imageName}`
            : "/placeholder.jpg",
        }));

        setProducts(validatedProducts);
        setFilteredProducts(validatedProducts);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) =>
        console.error("Erreur lors du chargement des catégories :", err)
      );
  }, []);

  useEffect(() => {
    let filtered = products;

    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === activeCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [activeCategory, searchQuery, products]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="alert alert-danger mx-3 my-5"
        style={{ fontSize: "0.9rem" }}
      >
        Erreur : {error}
        <button
          className="btn btn-link"
          onClick={() => window.location.reload()}
          style={{ fontSize: "0.9rem" }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="container" style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "2rem" }}>
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      </div>
    );
  }

  const displayedProducts = showAllProducts
    ? filteredProducts
    : filteredProducts.slice(0, 4);

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 10);

  return (
    <>
      <style>
        {`
          .category-pill {
            background-color: #f1f1f1;
            color: #333;
            font-weight: 500;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 25px;
            display: inline-block;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 2px solid transparent;
            font-size: 0.9rem;
            min-width: 100px;
            text-align: center;
          }

          .category-pill:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          .category-pill.active {
            background-color: rgb(30, 164, 106);
            color: white;
            border-color: rgb(30, 164, 106);
          }

          .view-all-btn {
            font-weight: 500;
            color: rgb(30, 164, 106);
            border: none;
            background: none;
            cursor: pointer;
            transition: transform 0.3s ease, border 0.4s ease;
            font-size: 1.1rem;
          }

          .view-all-btn:hover {
            text-decoration: underline;
            transform: scale(1.03);
            border-bottom: 2px solid rgb(30, 164, 106);
          }

          .categories-section {
            width: 100%;
            padding: 0 3vw;
          }
        `}
      </style>

      <section className="py-4 categories-section">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
          <h3 className="mb-0" style={{ fontSize: "1.75rem", fontWeight: "600" }}>
            Parcourir les catégories
          </h3>
          {categories.length > 7 && (
            <button
              className="view-all-btn"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? "Réduire" : "Voir tout"}
              <i className="bi bi-arrow-right"></i>
            </button>
          )}
        </div>

        <div className="d-flex flex-wrap gap-3 justify-content-start">
          <div
            className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            Tous les produits
          </div>

          {displayedCategories.map((category) => (
            <div
              key={category.id}
              className={`category-pill ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </section>

      <section className="recommended-products py-4 bg-white">
        <div className="container px-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2
              className="section-title mb-0"
              style={{ fontSize: "2rem", fontWeight: "700" }}
            >
              Produits disponibles
            </h2>

            {filteredProducts.length > 4 && (
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowAllProducts(!showAllProducts)}
                style={{
                  fontSize: "0.8rem",
                  padding: "6px 12px",
                  fontWeight: "400",
                }}
              >
                {showAllProducts ? "Réduire" : "Voir tout"}
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="row g-3">
              {displayedProducts.map((product) => (
                <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <ProductCard
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ListeProducts;