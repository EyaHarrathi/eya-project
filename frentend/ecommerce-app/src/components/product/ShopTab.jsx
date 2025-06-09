"use client";

import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {
  Plus,
  X,
  Loader2,
  Trash,
  Edit,
  Search,
  Tag,
  Package,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { FaBoxOpen } from "react-icons/fa";

import {
  InputGroup,
  FormControl,
  Row,
  Col,
  Button,
  Card,
  Badge,
  Tooltip,
  OverlayTrigger,
  Dropdown,
  Container,
  Alert,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

const ShopTab = ({ userId, products: initialProducts, onProductAdded }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    type: "SALE",
    quantity: 1,
    categoryId: "",
    available: true,
    colors: [],
    image: null,
    newColor: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [showQuantityAlert, setShowQuantityAlert] = useState(false);

  const modalTitle = editingProduct
    ? "Modifier le Produit"
    : "Ajouter un Nouveau Produit";
  const submitButtonText = editingProduct ? "Mettre à jour" : "Ajouter";

  // Récupérer les catégories
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/categories");
      if (!res.ok) throw new Error("Échec de récupération des catégories");
      setCategories(await res.json());
    } catch (error) {
      console.error("Erreur de récupération des catégories:", error);
      setError("Impossible de charger les catégories");
    }
  };

  // Ajouter une nouvelle catégorie
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch("http://localhost:8080/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (!res.ok) throw new Error("Échec d'ajout de catégorie");

      const newCat = await res.json();
      setCategories([...categories, newCat]);
      setFormData({ ...formData, categoryId: newCat.id });
      setShowCategoryInput(false);
      setNewCategory("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingCategory(false);
    }
  };

  // Modifier un produit existant
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      type: product.type === "VENTE" ? "SALE" : product.type === "LOCATION" ? "RENT" : product.type,
      quantity: product.quantity,
      categoryId: product.categoryId,
      available: product.available,
      colors: product.colors || [],
      newColor: "",
      image: null,
      imageName: product.imageName,
    });
    setShowProductModal(true);
    if (product.quantity > 5) {
      setShowQuantityAlert(true);
    } else {
      setShowQuantityAlert(false);
    }
  };

  // Gérer le changement de quantité
  const handleQuantityChange = (value) => {
    const quantity = Math.max(0, Number.parseInt(value) || 0);
    if (quantity > 5) {
      setShowQuantityAlert(true);
    } else {
      setShowQuantityAlert(false);
    }
    setFormData({ ...formData, quantity });
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.quantity > 5) {
      setShowQuantityAlert(true);
      setError(
        "Le nombre de produits en stock ne doit pas dépasser 5 unités. Opération annulée."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const form = new FormData();
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("price", formData.price);
    // Transform type before sending to backend
    form.append("type", formData.type === "SALE" ? "VENTE" : "LOCATION");
    form.append("quantity", formData.quantity);
    form.append("available", formData.available);
    form.append("categoryId", formData.categoryId);
    form.append("colors", formData.colors.join(","));

    if (editingProduct) {
      form.append("id", editingProduct.id);
    } else {
      form.append("userId", userId);
    }

    if (formData.image) {
      form.append("image", formData.image);
    } else if (editingProduct) {
      form.append("imageName", formData.imageName);
    }

    try {
      const url = editingProduct
        ? `http://localhost:8080/api/products/${editingProduct.id}`
        : "http://localhost:8080/api/products/createWithImage";

      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: form,
      });

      if (!res.ok) throw new Error("Échec de sauvegarde du produit");

      const updatedProducts = await fetchUserProducts(userId);
      setProducts(
        updatedProducts.map((p) => ({
          ...p,
          image: p.imageName
            ? `http://localhost:8080/api/products/images/${p.imageName}`
            : "https://via.placeholder.com/500",
        }))
      );

      if (onProductAdded) onProductAdded();

      setShowProductModal(false);
      setFormData({
        name: "",
        price: "",
        description: "",
        type: "SALE",
        quantity: 1,
        categoryId: "",
        available: true,
        colors: [],
        newColor: "",
        image: null,
      });
      setEditingProduct(null);
      setShowQuantityAlert(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un produit
  const handleDelete = async (productId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Échec de suppression du produit");

      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Récupérer les produits de l'utilisateur
  const fetchUserProducts = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/user/${userId}/without-boutique`
      );
      if (!res.ok) throw new Error("Échec de récupération des produits");
      const products = await res.json();
      return products.map((p) => ({
        ...p,
        type: p.type === "VENTE" ? "SALE" : p.type === "LOCATION" ? "RENT" : p.type,
      }));
    } catch (error) {
      console.error("Erreur de récupération des produits:", error);
      return [];
    }
  };

  // Ajouter une couleur
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

  // Supprimer une couleur
  const handleRemoveColor = (index) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  // Initialiser les données
  useEffect(() => {
    const initializeData = async () => {
      await fetchCategories();
      if (initialProducts && initialProducts.length > 0) {
        setProducts(
          initialProducts.map((p) => ({
            ...p,
            type: p.type === "VENTE" ? "SALE" : p.type === "LOCATION" ? "RENT" : p.type,
            image: p.imageName
              ? `http://localhost:8080/api/products/images/${p.imageName}`
              : "https://via.placeholder.com/500",
          }))
        );
      } else if (userId) {
        const fetchedProducts = await fetchUserProducts(userId);
        setProducts(
          fetchedProducts.map((p) => ({
            ...p,
            image: p.imageName
              ? `http://localhost:8080/api/products/images/${p.imageName}`
              : "https://via.placeholder.com/500",
          }))
        );
      }
      setLoading(false);
    };

    initializeData();
  }, [userId, initialProducts]);

  // Filtrer et trier les produits
  const getFilteredAndSortedProducts = () => {
    const result = products.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case "price-low":
        return result.sort((a, b) => a.price - b.price);
      case "price-high":
        return result.sort((a, b) => b.price - b.price);
      case "name":
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
      default:
        return result.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Aperçu de l'image
  const imagePreview = editingProduct?.imageName && (
    <div className="mb-2">
      <img
        src={`http://localhost:8080/api/products/images/${editingProduct.imageName}`}
        alt="Actuelle"
        style={{ maxWidth: "100px" }}
        className="img-thumbnail"
      />
      <p className="text-muted small mt-1">Image actuelle</p>
    </div>
  );

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );

  return (
    <Container fluid className="py-4">
      {error && (
        <div
          className={`alert ${
            error.includes("dépasser 5 unités")
              ? "alert-danger quantity-error-alert"
              : "alert-danger"
          } alert-dismissible fade show`}
          role="alert"
        >
          <div className="d-flex align-items-center">
            {error.includes("dépasser 5 unités") && (
              <AlertTriangle size={24} className="me-2" />
            )}
            <div>
              <strong>
                {error.includes("dépasser 5 unités")
                  ? "Limite de stock dépassée!"
                  : "Erreur!"}
              </strong>{" "}
              {error}
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      <div className="bg-white rounded-3 shadow-sm p-3 mb-4">
        <Row className="g-3 align-items-center">
          <Col lg={4} md={6}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0">
                <Search size={18} />
              </InputGroup.Text>
              <FormControl
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0 ps-0"
              />
            </InputGroup>
          </Col>

          <Col lg={3} md={6}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0">
                <Filter size={18} />
              </InputGroup.Text>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border-start-0 ps-0"
              >
                <option value="">Toutes les Catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>

          <Col lg={3} md={6}>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                className="w-100 text-start d-flex align-items-center"
              >
                <Tag size={18} className="me-2" />
                <span className="flex-grow-1">
                  Trier par:{" "}
                  {sortBy === "newest"
                    ? "Plus récent"
                    : sortBy === "price-low"
                    ? "Prix croissant"
                    : sortBy === "price-high"
                    ? "Prix décroissant"
                    : "Nom"}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortBy("newest")}>
                  Plus récent
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy("price-low")}>
                  Prix croissant
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy("price-high")}>
                  Prix décroissant
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy("name")}>
                  Nom
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>

          <Col lg={2} md={6} className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={() => setShowProductModal(true)}
              className="w-100 d-flex align-items-center justify-content-center"
            >
              <Plus size={18} className="me-2" />
              Ajouter Produit
            </Button>
          </Col>
        </Row>
      </div>

      {filteredProducts.length !== products.length && (
        <div className="bg-light rounded-3 p-3 mb-4 d-flex align-items-center">
          <Package size={18} className="text-primary me-2" />
          <span>
            Affichage de {filteredProducts.length} sur {products.length} produits
            {(selectedCategory || searchQuery) && (
              <>
                {" "}
                filtrés par:
                {selectedCategory && (
                  <Badge bg="primary" className="ms-2 me-1">
                    Catégorie:{" "}
                    {categories.find((c) => c.id === selectedCategory)?.name}
                    <X
                      size={14}
                      className="ms-1 cursor-pointer"
                      onClick={() => setSelectedCategory("")}
                      style={{ cursor: "pointer" }}
                    />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge bg="info" className="ms-2">
                    Recherche: "{searchQuery}"
                    <X
                      size={14}
                      className="ms-1"
                      onClick={() => setSearchQuery("")}
                      style={{ cursor: "pointer" }}
                    />
                  </Badge>
                )}
              </>
            )}
          </span>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm">
          <FaBoxOpen size={64} className="text-muted mb-3" />
          <h4>Aucun produit trouvé</h4>
          <p className="text-muted">
            Ajoutez votre premier produit ou modifiez vos filtres
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setShowProductModal(true);
              setSelectedCategory("");
              setSearchQuery("");
            }}
          >
            <Plus size={18} className="me-2" />
            Ajouter un Produit
          </Button>
        </div>
      ) : (
        <Row className="g-4">
          {filteredProducts.map((product) => (
            <Col lg={4} md={6} key={product.id}>
              <Card
                className="h-100 product-card border-0 shadow-sm"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={product.image}
                    style={{ height: "220px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/500";
                    }}
                    className="rounded-top"
                  />

                  <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2">
                    {product.type === "RENT" && (
                      <Badge bg="warning" className="shadow-sm">
                        Location
                      </Badge>
                    )}
                    {!product.available && (
                      <Badge bg="danger" className="shadow-sm">
                        Non disponible
                      </Badge>
                    )}
                    {product.quantity > 5 && (
                      <Badge bg="danger" className="shadow-sm stock-warning">
                        <AlertTriangle size={12} className="me-1" /> Stock élevé
                      </Badge>
                    )}
                  </div>

                  <div className="position-absolute top-0 end-0 p-3">
                    <Badge bg="light" text="dark" className="shadow-sm">
                      {categories.find((cat) => cat.id === product.categoryId)
                        ?.name || "Non catégorisé"}
                    </Badge>
                  </div>

                  {hoveredProductId === product.id && (
                    <div className="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-center gap-2 quick-actions">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Modifier</Tooltip>}
                      >
                        <Button
                          variant="light"
                          size="sm"
                          className="rounded-circle p-2 shadow"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit size={16} />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Supprimer</Tooltip>}
                      >
                        <Button
                          variant="light"
                          size="sm"
                          className="rounded-circle p-2 shadow text-danger"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  )}
                </div>

                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h5 mb-0">{product.name}</Card.Title>
                    <h5 className="text-primary mb-0 fw-bold">
                      {product.price?.toFixed(2) || "0.00"} DT
                    </h5>
                  </div>

                  <Card.Text
                    className="text-muted mb-3"
                    style={{ minHeight: "48px" }}
                  >
                    {product.description?.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description || "Aucune description disponible"}
                  </Card.Text>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <Badge
                      bg={
                        product.quantity > 0
                          ? product.quantity > 5
                            ? "danger"
                            : "success"
                          : "danger"
                      }
                      className={`px-3 py-2 ${
                        product.quantity > 5 ? "stock-badge-warning" : ""
                      }`}
                    >
                      {product.quantity > 0
                        ? `En stock (${product.quantity})`
                        : "Rupture de stock"}
                    </Badge>

                    <Button
                      variant="outline-primary"
                      onClick={() => handleEdit(product)}
                      className="d-flex align-items-center"
                    >
                      Détails
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        show={showProductModal}
        onHide={() => {
          setShowProductModal(false);
          setEditingProduct(null);
          setShowQuantityAlert(false);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {showQuantityAlert && (
            <Alert
              variant="warning"
              className="quantity-alert mb-4 animate__animated animate__fadeIn"
              dismissible
              onClose={() => setShowQuantityAlert(false)}
            >
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="me-3 text-warning" />
                <div>
                  <Alert.Heading className="mb-1 fs-5">
                    Attention au stock élevé!
                  </Alert.Heading>
                  <p className="mb-0">
                    Le nombre de produits en stock ne devrait pas dépasser 5
                    unités. Veuillez vérifier votre inventaire.
                  </p>
                </div>
              </div>
            </Alert>
          )}

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
                  {!showCategoryInput ? (
                    <InputGroup>
                      <Form.Select
                        value={formData.categoryId}
                        onChange={(e) => {
                          if (e.target.value === "new") {
                            setShowCategoryInput(true);
                          } else {
                            setFormData({
                              ...formData,
                              categoryId: e.target.value,
                            });
                          }
                        }}
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
                        onClick={() => setShowCategoryInput(true)}
                      >
                        <Plus size={16} />
                      </Button>
                    </InputGroup>
                  ) : (
                    <InputGroup>
                      <FormControl
                        placeholder="Nom de la nouvelle catégorie"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        autoFocus
                      />
                      <Button
                        variant={addingCategory ? "secondary" : "success"}
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim() || addingCategory}
                      >
                        {addingCategory ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Ajouter"
                        )}
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          setShowCategoryInput(false);
                          setNewCategory("");
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
                    className={formData.quantity > 5 ? "border-danger" : ""}
                    isInvalid={formData.quantity > 5}
                  />
                  {formData.quantity > 5 && (
                    <Form.Control.Feedback type="invalid">
                      <AlertTriangle size={12} className="me-1" />
                      La quantité ne doit pas dépasser 5 unités. La création ou
                      mise à jour sera bloquée.
                    </Form.Control.Feedback>
                  )}
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
                    <option value="SALE">Vente</option>
                    <option value="RENT">Location</option>
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
                    required={!editingProduct}
                    className="form-control-file"
                  />
                  {editingProduct && (
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
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  setShowQuantityAlert(false);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || formData.quantity > 5}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="me-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    {editingProduct ? (
                      <Edit size={16} className="me-2" />
                    ) : (
                      <Plus size={16} className="me-2" />
                    )}
                    {submitButtonText}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .product-card {
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .quick-actions {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .product-card:hover .quick-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .quantity-alert {
          border-left: 4px solid #ffc107;
          animation: fadeIn 0.5s ease-in-out;
        }

        .stock-badge-warning {
          animation: pulse 2s infinite;
        }

        .stock-warning {
          animation: pulse 2s infinite;
        }

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

        .quantity-error-alert {
          border-left: 5px solid #dc3545;
          background-color: rgba(220, 53, 69, 0.1);
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </Container>
  );
};

export default ShopTab;