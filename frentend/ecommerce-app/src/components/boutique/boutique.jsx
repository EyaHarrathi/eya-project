import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  ButtonGroup,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
  Badge,
} from "react-bootstrap";
import {
  Plus,
  Edit,
  Trash,
  Package,
  Search,
  AlertCircle,
  Loader2,
  Store,
  X,
  Warehouse,
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

const Boutique = () => {
  const { boutiqueId } = useParams();
  const [produits, setProduits] = useState([]);
  const [produitsIndependants, setProduitsIndependants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [produitsFiltres, setProduitsFiltres] = useState([]);
  const [termeRecherche, setTermeRecherche] = useState("");
  const [typeFiltre, setTypeFiltre] = useState(FILTER_VALUES.TOUS);
  const [showModalMigration, setShowModalMigration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    type: "VENTE",
    quantity: 1,
    categoryId: "",
    available: true,
    colors: [],
    image: null,
    newColor: "",
  });
  const [produitEnEdition, setProduitEnEdition] = useState(null);
  const [showModalProduit, setShowModalProduit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSaisieCategorie, setShowSaisieCategorie] = useState(false);
  const [nouvelleCategorie, setNouvelleCategorie] = useState("");
  const [ajoutCategorie, setAjoutCategorie] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    chargerProduits();
    chargerCategories();
  }, [boutiqueId]);

  useEffect(() => {
    filtrerProduits();
  }, [produits, termeRecherche, typeFiltre]);

  const filtrerProduits = () => {
    let resultat = [...produits];

    if (typeFiltre !== FILTER_VALUES.TOUS) {
      resultat = resultat.filter(p => {
        const normalizedType = p.type && TYPE_MAPPING[p.type.toUpperCase()];
        return normalizedType && normalizedType === (typeFiltre === FILTER_VALUES.SALE ? "SALE" : "RENT");
      });
    }

    if (termeRecherche.trim()) {
      resultat = resultat.filter((p) =>
        p.name.toLowerCase().includes(termeRecherche.toLowerCase())
      );
    }

    setProduitsFiltres(resultat);
  };

  const chargerProduits = async () => {
    setIsLoading(true);
    try {
      let res;
      if (boutiqueId) {
        res = await api.get(`/products/boutique/${boutiqueId}`);
        setProduits(res.data);
        const userId = localStorage.getItem("userId");
        const resIndependants = await api.get(`/products/user/${userId}/independent`);
        setProduitsIndependants(resIndependants.data);
      } else {
        const userId = localStorage.getItem("userId");
        res = await api.get(`/products/user/${userId}/independent`);
        setProduits(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Échec du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  const chargerCategories = async () => {
    try {
      const res = await api.get("/categories");
      if (!res.data) throw new Error("Échec de récupération des catégories");
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Échec du chargement des catégories");
    }
  };

  const handleQuantityChange = (value) => {
    const quantity = Math.max(0, Number.parseInt(value) || 0);
    setFormData({ ...formData, quantity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setError("Veuillez sélectionner une catégorie");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "newColor" && value !== null && value !== undefined) {
          if (key === "colors") {
            form.append(key, value.join(","));
          } else {
            form.append(key, value);
          }
        }
      });

      if (boutiqueId && !produitEnEdition) {
        form.append("boutiqueId", boutiqueId);
      } else if (produitEnEdition?.boutiqueId) {
        form.append("boutiqueId", produitEnEdition.boutiqueId);
      }

      if (!produitEnEdition) {
        form.append("userId", localStorage.getItem("userId"));
      }

      if (!formData.image && !produitEnEdition) {
        throw new Error("Veuillez sélectionner une image pour le produit.");
      }

      const url = produitEnEdition
        ? `/products/${produitEnEdition.id}`
        : "/products/createWithShop";
      const method = produitEnEdition ? "put" : "post";

      await api[method](url, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      chargerProduits();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Échec de la sauvegarde du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMigrate = async () => {
    try {
      await api.post("/products/migrate-to-boutique", null, {
        params: {
          userId: localStorage.getItem("userId"),
          boutiqueId: boutiqueId,
        },
      });
      await chargerProduits();
      setShowModalMigration(false);
      const userId = localStorage.getItem("userId");
      const resIndependants = await api.get(`/products/user/${userId}/independent`);
      setProduitsIndependants(resIndependants.data);
    } catch (err) {
      setError("Erreur de migration : " + (err.response?.data?.message || "Erreur inconnue"));
    }
  };

  const handleDelete = async (productId) => {
    if (!productId) {
      setError("ID de produit invalide");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      setIsLoading(true);
      await api.delete(`/products/${productId}`);
      setProduits(prev => prev.filter(p => p.id !== productId));
      
      if (!boutiqueId) {
        setProduitsIndependants(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      setError(err.response?.data?.message || `Échec de la suppression : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (produit) => {
    if (!produit?.id) {
      console.error("Tentative d'édition d'un produit invalide :", produit);
      setError("Impossible d'éditer le produit : ID manquant");
      return;
    }

    setProduitEnEdition(produit);
    setFormData({
      name: produit.name || "",
      description: produit.description || "",
      price: produit.price?.toString() || "0",
      type: produit.type || "VENTE",
      quantity: produit.quantity?.toString() || "1",
      available: produit.available ?? true,
      categoryId: produit.categoryId || "",
      colors: Array.isArray(produit.colors) ? produit.colors : [],
      image: null,
      imageName: produit.imageName || "",
      newColor: "",
    });
    setShowModalProduit(true);
  };

  const handleCloseModal = () => {
    setShowModalProduit(false);
    setFormData({
      name: "",
      price: "",
      description: "",
      type: "VENTE",
      quantity: 1,
      categoryId: "",
      available: true,
      colors: [],
      image: null,
      newColor: "",
    });
    setProduitEnEdition(null);
    setShowSaisieCategorie(false);
    setNouvelleCategorie("");
    setError(null);
  };

  const handleAddCategory = async () => {
    if (!nouvelleCategorie.trim()) {
      setError("Le nom de la catégorie ne peut pas être vide");
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === nouvelleCategorie.trim().toLowerCase())) {
      setError("Cette catégorie existe déjà");
      return;
    }
    setAjoutCategorie(true);
    try {
      const res = await api.post("/categories", {
        name: nouvelleCategorie.trim(),
      });
      const newCat = res.data;
      setCategories([...categories, newCat]);
      setFormData({ ...formData, categoryId: newCat.id });
      setShowSaisieCategorie(false);
      setNouvelleCategorie("");
    } catch (err) {
      setError(err.response?.data?.message || "Échec de l'ajout de la catégorie");
    } finally {
      setAjoutCategorie(false);
    }
  };

  const handleAddColor = () => {
    if (!formData.newColor?.trim()) return;
    const newColor = formData.newColor.trim();
    if (!formData.colors.includes(newColor)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, newColor],
        newColor: "",
      });
    }
  };

  const handleRemoveColor = (index) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const imagePreview = produitEnEdition?.imageName && (
    <div className="mb-2">
      <img
        src={`http://localhost:8080/api/products/images/${produitEnEdition.imageName}`}
        alt="Actuelle"
        style={{ maxWidth: "100px" }}
        className="img-thumbnail"
      />
      <p className="text-muted small mt-1">Image actuelle</p>
    </div>
  );

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
        {boutiqueId ? (
          <Warehouse size={32} className="me-3 text-primary" />
        ) : (
          <Store size={32} className="me-3 text-primary" />
        )}
        <div>
          <h1 className="h4 mb-0">
            {boutiqueId ? "Gestion de la boutique" : "Produits indépendants"}
          </h1>
          <p className="text-muted mb-0">
            {boutiqueId
              ? "Gérez les produits de votre boutique"
              : "Produits personnels non liés à une boutique"}
          </p>
        </div>
      </div>

      {boutiqueId && produits.length === 0 && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span>Aucun produit dans cette boutique</span>
            <ButtonGroup>
              <Button
                variant="primary"
                onClick={() => setShowModalProduit(true)}
              >
                <Plus size={16} className="me-1" />
                Ajouter un produit
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowModalMigration(true)}
                disabled={produitsIndependants.length === 0}
              >
                Migrer des produits existants
              </Button>
            </ButtonGroup>
          </div>
        </Alert>
      )}

      <div className="d-flex flex-wrap justify-content-between mb-4 gap-2">
        <div className="d-flex align-items-center bg-white rounded-pill px-3 py-2 border flex-grow-1">
          <Search size={18} className="me-2 text-muted" />
          <input
            type="text"
            className="border-0 w-100 bg-transparent"
            placeholder="Rechercher..."
            value={termeRecherche}
            onChange={(e) => setTermeRecherche(e.target.value)}
          />
        </div>

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

        {(!boutiqueId || produits.length > 0) && (
          <Button variant="primary" onClick={() => setShowModalProduit(true)}>
            <Plus size={18} className="me-1" />
            Ajouter
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <AlertCircle size={18} className="me-2" />
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : produits.length === 0 && !boutiqueId ? (
        <div className="text-center p-5 bg-light rounded">
          <Package size={48} className="mb-3 text-muted" />
          <h3 className="h4">Aucun produit trouvé</h3>
          <Button variant="primary" onClick={() => setShowModalProduit(true)}>
            <Plus size={18} className="me-1" />
            Ajouter votre premier produit
          </Button>
        </div>
      ) : produitsFiltres.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <AlertCircle size={48} className="mb-3 text-muted" />
          <h3 className="h4">Aucun produit correspondant</h3>
          <p className="text-muted">Ajustez vos critères de recherche</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {produitsFiltres.map((produit) => (
            <Col key={produit.id}>
              <Card className="h-100 shadow-sm">
                {produit.imageName && (
                  <Card.Img
                    variant="top"
                    src={`http://localhost:8080/api/products/images/${produit.imageName}`}
                    alt={produit.name}
                    style={{ height: "200px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                )}

                <Card.Body className="d-flex flex-column">
                  <Card.Title>{produit.name}</Card.Title>
                  <Card.Text className="text-muted small">
                    {produit.description}
                    <div className="mt-2">
                      <Badge bg="secondary" className="me-1">
                        {produit.type && TYPE_MAPPING[produit.type.toUpperCase()] 
                          ? FILTER_VALUES[TYPE_MAPPING[produit.type.toUpperCase()]] 
                          : produit.type || 'N/A'}
                      </Badge>
                      <Badge bg="info">
                        {categories.find(cat => cat.id === produit.categoryId)?.name || "Non catégorisé"}
                      </Badge>
                    </div>
                  </Card.Text>

                  <div className="mt-auto">
                    <div className="d-flex align-items-center mb-2">
                      <span>
                        {produit.price.toFixed(2)}DT
                        <small className="text-muted ms-1">
                          {produit.type && TYPE_MAPPING[produit.type.toUpperCase()] === "RENT" ? "/ jour" : ""}
                        </small>
                      </span>
                    </div>

                    <div className="d-flex justify-content-between gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(produit)}
                        className="flex-grow-1"
                      >
                        <Edit size={16} className="me-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(produit.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal Produit */}
      <Modal
        show={showModalProduit}
        onHide={handleCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            {produitEnEdition ? "Modifier le produit" : "Ajouter un produit"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nom du Produit</Form.Label>
                  <Form.Control
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Entrez le nom du produit"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Catégorie</Form.Label>
                  {!showSaisieCategorie ? (
                    <InputGroup>
                      <Form.Select
                        value={formData.categoryId}
                        onChange={(e) => {
                          if (e.target.value === "new") {
                            setShowSaisieCategorie(true);
                          } else {
                            setFormData({
                              ...formData,
                              categoryId: e.target.value,
                            });
                          }
                        }}
                        required
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                        <option value="new">
                          + Créer une nouvelle catégorie
                        </option>
                      </Form.Select>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowSaisieCategorie(true)}
                      >
                        <Plus size={16} />
                      </Button>
                    </InputGroup>
                  ) : (
                    <InputGroup>
                      <FormControl
                        placeholder="Nom de la nouvelle catégorie"
                        value={nouvelleCategorie}
                        onChange={(e) => setNouvelleCategorie(e.target.value)}
                        autoFocus
                      />
                      <Button
                        variant={ajoutCategorie ? "secondary" : "success"}
                        onClick={handleAddCategory}
                        disabled={!nouvelleCategorie.trim() || ajoutCategorie}
                      >
                        {ajoutCategorie ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Ajouter"
                        )}
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          setShowSaisieCategorie(false);
                          setNouvelleCategorie("");
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </InputGroup>
                  )}
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Couleurs</Form.Label>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Ajouter une couleur (ex: Rouge)"
                      value={formData.newColor || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, newColor: e.target.value })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.newColor) {
                          e.preventDefault();
                          handleAddColor();
                        }
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleAddColor}
                      disabled={!formData.newColor?.trim()}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {formData.colors.map((color, index) => (
                      <Badge
                        key={index}
                        bg="secondary"
                        className="d-flex align-items-center gap-1 p-2"
                      >
                        {color}
                        <X
                          size={12}
                          onClick={() => handleRemoveColor(index)}
                          style={{ cursor: "pointer" }}
                        />
                      </Badge>
                    ))}
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Prix (DT)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>DT</InputGroup.Text>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      placeholder="0.00"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quantité en Stock</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    required
                    placeholder="0"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="VENTE">Vente</option>
                    <option value="LOCATION">Location</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Disponibilité</Form.Label>
                  <div className="d-flex align-items-center mt-2">
                    <Form.Check
                      type="switch"
                      id="available-switch"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          available: e.target.checked,
                        })
                      }
                      className="me-2"
                    />
                    <span>
                      {formData.available ? "Disponible" : "Non disponible"}
                    </span>
                  </div>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Décrivez votre produit..."
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Image</Form.Label>
                  {imagePreview}
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        image: e.target.files[0],
                      })
                    }
                    accept="image/*"
                    required={!produitEnEdition}
                    className="form-control-file"
                  />
                  {produitEnEdition && (
                    <Form.Text className="text-muted">
                      Laissez vide pour conserver l'image actuelle
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                onClick={handleCloseModal}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="me-2 animate-spin" />
                    {produitEnEdition ? "Mise à jour..." : "Création..."}
                  </>
                ) : (
                  <>
                    {produitEnEdition ? (
                      <Edit size={16} className="me-2" />
                    ) : (
                      <Plus size={16} className="me-2" />
                    )}
                    {produitEnEdition ? "Mettre à jour" : "Ajouter"}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Migration */}
      <Modal show={showModalMigration} onHide={() => setShowModalMigration(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Migration de produits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Cette action va migrer {produitsIndependants.length} produit(s) indépendant(s) vers cette boutique.
            Cette opération est irréversible.
          </p>
          {produitsIndependants.length === 0 && (
            <Alert variant="warning">
              Aucun produit indépendant à migrer
            </Alert>
          )}
          <Alert variant="warning">
            Note : Les produits existants dans la boutique ne seront pas affectés
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalMigration(false)}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleMigrate}
            disabled={produitsIndependants.length === 0}
          >
            Confirmer la migration
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Boutique;