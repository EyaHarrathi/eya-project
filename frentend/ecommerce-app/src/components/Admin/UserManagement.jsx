"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import SignupAdmine from "../Admin/signupadmine";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Add notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // success, danger
  });

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.prenom} ${user.nom}`.toLowerCase();
    const email = user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/utilisateur");
        setUsers(response.data);

        const usersWithStats = response.data;
        const statsPromises = usersWithStats.map((user) =>
          axios
            .get(`http://localhost:8080/utilisateur/${user.id}/order-stats`)
            .then((res) => ({ userId: user.id, stats: res.data }))
            .catch((err) => {
              console.error(`Error fetching stats for user ${user.id}:`, err);
              return {
                userId: user.id,
                stats: { totalOrders: 0, totalSpent: 0 },
              };
            })
        );

        const statsResults = await Promise.allSettled(statsPromises);
        const statsMap = {};
        statsResults.forEach((result) => {
          if (result.status === "fulfilled") {
            statsMap[result.value.userId] = result.value.stats;
          }
        });

        setUserStats(statsMap);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to fetch users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Add function to show notification
  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type,
    });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const getUserActivityStatus = (userId) => {
    const stats = userStats[userId];
    if (!stats) return { status: "unknown", percentage: 0 };

    if (stats.totalOrders > 10) {
      return { status: "active", percentage: 100 };
    } else {
      const percentage = (stats.totalOrders / 10) * 100;
      return { status: "inactive", percentage: percentage };
    }
  };

  const handleDelete = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await axios.delete(`http://localhost:8080/utilisateur/${userId}`);

        // Find the user before removing from the list
        const deletedUser = users.find((user) => user.id === userId);
        const userName = deletedUser
          ? `${deletedUser.prenom} ${deletedUser.nom}`
          : "L'utilisateur";

        // Update the users list
        setUsers(users.filter((user) => user.id !== userId));

        // Show notification
        showNotification(`${userName} a été supprimé avec succès.`);
      } catch (err) {
        console.error("Delete error:", err);
        showNotification(
          "Erreur lors de la suppression de l'utilisateur.",
          "danger"
        );
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-primary";
      case "PREMIUM_USER":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  const handleUserAdded = (newUser) => {
    setUsers([...users, newUser]);
    setShowAddModal(false);
    showNotification(
      `${newUser.prenom} ${newUser.nom} a été ajouté avec succès.`
    );
  };

  // Function to handle user modification (to be called from profile page)
  window.handleUserModified = (updatedUser) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    showNotification(
      `${updatedUser.prenom} ${updatedUser.nom} a été modifié avec succès.`
    );
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card stat-card h-100 position-relative">
      {/* Notification popup */}
      {notification.show && (
        <div className={`notification-popup alert alert-${notification.type}`}>
          <div className="d-flex align-items-center">
            <i
              className={`bi bi-${
                notification.type === "success"
                  ? "check-circle"
                  : "exclamation-triangle"
              }-fill me-2`}
            ></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 d-flex align-items-center">
          <i className="bi bi-people me-2"></i>
          Gestion des Utilisateurs
        </h5>
        <div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} className="me-1" />
            Ajouter un Utilisateur
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="mb-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchQuery("")}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Date d'inscription</th>
                <th>Activité</th>
                <th>Commandes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const activity = getUserActivityStatus(user.id);
                  const stats = userStats[user.id] || {
                    totalOrders: 0,
                    totalSpent: 0,
                  };

                  return (
                    <tr key={user.id}>
                      <td>
                        {user.prenom} {user.nom}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge ${getRoleBadgeClass(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {new Date(user.createdDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2" style={{ width: "100px" }}>
                            <div className="progress" style={{ height: "8px" }}>
                              <div
                                className={`progress-bar ${
                                  activity.status === "active"
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                                role="progressbar"
                                style={{ width: `${activity.percentage}%` }}
                                aria-valuenow={activity.percentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                          <div className="small">
                            <span
                              className={`fw-bold ${
                                activity.status === "active"
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {activity.status === "active"
                                ? "Active"
                                : "Inactif"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="badge bg-light text-dark p-2 d-flex align-items-center">
                            <span className="fw-semibold me-1">
                              {stats.totalOrders}
                            </span>
                            <span className="small text-muted me-2">
                              commandes
                            </span>
                            {/* <span className="fw-semibold">
                              {(stats.totalSpent || 0).toFixed(2)}
                            </span>
                            <span className="small text-muted ms-1">DT</span> */}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/profile/${user.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="Voir le profil"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(user.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-search fs-3 mb-2 text-muted"></i>
                      <p className="text-muted mb-0">
                        Aucun utilisateur trouvé
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Nouvel Utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SignupAdmine onUserAdded={handleUserAdded} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .notification-popup {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1050;
          min-width: 300px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-left: 4px solid;
          animation: slideIn 0.3s ease-out forwards;
        }

        .alert-success {
          border-left-color: #198754;
        }

        .alert-danger {
          border-left-color: #dc3545;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
