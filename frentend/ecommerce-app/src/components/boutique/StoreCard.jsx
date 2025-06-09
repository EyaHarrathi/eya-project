import React from 'react';
import { Link } from 'react-router-dom';

const StoreCard = ({ boutique, logoUrl, onEditClick, onDeleteClick }) => {
  return (
    <div className="col-md-6 col-lg-4 d-flex">
      <div className="card mb-4 w-100 shadow-sm">
        {logoUrl ? (
          <img
            src={logoUrl}
            className="card-img-top"
            alt={boutique.nom}
            style={{ height: '200px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '';
              e.target.parentNode.innerHTML = `
                <div class="card-img-top d-flex align-items-center justify-content-center" 
                     style="height: 200px; background-color: #f0f0f0">
                  <i class="bi bi-image fs-1 text-muted"></i>
                </div>
              `;
            }}
          />
        ) : (
          <div
            className="card-img-top d-flex align-items-center justify-content-center"
            style={{ height: '200px', backgroundColor: '#f0f0f0' }}
          >
            <i className="bi bi-image fs-1 text-muted"></i>
          </div>
        )}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="card-title fw-bold">{boutique.nom}</h5>
              <p className="card-text text-muted mb-0">{boutique.description}</p>
              <small className="text-muted">{boutique.type}</small>
            </div>
            <Link
              to={`/boutique/${boutique.id}`}
              className="btn btn-sm btn-outline-primary ms-2 mt-1"
            >
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="d-flex mt-3 justify-content-end gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onEditClick}
              title="Modifier la boutique"
            >
              <i className="bi bi-pencil me-1"></i>
              Modifier
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={onDeleteClick}
              title="Supprimer la boutique"
            >
              <i className="bi bi-trash me-1"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
