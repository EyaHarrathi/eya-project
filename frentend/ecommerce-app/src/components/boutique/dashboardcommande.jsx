import React, { useEffect, useState } from 'react';
import {
  Search,
  Clock,
  Package2,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import StatusBadge from "../boutique/orders/StatusBadge";
import OrderDetails from "../boutique/orders/OrderDetails";
import Modal from 'react-bootstrap/Modal';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { boutiqueId } = useParams();

  const normalizeStatus = (status) => {
    const s = status.toLowerCase();
    if (['non_payee', 'payee'].includes(s)) return 'en_attente';
    return s;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/boutique/${boutiqueId}/order`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        const normalizedOrders = response.data.map(order => ({
          ...order,
          statut: normalizeStatus(order.statut),
          dateCommande: order.dateCommande || new Date().toISOString()
        }));

        setOrders(normalizedOrders);
        calculateStats(normalizedOrders);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur de chargement des commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [boutiqueId]);

  const calculateStats = (orders) => {
    const counts = {
      pending: orders.filter(o => o.statut === 'en_attente').length,
      processing: orders.filter(o => ['en_preparation', 'en_livraison'].includes(o.statut)).length,
      completed: orders.filter(o => o.statut === 'livree').length
    };
    setStats(counts);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.livraison?.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mx-3">
        {error} - <button onClick={() => window.location.reload()} className="btn btn-link">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-4 px-4 px-sm-6 px-md-8">

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Rechercher..."
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">Tous statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_preparation">Préparation</option>
              <option value="en_livraison">Livraison</option>
              <option value="livree">Livrée</option>
            </select>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <p className="text-muted mb-0">En attente</p>
                  <Clock className="text-warning" />
                </div>
                <h2 className="mb-1 fw-bold">{stats.pending}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <p className="text-muted mb-0">En traitement</p>
                  <Package2 className="text-primary" />
                </div>
                <h2 className="mb-1 fw-bold">{stats.processing}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <p className="text-muted mb-0">Livrées</p>
                  <CheckCircle2 className="text-success" />
                </div>
                <h2 className="mb-1 fw-bold">{stats.completed}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white">
            <h5 className="mb-0 fw-semibold">Liste des Commandes</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setIsModalOpen(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="fw-medium">#{order.id}</td>
                    <td>{order.client || 'Client inconnu'}</td>
                    <td>{new Date(order.dateCommande).toLocaleDateString()}</td>
                    <td><StatusBadge status={order.statut} /></td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(order.id);
                          setIsModalOpen(true);
                        }}
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          show={isModalOpen}
          onHide={() => setIsModalOpen(false)}
          size="xl"
          centered
          dialogClassName="modal-90w"
        >
          <Modal.Header closeButton>
            <Modal.Title>Détails de la commande</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {selectedOrderId && (
              <OrderDetails
                orderId={selectedOrderId}
                onClose={() => setIsModalOpen(false)}
                isModal
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
