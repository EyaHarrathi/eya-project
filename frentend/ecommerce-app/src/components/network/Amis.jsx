"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserFriends,
  FaSearch,
  FaUserMinus,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import {
  Alert,
  Badge,
  InputGroup,
  FormControl,
  Modal,
  Button,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const Amis = () => {
  const [amis, setAmis] = useState([]);
  const [filteredAmis, setFilteredAmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [deleteHoveredFriend, setDeleteHoveredFriend] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Fonction pour obtenir les initiales
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0) || "?";
    const lastInitial = lastName?.charAt(0) || "?";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Gérer les erreurs de chargement d'image
  const handleImageError = (friendId) => {
    setImageErrors((prev) => ({ ...prev, [friendId]: true }));
  };

  // Format the last active time
  const formatLastActive = (lastActiveDate, isOnline) => {
    if (isOnline) return "En ligne";

    if (!lastActiveDate) return "Inconnu";

    const now = new Date();
    const lastActive = new Date(lastActiveDate);

    if (isNaN(lastActive.getTime())) {
      return "Inconnu";
    }

    const diffMs = now - lastActive;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h${diffMinutes % 60}m`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    const options = { day: "numeric", month: "short" };
    return lastActive.toLocaleDateString("fr-FR", options);
  };

  // Send heartbeat to keep user online
  const sendHeartbeat = async () => {
    if (!userId) return;

    try {
      await axios.post(
        `http://localhost:8080/utilisateur/${userId}/heartbeat`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (error) {
      console.error("Error sending heartbeat:", error);
    }
  };

  // Set user online when component mounts
  const setUserOnline = async (userId) => {
    try {
      await axios.post(
        `http://localhost:8080/utilisateur/${userId}/online`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("User set online");
    } catch (error) {
      console.error("Error setting user online:", error);
    }
  };

  // Set user offline when component unmounts
  const setUserOffline = async (userId) => {
    try {
      await axios.post(
        `http://localhost:8080/utilisateur/${userId}/offline`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("User set offline");
    } catch (error) {
      console.error("Error setting user offline:", error);
    }
  };

  // Fetch user role
  const fetchUserRole = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/utilisateur/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserRole(response.data.role);
      return response.data.role;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  // Fetch friends status using the batch endpoint
  const fetchFriendsStatus = async (friendIds) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/utilisateur/batch-status",
        friendIds,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching friends status:", error);
      return [];
    }
  };

  // Fetch amis
  const fetchAmis = async (userId, role) => {
    try {
      const token = localStorage.getItem("token");
      let friendsData = [];

      if (role === "PREMIUM_USER") {
        try {
          const [directResponse, thirdDegreeResponse] = await Promise.all([
            axios.get(`http://localhost:8080/api/friends/list/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios
              .get(
                `http://localhost:8080/api/friends/${userId}/third-degree-friends`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              .catch((error) => {
                if (error.response?.status === 404) {
                  return { data: { friends: [] } };
                }
                throw error;
              }),
          ]);

          const directFriends = directResponse.data || [];
          const thirdDegreeFriends = thirdDegreeResponse.data?.friends || [];

          friendsData = [...directFriends, ...thirdDegreeFriends];
        } catch (error) {
          if (error.response?.status === 404) {
            const directResponse = await axios.get(
              `http://localhost:8080/api/friends/list/${userId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            friendsData = directResponse.data || [];
          } else {
            throw error;
          }
        }
      } else {
        const response = await axios.get(
          `http://localhost:8080/api/friends/list/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        friendsData = response.data || [];
      }

      // Suppression des doublons
      const uniqueFriends = Array.from(
        new Set(friendsData.map((f) => f.userId))
      ).map((id) => friendsData.find((f) => f.userId === id));

      // Fetch status for all friends in batch
      const friendIds = uniqueFriends.map((friend) => friend.userId);
      const statusData = await fetchFriendsStatus(friendIds);

      // Merge friends data with status data
      const friendsWithStatus = uniqueFriends.map((friend) => {
        const status = statusData.find((s) => s.userId === friend.userId);

        return {
          ...friend,
          isOnline: status?.isOnline || false,
          lastActive: status?.lastActive || null,
        };
      });

      setAmis(friendsWithStatus);
      setFilteredAmis(friendsWithStatus);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setError(
        error.response?.status === 404
          ? "Vous n'avez pas encore d'amis"
          : "Erreur lors du chargement des amis"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);

      const fetchData = async () => {
        // Set user online when component loads
        await setUserOnline(parsedUser.id);

        const role = await fetchUserRole(parsedUser.id);
        fetchAmis(parsedUser.id, role);
      };

      fetchData();
    }

    // Cleanup function to set user offline when component unmounts
    return () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserOffline(parsedUser.id);
      }
    };
  }, []);

  // Set up heartbeat to keep user online
  useEffect(() => {
    if (!userId) return;

    // Send heartbeat every 2 minutes
    const heartbeatInterval = setInterval(sendHeartbeat, 120000);

    return () => clearInterval(heartbeatInterval);
  }, [userId]);

  // Set up periodic refresh of online status
  useEffect(() => {
    if (!userId || amis.length === 0) return;

    const refreshInterval = setInterval(() => {
      fetchAmis(userId, userRole);
    }, 180000); // Refresh every 3 minutes

    return () => clearInterval(refreshInterval);
  }, [userId, userRole, amis.length]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAmis(amis);
    } else {
      const filtered = amis.filter(
        (ami) =>
          ami.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ami.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ami.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAmis(filtered);
    }
  }, [searchTerm, amis]);

  const confirmDeleteFriend = (friend) => {
    setFriendToDelete(friend);
    setShowDeleteModal(true);
  };

  const handleRemoveFriend = async () => {
    if (!friendToDelete) return;

    setLoading(true);
    setShowDeleteModal(false);

    try {
      const tempAmis = amis.filter(
        (ami) => ami.userId !== friendToDelete.userId
      );
      setAmis(tempAmis);
      setFilteredAmis(tempAmis);

      await axios.delete(
        `http://localhost:8080/api/friends/remove/${userId}/${friendToDelete.userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setToastMessage(
        `${friendToDelete.prenom} ${friendToDelete.nom} a été retiré de vos amis`
      );
      setShowToast(true);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ami", error);
      setAmis([...amis]);
      setFilteredAmis([...amis]);
      setToastMessage(
        "Vous ne pouvez supprimer cette ami il n'est pas ton amis direct"
      );
      setShowToast(true);
    } finally {
      setLoading(false);
      setFriendToDelete(null);
    }
  };

  if (loading && amis.length === 0) {
    return (
      <div className="friends-loading">
        <div className="friends-loading-content">
          <p>Chargement de vos amis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-error">
        <Alert variant="danger">
          <Alert.Heading>
            <FaExclamationTriangle className="me-2" />
            Une erreur est survenue
          </Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-danger"
              onClick={() => fetchAmis(userId, userRole)}
            >
              Réessayer
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="friends-container">
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3 toast-container">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="light"
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="friends-card">
        {/* Header */}
        <div className="friends-header">
          <div className="friends-title">
            <div className="friends-icon-wrapper">
              <FaUserFriends className="friends-icon" />
            </div>
            <div>
              <h2>
                Mes Amis
                {userRole === "PREMIUM_USER" && (
                  <Badge bg="success" className="ms-2">
                    Premium
                  </Badge>
                )}
              </h2>
              <p className="friends-subtitle">
                {userRole === "PREMIUM_USER"
                  ? "Vos connexions du troisième degré"
                  : "Gérez votre liste d'amis"}
                <Badge bg="primary" pill className="ms-2">
                  {amis.length}
                </Badge>
              </p>
            </div>
          </div>

          <div className="friends-search">
            <InputGroup>
              <InputGroup.Text className="search-icon-wrapper">
                <FaSearch className="search-icon" />
              </InputGroup.Text>
              <FormControl
                placeholder="Rechercher un ami..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </InputGroup>
          </div>
        </div>

        {/* Friends List */}
        <div className="friends-list-container">
          {filteredAmis.length === 0 ? (
            <div className="friends-empty">
              <div className="empty-icon-wrapper">
                <FaUserFriends className="empty-icon" />
              </div>
              <h4>Aucun ami trouvé</h4>
              {searchTerm ? (
                <p>Aucun résultat pour "{searchTerm}"</p>
              ) : (
                <p>Vous n'avez pas encore d'amis dans votre liste</p>
              )}
              {searchTerm && (
                <Button
                  variant="outline-primary"
                  onClick={() => setSearchTerm("")}
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <div className="friends-list">
              {filteredAmis.map((ami) => (
                <div
                  key={ami.id || ami.userId}
                  className={`friend-card ${
                    deleteHoveredFriend === ami.userId ? "delete-hover" : ""
                  }`}
                  onMouseLeave={() => setDeleteHoveredFriend(null)}
                >
                  <Link to={`/amis/${ami.userId}`} className="friend-link">
                    <div className="friend-avatar">
                      {ami.photoUrl && !imageErrors[ami.userId] ? (
                        <img
                          src={ami.photoUrl || "/placeholder.svg"}
                          alt={`${ami.prenom} ${ami.nom}`}
                          className="friend-image"
                          onError={() => handleImageError(ami.userId)}
                        />
                      ) : (
                        <div className="friend-initials">
                          {getInitials(ami.prenom, ami.nom)}
                        </div>
                      )}
                      <span
                        className={`status-indicator ${
                          ami.isOnline ? "online" : "offline"
                        }`}
                      ></span>
                    </div>

                    <div className="friend-info">
                      <h5 className="friend-name">
                        {ami.prenom} {ami.nom}
                      </h5>
                      <p className="friend-email">{ami.email}</p>
                      <p className="friend-activity">
                        {formatLastActive(ami.lastActive, ami.isOnline)}
                      </p>
                    </div>
                  </Link>

                  <div className="friend-actions">
                    <button
                      className="delete-button"
                      onClick={() => confirmDeleteFriend(ami)}
                      onMouseEnter={() => setDeleteHoveredFriend(ami.userId)}
                    >
                      <FaUserMinus />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="delete-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {friendToDelete && (
            <div className="delete-confirmation">
              <div className="delete-friend-preview">
                {friendToDelete.photoUrl &&
                !imageErrors[friendToDelete.userId] ? (
                  <img
                    src={friendToDelete.photoUrl || "/placeholder.svg"}
                    alt={`${friendToDelete.prenom} ${friendToDelete.nom}`}
                    className="delete-friend-image"
                    onError={() => handleImageError(friendToDelete.userId)}
                  />
                ) : (
                  <div className="delete-friend-initials">
                    {getInitials(friendToDelete.prenom, friendToDelete.nom)}
                  </div>
                )}
                <div>
                  <h5>
                    {friendToDelete.prenom} {friendToDelete.nom}
                  </h5>
                  <p>{friendToDelete.email}</p>
                </div>
              </div>
              <p className="delete-warning">
                <FaExclamationTriangle className="me-2" />
                Êtes-vous sûr de vouloir supprimer cette personne de votre liste
                d'amis ?
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Annuler
          </Button>
          <Button variant="danger" onClick={handleRemoveFriend}>
            <FaTrash className="me-2" />
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        /* Main Container */
        .friends-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          width: 95%;
        }

        /* Card Styling */
        .friends-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        /* Header Section */
        .friends-header {
          background: ${userRole === "PREMIUM_USER"
            ? "linear-gradient(135deg, #2c3e50, #3498db)"
            : "linear-gradient(135deg, #4568dc, #b06ab3)"};
          padding: 2rem;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .friends-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .friends-icon-wrapper {
          background: rgba(255, 255, 255, 0.2);
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .friends-icon {
          font-size: 1.5rem;
        }

        .friends-title h2 {
          margin: 0;
          font-weight: 600;
          font-size: 1.5rem;
        }

        .friends-subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .friends-search {
          flex: 1;
          max-width: 400px;
        }

        .search-icon-wrapper {
          background: rgba(255, 255, 255, 0.2);
          border: none;
        }

        .search-icon {
          color: white;
        }

        .search-input {
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding-left: 0;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: none;
          color: white;
        }

        /* Friends List */
        .friends-list-container {
          padding: 1.5rem;
          min-height: 300px;
        }

        .friends-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .friend-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .friend-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 4px;
          background: ${userRole === "PREMIUM_USER"
            ? "linear-gradient(to bottom, #2c3e50, #3498db)"
            : "linear-gradient(to bottom, #4568dc, #b06ab3)"};
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .friend-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }

        .friend-card:hover::before {
          opacity: 1;
        }

        .friend-card.delete-hover {
          background-color: rgba(220, 53, 69, 0.05);
          border-color: rgba(220, 53, 69, 0.2);
        }

        .friend-card.delete-hover::before {
          background: #dc3545;
          opacity: 1;
        }

        .friend-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          flex: 1;
          gap: 1.25rem;
        }

        .friend-avatar {
          position: relative;
        }

        .friend-image {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .friend-initials {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          border: 3px solid white;
          background-color: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
          text-transform: uppercase;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }

        .status-indicator {
          position: absolute;
          bottom: 3px;
          right: 3px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .status-indicator.online {
          background-color: #28a745;
        }

        .status-indicator.offline {
          background-color: #6c757d;
        }

        .friend-info {
          flex: 1;
          min-width: 0;
        }

        .friend-name {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #212529;
        }

        .friend-email {
          margin: 0 0 0.25rem;
          font-size: 0.9rem;
          color: #6c757d;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .friend-activity {
          margin: 0;
          font-size: 0.8rem;
          color: #28a745;
        }

        .friend-actions {
          display: flex;
          align-items: center;
        }

        .delete-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .delete-button:hover {
          background-color: #dc3545;
          color: white;
          transform: scale(1.05);
        }

        /* Delete Modal */
        .delete-confirmation {
          text-align: center;
        }

        .delete-friend-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .delete-friend-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .delete-friend-initials {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .delete-warning {
          color: #dc3545;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        /* Empty State */
        .friends-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1rem;
          color: #6c757d;
        }

        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background-color: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .empty-icon {
          font-size: 2rem;
          color: #adb5bd;
        }

        /* Loading State */
        .friends-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .friends-loading-content {
          text-align: center;
          color: #6c757d;
        }

        /* Error State */
        .friends-error {
          max-width: 800px;
          margin: 2rem auto;
        }

        /* Toast */
        .toast-container {
          z-index: 1100;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .friend-card {
          animation: slideIn 0.3s ease-out;
        }

        /* Responsive Adjustments */
        @media (max-width: 992px) {
          .friends-list {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .friends-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .friends-search {
            max-width: 100%;
            width: 100%;
          }

          .friends-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Amis;
