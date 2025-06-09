import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Col,
  Row,
  Spinner,
  Alert,
  Badge,
  ButtonGroup,
  Button,
  Form
} from "react-bootstrap";
import {
  Package,
  Euro,
  Search,
  AlertCircle,
  Store,
  Warehouse,
  ShoppingCart
} from "lucide-react";

// Type normalization mapping
const TYPE_MAPPING = {
  SALE: "SALE",
  VENTE: "SALE",
  RENT: "RENT",
  LOCATION: "RENT"
};

// Filter values for UI
const FILTER_VALUES = {
  TOUS: "tous",
  SALE: "vente",
  RENT: "location"
};

// Composant BoutiqueHeader
const BoutiqueHeader = ({ boutiqueId, boutiqueNom }) => {
  return (
    <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
      {boutiqueId ? (
        <Warehouse size={32} className="me-3 text-primary" />
      ) : (
        <Store size={32} className="me-3 text-primary" />
      )}
      <div>
        <h1 className="h4 mb-0">
          {boutiqueId 
            ? (boutiqueNom || "Boutique inconnue") 
            : "Mes produits"}
        </h1>
        <p className="text-muted mb-0">
          {boutiqueId 
            ? "Découvrez notre sélection exclusive" 
            : "Gestion de vos produits indépendants"}
        </p>
      </div>
    </div>
  );
};

// Composant principal
const AffichageBoutique = ({ searchQuery }) => {
  const { boutiqueId } = useParams();
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [produitsFiltres, setProduitsFiltres] = useState([]);
  const [termeRecherche, setTermeRecherche] = useState("");
  const [typeFiltre, setTypeFiltre] = useState(FILTER_VALUES.TOUS);
  const [categoryFiltre, setCategoryFiltre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [boutiqueNom, setBoutiqueNom] = useState("");

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: { "Content-Type": "application/json" }
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    setTermeRecherche(searchQuery || "");
  }, [searchQuery]);

  const chargerDonnees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId");
      if (!boutiqueId && !userId) {
        throw new Error("Identifiant utilisateur manquant");
      }

      const requests = [
        boutiqueId 
          ? api.get(`/products/boutique/${boutiqueId}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`)
          : api.get(`/products/user/${userId}/independent${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`),
        api.get("/categories")
      ];

      if (boutiqueId) {
        requests.push(api.get(`/boutiques/${boutiqueId}/nom`));
      }

      const [produitsRes, categoriesRes, boutiqueNomRes] = await Promise.all(requests);
      
      console.log("API Response:", produitsRes.data);
      setProduits(Array.isArray(produitsRes.data) ? produitsRes.data : []);
      setCategories(categoriesRes.data);
      if (boutiqueNomRes) {
        setBoutiqueNom(boutiqueNomRes.data);
      }
    } catch (err) {
      console.error("Erreur de chargement des données :", {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : null
      });
      setError(
        err.response?.status === 404 ? "Boutique ou produits introuvables" :
        err.response?.status === 401 ? "Session expirée, veuillez vous reconnecter" :
        err.response?.data?.message || `Erreur de chargement: ${err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      chargerDonnees();
    } else {
      navigate("/login");
    }
  }, [boutiqueId, navigate, searchQuery]);

  useEffect(() => {
    if (!Array.isArray(produits)) {
      setProduitsFiltres([]);
      return;
    }

    const result = produits.filter(p => {
      const normalizedType = p.type && TYPE_MAPPING[p.type.toUpperCase()];
      console.log(`Filtering: typeFiltre=${typeFiltre}, p.type=${p.type}, normalizedType=${normalizedType}`);
      const filtreActif = typeFiltre === FILTER_VALUES.TOUS 
        ? true 
        : normalizedType && normalizedType === (typeFiltre === FILTER_VALUES.SALE ? "SALE" : "RENT");
      
      const matchesSearch = termeRecherche
        ? p.name.toLowerCase().includes(termeRecherche.toLowerCase())
        : true;
      
      const matchesCategory = categoryFiltre
        ? p.categoryId === categoryFiltre
        : true;

      return filtreActif && matchesSearch && matchesCategory;
    });
    setProduitsFiltres(result);
  }, [produits, termeRecherche, typeFiltre, categoryFiltre]);

  const handleAddToCart = async (productId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non connecté");

      const response = await api.post(`/cart/${userId}/add/${productId}`);
      
      if (response.status === 200) {
        alert("Produit ajouté au panier !");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <AlertCircle size={18} className="me-2" />
          {error}
          <Button 
            variant="link" 
            className="ms-2 p-0"
            onClick={chargerDonnees}
          >
            Réessayer
          </Button>
        </Alert>
      );
    }

    if (produits.length === 0) {
      return (
        <Card className="text-center p-5 shadow-lg border-0 mx-auto no-products-card" style={{ maxWidth: '500px' }}>
          <Card.Body>
            <Package size={64} className="mb-3 text-primary" />
            <Card.Title as="h3" className="mb-3">
              {boutiqueId ? `${boutiqueNom || "Boutique inconnue"} n’a pas de produits` : "Aucun produit disponible"}
            </Card.Title>
            <Card.Text className="text-muted mb-4">
              {boutiqueId 
                ? "Cette boutique n’a pas encore ajouté de produits." 
                : "Vos boutiques n’ont pas de produits pour le moment."}
              <br />
              Revenez bientôt pour découvrir de nouvelles offres !
            </Card.Text>
            <Button variant="primary" onClick={() => navigate('/home')}>
              Retour à l’accueil
            </Button>
          </Card.Body>
        </Card>
      );
    }

    if (produitsFiltres.length === 0) {
      return (
        <div className="text-center p-5 bg-light rounded">
          <AlertCircle size={48} className="mb-3 text-muted" />
          <h3 className="h4">Aucun produit correspondant</h3>
          <p className="text-muted">Ajustez vos critères de recherche</p>
        </div>
      );
    }

    return (
      <Row xs={1} md={2} lg={3} className="g-4">
        {produitsFiltres.map((produit) => (
          <Col key={produit.id}>
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={produit.imageName 
                  ? `http://localhost:8080/api/products/images/${produit.imageName}`
                  : "/placeholder.jpg"}
                alt={produit.name}
                style={{ height: "200px", objectFit: "cover" }}
                onError={(e) => e.target.src = "/placeholder.jpg"}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{produit.name}</Card.Title>
                <Card.Text className="text-muted small">
                  {produit.description}
                  <div className="mt-2">
                    <Badge 
                      className={`type-badge ${
                        produit.type && TYPE_MAPPING[produit.type.toUpperCase()] 
                          ? FILTER_VALUES[TYPE_MAPPING[produit.type.toUpperCase()]] 
                          : 'N-A'
                      }`} 
                      className="me-1"
                    >
                      {produit.type && TYPE_MAPPING[produit.type.toUpperCase()] 
                        ? FILTER_VALUES[TYPE_MAPPING[produit.type.toUpperCase()]] 
                        : produit.type || 'N/A'}
                    </Badge>
                   
                  </div>
                </Card.Text>
                <div className="mt-auto">
                  <div className="d-flex align-items-center mb-2">
                   
                    <span>
                      {produit.price?.toFixed(2)} DT
                      <small className="text-muted ms-1">
                        {produit.type && TYPE_MAPPING[produit.type.toUpperCase()] === "RENT" ? "/jour" : ""}
                      </small>
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg={produit.available ? "success" : "danger"}>
                      {produit.available ? "Disponible" : "Indisponible"}
                    </Badge>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleAddToCart(produit.id)}
                      disabled={!produit.available || produit.quantity === 0}
                    >
                      <ShoppingCart size={16} className="me-2" />
                      {produit.type && TYPE_MAPPING[produit.type.toUpperCase()] === "RENT" ? "Réserver" : "Ajouter"}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="container py-3">
      <BoutiqueHeader boutiqueId={boutiqueId} boutiqueNom={boutiqueNom} />

      <div className="d-flex flex-wrap justify-content-between mb-4 gap-2">
        <div className="search-bar d-flex align-items-center bg-white rounded-pill px-2 py-1 border flex-grow-1 me-2">
          <Search size={16} className="me-2 text-muted" />
          <input
            type="text"
            className="border-0 w-100 bg-transparent"
            placeholder="Rechercher..."
            value={termeRecherche}
            onChange={(e) => setTermeRecherche(e.target.value)}
          />
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Form.Select
            value={categoryFiltre}
            onChange={(e) => setCategoryFiltre(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </Form.Select>

          <ButtonGroup>
            <Button
              variant={typeFiltre === FILTER_VALUES.TOUS ? "primary" : "outline-secondary"}
              onClick={() => setTypeFiltre(FILTER_VALUES.TOUS)}
            >
              Tous
            </Button>
            <Button
              variant={typeFiltre === FILTER_VALUES.SALE ? "primary" : "outline-secondary"}
              onClick={() => setTypeFiltre(FILTER_VALUES.SALE)}
            >
              Vente
            </Button>
            <Button
              variant={typeFiltre === FILTER_VALUES.RENT ? "primary" : "outline-secondary"}
              onClick={() => setTypeFiltre(FILTER_VALUES.RENT)}
            >
              Location
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {renderContent()}

      <style jsx>{`
        .no-products-card {
          transition: transform 0.2s;
        }
        .no-products-card:hover {
          transform: translateY(-5px);
        }
        .search-bar {
          height: 50px;
        }
        .search-bar input {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .type-badge {
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          color: white;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .type-badge.vente {
          background: linear-gradient(45deg, #007bff, #00b7eb);
        }
        .type-badge.location {
          background: linear-gradient(45deg, #28a745, #34c759);
        }
        .type-badge.N-A {
          background: linear-gradient(45deg, #6c757d, #adb5bd);
        }
        .type-badge:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        @media (max-width: 576px) {
          .no-products-card {
            padding: 2rem !important;
          }
          .type-badge {
            padding: 0.3rem 0.6rem;
            font-size: 0.85rem;
          }
          .search-bar {
            height: 32px;
          }
          .search-bar input {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AffichageBoutique;