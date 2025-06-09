"use client";
import { useState, useEffect, useRef } from "react";
import {
  Bell,
  User,
  UserPlus,
  UserCheck,
  Check,
  Trash2,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import notificationSound from "../../assets/notificationSound.mp3";

const Notifications = ({ isOnline }) => {
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const userId = localStorage.getItem("userId");
  const audioRef = useRef(null);
  const filterRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Formatage précis de la date des notifications
  const formatNotificationDate = (dateString) => {
    try {
      if (!dateString) {
        console.warn("Date string is empty");
        return "Date inconnue";
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "Date inconnue";
      }

      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) {
        return "À l'instant";
      } else if (diffInMinutes < 60) {
        return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
      } else if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
      } else {
        return date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date inconnue";
    }
  };

  // Initialisation du son de notification
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fonction pour récupérer toutes les notifications
  const fetchNotifications = async () => {
    if (!isOnline) return;

    setIsLoading(true);
    try {
      const endpoint = `http://localhost:8080/api/notifications/user/${userId}`;

      const response = await axios.get(endpoint);
      console.log("API Response:", response.data);

      const sortedNotifications = response.data
        .map((notif) => ({
          ...notif,
          displayDate: notif.date || notif.createdAt,
        }))
        .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));

      setNotifications(sortedNotifications);

      const currentUnread = sortedNotifications.filter(
        (notification) => notification.statut === "non lue"
      ).length;

      setUnreadCount(currentUnread);

      if (currentUnread > prevUnreadCount) {
        audioRef.current?.play();
      }

      setPrevUnreadCount(currentUnread);
      setError(null);
    } catch (error) {
      console.error("Fetch notifications error:", {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });
      setError(
        "Impossible de charger les notifications. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour filtrer les notifications côté client
  const getFilteredNotifications = () => {
    if (filterType === "all") {
      return notifications;
    }
    return notifications.filter(
      (notification) => notification.type === filterType
    );
  };

  // Fonction pour grouper les notifications par date
  const groupNotificationsByDate = () => {
    const filteredNotifications = getFilteredNotifications();
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    filteredNotifications.forEach((notification) => {
      const notifDate = new Date(
        notification.createdAt || notification.date || notification.displayDate
      );

      if (notifDate >= today) {
        groups.today.push(notification);
      } else if (notifDate >= yesterday) {
        groups.yesterday.push(notification);
      } else if (notifDate >= oneWeekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  // Vérification périodique des notifications
  useEffect(() => {
    if (isOnline) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isOnline, filterType]);

  const handleNotificationsClick = () => {
    setShowNotificationsModal(true);
    if (isOnline) fetchNotifications();
  };

  const handleCloseNotificationsModal = () => setShowNotificationsModal(false);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId, event) => {
    if (event) event.stopPropagation();

    try {
      // Mise à jour optimiste de l'UI
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, statut: "lue" } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await axios.post(
        `http://localhost:8080/api/notifications/markAsRead/${notificationId}`
      );
    } catch (error) {
      console.error("Mark as read error:", error);
      // Rollback en cas d'erreur
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, statut: "non lue" } : n
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId, event) => {
    if (event) event.stopPropagation();

    try {
      // Mise à jour optimiste de l'UI
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const wasUnread =
        notifications.find((n) => n.id === notificationId)?.statut ===
        "non lue";
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await axios.delete(
        `http://localhost:8080/api/notifications/${notificationId}`
      );
    } catch (error) {
      console.error("Delete notification error:", error);
      // Rafraîchir pour obtenir l'état actuel
      fetchNotifications();
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      // Mise à jour optimiste de l'UI
      setNotifications((prev) => prev.map((n) => ({ ...n, statut: "lue" })));
      setUnreadCount(0);

      await axios.post(
        "http://localhost:8080/api/notifications/markAllAsRead",
        { userId }
      );
    } catch (error) {
      console.error("Mark all as read error:", error);
      // Revenir à l'état précédent en récupérant les dernières notifications
      try {
        const response = await axios.get(
          `http://localhost:8080/api/notifications/user/${userId}`
        );
        setNotifications(response.data);
        setUnreadCount(
          response.data.filter((n) => n.statut === "non lue").length
        );
      } catch (fetchError) {
        console.error("Failed to fetch notifications:", fetchError);
        alert("Erreur lors de la mise à jour des notifications");
      }
    }
  };

  // Supprimer toutes les notifications
  const deleteAllNotifications = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer toutes les notifications ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      // Mise à jour optimiste de l'UI
      setNotifications([]);
      setUnreadCount(0);

      await axios.delete(
        `http://localhost:8080/api/notifications/user/${userId}/all`
      );
    } catch (error) {
      console.error("Delete all notifications error:", error);
      // Rafraîchir pour obtenir l'état actuel en cas d'erreur
      fetchNotifications();
      alert("Erreur lors de la suppression de toutes les notifications");
    }
  };

  // Obtenir l'icône et la couleur en fonction du type de notification
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case "nouvelle_invitation":
        return {
          icon: <UserPlus size={16} />,
          color: "#4361ee",
          bgColor: "#eef2ff",
          label: "Invitation",
        };
      case "invitation_acceptée":
        return {
          icon: <UserCheck size={16} />,
          color: "#10b981",
          bgColor: "#ecfdf5",
          label: "Acceptée",
        };
      case "PREMIUM_UPGRADE":
        return {
          icon: <Check size={16} />,
          color: "#f59e0b",
          bgColor: "#fffbeb",
          label: "Premium",
        };
      case "SUBSCRIPTION_REMINDER":
      case "PREMIUM_EXPIRATION_WARNING":
        return {
          icon: <Bell size={16} />,
          color: "#ef4444",
          bgColor: "#fef2f2",
          label: "Rappel",
        };
      case "SUBSCRIPTION_EXPIRED":
        return {
          icon: <Bell size={16} />,
          color: "#dc2626",
          bgColor: "#fef2f2",
          label: "Expiré",
        };
      default:
        return {
          icon: <Bell size={16} />,
          color: "#f59e0b",
          bgColor: "#fffbeb",
          label: "Notification",
        };
    }
  };

  const notificationGroups = groupNotificationsByDate();

  return (
    <>
      {/* Bouton Notifications */}
      <button
        className="nav-btn notification-btn"
        onClick={handleNotificationsClick}
      >
        <Bell className="nav-icon" />
        <span className="nav-text">Notifications</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Modal des Notifications */}
      <Modal
        show={showNotificationsModal}
        onHide={handleCloseNotificationsModal}
        size="lg"
        className="notifications-modal"
        dialogClassName="notifications-dialog"
      >
        <Modal.Header closeButton>
          <div className="notifications-header-content">
            <Modal.Title>Notifications</Modal.Title>
            <div className="notification-count-badge">
              {unreadCount > 0 ? `${unreadCount} non lues` : "Toutes lues"}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="notifications-body">
          {!isOnline ? (
            <div className="login-prompt">
              <div className="login-icon">
                <User size={32} />
              </div>
              <h3>Connectez-vous</h3>
              <p>Vous devez être connecté pour voir vos notifications</p>
            </div>
          ) : (
            <div className="notifications-container">
              <div className="notifications-toolbar">
                <div className="filter-dropdown" ref={filterRef}>
                  <button
                    className="filter-button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    aria-expanded={isFilterOpen}
                  >
                    <Filter size={16} />
                    <span>
                      {filterType === "all"
                        ? "Toutes les notifications"
                        : filterType === "nouvelle_invitation"
                        ? "Nouvelles invitations"
                        : filterType === "invitation_acceptée"
                        ? "Invitations acceptées"
                        : filterType === "PREMIUM_UPGRADE"
                        ? "Mises à niveau Premium"
                        : filterType === "SUBSCRIPTION_EXPIRED"
                        ? "abonnement expiré"
                        : "Autre"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={isFilterOpen ? "rotate" : ""}
                    />
                  </button>

                  {isFilterOpen && (
                    <div className="filter-menu">
                      <div
                        className={`filter-option ${
                          filterType === "all" ? "active" : ""
                        }`}
                        onClick={() => {
                          setFilterType("all");
                          setIsFilterOpen(false);
                        }}
                      >
                        <Bell size={16} />
                        <span>Toutes les notifications</span>
                      </div>
                      <div
                        className={`filter-option ${
                          filterType === "nouvelle_invitation" ? "active" : ""
                        }`}
                        onClick={() => {
                          setFilterType("nouvelle_invitation");
                          setIsFilterOpen(false);
                        }}
                      >
                        <UserPlus size={16} />
                        <span>Nouvelles invitations</span>
                      </div>
                      <div
                        className={`filter-option ${
                          filterType === "invitation_acceptée" ? "active" : ""
                        }`}
                        onClick={() => {
                          setFilterType("invitation_acceptée");
                          setIsFilterOpen(false);
                        }}
                      >
                        <UserCheck size={16} />
                        <span>Invitations acceptées</span>
                      </div>
                      <div
                        className={`filter-option ${
                          filterType === "PREMIUM_UPGRADE" ? "active" : ""
                        }`}
                        onClick={() => {
                          setFilterType("PREMIUM_UPGRADE");
                          setIsFilterOpen(false);
                        }}
                      >
                        <Check size={16} />
                        <span>Mises à niveau Premium</span>
                      </div>
                      <div
                        className={`filter-option ${
                          filterType === "SUBSCRIPTION_EXPIRED" ? "active" : ""
                        }`}
                        onClick={() => {
                          setFilterType("SUBSCRIPTION_EXPIRED");
                          setIsFilterOpen(false);
                        }}
                      >
                        <Bell size={16} />
                        <span>abonnement expiré</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="toolbar-actions">
                  <button
                    className="refresh-button"
                    onClick={fetchNotifications}
                    title="Rafraîchir"
                  >
                    <RefreshCw size={16} />
                  </button>

                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read-button"
                      onClick={markAllAsRead}
                    >
                      <Check size={16} />
                      <span>Tout marquer comme lu</span>
                    </button>
                  )}

                  {notifications.length > 0 && (
                    <button
                      className="delete-all-button"
                      onClick={deleteAllNotifications}
                      title="Supprimer toutes les notifications"
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "14px",
                        cursor: "pointer",
                        marginLeft: "8px",
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Tout supprimer</span>
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="loader"></div>
                  <p>Chargement des notifications...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button className="retry-button" onClick={fetchNotifications}>
                    Réessayer
                  </button>
                </div>
              ) : getFilteredNotifications().length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Bell size={40} />
                  </div>
                  <h3>Aucune notification</h3>
                  <p>
                    {notifications.length === 0
                      ? "Vous n'avez pas de notifications pour le moment."
                      : `Aucune notification de type "${
                          filterType === "nouvelle_invitation"
                            ? "Nouvelles invitations"
                            : filterType === "invitation_acceptée"
                            ? "Invitations acceptées"
                            : filterType === "PREMIUM_UPGRADE"
                            ? "Mises à niveau Premium"
                            : filterType === "SUBSCRIPTION_REMINDER"
                            ? "Rappels d'abonnement"
                            : "Autre"
                        }"`}
                  </p>
                </div>
              ) : (
                <div className="notifications-list">
                  {Object.entries(notificationGroups).map(
                    ([groupKey, groupNotifications]) => {
                      if (groupNotifications.length === 0) return null;

                      return (
                        <div key={groupKey} className="notification-group">
                          <div className="group-header">
                            {groupKey === "today" && "Aujourd'hui"}
                            {groupKey === "yesterday" && "Hier"}
                            {groupKey === "thisWeek" && "Cette semaine"}
                            {groupKey === "older" && "Plus ancien"}
                          </div>

                          {groupNotifications.map((notification) => {
                            const typeInfo = getNotificationTypeInfo(
                              notification.type
                            );

                            return (
                              <div
                                key={notification.id}
                                className={`notification-card ${
                                  notification.statut === "non lue"
                                    ? "unread"
                                    : ""
                                }`}
                                onClick={() =>
                                  notification.statut === "non lue" &&
                                  markAsRead(notification.id)
                                }
                              >
                                <div className="notification-left">
                                  <div className="user-avatar">
                                    <img
                                      src={
                                        notification.userPhotoUrl ||
                                        "data:image/png;base64,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"
                                      }
                                      className={`avatar-image ${
                                        loadedImages[notification.id]
                                          ? "loaded"
                                          : "loading"
                                      }`}
                                      onLoad={() =>
                                        setLoadedImages((prev) => ({
                                          ...prev,
                                          [notification.id]: true,
                                        }))
                                      }
                                      onError={(e) => {
                                        e.target.src =
                                          "data:image/png;base64,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";
                                        setLoadedImages((prev) => ({
                                          ...prev,
                                          [notification.id]: true,
                                        }));
                                      }}
                                      alt="Avatar utilisateur"
                                    />
                                  </div>
                                </div>

                                <div className="notification-content">
                                  <div className="notification-header">
                                    <div
                                      className="notification-type"
                                      style={{
                                        backgroundColor: typeInfo.bgColor,
                                        color: typeInfo.color,
                                      }}
                                    >
                                      {typeInfo.icon}
                                      <span>{typeInfo.label}</span>
                                    </div>
                                    <div className="notification-time">
                                      {formatNotificationDate(
                                        notification.displayDate
                                      )}
                                    </div>
                                  </div>

                                  <div className="notification-message">
                                    {notification.message}
                                  </div>
                                </div>

                                <div className="notification-actions">
                                  {notification.statut === "non lue" && (
                                    <button
                                      className="action-button read-button"
                                      onClick={(e) =>
                                        markAsRead(notification.id, e)
                                      }
                                      title="Marquer comme lue"
                                    >
                                      <Check size={16} />
                                    </button>
                                  )}
                                  <button
                                    className="action-button delete-button"
                                    onClick={(e) =>
                                      deleteNotification(notification.id, e)
                                    }
                                    title="Supprimer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Notifications;
