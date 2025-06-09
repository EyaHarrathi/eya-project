import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Accordion,
  Modal,
  Form,
  Spinner,
  Alert,
  ListGroup,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import {
  FaStore,
  FaEdit,
  FaTrash,
  FaPhone,
  FaSearch,
  FaPlus,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaDownload,
  FaUserCircle,
  FaTag,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaFile,
} from "react-icons/fa";
import axios from "axios";

const BoutiqueAdmin = () => {
  const navigate = useNavigate();
  const [boutiquesData, setBoutiquesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boutiqueToDelete, setBoutiqueToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBoutique, setCurrentBoutique] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    type: "",
    numeros: [],
  });
  const [newNumero, setNewNumero] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [activeView, setActiveView] = useState("grid");
  const [sortBy, setSortBy] = useState("nom");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterType, setFilterType] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBoutique, setDetailBoutique] = useState(null);
  const [stats, setStats] = useState({
    totalBoutiques: 0,
    totalUsers: 0,
    boutiquesByType: {},
  });

  const [typeStats, setTypeStats] = useState({});

  const typeTranslations = {
    retail: "Vente au Détail",
    wholesale: "Vente en Gros",
    service: "Service",
    unknown: "Non spécifié",
  };

  useEffect(() => {
    const fetchBoutiques = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8080/api/boutiques/grouped-by-user"
        );
        setBoutiquesData(response.data);

        const typeStatsResponse = await axios.get(
          "http://localhost:8080/api/boutiques/count-by-type"
        );
        setTypeStats(typeStatsResponse.data);

        const totalBoutiques = response.data.reduce(
          (acc, user) => acc + user.boutiques.length,
          0
        );
        const totalUsers = response.data.length;

        setStats({
          totalBoutiques,
          totalUsers,
          boutiquesByType: typeStatsResponse.data,
        });

        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des boutiques:", err);
        setError(
          "Impossible de charger les boutiques. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBoutiques();
  }, [updateSuccess, deleteSuccess]);

  const handleBoutiqueClick = (boutiqueId) => {
    navigate(`/boutique/${boutiqueId}`);
  };

  const handleDeleteBoutique = async () => {
    if (!boutiqueToDelete) return;

    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:8080/api/boutiques/${boutiqueToDelete.id}`
      );
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
      setShowDeleteModal(false);
      setBoutiqueToDelete(null);
    } catch (err) {
      console.error("Erreur lors de la suppression de la boutique:", err);
      setDeleteError(
        "Impossible de supprimer la boutique. Veuillez réessayer plus tard."
      );
      setTimeout(() => setDeleteError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (boutique, e) => {
    e.stopPropagation();
    setCurrentBoutique(boutique);
    setFormData({
      nom: boutique.nom,
      description: boutique.description,
      type: boutique.type,
      numeros: boutique.numeros || [],
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (boutique, e) => {
    e.stopPropagation();
    setDetailBoutique(boutique);
    setShowDetailModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddNumero = () => {
    if (newNumero.trim()) {
      setFormData({
        ...formData,
        numeros: [...formData.numeros, newNumero.trim()],
      });
      setNewNumero("");
    }
  };

  const handleRemoveNumero = (index) => {
    const updatedNumeros = [...formData.numeros];
    updatedNumeros.splice(index, 1);
    setFormData({
      ...formData,
      numeros: updatedNumeros,
    });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === "logo") {
      setLogoFile(file);
    } else if (fileType === "document") {
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentBoutique) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append("nom", formData.nom);
      formDataObj.append("description", formData.description);
      formDataObj.append("type", formData.type);
      formData.numeros.forEach((numero) => {
        formDataObj.append("numeros", numero);
      });

      if (logoFile) {
        formDataObj.append("logo", logoFile);
      }
      if (documentFile) {
        formDataObj.append("documentJuridique", documentFile);
      }

      await axios.put(
        `http://localhost:8080/api/boutiques/${currentBoutique.id}`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setShowEditModal(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la boutique:", err);
      setUpdateError(
        "Impossible de mettre à jour la boutique. Veuillez réessayer plus tard."
      );
      setTimeout(() => setUpdateError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const getFilteredAndSortedData = () => {
    return boutiquesData
      .map((userData) => {
        const filteredBoutiques = userData.boutiques.filter((boutique) => {
          const matchesSearch =
            boutique.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boutique.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            userData.userName.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesType = filterType ? boutique.type === filterType : true;

          return matchesSearch && matchesType;
        });

        const sortedBoutiques = [...filteredBoutiques].sort((a, b) => {
          if (sortBy === "nom") {
            return sortDirection === "asc"
              ? a.nom.localeCompare(b.nom)
              : b.nom.localeCompare(a.nom);
          } else if (sortBy === "type") {
            return sortDirection === "asc"
              ? a.type.localeCompare(b.type)
              : b.type.localeCompare(a.type);
          }
          return 0;
        });

        if (sortedBoutiques.length > 0) {
          return {
            ...userData,
            boutiques: sortedBoutiques,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredData = getFilteredAndSortedData();

  const boutiqueTypes = [
    { value: "retail", label: "Vente au Détail" },
    { value: "wholesale", label: "Vente en Gros" },
    { value: "service", label: "Service" },
  ];

  const exportToCSV = () => {
    const allBoutiques = boutiquesData.flatMap((userData) =>
      userData.boutiques.map((boutique) => ({
        ...boutique,
        userName: userData.userName,
      }))
    );

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nom,Description,Type,Propriétaire,ID Utilisateur\n";

    allBoutiques.forEach((boutique) => {
      const row = [
        `"${boutique.nom}"`,
        `"${boutique.description}"`,
        `"${typeTranslations[boutique.type] || boutique.type}"`,
        `"${boutique.userName}"`,
        `"${boutique.idUtilisateur}"`,
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `boutiques_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && boutiquesData.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Chargement des boutiques...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <FaInfoCircle className="me-2" />
        {error}
      </Alert>
    );
  }

  return (
    <Container fluid className="py-4">
      {updateSuccess && (
        <Alert variant="success" className="mb-3">
          <FaCheck className="me-2" />
          La boutique a été mise à jour avec succès!
        </Alert>
      )}

      {updateError && (
        <Alert variant="danger" className="mb-3">
          <FaTimes className="me-2" />
          {updateError}
        </Alert>
      )}

      {deleteSuccess && (
        <Alert variant="success" className="mb-3">
          <FaCheck className="me-2" />
          La boutique a été supprimée avec succès!
        </Alert>
      )}

      {deleteError && (
        <Alert variant="danger" className="mb-3">
          <FaTimes className="me-2" />
          {deleteError}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-0 bg-primary text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-white p-3 me-3">
                <FaStore className="text-primary fs-3" />
              </div>
              <div>
                <h6 className="mb-0">Total Boutiques</h6>
                <h2 className="mb-0">{stats.totalBoutiques}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-0 bg-success text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-white p-3 me-3">
                <FaUserCircle className="text-success fs-3" />
              </div>
              <div>
                <h6 className="mb-0">Propriétaires</h6>
                <h2 className="mb-0">{stats.totalUsers}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-0 bg-info text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-white p-3 me-3">
                <FaTag className="text-info fs-3" />
              </div>
              <div>
                <h6 className="mb-0">Types de Boutiques</h6>
                <h2 className="mb-0">
                  {Object.keys(stats.boutiquesByType).length}
                </h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-0 bg-warning text-white">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-white p-3 me-3">
                <FaTag className="text-warning fs-3" />
              </div>
              <div>
                <h6 className="mb-0">Boutiques par Type</h6>
                <div className="small">
                  <div>Vente au Détail: {typeStats.retail || 0}</div>
                  <div>Vente en Gros: {typeStats.wholesale || 0}</div>
                  <div>Service: {typeStats.service || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
            <h2 className="mb-3 mb-md-0">
              <FaStore className="me-2 text-primary" />
              Gestion des Boutiques
            </h2>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={exportToCSV}>
                <FaDownload className="me-2" />
                Exporter
              </Button>
              <div className="btn-group">
                <Button
                  variant={activeView === "grid" ? "primary" : "outline-primary"}
                  onClick={() => setActiveView("grid")}
                >
                  <i className="bi bi-grid"></i>
                </Button>
                <Button
                  variant={activeView === "list" ? "primary" : "outline-primary"}
                  onClick={() => setActiveView("list")}
                >
                  <i className="bi bi-list"></i>
                </Button>
              </div>
            </div>
          </div>

          <Row>
            <Col md={6} lg={8} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Rechercher par nom, description ou propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col md={3} lg={2}>
              <Dropdown className="w-100">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  className="w-100 d-flex align-items-center justify-content-between"
                >
                  <span>
                    <FaFilter className="me-2" />
                    {filterType
                      ? boutiqueTypes.find((t) => t.value === filterType)?.label ||
                        filterType
                      : "Tous les types"}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFilterType("")}>
                    Tous les types
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {boutiqueTypes.map((type) => (
                    <Dropdown.Item
                      key={type.value}
                      onClick={() => setFilterType(type.value)}
                    >
                      {type.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col md={3} lg={2}>
              <Dropdown className="w-100">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  className="w-100 d-flex align-items-center justify-content-between"
                >
                  <span>
                    {sortDirection === "asc" ? (
                      <FaSortAmountUp className="me-2" />
                    ) : (
                      <FaSortAmountDown className="me-2" />
                    )}
                    Trier par {sortBy === "nom" ? "nom" : "type"}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => toggleSort("nom")}>
                    Nom{" "}
                    {sortBy === "nom" && (sortDirection === "asc" ? "↑" : "↓")}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleSort("type")}>
                    Type{" "}
                    {sortBy === "type" && (sortDirection === "asc" ? "↑" : "↓")}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredData.length === 0 && (
        <Card className="shadow-sm border-0 text-center p-5">
          <Card.Body>
            <div className="py-5">
              <FaInfoCircle
                className="text-muted mb-3"
                style={{ fontSize: "3rem" }}
              />
              <h4>Aucune boutique trouvée</h4>
              <p className="text-muted">
                Aucune boutique ne correspond à vos critères de recherche.
                {filterType && (
                  <span>
                    {" "}
                    Essayez de supprimer le filtre "
                    {boutiqueTypes.find((t) => t.value === filterType)?.label ||
                      filterType}
                    ".
                  </span>
                )}
              </p>
              {(searchTerm || filterType) && (
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {activeView === "grid" && filteredData.length > 0 && (
        <Accordion defaultActiveKey="0" className="mb-4">
          {filteredData.map((userData, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={userData.userId}
              className="shadow-sm border-0 mb-3 rounded overflow-hidden"
            >
              <Accordion.Header className="bg-light">
                <div className="d-flex align-items-center w-100">
                  <div className="bg-primary text-white rounded-circle p-2 me-3">
                    <FaUserCircle size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-0">{userData.userName}</h5>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body className="bg-white">
                <Row xs={1} md={2} lg={3} className="g-4">
                  {userData.boutiques.map((boutique) => (
                    <Col key={boutique.id}>
                      <Card
                        className="h-100 shadow-sm boutique-card border-0 cursor-pointer"
                        onClick={() => handleBoutiqueClick(boutique.id)}
                      >
                        <Image
                          src={`http://localhost:8080/api/boutiques/${boutique.id}/logo`}
                          alt={boutique.nom}
                          className="card-img-top boutique-logo"
                          style={{ height: "160px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x160?text=Logo+non+disponible";
                          }}
                        />
                        <Card.Body>
                          <Card.Title className="d-flex justify-content-between align-items-center">
                            <span>{boutique.nom}</span>
                            <FaExternalLinkAlt
                              className="text-primary"
                              size={14}
                            />
                          </Card.Title>
                          <Card.Text className="text-muted small mb-3">
                            {boutique.description.length > 100
                              ? `${boutique.description.substring(0, 100)}...`
                              : boutique.description}
                          </Card.Text>
                          <div className="mb-3">
                            <h6 className="mb-2">
                              <FaPhone className="me-1" /> Numéros de contact:
                            </h6>
                            <ListGroup variant="flush" className="small">
                              {boutique.numeros &&
                              boutique.numeros.length > 0 ? (
                                boutique.numeros.map((numero, idx) => (
                                  <ListGroup.Item
                                    key={idx}
                                    className="py-1 px-0 border-0"
                                  >
                                    {numero}
                                  </ListGroup.Item>
                                ))
                              ) : (
                                <ListGroup.Item className="py-1 px-0 text-muted border-0">
                                  Aucun numéro disponible
                                </ListGroup.Item>
                              )}
                            </ListGroup>
                          </div>
                        </Card.Body>
                        <Card.Footer className="bg-white border-top-0">
                          <div className="d-flex justify-content-between">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={(e) => handleViewDetails(boutique, e)}
                            >
                              <FaEye className="me-1" /> Détails
                            </Button>
                            <div>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={(e) => handleEditClick(boutique, e)}
                              >
                                <FaEdit className="me-1" /> Modifier
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBoutiqueToDelete(boutique);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FaTrash className="me-1" /> Supprimer
                              </Button>
                            </div>
                          </div>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {activeView === "list" && filteredData.length > 0 && (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Boutique</th>
                    <th className="border-0">Type</th>
                    <th className="border-0">Propriétaire</th>
                    <th className="border-0">Contact</th>
                    <th className="border-0">Document</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.flatMap((userData) =>
                    userData.boutiques.map((boutique) => (
                      <tr
                        key={boutique.id}
                        className="cursor-pointer"
                        onClick={() => handleBoutiqueClick(boutique.id)}
                      >
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <Image
                              src={`http://localhost:8080/api/boutiques/${boutique.id}/logo`}
                              alt={boutique.nom}
                              className="me-3 rounded"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/40?text=Logo";
                              }}
                            />
                            <div>
                              <h6 className="mb-0 d-flex align-items-center">
                                {boutique.nom}
                                <FaExternalLinkAlt
                                  className="ms-2 text-primary"
                                  size={12}
                                />
                              </h6>
                              <small className="text-muted">
                                {boutique.description.length > 50
                                  ? `${boutique.description.substring(0, 50)}...`
                                  : boutique.description}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="align-middle">
                          {typeTranslations[boutique.type] || boutique.type}
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <FaUserCircle className="text-primary me-2" />
                            {userData.userName}
                          </div>
                        </td>
                        <td className="align-middle">
                          {boutique.numeros && boutique.numeros.length > 0 ? (
                            <span>{boutique.numeros[0]}</span>
                          ) : (
                            <span className="text-muted">Non disponible</span>
                          )}
                        </td>
                        <td className="align-middle">
                          {boutique.documentJuridique ? (
                            <span className="text-success">
                              <FaFile className="me-1" /> Disponible
                            </span>
                          ) : (
                            <span className="text-muted">
                              <FaTimes className="me-1" /> Non disponible
                            </span>
                          )}
                        </td>
                        <td className="align-middle text-end">
                          <Button
                            variant="link"
                            className="text-primary p-0 me-3"
                            onClick={(e) => handleViewDetails(boutique, e)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="link"
                            className="text-secondary p-0 me-3"
                            onClick={(e) => handleEditClick(boutique, e)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBoutiqueToDelete(boutique);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <FaExclamationTriangle
              className="text-warning"
              style={{ fontSize: "3rem" }}
            />
          </div>
          <p>
            Êtes-vous sûr de vouloir supprimer la boutique{" "}
            <strong>{boutiqueToDelete?.nom}</strong>?
          </p>
          <Alert variant="warning">
            <FaInfoCircle className="me-2" />
            Cette action est irréversible et supprimera définitivement toutes les
            données associées à cette boutique.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteBoutique}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Suppression...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Supprimer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FaEdit className="me-2 text-primary" />
            Modifier la boutique
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de la boutique</Form.Label>
                  <Form.Control
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de boutique</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="retail">Vente au Détail</option>
                    <option value="wholesale">Vente en Gros</option>
                    <option value="service">Service</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Numéros de téléphone</Form.Label>
              <InputGroup className="mb-2">
                <Form.Control
                  type="text"
                  value={newNumero}
                  onChange={(e) => setNewNumero(e.target.value)}
                  placeholder="Ajouter un numéro"
                />
                <Button
                  variant="outline-primary"
                  onClick={handleAddNumero}
                  disabled={!newNumero.trim()}
                >
                  <FaPlus />
                </Button>
              </InputGroup>

              <ListGroup>
                {formData.numeros.map((numero, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {numero}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveNumero(index)}
                    >
                      <FaTimes />
                    </Button>
                  </ListGroup.Item>
                ))}
                {formData.numeros.length === 0 && (
                  <ListGroup.Item className="text-muted">
                    Aucun numéro ajouté
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Logo (optionnel)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                  />
                  <Form.Text className="text-muted">
                    Laissez vide pour conserver le logo actuel
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Document juridique</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "document")}
                    />
                    {currentBoutique?.documentJuridique && (
                      <Button
                        variant="outline-success"
                        href={`http://localhost:8080/api/boutiques/${currentBoutique.id}/document-juridique`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaEye className="me-1" /> Voir
                      </Button>
                    )}
                  </InputGroup>
                  <Form.Text className="text-muted">
                    {currentBoutique?.documentJuridique
                      ? "Un document existe déjà. Téléchargez un nouveau fichier pour le remplacer."
                      : "Aucun document juridique n'existe. Veuillez en télécharger un."}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FaCheck className="me-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FaStore className="me-2 text-primary" />
            Détails de la boutique
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailBoutique && (
            <Row>
              <Col md={4}>
                <div className="text-center mb-4">
                  <Image
                    src={`http://localhost:8080/api/boutiques/${detailBoutique.id}/logo`}
                    alt={detailBoutique.nom}
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/200?text=Logo+non+disponible";
                    }}
                  />
                </div>
              </Col>
              <Col md={8}>
                <h3 className="mb-3">{detailBoutique.nom}</h3>
                <p className="text-muted mb-4">{detailBoutique.description}</p>

                <h5 className="mb-3">
                  <FaPhone className="me-2 text-primary" />
                  Numéros de contact
                </h5>
                {detailBoutique.numeros && detailBoutique.numeros.length > 0 ? (
                  <ListGroup className="mb-4">
                    {detailBoutique.numeros.map((numero, idx) => (
                      <ListGroup.Item
                        key={idx}
                        className="d-flex align-items-center"
                      >
                        <FaPhone className="me-2 text-muted" />
                        {numero}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="light" className="mb-4">
                    Aucun numéro de contact disponible
                  </Alert>
                )}
                <h5 className="mb-3 mt-4">
                  <FaFile className="me-2 text-primary" />
                  Document Juridique
                </h5>
                {detailBoutique.documentJuridique ? (
                  <div className="mb-4">
                    <Button
                      variant="outline-primary"
                      href={`http://localhost:8080/api/boutiques/${detailBoutique.id}/document-juridique`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDownload className="me-2" />
                      Télécharger le document juridique
                    </Button>
                  </div>
                ) : (
                  <Alert variant="light" className="mb-4">
                    Aucun document juridique disponible
                  </Alert>
                )}

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleBoutiqueClick(detailBoutique.id);
                    }}
                  >
                    <FaExternalLinkAlt className="me-1" /> Voir la boutique
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Fermer
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditClick(detailBoutique, new Event("click"));
                    }}
                  >
                    <FaEdit className="me-1" /> Modifier
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      setBoutiqueToDelete(detailBoutique);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash className="me-1" /> Supprimer
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .boutique-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .boutique-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        .boutique-logo {
          transition: opacity 0.3s ease;
        }
        .boutique-card:hover .boutique-logo {
          opacity: 0.9;
        }
        .accordion-button:not(.collapsed) {
          background-color: #f8f9fa;
          color: #212529;
          box-shadow: none;
        }
        .accordion-button:focus {
          box-shadow: none;
          border-color: rgba(0, 0, 0, 0.125);
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default BoutiqueAdmin;