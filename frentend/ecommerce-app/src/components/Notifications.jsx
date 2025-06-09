import React, { useState, useEffect } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("all"); // Filtre par type
  const userId = localStorage.getItem("userId"); // Récupérer l'ID de l'utilisateur connecté

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
  }, [filterType]); // Recharger les notifications lorsque le filtre change

  // Fonction pour charger les notifications
  const fetchNotifications = async () => {
    try {
      const endpoint =
        filterType === "all"
          ? `http://localhost:8080/api/notifications/user/${userId}`
          : `http://localhost:8080/api/notifications/user/${userId}/type/${filterType}`;
      const response = await axios.get(endpoint);
      setNotifications(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications", error);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/mark-as-read`);
      fetchNotifications(); // Recharger les notifications après la mise à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification", error);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:8080/api/notifications/${notificationId}`);
      fetchNotifications(); // Recharger les notifications après la suppression
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification", error);
    }
  };

  return (
    <div className="notifications">
      <h3>Notifications</h3>

      {/* Filtre par type de notification */}
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
        <option value="all">Toutes les notifications</option>
        <option value="nouvelle_invitation">Nouvelles invitations</option>
        <option value="invitation_acceptée">Invitations acceptées</option>
      </select>

      {notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id} className={notification.statut === "lue" ? "read" : "unread"}>
              <img src={notification.userPhotoUrl} alt="User" style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
              <img src={notification.iconUrl} alt="Icon" style={{ width: "20px", height: "20px" }} />
              <p>{notification.message}</p>
              {notification.statut === "non lue" && (
                <button onClick={() => markAsRead(notification.id)}>Marquer comme lue</button>
              )}
              <button onClick={() => deleteNotification(notification.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;