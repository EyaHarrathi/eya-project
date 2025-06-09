import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Row,
  Col,
  Card,
  Badge,
  FormControl,
  Form,
  Spinner,
  Button,
} from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";

const AmisProduct = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { userId } = useParams();

  // Fonction pour ajouter au panier
  const handleAddToCart = async (productId) => {
    if (!userId) {
      alert("Veuillez vous connecter pour ajouter des articles au panier !");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/${userId}/add/${productId}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Erreur lors de l'ajout au panier");
      }

      alert("✅ Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur :", error.message);
      alert("❌ Erreur lors de l'ajout au panier : " + error.message);
    }
  };

  // Fonction pour récupérer les produits de l'utilisateur
  const fetchUserProducts = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/user/${userId}/without-boutique`
      );
      return res.ok ? await res.json() : [];
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      return [];
    }
  };

  // Fonction pour récupérer les catégories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/categories"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
    }
  };

  useEffect(() => {
    // Récupérer les produits et catégories lors du montage du composant
    const loadData = async () => {
      setLoading(true);
      try {
        const productsData = await fetchUserProducts(userId);
        setProducts(
          productsData.map((p) => ({
            ...p,
            image: p.imageName
              ? `http://localhost:8080/api/products/images/${p.imageName}`
              : "https://via.placeholder.com/500",
          }))
        );
        await fetchCategories();
      } catch (error) {
        setErrorMessage("Erreur lors du chargement des données.");
        console.error("Erreur lors du chargement des produits et catégories", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Filtrage des produits en fonction de la recherche et de la catégorie sélectionnée
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="tab-pane fade show active" id="shop" role="tabpanel">
      <Row className="mb-3">
        <Col md={6} className="mb-2">
          <FormControl
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {errorMessage && (
        <div className="alert alert-danger mt-3">{errorMessage}</div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <FaShoppingCart size={48} className="text-muted mb-3" />
          <h4>Aucun produit trouvé</h4>
        </div>
      ) : (
        <Row>
          {filteredProducts.map((product) => (
            <Col md={4} key={product.id} className="mb-4">
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={product.image}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/500";
                  }}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>
                    {product.description || "Aucune description disponible"}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-primary mb-0">
                      DT{product.price?.toFixed(2) || "0.00"}
                    </h5>
                    <Badge bg={product.quantity > 0 ? "success" : "danger"}>
                      {product.quantity > 0 ? "En stock" : "En rupture"}
                    </Badge>
                  </div>
                  <Badge bg="secondary" className="mt-2">
                    {categories.find((cat) => cat.id === product.categoryId)
                      ?.name || "Non catégorisé"}
                  </Badge>
                  <Button
                    variant="primary"
                    className="mt-3 w-100"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.quantity <= 0 || addingToCartId === product.id}
                  >
                    {addingToCartId === product.id ? (
                      <>
                        <Spinner animation="border" size="sm" /> Ajout en cours...
                      </>
                    ) : (
                      "Ajouter au panier"
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AmisProduct;
