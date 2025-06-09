"use client";
import "../boutique/amilisteboutique";
import { useState, useEffect } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Country, State } from "country-state-city";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AmisProduct from "./AmisProduct";
import {
  FaBell,
  FaShoppingCart,
  FaUserFriends,
  FaComment,
  FaAward,
  FaTimes,
  FaBars,
  FaStar,
  FaClock,
  FaBuilding,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaTruck,
  FaGlobe,
  FaCity,
} from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Button,
  Card,
  Badge,
  Image,
  Tab,
  Tabs,
  Spinner,
} from "react-bootstrap";
import { Dropdown } from "react-bootstrap";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import LLboutique from "../boutique/amilisteboutique";
countries.registerLocale(enLocale);

const AmisProfil = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("produits"); // Modification ici
  const [friendData, setFriendData] = useState(null);
  const [userProductCount, setUserProductCount] = useState(0);

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    bio: "",
    coverPhoto:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=400&fit=crop",
    profilePhoto: "",
    followers: 0,
    country: "",
    state: "",
    address: "",
    phone: "",
    email: "",
    businessType: "",
    verificationBadge: false,
    responseRate: 0,
    businessHours: "",
    certificates: [],
    shippingCountries: [],
    creationDate: "avril 2025",
  });
  // Ajouter cette fonction en haut du composant
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    let initials = "";
    if (parts.length > 0) initials += parts[0][0];
    if (parts.length > 1) initials += parts[parts.length - 1][0];
    return initials.toUpperCase();
  };
  // Récupérer le nombre de produits créés par l'utilisateur
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

  const businessMetrics = [
    {
      icon: profile.role === "PREMIUM_USER" ? <FaAward /> : <FaTimes />,
      label:
        profile.role === "PREMIUM_USER" ? "Statut Premium" : "Statut Basique",
      value: profile.role === "PREMIUM_USER" ? "Premium" : "Gratuit",
      color: "warning",
      premium: profile.role === "PREMIUM_USER",
    },

    {
      icon: <FaUserFriends />,
      label: "Amis",
      value: profile.followers,
      color: "info",
    },

    {
      icon: <FaShoppingCart />,
      label: "Produits en Vente",
      value: userProductCount || 0,
      color: "success",
    },
  ];
  const storedFriendId = localStorage.getItem("selectedFriendId") || userId;

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/${storedFriendId}`
        );
        setFriendData(response.data);
      } catch (error) {
        console.error("Error fetching friend data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendData();
  }, [storedFriendId]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [userRes, friendsRes] = await Promise.all([
          fetch(`http://localhost:8080/utilisateur/${userId}`),
          fetch(`http://localhost:8080/api/friends/list/${userId}`),
        ]);

        if (!userRes.ok || !friendsRes.ok)
          throw new Error("Données non trouvées");

        const userData = await userRes.json();
        const friendsData = await friendsRes.json();

        const creationDate = userData.created_date
          ? format(new Date(userData.created_date), "MMMM yyyy", { locale: fr })
          : "avril 2025";

        const country = Country.getCountryByCode(userData.pays);
        const state = State.getStateByCodeAndCountry(
          userData.etat,
          userData.pays
        );

        setProfile({
          name: `${userData.prenom} ${userData.nom}`,
          username: userData.email.split("@")[0],
          coverPhoto:
            userData.coverPhoto ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=400&fit=crop",
          bio: userData.bio || "Aucune biographie ajoutée",
          followers: friendsData.length,
          profilePhoto: userData.photoUrl || "https://via.placeholder.com/168",
          address: userData.adresse,
          country: country?.name || userData.pays,
          state: state?.name || userData.etat,
          phone: userData.telephone,
          email: userData.email,
          role: userData.role,
          businessType: userData.businessType || "Verified Seller",
          verificationBadge: userData.isVerified || false,
          responseRate: userData.responseRate || 98,
          businessHours: userData.businessHours || "Mon-Fri: 9:00-18:00",
          certificates: userData.certificates || [
            "Certified Artisan",
            "Premium Seller",
          ],

          creationDate,
        });
        const productCount = await fetchUserProductCount(userId);
        setUserProductCount(productCount);
      } catch (error) {
        console.error("Profile load error:", error);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    userId && loadProfile();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

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
                {/* Animated floating circles */}
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
                    background: "rgba(13, 110, 253, 0.5)",
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
       `}</style>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="position-relative">
        {/* Replace the existing Image component with this */}
        <div
          className="position-relative"
          style={{ height: "320px", overflow: "hidden" }}
        >
          <Image
            src={profile.coverPhoto || "/placeholder.svg"}
            fluid
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25" />
        </div>

        <Container
          className="position-relative"
          style={{ marginTop: "-100px" }}
        >
          <Row className="align-items-end g-4">
            <Col lg={3} className="text-center text-lg-start">
              <div className="position-relative d-inline-block">
                {profile.profilePhoto &&
                profile.profilePhoto !== "https://via.placeholder.com/168" &&
                profile.profilePhoto !== "" &&
                !profile.profilePhoto.includes("placeholder") ? (
                  <Image
                    src={profile.profilePhoto || "/placeholder.svg"}
                    roundedCircle
                    className="border border-4 border-white shadow"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="border border-4 border-white shadow rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "160px",
                      height: "160px",
                      backgroundColor: "#3498db",
                      color: "white",
                      fontSize: "3rem",
                      fontWeight: "600",
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
                <p className="lead mt-2 text-muted mb-0">{profile.bio}</p>
                <p className="lead text-muted mb-3">@{profile.username}</p>
                <div className="d-flex flex-wrap gap-4 justify-content-center text-muted justify-content-lg-start">
                  <span>{profile.followers.toLocaleString()} Amis</span>
                  <span>Member depuis {format(new Date(), "MMMM yyyy")}</span>
                </div>
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
                    <span>
                      {profile.role === "PREMIUM_USER" ? "Vendeur" : "Acheteur"}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <FaMapMarkerAlt className="text-muted" />
                    <span>{profile.address}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <FaEnvelope className="text-muted" />
                    <span>{profile.email}</span>
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
            onSelect={setActiveTab}
            className="mt-4 mb-2"
          >
            <Tab eventKey="produits" title="Produits">
              <Card className="shadow mt-4">
                <Card.Body>
                  <AmisProduct userId={userId} />
                </Card.Body>
              </Card>
            </Tab>
            {/* Ajout de la condition pour l'onglet Boutique */}
            {profile.role === "PREMIUM_USER" && (
              <Tab eventKey="boutique" title="Boutique">
                <Card className="shadow mt-4">
                  <Card.Body>
                    <h2 className="mb-4">Boutiques {profile.name}</h2>
                    <Row className="g-4">
                      <LLboutique />
                    </Row>
                  </Card.Body>
                </Card>
              </Tab>
            )}
          </Tabs>
        </Container>
      </div>
    </div>
  );
};

export default AmisProfil;
