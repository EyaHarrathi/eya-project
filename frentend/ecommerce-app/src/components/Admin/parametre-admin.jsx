"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Tabs,
  Tab,
  InputGroup,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useTheme } from "../theme-context"; // Import useTheme hook

// Configure axios
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

// API base URL - can be configured from environment variables
const API_BASE_URL = "http://localhost:8080";

const ParametreAdmin = () => {
  // Initialize with empty settings object
  const [settings, setSettings] = useState({
    // General settings
    applicationName: "",
    email: "",
    phone: "",
    address: "",

    // Social media
    facebookLink: "",
    twitterLink: "",
    instagramLink: "",
    linkedinLink: "",

    // Footer
    copyright: "",

    // Admin settings
    adminEmailDomain: "",
    adminPasswordMinLength: 8,
    adminRequireStrongPassword: true,
    adminAccountExpiration: 0,
    adminSessionTimeout: 60,
    adminMaxLoginAttempts: 5,
    adminLockoutDuration: 30,
    adminDefaultRole: "ADMIN",
    adminMustVerifyEmail: true,
    adminCanCreateUsers: true,
    adminNotifyOnNewUser: true,
    adminNotifyEmail: "",
    adminTermsUrl: "",
    adminPrivacyUrl: "",

    // Theme settings
    defaultTheme: "light",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#10b981",
    allowUserThemeChange: true,
    useDarkHeader: false,
    useDarkSidebar: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { currentTheme, setTheme, toggleTheme } = useTheme(); // Use the theme context
  const [previewTheme, setPreviewTheme] = useState(currentTheme);

  // Fetch current settings from backend
  useEffect(() => {
    fetchSettings();
  }, []);

  // Function to fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/settings`);
      if (response.data) {
        setSettings(response.data);
        // Set the current theme based on settings
        if (response.data.defaultTheme) {
          setPreviewTheme(response.data.defaultTheme);
          setTheme(response.data.defaultTheme); // Update the global theme
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(
        "Impossible de récupérer les paramètres. Utilisation des valeurs par défaut."
      );
      // If API fails, we'll use default values
    } finally {
      setLoading(false);
    }
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    // Update the global theme state
    setTheme(theme);

    // Also update the preview theme
    setPreviewTheme(theme);

    // Update the settings object
    setSettings((prev) => ({
      ...prev,
      defaultTheme: theme,
    }));
  };

  // Handle theme toggle from the parameters page
  const handleThemeToggle = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Update the global theme
    setTheme(newTheme);

    // Update the preview theme
    setPreviewTheme(newTheme);

    // Update the settings object
    setSettings((prev) => ({
      ...prev,
      defaultTheme: newTheme,
    }));
  };

  // Preview theme
  const handlePreviewTheme = (theme) => {
    setPreviewTheme(theme);
    applyTheme(theme);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));

    // If changing theme settings, update preview
    if (name === "defaultTheme") {
      handlePreviewTheme(value);
    }

    // If changing colors, update CSS variables
    if (
      name === "primaryColor" ||
      name === "secondaryColor" ||
      name === "accentColor"
    ) {
      const root = document.documentElement;
      root.style.setProperty(`--${name.replace("Color", "-color")}`, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/settings`, settings);

      // Update settings in localStorage for immediate use by other components
      localStorage.setItem("appSettings", JSON.stringify(settings));

      // Update the current theme to match the default theme setting
      setTheme(settings.defaultTheme);

      // Dispatch an event to notify other components about the settings change
      window.dispatchEvent(new Event("settingsUpdated"));

      setSuccess(true);

      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(
        `Une erreur est survenue lors de la sauvegarde des paramètres: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Theme preview component
  const ThemePreview = ({ theme }) => {
    return (
      <div
        className={`theme-preview ${theme === previewTheme ? "active" : ""}`}
        onClick={() => handlePreviewTheme(theme)}
      >
        <div className={`preview-container ${theme}`}>
          <div
            className="preview-header"
            style={{
              backgroundColor: theme === "dark" ? "#212529" : "#f8f9fa",
            }}
          >
            <div
              className="preview-title"
              style={{
                backgroundColor: theme === "dark" ? "#343a40" : "#e9ecef",
              }}
            ></div>
          </div>
          <div
            className="preview-sidebar"
            style={{
              backgroundColor: theme === "dark" ? "#343a40" : "#f8f9fa",
            }}
          >
            <div
              className="preview-menu-item"
              style={{
                backgroundColor: theme === "dark" ? "#495057" : "#e9ecef",
              }}
            ></div>
            <div
              className="preview-menu-item"
              style={{
                backgroundColor: theme === "dark" ? "#495057" : "#e9ecef",
              }}
            ></div>
            <div
              className="preview-menu-item"
              style={{
                backgroundColor: theme === "dark" ? "#495057" : "#e9ecef",
              }}
            ></div>
          </div>
          <div
            className="preview-content"
            style={{
              backgroundColor: theme === "dark" ? "#212529" : "#ffffff",
            }}
          >
            <div
              className="preview-card"
              style={{
                backgroundColor: theme === "dark" ? "#343a40" : "#ffffff",
                borderColor: theme === "dark" ? "#495057" : "#dee2e6",
              }}
            ></div>
            <div
              className="preview-card"
              style={{
                backgroundColor: theme === "dark" ? "#343a40" : "#ffffff",
                borderColor: theme === "dark" ? "#495057" : "#dee2e6",
              }}
            ></div>
          </div>
        </div>
        <div className="preview-label">
          {theme === "light" ? "Clair" : "Sombre"}
        </div>
        {theme === previewTheme && (
          <Badge bg="primary" className="preview-badge">
            Actif
          </Badge>
        )}
      </div>
    );
  };

  // Loading state
  if (loading && Object.keys(settings).length === 0) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des paramètres...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Paramètres de l'Application</h2>
          <Button
            variant={currentTheme === "light" ? "outline-light" : "light"}
            size="sm"
            onClick={handleThemeToggle}
            className="theme-toggle-btn"
          >
            <i
              className={`bi ${
                currentTheme === "light" ? "bi-moon-fill" : "bi-sun-fill"
              } me-2`}
            ></i>
            {currentTheme === "light" ? "Mode Sombre" : "Mode Clair"}
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">Paramètres mis à jour avec succès!</Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="general" title="Général">
              <Form>
                <Row className="mb-4">
                  <Col md={12}>
                    <h4>Informations Générales</h4>
                    <hr />
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom de l'Application</Form.Label>
                      <Form.Control
                        type="text"
                        name="applicationName"
                        value={settings.applicationName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email de Contact</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Téléphone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={settings.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Adresse</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={settings.address}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab>

            <Tab eventKey="social" title="Réseaux Sociaux">
              <Form>
                <Row className="mb-4">
                  <Col md={12}>
                    <h4>Réseaux Sociaux</h4>
                    <hr />
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Facebook</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-facebook"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="url"
                          name="facebookLink"
                          value={settings.facebookLink}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Twitter</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-twitter-x"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="url"
                          name="twitterLink"
                          value={settings.twitterLink}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Instagram</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-instagram"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="url"
                          name="instagramLink"
                          value={settings.instagramLink}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>LinkedIn</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-linkedin"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="url"
                          name="linkedinLink"
                          value={settings.linkedinLink}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab>

            <Tab eventKey="theme" title="Thème">
              <Form>
                <Row className="mb-4">
                  <Col md={12}>
                    <h4>Paramètres du Thème</h4>
                    <hr />
                  </Col>

                  <Col md={12} className="mb-4">
                    <Form.Group>
                      <Form.Label>Thème par Défaut</Form.Label>
                      <div className="theme-previews-container">
                        <ThemePreview theme="light" />
                        <ThemePreview theme="dark" />
                      </div>
                      <Form.Select
                        name="defaultTheme"
                        value={settings.defaultTheme}
                        onChange={handleChange}
                        className="mt-3"
                      >
                        <option value="light">Clair</option>
                        <option value="dark">Sombre</option>
                        <option value="system">
                          Système (selon les préférences de l'utilisateur)
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <h5>Couleurs Personnalisées</h5>
                    <hr />
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Couleur Primaire</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="color"
                          name="primaryColor"
                          value={settings.primaryColor}
                          onChange={handleChange}
                          className="me-2"
                        />
                        <Form.Control
                          type="text"
                          name="primaryColor"
                          value={settings.primaryColor}
                          onChange={handleChange}
                          placeholder="#2563eb"
                        />
                      </div>
                      <div
                        className="color-preview mt-2"
                        style={{ backgroundColor: settings.primaryColor }}
                      ></div>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Couleur Secondaire</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="color"
                          name="secondaryColor"
                          value={settings.secondaryColor}
                          onChange={handleChange}
                          className="me-2"
                        />
                        <Form.Control
                          type="text"
                          name="secondaryColor"
                          value={settings.secondaryColor}
                          onChange={handleChange}
                          placeholder="#1e40af"
                        />
                      </div>
                      <div
                        className="color-preview mt-2"
                        style={{ backgroundColor: settings.secondaryColor }}
                      ></div>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Couleur d'Accent</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="color"
                          name="accentColor"
                          value={settings.accentColor}
                          onChange={handleChange}
                          className="me-2"
                        />
                        <Form.Control
                          type="text"
                          name="accentColor"
                          value={settings.accentColor}
                          onChange={handleChange}
                          placeholder="#10b981"
                        />
                      </div>
                      <div
                        className="color-preview mt-2"
                        style={{ backgroundColor: settings.accentColor }}
                      ></div>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <hr />
                    <h5>Options Supplémentaires</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="allowUserThemeChange"
                        name="allowUserThemeChange"
                        label="Permettre aux utilisateurs de changer de thème"
                        checked={settings.allowUserThemeChange}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Si activé, les utilisateurs pourront choisir entre le
                        thème clair et sombre
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="useDarkHeader"
                        name="useDarkHeader"
                        label="Utiliser un en-tête sombre en mode clair"
                        checked={settings.useDarkHeader}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="useDarkSidebar"
                        name="useDarkSidebar"
                        label="Utiliser une barre latérale sombre en mode clair"
                        checked={settings.useDarkSidebar}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab>

            <Tab eventKey="admin" title="Administration">
              <Form>
                <Row className="mb-4">
                  <Col md={12}>
                    <h4>Gestion des Utilisateurs</h4>
                    <hr />
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Domaine Email Admin</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>@</InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="adminEmailDomain"
                          value={settings.adminEmailDomain}
                          onChange={handleChange}
                          placeholder="domaine.com"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Domaine recommandé pour les emails administrateurs
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Longueur Min. Mot de Passe</Form.Label>
                      <Form.Control
                        type="number"
                        name="adminPasswordMinLength"
                        value={settings.adminPasswordMinLength}
                        onChange={handleChange}
                        min="6"
                        max="20"
                      />
                      <Form.Text className="text-muted">
                        Nombre minimum de caractères pour les mots de passe
                        admin
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <hr />
                    <h5>Paramètres de Connexion</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Délai d'Inactivité (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        name="adminSessionTimeout"
                        value={settings.adminSessionTimeout}
                        onChange={handleChange}
                        min="5"
                        max="1440"
                      />
                      <Form.Text className="text-muted">
                        Déconnexion automatique après inactivité
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tentatives de Connexion Max</Form.Label>
                      <Form.Control
                        type="number"
                        name="adminMaxLoginAttempts"
                        value={settings.adminMaxLoginAttempts}
                        onChange={handleChange}
                        min="1"
                        max="10"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Durée de Verrouillage (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        name="adminLockoutDuration"
                        value={settings.adminLockoutDuration}
                        onChange={handleChange}
                        min="1"
                      />
                      <Form.Text className="text-muted">
                        Après dépassement des tentatives max
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rôle par Défaut</Form.Label>
                      <Form.Select
                        name="adminDefaultRole"
                        value={settings.adminDefaultRole}
                        onChange={handleChange}
                      >
                        <option value="ADMIN">Administrateur</option>
                        <option value="SUPER_ADMIN">
                          Super Administrateur
                        </option>
                        <option value="EDITOR">Éditeur</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <hr />
                    <h5>Paramètres de Réseau Social</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="allowFriendRequests"
                        name="allowFriendRequests"
                        label="Autoriser les demandes d'amitié"
                        checked={settings.allowFriendRequests !== false}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Permet aux utilisateurs d'envoyer des invitations
                        d'amitié
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="allowUserBlocking"
                        name="allowUserBlocking"
                        label="Autoriser le blocage d'utilisateurs"
                        checked={settings.allowUserBlocking !== false}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Permet aux utilisateurs de bloquer d'autres utilisateurs
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="showFriendSuggestions"
                        name="showFriendSuggestions"
                        label="Afficher les suggestions d'amis"
                        checked={settings.showFriendSuggestions !== false}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Affiche des suggestions d'amis basées sur les relations
                        existantes
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="enableThirdDegreeFriends"
                        name="enableThirdDegreeFriends"
                        label="Activer les amis au 3ème degré"
                        checked={settings.enableThirdDegreeFriends !== false}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Permet de voir les amis des amis des amis
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <hr />
                    <h5>Notifications</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="adminNotifyOnNewUser"
                        name="adminNotifyOnNewUser"
                        label="Notifier lors de nouvelles inscriptions"
                        checked={settings.adminNotifyOnNewUser}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email de Notification</Form.Label>
                      <Form.Control
                        type="email"
                        name="adminNotifyEmail"
                        value={settings.adminNotifyEmail}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Pour les notifications administratives
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="notifyOnFriendRequest"
                        name="notifyOnFriendRequest"
                        label="Notifier lors des demandes d'amitié"
                        checked={settings.notifyOnFriendRequest !== false}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="notifyOnFriendAccept"
                        name="notifyOnFriendAccept"
                        label="Notifier lors de l'acceptation d'amitié"
                        checked={settings.notifyOnFriendAccept !== false}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <hr />
                    <h5>Pages Légales</h5>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>URL Conditions d'Utilisation</Form.Label>
                      <Form.Control
                        type="text"
                        name="adminTermsUrl"
                        value={settings.adminTermsUrl}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>URL Politique de Confidentialité</Form.Label>
                      <Form.Control
                        type="text"
                        name="adminPrivacyUrl"
                        value={settings.adminPrivacyUrl}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab>

            <Tab eventKey="footer" title="Pied de Page">
              <Form>
                <Row className="mb-4">
                  <Col md={12}>
                    <h4>Pied de Page</h4>
                    <hr />
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Texte de Copyright</Form.Label>
                      <Form.Control
                        type="text"
                        name="copyright"
                        value={settings.copyright}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab>
          </Tabs>

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder les Paramètres"}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        /* Theme toggle button */
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        /* Theme preview styles */
        .theme-previews-container {
          display: flex;
          gap: 20px;
          margin-top: 10px;
        }

        .theme-preview {
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .theme-preview.active {
          border-color: var(--primary-color, #2563eb);
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .preview-container {
          width: 200px;
          height: 120px;
          display: grid;
          grid-template-columns: 50px 1fr;
          grid-template-rows: 30px 1fr;
          grid-template-areas:
            "header header"
            "sidebar content";
        }

        .preview-header {
          grid-area: header;
          padding: 5px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .preview-title {
          height: 10px;
          width: 70%;
          border-radius: 3px;
        }

        .preview-sidebar {
          grid-area: sidebar;
          padding: 5px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .preview-menu-item {
          height: 8px;
          border-radius: 3px;
        }

        .preview-content {
          grid-area: content;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preview-card {
          height: 30px;
          border-radius: 5px;
          border: 1px solid;
        }

        .preview-label {
          text-align: center;
          margin-top: 8px;
          font-weight: 500;
        }

        .preview-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          font-size: 0.7rem;
        }

        /* Color preview */
        .color-preview {
          height: 20px;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }
      `}</style>
    </Container>
  );
};

export default ParametreAdmin;
