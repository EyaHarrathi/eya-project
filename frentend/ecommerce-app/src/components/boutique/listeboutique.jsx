import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import StoreCard from '../boutique/StoreCard';
import EditBoutiqueModal from '../boutique/EditBoutiqueModal ';
import DeleteConfirmationModal from '../boutique/DeleteConfirmationModal';

// Fonction de traduction des types
const getTranslatedType = (type) => {
  switch (type) {
    case 'retail': return 'Vente au Détail';
    case 'wholesale': return 'Vente en Gros';
    case 'service': return 'Service';
    default: return 'Type inconnu';
  }
};

const Lboutique = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoutique, setSelectedBoutique] = useState(null);
  const [actionSuccess, setActionSuccess] = useState({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  // Configuration Axios
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    return btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), ''));
  };

  const fetchUserBoutiques = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) return navigate('/login');

      const response = await axios.get(
        `http://localhost:8080/api/boutiques/by-user?userId=${userId}&cache=${Date.now()}`
      );

      const boutiquesWithData = await Promise.all(
        response.data.map(async boutique => {
          try {
            const logoResponse = await axios.get(
              `http://localhost:8080/api/boutiques/${boutique.id}/logo?cache=${Date.now()}`,
              { responseType: 'arraybuffer' }
            );
            
            return {
              ...boutique,
              typeLabel: getTranslatedType(boutique.type),
              logoUrl: `data:${logoResponse.headers['content-type']};base64,${arrayBufferToBase64(logoResponse.data)}`
            };
          } catch {
            return { ...boutique, typeLabel: getTranslatedType(boutique.type), logoUrl: null };
          }
        })
      );

      setBoutiques(boutiquesWithData);
      setError('');
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      navigate('/login');
    } else {
      setError(error.response?.data?.message || 'Erreur serveur');
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) navigate('/login');
    };

    checkAuth();
    fetchUserBoutiques();
    const interval = setInterval(fetchUserBoutiques, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleCreateBoutique = () => {
    boutiques.length >= 3 
      ? alert('Limite de 3 boutiques atteinte!') 
      : navigate('/novelle_boutique');
  };

  const handleEditClick = (boutique) => {
    setSelectedBoutique(boutique);
    setShowEditModal(true);
  };

  const handleDeleteClick = (boutique) => {
    setSelectedBoutique(boutique);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      await axios.put(
        `http://localhost:8080/api/boutiques/${formData.get('id')}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await fetchUserBoutiques();
      setShowEditModal(false);
      showSuccess('Boutique mise à jour avec succès !');
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/boutiques/${id}`);
      setBoutiques(prev => prev.filter(b => b.id !== id));
      showSuccess('Boutique supprimée avec succès !');
    } catch (error) {
      handleApiError(error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const showSuccess = (message) => {
    setActionSuccess({ show: true, message, type: 'success' });
    setTimeout(() => setActionSuccess(prev => ({ ...prev, show: false })), 3000);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-dark">Mes Boutiques</h1>
        <button 
          className={`btn d-flex align-items-center ${boutiques.length >= 3 ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleCreateBoutique}
          disabled={boutiques.length >= 3}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Boutique
        </button>
      </div>

      {/* Alertes */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {actionSuccess.show && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {actionSuccess.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setActionSuccess(prev => ({ ...prev, show: false }))}
          ></button>
        </div>
      )}

      {/* Liste des boutiques */}
      <div className="row g-4">
        {boutiques.length > 0 ? (
          boutiques.map(boutique => (
            <StoreCard 
              key={boutique.id}
              boutique={{
                ...boutique,
                type: boutique.typeLabel // Utilisation de la version traduite
              }}
              logoUrl={boutique.logoUrl}
              onEditClick={() => handleEditClick(boutique)}
              onDeleteClick={() => handleDeleteClick(boutique)}
            />
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <i className="bi bi-shop fs-1 text-muted"></i>
                <p className="mt-3 mb-0 text-muted">Vous n'avez pas encore de boutique.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditBoutiqueModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        boutique={selectedBoutique}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        boutique={selectedBoutique}
        onConfirm={() => handleDelete(selectedBoutique?.id)}
      />
    </div>
  );
};

export default Lboutique;