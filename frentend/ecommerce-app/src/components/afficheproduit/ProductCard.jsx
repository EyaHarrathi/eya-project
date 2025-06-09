import React from "react";
import { Tag } from "lucide-react";

export const ProductCard = ({ product, onClick }) => {
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

  const { text: typeText, class: typeClass } = typeConfig[product.type] || {};
  const isAvailable = product.available && product.quantity > 0;

  return (
    <>
      <style>
        {`
          .product-card-hover .product-card-img {
            transition: transform 0.3s ease;
          }

          .product-card-hover:hover .product-card-img {
            transform: scale(1.05);
          }

          .product-card-hover:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }

          .product-price {
            font-size: 1.3rem;
            font-weight: 700;
            color: #198754;
          }

          .per-day {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 400;
          }

          .card-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          .card-text {
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
          }

          .badge-custom {
            font-size: 0.95rem;
            font-weight: 600;
            padding: 0.4em 0.7em;
            border-radius: 0.6em;
          }

          .product-card {
            width: 320px;
            height: 350px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .product-image-container {
            flex: 1;
            overflow: hidden;
          }

          .product-info {
            flex: 1;
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .product-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

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
        onClick={onClick}
        className="card product-card product-card-hover cursor-pointer"
        role="button"
        aria-label={`Voir les détails de ${product.name}`}
      >
        {/* ✅ Image en haut */}
        <div className="position-relative product-image-container">
          <img
            src={`http://localhost:8080/api/products/images/${product.imageName}`}
            alt={product.name}
            className="product-img product-card-img"
            loading="lazy"
          />
          {typeText && (
            <div
              className={`position-absolute top-0 end-0 m-1 badge ${typeClass} badge-custom`}
            >
              {typeText}
            </div>
          )}
        </div>

        {/* ✅ Infos produit */}
        <div className="product-info">
          <div>
            <h5 className="card-title">{product.name}</h5>
            <p className="card-text text-muted text-truncate">
              {product.description}
            </p>
            {product.colors?.length > 0 && (
              <div className="d-flex align-items-center mb-1">
                <Tag className="me-1" size={16} />
                <div className="d-flex flex-wrap gap-1">
                  {product.colors
                    .filter(
                      (color) => color != null && colorMap[color.toLowerCase()]
                    ) // Filter null/undefined and invalid colors
                    .map((color, index) => {
                      const normalizedColor = color.toLowerCase();
                      const cssColor = colorMap[normalizedColor]; // No fallback
                      const isLightColor = lightColors.includes(cssColor);

                      return (
                        <span
                          key={index}
                          className="color-circle"
                          style={{
                            backgroundColor: cssColor,
                            ...(isLightColor && {
                              border: "1px solid #dee2e6",
                            }),
                          }}
                          title={color}
                        />
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="product-price">
              {product.price.toFixed(2)} DT{" "}
              {product.type === "LOCATION" && (
                <span className="per-day">/jour</span>
              )}
            </div>
            <span
              className={`badge badge-custom ${
                isAvailable
                  ? "bg-success bg-opacity-10 text-success"
                  : "bg-danger bg-opacity-10 text-danger"
              }`}
            >
              {isAvailable ? "Disponible" : "Indisponible"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
