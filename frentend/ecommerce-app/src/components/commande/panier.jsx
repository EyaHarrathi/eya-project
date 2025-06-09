"use client";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Pai from "../commande/paiment";

function Panier() {
  const [products, setProducts] = useState([]);
  const [cartExists, setCartExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaiement, setShowPaiement] = useState(false);
  const [stockInfo, setStockInfo] = useState({}); // Store stock info for each product
  const userId = localStorage.getItem("userId");

  const getCart = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/cart/${userId}`);
      if (res.status === 404) {
        setCartExists(false);
        setProducts([]);
      } else {
        const data = await res.json();
        if (data.success) {
          setCartExists(true);
          const items = data.items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            imageName: item.product.imageUrl.split("/").pop(),
            quantity: item.quantity,
          }));
          setProducts(items);

          // Fetch stock info for each product
          await fetchStockInfo(items);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du panier:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockInfo = async (items) => {
    const stockData = {};

    for (const item of items) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/products/${item.id}`
        );
        if (response.ok) {
          const product = await response.json();
          stockData[item.id] = {
            availableStock: product.quantity,
            maxAllowed: product.quantity,
          };
        }
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du stock pour ${item.id}:`,
          error
        );
        // Set default values if fetch fails
        stockData[item.id] = {
          availableStock: item.quantity,
          maxAllowed: item.quantity,
        };
      }
    }

    setStockInfo(stockData);
  };

  const checkStockAvailability = async (productId, requestedQuantity) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/products/${productId}/check-stock?quantityToCheck=${requestedQuantity}`
      );

      if (response.ok) {
        const isAvailable = await response.json();
        return isAvailable;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification du stock:", error);
      return false;
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const updateQuantity = async (id, change) => {
    const currentProduct = products.find((p) => p.id === id);
    const newQuantity = currentProduct.quantity + change;

    // If increasing quantity, check stock availability
    if (change > 0) {
      const isStockAvailable = await checkStockAvailability(id, newQuantity);

      if (!isStockAvailable) {
        // Show user feedback - you can customize this
        alert(
          `Stock insuffisant. Stock disponible: ${
            stockInfo[id]?.availableStock || "inconnu"
          }`
        );
        return;
      }
    }

    const endpoint = change > 0 ? "increment" : "decrement";

    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/${userId}/${endpoint}/${id}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        await getCart(); // Refresh cart and stock info
      } else {
        console.error("Erreur lors de la mise à jour de la quantité");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const removeProduct = async (id) => {
    await fetch(`http://localhost:8080/api/cart/${userId}/remove/${id}`, {
      method: "DELETE",
    });
    getCart();
  };

  const isIncrementDisabled = (productId, currentQuantity) => {
    const stock = stockInfo[productId];
    if (!stock) return true; // Disable if stock info not loaded

    return currentQuantity >= stock.availableStock;
  };

  const getStockMessage = (productId, currentQuantity) => {
    const stock = stockInfo[productId];
    if (!stock) return "";

    if (currentQuantity >= stock.availableStock) {
      return `Stock maximum atteint (${stock.availableStock})`;
    }

    const remaining = stock.availableStock - currentQuantity;
    if (remaining <= 3) {
      return `Plus que ${remaining} en stock`;
    }

    return "";
  };

  const total = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const itemCount = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  if (loading) return <div className="cart-loading">Chargement...</div>;

  return (
    <div className="cart-container">
      {!cartExists ? (
        <div className="card-body text-center py-5">
          <div className="mb-3">
            <ShoppingCart size={40} className="text-muted" />
          </div>
          <h4 className="text-muted">Aucun panier trouvé</h4>
          <p className="text-muted">Ajoutez des produits pour commencer.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="card-body text-center py-5">
          <div className="mb-3">
            <ShoppingCart size={40} className="text-muted" />
          </div>
          <h4 className="text-muted">Votre panier est vide</h4>
          <p className="text-muted">
            Ajoutez des articles pour procéder à l'achat.
          </p>
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {products.map((product) => (
              <li key={product.id} className="cart-item">
                <img
                  src={`http://localhost:8080/api/products/images/${product.imageName}`}
                  alt={product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <span className="cart-item-name">{product.name}</span>
                  <span className="cart-item-price">
                    {product.price ? product.price.toFixed(2) : "0.00"} DT
                  </span>
                  {getStockMessage(product.id, product.quantity) && (
                    <span className="stock-warning">
                      {getStockMessage(product.id, product.quantity)}
                    </span>
                  )}
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="quantity-btn"
                      disabled={product.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity">{product.quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="quantity-btn"
                      disabled={isIncrementDisabled(
                        product.id,
                        product.quantity
                      )}
                      title={
                        isIncrementDisabled(product.id, product.quantity)
                          ? "Stock maximum atteint"
                          : "Augmenter la quantité"
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="remove-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>{total.toFixed(2)} DT</span>
            </div>
            <button
              className="checkout-btn"
              disabled={products.length === 0}
              onClick={() => setShowPaiement(true)}
            >
              Procéder au paiement ({itemCount} article
              {itemCount !== 1 ? "s" : ""})
            </button>
          </div>
        </>
      )}

      {/* Paiement Popup */}
      <Pai
        cart={products}
        show={showPaiement}
        onClose={() => setShowPaiement(false)}
        total={total}
      />

      <style>{`
        .cart-container {
          padding: 1rem;
          font-family: Arial, sans-serif;
          color: #333;
        }

        .cart-loading {
          text-align: center;
          padding: 1rem;
          color: #666;
        }

        .cart-items {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }

        .cart-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .cart-item-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 1rem;
        }

        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cart-item-name {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .cart-item-price {
          font-size: 0.85rem;
          color: #666;
        }

        .stock-warning {
          font-size: 0.75rem;
          color: #e53e3e;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .quantity-btn {
          background: none;
          border: none;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          color: #333;
          transition: all 0.2s;
        }

        .quantity-btn:disabled {
          color: #ccc;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .quantity-btn:not(:disabled):hover {
          background-color: #f5f5f5;
        }

        .quantity {
          padding: 0.25rem 0.5rem;
          font-size: 0.85rem;
          min-width: 24px;
          text-align: center;
        }

        .remove-btn {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: #e53e3e;
          transition: color 0.2s;
        }

        .remove-btn:hover {
          color: #c53030;
        }

        .cart-footer {
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .checkout-btn {
          width: 100%;
          padding: 0.75rem;
          background-color: #1EB76C;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .checkout-btn:hover {
          background-color: #17a558;
        }

        .checkout-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default Panier;
