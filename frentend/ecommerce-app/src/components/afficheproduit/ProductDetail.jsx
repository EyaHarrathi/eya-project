"use client";
import React from "react";
import { ArrowLeft, Package, ShoppingCart, Tag } from "lucide-react";

export const ProductDetail = ({ product, onBack }) => {
  const typeConfig = {
    LOCATION: { text: "Location", class: "bg-primary" },
    VENTE: { text: "Vente", class: "bg-success" },
  };

  const colorMap = {
    rouge: "red",
    vert: "green",
    noire: "black",
    bleu: "blue",
    blanc: "white",
    jaune: "yellow",
    gris: "gray",
    orange: "orange",
    violet: "purple",
    rose: "pink",
    marron: "brown",
    beige: "beige",
    turquoise: "turquoise",
    argent: "silver",
    or: "gold",
  };

  const lightColors = ["white", "yellow", "beige", "lightgray"];

  const { text: typeText, class: typeClass } =
    typeConfig[product.type?.toUpperCase()] || {};

  const isAvailable = product.available && product.quantity > 0;

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    const productId = product.id;

    if (!userId) {
      alert("Utilisateur non connecté !");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/${userId}/add/${productId}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Erreur lors de l'ajout au panier");
      }

      await response.json();
      alert("✅ Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur attrapée :", error.message);
      alert("❌ Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <>
      <style>
        {`
          .color-circle {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-block;
            border: 1px solid #dee2e6;
          }
        `}
      </style>
      <div
        className="card mb-3 shadow-sm"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <div className="row g-0">
          <div className="col-md-5">
            <div className="position-relative h-100">
              <img
                src={`http://localhost:8080/api/products/images/${product.imageName}`}
                alt={product.name}
                className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                style={{ aspectRatio: "1/1" }}
                loading="lazy"
              />
              {typeText && (
                <span
                  className={`position-absolute top-0 end-0 m-2 badge ${typeClass}`}
                >
                  {typeText}
                </span>
              )}
            </div>
          </div>

          <div className="col-md-7 d-flex flex-column">
            <div className="card-body d-flex flex-column p-3">
              <div>
                <button
                  onClick={onBack}
                  className="btn btn-link text-decoration-none p-0 mb-2"
                >
                  <ArrowLeft className="me-2" size={16} />
                  Retour aux produits
                </button>

                <h5 className="card-title mb-2">{product.name}</h5>

                <div className="d-flex align-items-center bg-light p-2 rounded mb-2">
                  <span className="me-2 fw-semibold">DT</span>
                  <span className="fw-semibold">
                    {product.price.toFixed(2)}
                    {product.type === "LOCATION" && (
                      <small className="text-muted ms-1">/jour</small>
                    )}
                  </span>
                </div>

                <div className="mb-2">
                  <h6 className="mb-1">Description</h6>
                  <p className="text-muted small mb-0">{product.description}</p>
                </div>

                {product.colors?.length > 0 && (
                  <div className="mb-2">
                    <div className="d-flex align-items-center mb-1">
                      <Tag className="me-2" size={16} />
                      <h6 className="mb-0">Options disponibles</h6>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {product.colors
                        .filter(
                          (color) =>
                            color != null && colorMap[color.toLowerCase()]
                        ) // Filter null/undefined and invalid colors
                        .map((color, index) => {
                          const normalizedColor = color.toLowerCase();
                          const cssColor = colorMap[normalizedColor]; // No fallback
                          const isLightColor = lightColors.includes(cssColor);

                          return (
                            <span
                              key={index}
                              className="color-circle"
                              title={color}
                              style={{
                                backgroundColor: cssColor,
                                ...(isLightColor && {
                                  border: "1px solid #dee2e6",
                                }),
                              }}
                            />
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                  <div className="d-flex align-items-center">
                    <Package className="me-2" size={16} />
                    <small>
                      Stock : <strong>{product.quantity}</strong>
                    </small>
                  </div>
                  <span
                    className={`badge ${
                      isAvailable
                        ? "bg-success bg-opacity-10 text-success"
                        : "bg-danger bg-opacity-10 text-danger"
                    }`}
                  >
                    {isAvailable ? "Disponible" : "Indisponible"}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  className={`btn ${typeClass} w-100 py-2 ${
                    !product.available && "disabled opacity-75"
                  } text-white fw-semibold rounded-pill shadow-sm`}
                  disabled={!product.available}
                  onClick={handleAddToCart}
                  style={{
                    backgroundColor: "#22c55e",
                    borderColor: "#16a34a",
                    fontSize: "0.9rem",
                    letterSpacing: "0.3px",
                  }}
                >
                  <ShoppingCart className="me-2" size={16} />
                  {product.type === "LOCATION" ? "Réserver" : "Acheter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
