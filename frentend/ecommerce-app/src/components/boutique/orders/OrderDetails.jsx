import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Save,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { formatDistanceToNow, parseISO, format } from "date-fns";

const statusConfig = {
  en_attente: { label: "En attente", color: "warning", icon: Clock },
  en_preparation: { label: "Préparation", color: "primary", icon: Package },
  en_livraison: { label: "Livraison", color: "info", icon: Truck },
  livree: { label: "Livrée", color: "success", icon: CheckCircle2 },
  annulee: { label: "Annulée", color: "danger", icon: XCircle },
};

const OrderDetails = ({ orderId, onClose, isModal }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  const formatPrice = (value) => {
    const number = Number(value || 0);
    return isNaN(number) ? "0.00" : number.toFixed(2);
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "dd/MM/yyyy");
  };

  const handleStockAndTransactions = async (order) => {
    try {
      const produitsAvecPrix = await Promise.all(
        order.products.map(async (produit) => {
          try {
            const { data } = await axios.get(
              `http://localhost:8080/api/products/${produit.idProduit}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            const vendeurRes = await axios.get(
              `http://localhost:8080/api/products/${produit.idProduit}/user`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            return {
              ...produit,
              prix: data.price,
              idVendeur: vendeurRes.data,
              type: data.type.toUpperCase(),
            };
          } catch (error) {
            console.error(
              `Erreur lors de la récupération du produit ${produit.idProduit}:`,
              error
            );
            return null;
          }
        })
      );

      const validProduits = produitsAvecPrix.filter((p) => p !== null);
      if (validProduits.length === 0) {
        throw new Error("Aucun produit valide récupéré");
      }

      const userId = order.idUtilisateur;
      let transactionPayload = {
        idCommande: order.id,
        idAcheteur: userId,
        montant: validProduits.reduce((acc, p) => acc + p.prix * p.quantite, 0),
        produits: validProduits.map((p) => ({
          idProduit: p.idProduit,
          quantite: p.quantite,
          prix: p.prix,
          idVendeur: p.idVendeur,
        })),
        dateTransaction: new Date().toISOString(),
      };

      // Temporary: Bypass statut === 'payee' for testing
      // if (order.statut === 'payee') {
      if (true) {
        const intermediairesParProduit = {};
        for (const p of validProduits) {
          const catRes = await axios.get(
            `http://localhost:8080/api/products/${p.idProduit}/category`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const categorieId = catRes.data?.categoryId;

          if (!categorieId) {
            console.error(
              `categorieId manquant pour le produit ${p.idProduit}:`,
              catRes.data
            );
            throw new Error(
              `categorieId manquant pour le produit ${p.idProduit}`
            );
          }

          if (!userId || !p.idVendeur) {
            console.error("Paramètres manquants:", {
              idUtilisateur: userId,
              idVendeur: p.idVendeur,
            });
            throw new Error("idUtilisateur ou idVendeur manquant");
          }

          console.log(
            "Paramètres de l'API intermediaries/between pour le produit",
            p.idProduit,
            ":",
            {
              idUtilisateur: userId,
              idVendeur: p.idVendeur,
              categorieId: categorieId,
            }
          );

          console.log(
            "Calling intermediaries API:",
            `http://localhost:8080/api/intermediaries/between/${userId}/${p.idVendeur}/${categorieId}`
          );

          const interRes = await axios.get(
            `http://localhost:8080/api/intermediaries/between/${userId}/${p.idVendeur}/${categorieId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const intermediaires = Array.isArray(interRes.data)
            ? interRes.data
            : [];
          intermediairesParProduit[p.idProduit] = intermediaires.map(
            (i) => i.id
          );
        }

        transactionPayload = {
          ...transactionPayload,
          produits: validProduits.map((p) => ({
            idProduit: p.idProduit,
            quantite: p.quantite,
            prix: p.prix,
            idVendeur: p.idVendeur,
            intermediaires: intermediairesParProduit[p.idProduit] || [],
          })),
        };
      }

      await axios.post(
        "http://localhost:8080/api/transactions",
        transactionPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Erreur transaction:", error);
      throw new Error(
        `Échec de la transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleSaveChanges = async () => {
    if (!order) return;

    const originalStatus = order.statut;
    setProcessing(true);

    try {
      setOrder((prev) => ({ ...prev, statut: editedStatus }));

      await axios.put(
        `http://localhost:8080/api/commandes/${orderId}/statut`,
        { statut: editedStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (editedStatus === "livree") {
        await handleStockAndTransactions(order);
      }

      if (editedStatus === "annulee") {
        await Promise.all(
          order.products.map(async (product) => {
            try {
              const { data } = await axios.get(
                `http://localhost:8080/api/products/${product.idProduit}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              const type = data.type.toUpperCase();

              if (
                !Number.isInteger(product.quantite) ||
                product.quantite <= 0
              ) {
                throw new Error(
                  `Quantité invalide pour le produit ${product.idProduit}`
                );
              }

              await axios.put(
                `http://localhost:8080/api/products/${product.idProduit}/stock`,
                { operation: "increment", value: product.quantite },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (type === "LOCATION") {
                if (!product.startDate || !product.endDate) {
                  console.warn(
                    `Dates de réservation manquantes pour le produit ${product.idProduit}`
                  );
                  return;
                }
                await axios.delete(
                  `http://localhost:8080/api/products/${product.idProduit}/rental/cancel`,
                  {
                    data: {
                      startDate: product.startDate,
                      endDate: product.endDate,
                    },
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
              }
            } catch (error) {
              console.error(
                `Erreur lors de la mise à jour du produit ${product.idProduit}:`,
                error
              );
              throw new Error(
                `Échec de mise à jour pour le produit ${product.idProduit}: ${error.message}`
              );
            }
          })
        );
      }

      setEditMode(false);
    } catch (error) {
      setOrder((prev) => ({ ...prev, statut: originalStatus }));
      alert(
        `Échec de la mise à jour: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8080/api/commandes/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const productsWithDetails = await Promise.all(
          data.produits.map(async (produit) => {
            try {
              const productRes = await axios.get(
                `http://localhost:8080/api/products/${produit.idProduit}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              return {
                ...produit,
                name: productRes.data.name,
                price: productRes.data.price,
                image: productRes.data.imageName
                  ? `http://localhost:8080/api/products/images/${productRes.data.imageName}`
                  : null,
              };
            } catch (error) {
              console.error(`Erreur produit ${produit.idProduit}:`, error);
              return {
                ...produit,
                name: "Produit indisponible",
                price: 0,
                image: null,
                error: true,
              };
            }
          })
        );

        setOrder({
          ...data,
          products: productsWithDetails,
          total: data.total
            ? Number(data.total)
            : productsWithDetails.reduce(
                (sum, p) => sum + p.price * p.quantite,
                0
              ),
          dateCommande: formatDistanceToNow(parseISO(data.dateCommande), {
            addSuffix: true,
          }),
        });
        setEditedStatus(data.statut);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100">
        <p className="h5 text-secondary mb-3">Commande introuvable</p>
        <button className="btn btn-primary" onClick={onClose}>
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className={isModal ? "p-3" : "container py-4"}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-light btn-sm" onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="h3 mb-0">Commande #{order.id}</h1>
          <span
            className={`badge bg-${statusConfig[order.statut]?.color} ms-2`}
          >
            {statusConfig[order.statut]?.label}
          </span>
        </div>

        <div className="d-flex gap-2">
          {editMode ? (
            <>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setEditMode(false)}
                disabled={processing}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleSaveChanges}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Enregistrer
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
              disabled={order.statut === "annulee" || order.statut === "livree"}
            >
              Modifier
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Informations de livraison</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <p className="text-muted small mb-1">Nom du client</p>
                <p className="mb-0">{order.livraison.nomComplet}</p>
              </div>

              <div className="mb-3">
                <p className="text-muted small mb-1">Statut</p>
                <select
                  className={`form-select form-select-sm border-${
                    statusConfig[editedStatus]?.color || "secondary"
                  }`}
                  value={editedStatus}
                  onChange={(e) => editMode && setEditedStatus(e.target.value)}
                  disabled={!editMode}
                >
                  {Object.keys(statusConfig).map((status) => (
                    <option key={status} value={status}>
                      {statusConfig[status].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                  <MapPin size={14} />
                  <span>Adresse de livraison</span>
                </div>
                <p className="mb-0">{order.livraison.adresse}</p>
                <p className="mb-0">
                  {order.livraison.codePostal} {order.livraison.ville}
                </p>
                <p className="mb-0">📞 {order.livraison.telephone}</p>
                {order.livraison.livraisonADomicile !== undefined && (
                  <span className="badge bg-info-subtle text-dark mt-2">
                    {order.livraison.livraisonADomicile
                      ? "Livraison à domicile - Paiement à la livraison"
                      : "Livraison à domicile - Paiement en ligne"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Détails de la commande</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                {order.products.map((product, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center p-3 border rounded mb-2"
                  >
                    <div
                      className="rounded overflow-hidden bg-light d-flex align-items-center justify-content-center"
                      style={{ width: 80, height: 80 }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="img-fluid h-100 object-fit-cover"
                        />
                      ) : (
                        <Package className="text-secondary" size={24} />
                      )}
                    </div>
                    <div className="ms-3 flex-grow-1">
                      <h6 className="mb-1">{product.name}</h6>
                      <p className="text-muted small mb-0">
                        DT{formatPrice(product.price)} × {product.quantite}
                      </p>
                      {product.startDate && product.endDate && (
                        <p className="text-muted small mb-0">
                          Location du {formatDate(product.startDate)} au{" "}
                          {formatDate(product.endDate)}
                        </p>
                      )}
                    </div>
                    <div className="text-nowrap">
                      DT{formatPrice(product.price * product.quantite)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Sous-total :</span>
                  <span>DT{formatPrice(order.total)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Livraison :</span>
                  <span>DT0.00</span>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top fw-bold">
                  <span>Total :</span>
                  <span>DT{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
