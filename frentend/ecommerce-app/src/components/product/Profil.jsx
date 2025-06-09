"use client";

import "../boutique/listeboutique";
import { useState, useEffect } from "react";
import { Country, State } from "country-state-city";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Home/PremiumBanner";

import { logout } from "../../Services/auth";
import {
  FaShoppingCart,
  FaStar,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaBuilding,
  FaAward,
  FaCity,
  FaRegEdit,
  FaBox,
  FaUserFriends,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Form,
  Button,
  Card,
  Badge,
  Image,
  Tab,
  Tabs,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ShopTab from "./ShopTab";
import { useNavigate } from "react-router-dom";
import Lboutique from "../boutique/listeboutique";

const Profil = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("produits");
  const [userProductCount, setUserProductCount] = useState(0);
  const [userCommandCount, setUserCommandCount] = useState(0);
  const [vendeurCommandCount, setVendeurCommandCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [editableBio, setEditableBio] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [memberSince, setMemberSince] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    bio: "",
    coverPhoto: "",
    profilePhoto: "",
    friends: 0,
    followers: 0,
    products: [],
    country: "",
    state: "",
    address: "",
    phone: "",
    emails: [],
    businessType: "",
    verificationBadge: false,
    responseRate: 0,
    totalSales: 0,
    averageRating: 0,
    shippingCountries: [],
    businessHours: "",
    certificates: [],
    creationDate: "avril 2025",
  });

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    let initials = "";
    if (parts.length > 0) initials += parts[0][0];
    if (parts.length > 1) initials += parts[parts.length - 1][0];
    return initials.toUpperCase();
  };

  const fetchUserCommandCount = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/commandes/count/by-user?userId=${userId}`
      );
      return res.ok ? await res.json() : 0;
    } catch (error) {
      console.error("Erreur commandes client :", error);
      return 0;
    }
  };

  const fetchVendeurCommandCount = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/commandes/count-by-vendeur/${userId}`
      );
      return res.ok ? await res.json() : 0;
    } catch (error) {
      console.error("Erreur commandes vendeur :", error);
      return 0;
    }
  };

  const fetchUserProductCount = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/user/${userId}/without-boutique/count`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data.count || 0; // Correction de la clé de réponse
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de produits:",
        error
      );
      return 0;
    }
  };

  const fetchCartItems = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/users/${userId}`
      );
      return res.ok ? (await res.json()).length : 0;
    } catch (error) {
      console.error("Erreur produits:", error);
      return 0;
    }
  };

  const fetchShippingCountries = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/shipping/${userId}`);
      return res.ok ? await res.json() : [];
    } catch (error) {
      console.error("Erreur pays:", error);
      return [];
    }
  };

  const fetchBusinessMetrics = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/business/${userId}`);
      return res.ok
        ? await res.json()
        : {
            responseRate: 0,
            totalSales: 0,
            averageRating: 0,
            businessType: "",
            businessHours: "",
            certificates: [],
          };
    } catch (error) {
      console.error("Erreur métriques:", error);
      return {
        responseRate: 0,
        totalSales: 0,
        averageRating: 0,
        businessType: "",
        businessHours: "",
        certificates: [],
      };
    }
  };

  // Après (avec gestion d'erreur améliorée)
  const fetchUserProducts = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/user/${userId}/without-boutique`,
        {}
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Erreur de récupération des produits"
        );
      }

      const data = await res.json();

      // Validation du schéma de réponse
      if (!Array.isArray(data)) {
        throw new Error("Format de réponse invalide");
      }

      return data;
    } catch (error) {
      console.error("Erreur produits:", error);
      // Loguer l'erreur dans un service de monitoring
      Sentry.captureException(error);
      return [];
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) return navigate("/");
      setUserId(user.id);

      try {
        // Récupérer les données utilisateur
        const userRes = await fetch(
          `http://localhost:8080/utilisateur/${user.id}`
        );
        if (!userRes.ok) throw new Error("Échec de la récupération du profil");
        const userData = await userRes.json();

        // Récupérer la liste des amis
        const friendsRes = await fetch(
          `http://localhost:8080/api/friends/list/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const friendsData = await friendsRes.json();

        // Conversion pays/état
        const country = Country.getCountryByCode(userData.pays);
        const state = State.getStateByCodeAndCountry(
          userData.etat,
          userData.pays
        );

        // Récupérer les produits
        const products = await fetchUserProducts(user.id);

        // Récupérer le nombre de produits créés par l'utilisateur
        const userProductsCount = await fetchCartItems(user.id);
        setCartCount(userProductsCount);

        // Récupérer les pays d'expédition
        const shippingCountries = await fetchShippingCountries(user.id);

        // Récupérer les métriques commerciales
        const businessMetrics = await fetchBusinessMetrics(user.id);

        // Calculer la date d'inscription à partir de la date de création de l'utilisateur
        const createdAt = userData.createdAt || new Date();
        setMemberSince(
          format(new Date(createdAt), "MMMM yyyy", { locale: fr })
        );

        // Mettre à jour l'état du profil avec toutes les données récupérées
        setProfile({
          name: `${userData.prenom} ${userData.nom}`,
          username: userData.email.split("@")[0],
          bio: userData.bio || "Aucune bio ajoutée",
          coverPhoto:
            userData.coverPhoto ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=400&fit=crop",
          profilePhoto:
            userData.photoUrl && userData.photoUrl !== ""
              ? userData.photoUrl
              : null,
          friends: friendsData.length,

          role: userData.role,
          followers: friendsData.length,
          products: products.map((p) => ({
            ...p,
            image: p.imageName
              ? `http://localhost:8080/api/products/images/${p.imageName}`
              : "https://via.placeholder.com/500",
          })),
          address: userData.adresse,
          country: country ? country.name : userData.pays,
          state: state ? state.name : userData.etat,
          phone: userData.telephone,
          emails: [userData.email],
          businessType: businessMetrics.businessType || "Vendeur",
          verificationBadge: userData.verified || false,
          responseRate: businessMetrics.responseRate || 0,
          totalSales: businessMetrics.totalSales || 0,
          averageRating: businessMetrics.averageRating || 0,
          shippingCountries: shippingCountries,
          businessHours: businessMetrics.businessHours || "Non spécifié",
          certificates: businessMetrics.certificates || [],
        });
        const userCommands = await fetchUserCommandCount(user.id);
        const vendeurCommands = await fetchVendeurCommandCount(user.id);
        const productCount = await fetchUserProductCount(user.id);

        setUserCommandCount(userCommands);
        setVendeurCommandCount(vendeurCommands);
        setUserProductCount(productCount);
      } catch (error) {
        console.error("Erreur de chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleBioUpdate = async () => {
    try {
      setIsUpdatingBio(true);
      const response = await fetch(
        `http://localhost:8080/utilisateur/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ...profile, bio: editableBio }),
        }
      );

      if (!response.ok) throw new Error("Échec bio");
      const updatedUser = await response.json();

      setProfile((prev) => ({ ...prev, bio: updatedUser.bio }));
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, bio: updatedUser.bio })
      );
      setShowBioModal(false);
    } catch (error) {
      console.error("Erreur bio:", error);
      alert(error.message || "Échec bio");
    } finally {
      setIsUpdatingBio(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );

  const isPremium = profile.role === "PREMIUM_USER";
  const businessMetrics = [
    {
      icon: <FaShoppingCart />,
      label: "Commandes Passées",
      value: userCommandCount,
      color: "warning",
    },
    {
      icon: <FaBox />,
      label: "Commandes Reçues",
      value: vendeurCommandCount,
      color: "success",
    },
    {
      icon: <FaBox />,
      label: "Produits en Vente", // Modification du libellé
      value: userProductCount, // Utilisation du nouveau state
      color: "info",
    },
    {
      icon: <FaUserFriends />,
      label: "Abonnés",
      value: profile.followers || 0,
      color: "danger",
    },
  ];

  return (
    <div className="min-vh-100 bg-light">
      <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#" className="fw-bold text-primary">
            SocialShop
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </Navbar.Toggle>

          <Navbar.Collapse id="basic-navbar-nav" in={showMobileMenu}>
            <div className="d-flex flex-column flex-lg-row align-items-center ms-auto gap-3 w-100">
              <div
                className="d-flex w-100 mx-4 position-relative"
                style={{
                  height: "60px",
                  borderRadius: "2rem",
                  border: "1px solid #dee2e6",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                }}
              >
                {/* Cercles flottants animés */}
                <div
                  style={{
                    position: "absolute",
                    width: "12px",
                    height: "12px",
                    background: "rgba(108, 200, 17, 0.5)",
                    borderRadius: "50%",
                    top: "50%",
                    left: "20%",
                    animation: "float 6s infinite ease-in-out",
                    animationDelay: "0.2s",
                  }}
                ></div>

                <div
                  style={{
                    position: "absolute",
                    width: "18px",
                    height: "18px",
                    background: "rgba(13, 110,  Oryza, 0.5)",
                    borderRadius: "50%",
                    top: "30%",
                    left: "45%",
                    animation: "float 7s infinite ease-in-out",
                    animationDelay: "0.8s",
                  }}
                ></div>

                <div
                  style={{
                    position: "absolute",
                    width: "14px",
                    height: "14px",
                    background: "rgba(225, 53, 220, 0.5)",
                    borderRadius: "50%",
                    top: "60%",
                    left: "70%",
                    animation: "float 6.5s infinite ease-in-out",
                    animationDelay: "1.5s",
                  }}
                ></div>

                <div
                  style={{
                    position: "absolute",
                    width: "10px",
                    height: "10px",
                    background: "rgba(255, 193, 7, 0.5)",
                    borderRadius: "50%",
                    top: "40%",
                    left: "10%",
                    animation: "float 8s infinite ease-in-out",
                    animationDelay: "1s",
                  }}
                ></div>

                <div
                  style={{
                    position: "absolute",
                    width: "16px",
                    height: "16px",
                    background: "rgba(0, 123, 255, 0.4)",
                    borderRadius: "50%",
                    top: "70%",
                    left: "55%",
                    animation: "float 7.5s infinite ease-in-out",
                    animationDelay: "2s",
                  }}
                ></div>

                <div
                  style={{
                    position: "absolute",
                    width: "11px",
                    height: "11px",
                    background: "rgba(40, 167, 69, 0.4)",
                    borderRadius: "50%",
                    top: "20%",
                    left: "80%",
                    animation: "float 9s infinite ease-in-out",
                    animationDelay: "1.3s",
                  }}
                ></div>

                <style>{`
                  @keyframes float {
                    0% { transform: translateY(0) translateX(0); opacity: 0.8; }
                    25% { transform: translateY(-10px) translateX(6px); }
                    50% { transform: translateY(10px) translateX(-4px); opacity: 1; }
                    75% { transform: translateY(-8px) translateX(-6px); }
                    100% { transform: translateY(0) translateX(0); opacity: 0.8; }
                  }
                  .badge-premium {
                    background: linear-gradient(45deg, #ffd700, #c5a500);
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                  }
                `}</style>
              </div>

              <Nav className="align-items-center gap-3">
                <Dropdown>
                  <Dropdown.Toggle variant="link" className="p-0">
                    {profile.profilePhoto &&
                    profile.profilePhoto !==
                      "https://via.placeholder.com/168" ? (
                      <Image
                        src={profile.profilePhoto || "/placeholder.svg"}
                        roundedCircle
                        width={40}
                        height={40}
                        className="border border-2 border-primary"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div
                        className="border border-2 border-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#1a5276",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {getInitials(profile.name)}
                      </div>
                    )}
                    {profile.profilePhoto &&
                      profile.profilePhoto !==
                        "https://via.placeholder.com/168" && (
                        <div
                          className="border border-2 border-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#1a5276",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "bold",
                            display: "none",
                          }}
                        >
                          {getInitials(profile.name)}
                        </div>
                      )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={logout}>
                      <i className="fa-solid fa-right-from-bracket me-2"></i>
                      Quitter profil
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="position-relative">
        <Image
          src={profile.coverPhoto || "/placeholder.svg"}
          fluid
          className="w-100 object-fit-cover"
          style={{ height: "320px" }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25" />

        <Container
          className="position-relative"
          style={{ marginTop: "-100px" }}
        >
          <Row className="align-items-end g-4">
            <Col lg={3} className="text-center text-lg-start">
              <div className="position-relative d-inline-block">
                {profile.profilePhoto &&
                profile.profilePhoto !== "https://via.placeholder.com/168" ? (
                  <Image
                    src={profile.profilePhoto || "/placeholder.svg"}
                    roundedCircle
                    className="border border-4 border-white shadow"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : (
                  <div
                    className="border border-4 border-white shadow rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "160px",
                      height: "160px",
                      backgroundColor: "#1a5276",
                      color: "white",
                      fontSize: "48px",
                      fontWeight: "bold",
                    }}
                  >
                    {getInitials(profile.name)}
                  </div>
                )}
                {profile.profilePhoto &&
                  profile.profilePhoto !==
                    "https://via.placeholder.com/168" && (
                    <div
                      className="border border-4 border-white shadow rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "160px",
                        height: "160px",
                        backgroundColor: "#1a5276",
                        color: "white",
                        fontSize: "48px",
                        fontWeight: "bold",
                        display: "none",
                      }}
                    >
                      {getInitials(profile.name)}
                    </div>
                  )}
                {profile.verificationBadge && (
                  <Badge
                    bg="primary"
                    className="position-absolute bottom-0 end-0 p-2 rounded-circle"
                  >
                    <FaAward className="text-white" size={20} />
                  </Badge>
                )}
              </div>
            </Col>

            <Col lg={9}>
              <div className="text-white text-center text-lg-start">
                <h1 className="display-5 fw-bold mb-2">{profile.name}</h1>
                <div className="d-flex align-items-center gap-2">
                  <p className="lead mt-2 text-muted mb-0">
                    {profile.bio === "Aucune bio ajoutée" ? (
                      <span className="text-danger">
                        Cliquez pour ajouter une bio
                      </span>
                    ) : (
                      profile.bio
                    )}
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setEditableBio(
                        profile.bio === "Aucune bio ajoutée" ? "" : profile.bio
                      );
                      setShowBioModal(true);
                    }}
                    className="p-0"
                  >
                    <FaRegEdit className="text-danger" size={20} />
                  </Button>
                </div>
                <p className="lead text-muted mb-3">@{profile.username}</p>
                <div className="d-flex flex-wrap gap-4 justify-content-center text-muted justify-content-lg-start">
                  <span>{profile.followers.toLocaleString()} abonnés</span>
                  <span>Membre depuis {memberSince}</span>
                </div>
                {isPremium && (
                  <div className="mt-4 d-flex gap-3 justify-content-center justify-content-lg-start">
                    <Badge
                      bg="warning"
                      className="d-flex align-items-center gap-2 p-2 premium-badge"
                    >
                      <FaAward className="fs-5" />
                      <span>Utilisateur Premium</span>
                      <FaStar className="fs-5 text-white" />
                    </Badge>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row className="mt-4 g-4">
            {businessMetrics.map((metric, index) => (
              <Col md={6} lg={3} key={index}>
                <Card
                  className={`border-0 shadow bg-${metric.color}-subtle h-100`}
                >
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`text-${metric.color} fs-3`}>
                        {metric.icon}
                      </div>
                      <div>
                        <div className="text-muted small">{metric.label}</div>
                        <div className="h3 mb-0">{metric.value}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="mt-4 shadow">
            <Card.Body>
              <Row className="g-4">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <FaBuilding className="text-muted" />
                    <span>{isPremium ? "Vendeur" : "Acheteur"}</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <FaMapMarkerAlt className="text-muted" />
                    <span>{profile.address}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <FaEnvelope className="text-muted" />
                    <span>{profile.emails[0]}</span>
                    <div className="ms-auto">
                      <Button
                        variant="link"
                        onClick={() => navigate("/profile")}
                        className="text-nowrap"
                      >
                        <FaRegEdit className="me-1" /> Modifier
                      </Button>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <FaPhone className="text-muted" />
                    <span>{profile.phone}</span>
                  </div>
                </Col>
              </Row>

              <div className="mt-4 pt-4 border-top">
                <h5 className="mb-3">Localisation</h5>
                <Row className="g-4">
                  <Col md={6}>
                    <div className="bg-light p-3 rounded">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <FaGlobe className="text-primary" />
                        <span>Pays: {profile.country}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <FaCity className="text-primary" />
                        <span>Région: {profile.state}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mt-4 mb-2"
          >
            <Tab eventKey="produits" title="Produits">
              <ShopTab
                userId={userId}
                products={profile.products}
                onProductAdded={() => fetchUserProducts(userId)}
              />
            </Tab>

            {isPremium && (
              <Tab eventKey="about" title="Boutiques">
                <div className="mt-4">
                  <Card className="shadow">
                    <Card.Body>
                      <Lboutique />
                    </Card.Body>
                  </Card>
                </div>
              </Tab>
            )}
          </Tabs>
        </Container>
      </div>

      <Modal show={showBioModal} onHide={() => setShowBioModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier la bio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={4}
              value={editableBio}
              maxLength={500}
              onChange={(e) => setEditableBio(e.target.value)}
              placeholder="Parlez-nous de vous..."
            />
            <Form.Text className="text-muted">
              {500 - editableBio.length} caractères restants
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBioModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleBioUpdate}
            disabled={isUpdatingBio}
          >
            {isUpdatingBio ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                ></span>
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profil;
