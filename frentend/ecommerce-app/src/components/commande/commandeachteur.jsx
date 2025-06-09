import React, { useState, useEffect } from 'react';
import { Package2, Truck, CheckCircle2, Clock, XCircle, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns';

const statuses = [
  { value: 'en_attente', label: 'En attente', icon: Clock },
  { value: 'en_preparation', label: 'Préparation', icon: Package2 },
  { value: 'en_livraison', label: 'Livraison', icon: Truck },
  { value: 'livree', label: 'Livrée', icon: CheckCircle2 },
  { value: 'annulee', label: 'Annulée', icon: XCircle }
];

const OrderStatus = ({ statut }) => {
  const currentStatusIndex = statuses.findIndex(s => s.value === statut);

  return (
    <div className="card shadow border-0">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Suivi de votre commande</h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between position-relative px-2">
          <div className="position-absolute top-50 start-0 end-0 border-bottom border-2 border-light" style={{ zIndex: 0 }} />
          {statuses.map((status, index) => {
            const Icon = status.icon;
            const isDone = index <= currentStatusIndex && statut !== 'annulee';
            const isCurrent = status.value === statut;
            return (
              <div key={status.value} className="text-center position-relative" style={{ zIndex: 1, flex: 1 }}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2
                    ${isDone ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'}
                    ${isCurrent ? 'border border-3 border-primary' : ''}`}
                  style={{ width: 45, height: 45 }}
                >
                  <Icon size={22} />
                </div>
                <small className={isCurrent ? 'text-primary fw-semibold' : 'text-muted'}>
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

  const formattedDate = formatDistanceToNow(parseISO(order.dateCommande), { addSuffix: true });

  useEffect(() => {
    const fetchProductDetails = async () => {
      const productDetails = await Promise.all(order.produits.map(async (product) => {
        try {
          const productNameResponse = await axios.get(`http://localhost:8080/api/products/name/${product.idProduit}`);
          const productName = productNameResponse.data;

          const imageNameResponse = await axios.get(`http://localhost:8080/api/products/${product.idProduit}/imageName`);
          const imageName = imageNameResponse.data;

          return { ...product, productName, imageName };
        } catch (error) {
          console.error('Erreur lors de la récupération des informations du produit:', error);
          return { ...product, productName: 'Produit non trouvé', imageName: '' };
        }
      }));

      setProducts(productDetails);
    };

    fetchProductDetails();
  }, [order.produits]);

  return (
    <div className="card shadow border-0">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Détails de votre commande</h5>
      </div>
      <div className="card-body row">
        <div className="col-md-6 mb-4">
          <h6 className="text-muted mb-2">Informations de livraison</h6>
          <p className="mb-1">{order.livraison.nomComplet}</p>
          <p className="mb-1">{order.livraison.adresse}</p>
          <p className="mb-1">{order.livraison.ville}, {order.livraison.codePostal}</p>
          <p className="mb-1">📞 {order.livraison.telephone}</p>
          <span className="badge bg-info-subtle text-dark mt-2">
            {order.livraison.livraisonADomicile ? 'Livraison à domicile' : 'Point relais'}
          </span>
        </div>
        <div className="col-md-6">
          <h6 className="text-muted mb-2">Vos produits</h6>
          <ul className="list-group list-group-flush">
            {products.map((p, idx) => (
              <li key={idx} className="list-group-item px-0 d-flex align-items-center">
                {p.imageName && (
                  <img
                    src={`http://localhost:8080/api/products/images/${p.imageName}`}
                    alt={p.productName}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    className="me-3 rounded"
                    loading="lazy"
                  />
                )}
                <div>
                  <strong>{p.productName}</strong>
                  <span className="text-muted"> × </span>
                  <strong>{p.quantite}</strong>
                </div>
              </li>
            ))}
          </ul>
          <h6 className="mt-3 text-muted">Date de la commande</h6>
          <p>{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default function AcheteurApp() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    axios.get(`http://localhost:8080/api/commandes?userId=${userId}`)
      .then(response => {
        const updatedOrders = response.data.map(order => {
          let s = order.statut.toLowerCase();
          if (['non_payee', 'payee'].includes(s)) s = 'en_attente';
          return { ...order, statut: s };
        });
        setOrders(updatedOrders);
      })
      .catch(error => {
        console.error('Erreur de récupération des commandes:', error);
      });
  }, []);

  // // Mise à jour du statut dans la base
  // useEffect(() => {
  //   const order = orders[selectedOrderIndex];
  //   if (!order) return;

  //   axios.put(
  //     `http://localhost:8080/api/commandes/${order.id}/statut`,
  //     null,
  //     { params: { statut: order.statut } }
  //   ).catch(console.error);
  // }, [orders, selectedOrderIndex]);

  // // Création de transaction automatique si commande livrée
  // useEffect(() => {
  //   const order = orders[selectedOrderIndex];
  //   if (!order || order.statut !== 'livree') return;

  //   const transactionData = {
  //     idAcheteur: order.idUtilisateur,
  //     idCommande: order.id,
  //     dateTransaction: new Date().toISOString(),
  //     montant: order.montantTotal || order.produits.reduce((sum, p) => sum + (p.prix * p.quantite), 0),
  //     intermediaires: [], // adapte si tu as une logique pour ça
  //     produits: order.produits.map(p => ({
  //       idProduit: p.idProduit,
  //       ipVendeur: p.ipVendeur || '', // tu peux adapter cette partie selon tes données
  //       prix: p.prix,
  //       quantite: p.quantite
  //     }))
  //   };

  //   axios.post('http://localhost:8080/api/transactions', transactionData)
  //     .then(res => {
  //       console.log('✅ Transaction créée pour la livraison :', res.data);
  //     })
  //     .catch(err => {
  //       console.error('❌ Erreur lors de la création de la transaction :', err);
  //     });
  // }, [orders, selectedOrderIndex]);

  const badgeStyle = (statut) => {
    switch (statut) {
      case 'en_attente': return 'bg-warning text-dark';
      case 'en_preparation': return 'bg-info text-dark';
      case 'en_livraison': return 'bg-primary';
      case 'livree': return 'bg-success';
      case 'annulee': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (!orders) {
    return <div className="p-5 text-center">Chargement des commandes...</div>;
  }
  
  if (orders.length === 0) {
    return (
      <div className="container d-flex flex-column align-items-center justify-content-center py-5">
        <ShoppingBag size={48} className="mb-3 text-muted" />
        <h4 className="text-muted">Vous n’avez pas encore de commandes.</h4>
        <p className="text-secondary">Vos commandes apparaîtront ici dès que vous en aurez passé une.</p>
      </div>
    );
  }
  

  const currentOrder = orders[selectedOrderIndex];

  return (
    <div className="container-fluid bg-body-tertiary min-vh-100">
      <header className="bg-white shadow-sm px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <ShoppingBag size={28} className="text-primary" />
          <h4 className="mb-0 fw-bold">Espace Client - Mes Commandes</h4>
        </div>
      </header>

      <div className="row px-4">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-semibold">Mes Commandes</h6>
            </div>
            <div className="list-group list-group-flush">
              {orders.map((order, index) => (
                <button
                  key={index}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center
                    ${selectedOrderIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedOrderIndex(index)}
                >
                  <div>
                    <div>Commande {1 + index}</div>
                    <small className="text-muted">Statut: {order.statut.replace('_', ' ')}</small>
                  </div>
                  <span className={`badge ${badgeStyle(order.statut)} text-capitalize`}>
                    {order.statut.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-8 d-flex flex-column gap-4">
          <OrderStatus statut={currentOrder.statut} />
          <OrderDetails order={currentOrder} />
        </div>
      </div>
    </div>
  );
}
