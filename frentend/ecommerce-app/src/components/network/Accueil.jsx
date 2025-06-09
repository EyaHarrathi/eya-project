"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Accueil = () => {
  const location = useLocation();
  const initialSearchTerm = location.state?.searchTerm || "";

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [profils, setProfils] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [temporarilyHidden, setTemporarilyHidden] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [refreshKey, setRefreshKey] = useState(0);
  const [invitationLoading, setInvitationLoading] = useState(null);
  const [cancelledInvitations, setCancelledInvitations] = useState([]); // Track cancelled invitations
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Set search term from location state when it changes
  useEffect(() => {
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
      // Clear the state after using it to prevent it from persisting on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all required data in parallel
        const [excludedRes, profilsRes, sentRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/friends/excluded-ids/${userId}`),
          axios.get("http://localhost:8080/utilisateur"),
          userId
            ? axios.get(
                `http://localhost:8080/api/friends/invitations/sent-ids/${userId}`
              )
            : Promise.resolve({ data: [] }),
        ]);

        setExcludedIds(excludedRes.data);
        setProfils(profilsRes.data);
        setSentInvitations(sentRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotification({
          message: "Erreur lors du chargement des données. Veuillez réessayer.",
          type: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchAllData();
    else setLoading(false);
  }, [userId, refreshKey]);

  const handleProfileClick = (userId) => {
    navigate(`/Acceuilprofile/${userId}`);
  };

  const sendInvitation = async (receiverId) => {
    if (!userId) {
      setNotification({
        message: "Vous devez être connecté pour envoyer des invitations.",
        type: "danger",
      });
      return;
    }

    setInvitationLoading(receiverId);
    try {
      await axios.post(
        `http://localhost:8080/api/friends/invitations/send/${userId}/${receiverId}`
      );
      setNotification({
        message: "Invitation envoyée avec succès!",
        type: "success",
      });
      // Update sent invitations state immediately
      setSentInvitations((prev) => [...prev, receiverId]);
      // Remove from cancelled invitations if it was there
      setCancelledInvitations((prev) => prev.filter((id) => id !== receiverId));

      // Dispatch custom event to notify other components
      console.log(
        "Accueil dispatching invitation-sent event for userId:",
        receiverId
      );
      window.dispatchEvent(
        new CustomEvent("invitation-sent", {
          detail: { userId: receiverId },
        })
      );
    } catch (error) {
      setNotification({
        message: "Erreur lors de l'envoi de l'invitation. Veuillez réessayer.",
        type: "danger",
      });
      console.error("Error sending invitation:", error);
    } finally {
      setInvitationLoading(null);
    }
  };

  const cancelInvitation = async (receiverId) => {
    if (!userId) {
      setNotification({
        message: "Vous devez être connecté pour annuler des invitations.",
        type: "danger",
      });
      return;
    }

    setInvitationLoading(receiverId);
    try {
      await axios.delete(
        `http://localhost:8080/api/friends/invitations/cancel/${userId}/${receiverId}`
      );
      setNotification({
        message: "Invitation annulée avec succès!",
        type: "info",
      });
      // Remove from sent invitations state immediately
      setSentInvitations((prev) => prev.filter((id) => id !== receiverId));
      // Add to cancelled invitations to keep profile visible
      setCancelledInvitations((prev) => [...prev, receiverId]);

      // Dispatch custom event to notify other components
      console.log(
        "Accueil dispatching invitation-cancelled event for userId:",
        receiverId
      );
      window.dispatchEvent(
        new CustomEvent("invitation-cancelled", {
          detail: { userId: receiverId },
        })
      );
    } catch (error) {
      setNotification({
        message:
          "Erreur lors de l'annulation de l'invitation. Veuillez réessayer.",
        type: "danger",
      });
      console.error("Error canceling invitation:", error);
    } finally {
      setInvitationLoading(null);
    }
  };

  const hideProfileTemporarily = (profileId) => {
    setTemporarilyHidden([...temporarilyHidden, profileId]);
    setNotification({
      message: "Profil masqué temporairement",
      type: "info",
    });
  };

  // Modified filter to keep profiles visible after cancelling invitations
  const filteredProfils = profils.filter((person) => {
    // Always exclude current user and temporarily hidden profiles
    if (person.id === userId || temporarilyHidden.includes(person.id)) {
      return false;
    }
    if (person.role === "ADMIN") {
      
      return false;
    }
    // Keep profiles visible if:
    // 1. They have a sent invitation
    // 2. They had a cancelled invitation (to keep them visible after cancelling)
    // 3. They are not in excludedIds
    const hasSentInvitation = sentInvitations.includes(person.id);
    const hadCancelledInvitation = cancelledInvitations.includes(person.id);
    const isExcluded = excludedIds.includes(person.id);

    if (hasSentInvitation || hadCancelledInvitation || !isExcluded) {
      // Apply search filter
      return (
        searchTerm === "" ||
        `${person.prenom} ${person.nom}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    return false;
  });

  useEffect(() => {
    const handleFriendshipUpdate = () => triggerRefresh();
    window.addEventListener("friendship-updated", handleFriendshipUpdate);
    return () =>
      window.removeEventListener("friendship-updated", handleFriendshipUpdate);
  }, []);

  useEffect(() => {
    const handleInvitationSent = (event) => {
      const { userId: targetUserId } = event.detail;
      setSentInvitations((prev) => {
        if (!prev.includes(targetUserId)) {
          return [...prev, targetUserId];
        }
        return prev;
      });
      // Remove from cancelled invitations if it was there
      setCancelledInvitations((prev) =>
        prev.filter((id) => id !== targetUserId)
      );
    };

    const handleInvitationCancelled = (event) => {
      const { userId: targetUserId } = event.detail;
      setSentInvitations((prev) => prev.filter((id) => id !== targetUserId));
      // Add to cancelled invitations to keep profile visible
      setCancelledInvitations((prev) => {
        if (!prev.includes(targetUserId)) {
          return [...prev, targetUserId];
        }
        return prev;
      });
    };

    window.addEventListener("invitation-sent", handleInvitationSent);
    window.addEventListener("invitation-cancelled", handleInvitationCancelled);

    return () => {
      window.removeEventListener("invitation-sent", handleInvitationSent);
      window.removeEventListener(
        "invitation-cancelled",
        handleInvitationCancelled
      );
    };
  }, []);

  // Function to get initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="fs-5 text-secondary">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <style>
        {`
          /* Custom CSS */
          .profile-card {
            transition: all 0.3s ease;
            border-radius: 12px;
            overflow: hidden;
            height: 100%;
          }
          
          .profile-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .card-header-gradient {
            height: 120px;
            position: relative;
            background-color: #BCD6FCFF !important; /* All profiles use the same blue color */
          }
          
          .profile-image-container {
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
          }
          
          .profile-image {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid white;
            object-fit: cover;
            background-color: #f8f9fa;
          }
          
          .profile-initials {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 600;
            color: white;
            background-color: #73A7F5FF !important; /* All profile initials use the same blue color */
          }
          
          .card-body-with-image {
            padding-top: 45px;
          }
          
          .hide-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0,0,0,0.3);
            color: white;
            border: none;
            transition: background-color 0.2s;
          }
          
          .hide-btn:hover {
            background-color: rgba(0,0,0,0.5);
          }
          
          .filter-btn.active {
            color: white !important;
          }
          
          .notification-alert {
            animation: fadeIn 0.3s ease-in-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .btn-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          .btn-icon svg {
            margin-right: 0.5rem;
          }
          
          .search-container {
            position: relative;
          }
          
          .search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
          }
          
          .search-input {
            padding-left: 40px;
          }
          
          .empty-state {
            padding: 3rem;
            text-align: center;
            background-color: #f8f9fa;
            border-radius: 12px;
          }
          
          .spinner-sm {
            width: 1rem;
            height: 1rem;
            border-width: 0.15em;
          }
        `}
      </style>

      {/* Header Section */}
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-2 d-flex align-items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="me-2 text-primary"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Découvrir des Personnes
        </h1>
        <p className="text-secondary">
          Connectez-vous avec de nouvelles personnes et élargissez votre réseau
        </p>
      </div>

      {/* Notification */}
      {notification.message && (
        <div
          className={`alert alert-${notification.type} d-flex align-items-center justify-content-between notification-alert mb-4`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setNotification({ message: "", type: "" })}
          ></button>
        </div>
      )}

      {/* Search and Refresh Controls */}
      <div className="row g-3 mb-4">
        <div className="col-md-9">
          <div className="search-container">
            <div className="search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3 text-end">
          <button
            onClick={triggerRefresh}
            className="btn btn-outline-primary"
            title="Rafraîchir"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="me-2"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
            </svg>
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 d-flex align-items-center text-secondary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="me-2"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>Affichage de {filteredProfils.length} profils</span>
      </div>

      {/* Profiles Grid */}
      {filteredProfils.length === 0 ? (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 text-secondary mx-auto d-block"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="18" y1="8" x2="23" y2="13"></line>
            <line x1="23" y1="8" x2="18" y2="13"></line>
          </svg>
          <h3 className="fs-4 fw-semibold text-secondary mb-2">
            Aucun profil trouvé
          </h3>
          <p className="text-muted mb-4">
            {searchTerm
              ? "Essayez d'ajuster vos termes de recherche"
              : "Il n'y a pas de profils disponibles pour le moment"}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              triggerRefresh();
            }}
            className="btn btn-primary"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredProfils.map((person) => (
            <div className="col" key={person.id}>
              <div className="card profile-card shadow-sm h-100">
                {/* Card Header with Profile Image */}
                <div className="card-header-gradient">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hideProfileTemporarily(person.id);
                    }}
                    className="hide-btn"
                    title="Masquer temporairement"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  <div className="profile-image-container">
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl || "/placeholder.svg"}
                        alt={`${person.prenom} ${person.nom}`}
                        className="profile-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <div
                      className="profile-initials"
                      style={{
                        display: person.photoUrl ? "none" : "flex",
                      }}
                    >
                      {getInitials(person.prenom, person.nom)}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body card-body-with-image text-center">
                  <h5 className="card-title mb-1">
                    {person.prenom} {person.nom}
                  </h5>
                  <br></br>
                  <div className="d-grid gap-2">
                    <button
                      onClick={() => handleProfileClick(person.id)}
                      className="btn btn-outline-secondary btn-icon"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                      Voir Profil
                    </button>

                    {sentInvitations.includes(person.id) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelInvitation(person.id);
                        }}
                        disabled={invitationLoading === person.id}
                        className="btn btn-outline-danger btn-icon"
                      >
                        {invitationLoading === person.id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Annulation...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Annuler Invitation
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sendInvitation(person.id);
                        }}
                        disabled={invitationLoading === person.id}
                        className="btn btn-primary btn-icon"
                      >
                        {invitationLoading === person.id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Envoi...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            Envoyer Invitation
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accueil;
