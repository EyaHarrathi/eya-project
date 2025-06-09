import React, { useState, useEffect } from 'react';
import {
  Package2,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag
} from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns';

const statuses = [
  { value: 'en_attente', label: 'En attente', icon: Clock },
  { value: 'en_preparation', label: 'Préparation', icon: Package2 },
  { value: 'en_livraison', label: 'Livraison', icon: Truck },
  { value: 'livree', label: 'Livrée', icon: CheckCircle2 },
  { value: 'annulee', label: 'Annulée', icon: XCircle }
];

const OrderStatus = ({ order, onStatusChange, userRole }) => {
  const currentStatusIndex = statuses.findIndex(s => s.value === order.statut);

  return (
    <div className="card shadow border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold">Suivi de la commande</h5>
        {order.statut !== 'livree' && order.statut !== 'annulee' && (
          <select
            className="form-select w-auto"
            value={order.statut}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {statuses.map(status => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between position-relative px-2">
          <div className="position-absolute top-50 start-0 end-0 border-bottom border-2 border-light" />
          {statuses.map((status, index) => {
            const Icon = status.icon;
            const isDone = index <= currentStatusIndex && !['annulee', 'en_attente'].includes(order.statut);
            const isCurrent = status.value === order.statut;

            return (
              <div
                key={status.value}
                className="text-center position-relative"
                style={{ zIndex: 1, flex: 1 }}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2
                    ${isDone ? 'bg-primary text-white' : 'bg-light text-secondary'}
                    ${isCurrent ? 'border border-3 border-primary' : ''}
                    ${order.statut === 'annulee' ? 'bg-danger text-white' : ''}`}
                  style={{ width: 45, height: 45 }}
                >
                  <Icon size={22} />
                </div>
                <small className={`${isCurrent ? 'text-primary fw-semibold' : 'text-muted'}
                  ${order.statut === 'annulee' ? 'text-danger' : ''}`}>
                  {status.label}
                </small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const OrderDetails = ({ order }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productDetails = await Promise.all(
          order.produits.map(async (product) => {
            try {
              const [nameRes, imageRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/products/name/${product.idProduit}`),
                axios.get(`http://localhost:8080/api/products/${product.idProduit}/imageName`)
              ]);
              return {
                ...product,
                productName: nameRes.data,
                imageName: imageRes.data,
                error: false
              };
            } catch (error) {
              console.error('Erreur produit:', error);
              return { ...product, productName: 'Produit indisponible', imageName: '', error: true };
            }
          })
        );
        setProducts(productDetails);
      } catch (error) {
        console.error('Erreur général:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductDetails();
  }, [order.produits]);

  return (
    <div className="card shadow border-0">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Détails de la commande</h5>
      </div>
      <div className="card-body row">
        <div className="col-md-6 mb-4">
          <h6 className="text-muted mb-2">Informations de livraison</h6>
          <p className="mb-1">{order.livraison.nomComplet}</p>
          <p className="mb-1">{order.livraison.adresse}</p>
          <p className="mb-1">{order.livraison.ville}, {order.livraison.codePostal}</p>
          <p className="mb-1">📞 {order.livraison.telephone}</p>
          <span className="badge bg-info-subtle text-dark mt-2">
            {order.livraison.livraisonADomicile ?   'Livraison à domicile - Paiement à la livraison'
                      : 'Livraison à domicile - Paiement en ligne'}
          </span>
        </div>

        <div className="col-md-6">
          <h6 className="text-muted mb-2">Produits commandés</h6>
          {loadingProducts ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {products.map((p, idx) => (
                <li
                  key={idx}
                  className="list-group-item px-0 d-flex align-items-center"
                  title={p.error ? "Ce produit n'est plus disponible" : ""}
                >
                  {p.imageName && (
                    <img
                      src={`http://localhost:8080/api/products/images/${p.imageName}`}
                      alt={p.productName}
                      className="me-3 rounded"
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        opacity: p.error ? 0.5 : 1
                      }}
                    />
                  )}
                  <div className={p.error ? "text-muted" : ""}>
                    <strong>{p.productName}</strong>
                    <span className="text-muted"> × </span>
                    <strong>{p.quantite}</strong>
                    {p.error && (
                      <span className="ms-2 text-danger">
                        <XCircle size={16} />
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <h6 className="text-muted mb-2">Date de la commande</h6>
            <p className="mb-0">
              {formatDistanceToNow(parseISO(order.dateCommande), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VendeurApp() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('user');

  const normalizeStatus = (status) => {
    const s = status.toLowerCase().replace(' ', '_');
    if (['non_payee', 'payee'].includes(s)) return 'en_attente';
    return s;
  };

  const fetchUserRole = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/${userId}/role`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data.role;
    } catch (error) {
      console.error("Erreur de récupération du rôle:", error);
      return 'user';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("Utilisateur non authentifié");
        }

        const role = await fetchUserRole(userId);
        setUserRole(role);

        const apiUrl = role === 'premium'
          ? `http://localhost:8080/api/commandes/by-vendeur?vendeurId=${userId}`
          : `http://localhost:8080/api/commandes/by-user/${userId}`;

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const normalizedOrders = response.data.map(order => ({
          ...order,
          statut: normalizeStatus(order.statut),
          dateCommande: order.dateCommande || new Date().toISOString()
        }));

        setOrders(normalizedOrders);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur de chargement des commandes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStockAndTransactions = async (order) => {
    try {
      const produitsAvecPrix = await Promise.all(
        order.produits.map(async (produit) => {
          try {
            // Fetch product details
            const { data } = await axios.get(
              `http://localhost:8080/api/products/${produit.idProduit}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return {
              ...produit,
              prix: produit.prix || data.price, // Use prix from order if available, else from API
              idVendeur: produit.idVendeur, // Use idVendeur from order structure
              type: data.type ? data.type.toUpperCase() : 'VENTE' // Default to 'VENTE' if type is missing
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération du produit ${produit.idProduit}:`, error);
            return null;
          }
        })
      );

      const validProduits = produitsAvecPrix.filter(p => p !== null);
      if (validProduits.length === 0) {
        throw new Error('Aucun produit valide récupéré');
      }

      const userId = order.idUtilisateur;
      if (!userId) {
        throw new Error('idUtilisateur manquant dans la commande');
      }

      let transactionPayload = {
        idCommande: order.id,
        idAcheteur: userId,
        montant: validProduits.reduce((acc, p) => acc + (p.prix * p.quantite), 0),
        produits: validProduits.map(p => ({
          idProduit: p.idProduit,
          quantite: p.quantite,
          prix: p.prix,
          idVendeur: p.idVendeur
        })),
        dateTransaction: new Date().toISOString()
      };

      // Include intermediaries (bypass statut === 'payee' for testing as per OrderDetails)
      const intermediairesParProduit = {};
      for (const p of validProduits) {
        if (!p.idVendeur) {
          console.error(`idVendeur manquant pour le produit ${p.idProduit}`);
          throw new Error(`idVendeur manquant pour le produit ${p.idProduit}`);
        }

        try {
          const catRes = await axios.get(
            `http://localhost:8080/api/products/${p.idProduit}/category`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          const categorieId = catRes.data?.categoryId;

          if (!categorieId) {
            console.error(`categorieId manquant pour le produit ${p.idProduit}:`, catRes.data);
            throw new Error(`categorieId manquant pour le produit ${p.idProduit}`);
          }

          console.log('Calling intermediaries API:', 
            `http://localhost:8080/api/intermediaries/between/${userId}/${p.idVendeur}/${categorieId}`);

          const interRes = await axios.get(
            `http://localhost:8080/api/intermediaries/between/${userId}/${p.idVendeur}/${categorieId}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );

          const intermediaires = Array.isArray(interRes.data) ? interRes.data : [];
          intermediairesParProduit[p.idProduit] = intermediaires.map(i => i.id);
        } catch (error) {
          console.error(`Erreur lors de la récupération des intermédiaires pour le produit ${p.idProduit}:`, error);
          throw new Error(`Échec de la récupération des intermédiaires pour le produit ${p.idProduit}: ${error.message}`);
        }
      }

      transactionPayload = {
        ...transactionPayload,
        produits: validProduits.map(p => ({
          idProduit: p.idProduit,
          quantite: p.quantite,
          prix: p.prix,
          idVendeur: p.idVendeur,
          intermediaires: intermediairesParProduit[p.idProduit] || []
        }))
      };

      await axios.post(
        'http://localhost:8080/api/transactions',
        transactionPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    } catch (error) {
      console.error('Erreur transaction:', error);
      throw new Error(`Échec de la transaction: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const selectedOrder = orders[selectedOrderIndex];
    if (!selectedOrder) return;

    const originalStatus = selectedOrder.statut;

    try {
      // Optimistic update
      setOrders(prev => prev.map((order, index) =>
        index === selectedOrderIndex ? { ...order, statut: newStatus } : order
      ));

      // Update status in backend
      await axios.put(
        `http://localhost:8080/api/commandes/${selectedOrder.id}/statut`,
        { statut: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Handle 'livree' status
      if (newStatus === 'livree') {
        await handleStockAndTransactions(selectedOrder);
      }

      // Handle 'annulee' status
      if (newStatus === 'annulee') {
        await Promise.all(
          selectedOrder.produits.map(async (product) => {
            try {
              const { data } = await axios.get(
                `http://localhost:8080/api/products/${product.idProduit}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
              const type = data.type ? data.type.toUpperCase() : 'VENTE';

              if (!Number.isInteger(product.quantite) || product.quantite <= 0) {
                throw new Error(`Quantité invalide pour le produit ${product.idProduit}`);
              }

              await axios.put(
                `http://localhost:8080/api/products/${product.idProduit}/stock`,
                { operation: 'increment', value: product.quantite },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                }
              );

              if (type === 'LOCATION') {
                if (!product.startDate || !product.endDate) {
                  console.warn(`Dates de réservation manquantes pour le produit ${product.idProduit}`);
                  return;
                }
                await axios.delete(
                  `http://localhost:8080/api/products/${product.idProduit}/rental/cancel`,
                  {
                    data: { startDate: product.startDate, endDate: product.endDate },
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                  }
                );
              }
            } catch (error) {
              console.error(`Erreur lors de la mise à jour du produit ${product.idProduit}:`, error);
              throw new Error(`Échec de mise à jour pour le produit ${product.idProduit}: ${error.message}`);
            }
          })
        );
      }
    } catch (err) {
      // Rollback on error
      setOrders(prev => prev.map((order, index) =>
        index === selectedOrderIndex ? { ...order, statut: originalStatus } : order
      ));

      const errorMessage = err.response?.data?.message
        || err.message
        || "Erreur lors de la mise à jour";
      alert(`Échec : ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid bg-body-tertiary min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid bg-body-tertiary min-vh-100 d-flex justify-content-center align-items-center">
        <div className="alert alert-danger text-center">
          <h4 className="alert-heading">Erreur</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-fluid bg-body-tertiary min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <ShoppingBag size={64} className="mb-3 text-muted" />
        <h4 className="text-muted mb-3">
          {userRole === 'premium'
            ? "Aucune commande disponible"
            : "Vous n'avez aucune commande"}
        </h4>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-body-tertiary min-vh-100">
      <header className="bg-white shadow-sm px-4 py-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <ShoppingBag size={32} className="text-primary" />
          <h1 className="mb-0 h4 fw-bold">
            {userRole === 'premium'
              ? 'Espace Vendeur Premium'
              : 'Mes Commandes'}
          </h1>
          {userRole === 'premium' && (
            <span className="badge bg-warning text-dark ms-auto">
              Compte Premium
            </span>
          )}
        </div>
      </header>

      <div className="row g-4 px-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Liste des Commandes</h6>
              <small className="text-muted">
                {orders.length} commande{orders.length > 1 ? 's' : ''}
              </small>
            </div>
            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '70vh' }}>
              {orders.map((order, index) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrderIndex(index)}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center
                    ${selectedOrderIndex === index ? 'active' : ''}`}
                >
                  <div className="d-flex flex-column">
                    <span className="fw-medium">Commande #{index + 1}</span>
                    <small className="text-truncate" style={{ maxWidth: '200px' }}>
                      {order.livraison.nomComplet}
                    </small>
                  </div>
                  <span className={`badge text-capitalize ${
                    order.statut === 'en_attente' ? 'bg-warning text-dark' :
                    order.statut === 'en_preparation' ? 'bg-info text-dark' :
                    order.statut === 'en_livraison' ? 'bg-primary' :
                    order.statut === 'livree' ? 'bg-success' :
                    'bg-danger'
                  }`}>
                    {order.statut.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            <OrderStatus
              order={orders[selectedOrderIndex]}
              onStatusChange={handleStatusChange}
              userRole={userRole}
            />
            <OrderDetails order={orders[selectedOrderIndex]} />
          </div>
        </div>
      </div>
    </div>
  );
}