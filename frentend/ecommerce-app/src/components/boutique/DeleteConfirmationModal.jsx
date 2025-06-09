import React from 'react';
import axios from 'axios';

const DeleteConfirmationModal = ({ show, onClose, boutique, onDeleted }) => {
  if (!show || !boutique) return null;

  const handleDelete = async () => {
    console.log("Boutique ID:", boutique.id);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/boutiques/${boutique.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 204) {
        onDeleted(boutique.id);
        onClose();
      } else {
        throw new Error("Suppression échouée. Code de réponse: " + response.status);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      if (error.response) {
        alert(`Erreur serveur : ${error.response.data.message || 'Suppression échouée'}`);
      } else if (error.request) {
        alert("Problème de réseau ou serveur non accessible.");
      } else {
        alert(`Erreur inconnue : ${error.message}`);
      }
    }
  };

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmer la suppression</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer la boutique <strong>{boutique.nom}</strong> ?
              </p>
              <p className="text-danger mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Cette action est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default DeleteConfirmationModal;
