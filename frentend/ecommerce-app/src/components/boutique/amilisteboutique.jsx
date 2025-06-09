import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const StoreCard = ({ boutique, logoUrl }) => {
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
          <div className="card-img-top d-flex align-items-center justify-content-center" 
               style={{ height: '200px', backgroundColor: '#f0f0f0' }}>
            <i className="bi bi-image fs-1 text-muted"></i>
          </div>
        )}
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title fw-bold">{boutique.nom}</h5>
            <p className="card-text text-muted mb-0">{boutique.description}</p>
            <small className="text-muted">{boutique.type}</small>
          </div>
          <Link 
            to={`/amiboutique/${boutique.id}`}
            className="btn btn-sm btn-outline-primary ms-2 mt-1"
          >
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const LLboutique = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [logos, setLogos] = useState({});
  const navigate = useNavigate();
  const { userId } = useParams(); // <-- On récupère userId depuis l'URL

  useEffect(() => {
    const fetchUserBoutiques = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        if (!userId) {
          setError('Identifiant utilisateur manquant dans l\'URL');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/boutiques/by-user?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBoutiques(response.data);

        const logosPromises = response.data.map(async (boutique) => {
          try {
            const logoResponse = await axios.get(
              `http://localhost:8080/api/boutiques/${boutique.id}/logo`,
              {
                responseType: 'arraybuffer',
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Cache-Control': 'no-cache',
                }
              }
            );

            const contentType = logoResponse.headers['content-type'] || 'image/jpeg';
            const base64Logo = `data:${contentType};base64,${arrayBufferToBase64(logoResponse.data)}`;

            return { id: boutique.id, logoUrl: base64Logo };
          } catch (err) {
            console.error(`Erreur chargement logo ${boutique.id}`, err);
            return { id: boutique.id, logoUrl: null };
          }
        });

        const logosData = await Promise.all(logosPromises);
        const logosMap = logosData.reduce((acc, { id, logoUrl }) => {
          acc[id] = logoUrl;
          return acc;
        }, {});

        setLogos(logosMap);

      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des boutiques');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBoutiques();
  }, [navigate, userId]);

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
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Header ou bouton optionnel ici */}
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      <div className="row g-4">
        {boutiques.length > 0 ? (
          boutiques.map((boutique) => (
            <StoreCard
              key={boutique.id}
              boutique={boutique}
              logoUrl={logos[boutique.id]}
            />
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <i className="bi bi-shop fs-1 text-muted mb-3 d-block"></i>
                <h5 className="card-title mb-3">Aucune boutique trouvée</h5>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLboutique;
