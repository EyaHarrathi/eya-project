"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import { Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [notification, setNotification] = useState("");
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) fetchInvitations();
  }, [userId]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setNotification("");
      const { data } = await axios.get(
        `http://localhost:8080/api/friends/invitations/${userId}`
      );
      setInvitations(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        setNotification("Erreur lors du chargement des invitations");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (userId) => {
    // Pass state to indicate coming from invitations
    navigate(`/Acceuilprofile/${userId}`, {
      state: { fromInvitations: true },
    });
  };

  const handleInvitationAction = async (senderId, action) => {
    if (!userId || processingIds.has(senderId)) return;
    const originalInvitations = [...invitations];

    setProcessingIds((prev) => new Set([...prev, senderId]));

    try {
      setInvitations((prev) => prev.filter((inv) => inv.id !== senderId));
      await axios.post(
        `http://localhost:8080/api/friends/invitations/${action}/${senderId}/${userId}`
      );
      await fetchInvitations();
      window.dispatchEvent(new Event("friendship-updated"));
      setInvitations((prev) => prev.filter((inv) => inv.id !== senderId));
    } catch (error) {
      setInvitations(originalInvitations);
      setNotification(
        `Échec de l'action : ${error.response?.data?.message || error.message}`
      );
      await fetchInvitations(); // Resynchronisation en cas d'erreur
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(senderId);
        return newSet;
      });
    }
  };

  const filteredInvitations = invitations.filter((invitation) =>
    `${invitation.prenom} ${invitation.nom}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="invitations-container">
      <style>
        {`
          .invitations-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .invitations-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .invitations-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .invitations-count {
            background: linear-gradient(135deg, #0d6efd, #0dcaf0);
            color: white;
            border-radius: 20px;
            padding: 5px 12px;
            font-size: 0.9rem;
            font-weight: 600;
          }

          .search-container {
            margin-bottom: 20px;
          }

          .search-input-wrapper {
            position: relative;
            max-width: 400px;
            margin: 0 auto;
          }

          .search-input {
            width: 100%;
            padding: 12px 45px 12px 45px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            font-size: 1rem;
            background-color: white;
            transition: all 0.3s ease;
            outline: none;
          }

          .search-input:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          }

          .search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            font-size: 1.1rem;
          }

          .clear-search {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.2s ease;
          }

          .clear-search:hover {
            background-color: #f8f9fa;
            color: #dc3545;
          }
          
          .invitations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
            max-height: calc(100vh - 200px);
            overflow-y: auto;
            padding: 10px;
            border-radius: 12px;
            background-color: #f8f9fa;
            border: 1px solid rgba(0,0,0,0.05);
          }
          
          .invitation-card {
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            border: none;
            position: relative;
            cursor: pointer;
          }
          
          .invitation-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          
          .invitation-header {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 20px 0 50px 0;
            text-align: center;
            position: relative;
          }
          
          .invitation-img-container {
            position: relative;
            margin-top: -40px;
            display: flex;
            justify-content: center;
          }
          
          .invitation-img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            background-color: #f8f9fa;
            transition: all 0.3s ease;
          }
          
          .invitation-card:hover .invitation-img {
            transform: scale(1.05);
          }
          
          .invitation-body {
            padding: 15px;
            text-align: center;
          }
          
          .invitation-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
          }

          .view-profile-btn {
            background: linear-gradient(135deg, #6c757d, #495057);
            border: none;
            width: 100%;
            padding: 8px 0;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
          }

          .view-profile-btn:hover {
            background: linear-gradient(135deg, #5a6268, #343a40);
            transform: translateY(-2px);
          }
          
          .invitation-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
          }
          
          .btn-accept {
            background: linear-gradient(135deg, #20c997, #0dcaf0);
            border: none;
            flex: 1;
            padding: 8px 0;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-accept:hover {
            background: linear-gradient(135deg, #0ca678, #0aa2c0);
            transform: translateY(-2px);
          }
          
          .btn-decline {
            background: linear-gradient(135deg, #6c757d, #495057);
            border: none;
            flex: 1;
            padding: 8px 0;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-decline:hover {
            background: linear-gradient(135deg, #5a6268, #343a40);
            transform: translateY(-2px);
          }
          
          .btn-accept:disabled, .btn-decline:disabled, .view-profile-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          
          .notification {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            background-color: #f8d7da;
            border-left: 5px solid #dc3545;
            color: #721c24;
            display: flex;
            align-items: center;
            animation: fadeIn 0.3s ease;
          }
          
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            width: 100%;
          }
          
          .empty-icon {
            font-size: 3rem;
            color: #6c757d;
            margin-bottom: 15px;
          }
          
          .empty-text {
            font-size: 1.1rem;
            color: #6c757d;
            margin-bottom: 0;
          }
          
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
            width: 100%;
          }
          
          .loading-spinner {
            width: 3rem;
            height: 3rem;
          }
          
          .loading-text {
            margin-top: 15px;
            color: #6c757d;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .processing {
            position: relative;
          }
          
          .processing::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255,255,255,0.7);
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
          }
          
          .pulse-animation {
            animation: pulse 1.5s infinite ease-in-out;
          }
        `}
      </style>

      <div className="invitations-header">
        <h2 className="invitations-title">
          Invitations d'amis
          {filteredInvitations.length > 0 && (
            <Badge className="invitations-count">
              {searchTerm
                ? `${filteredInvitations.length}/${invitations.length}`
                : invitations.length}
            </Badge>
          )}
        </h2>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              title="Effacer la recherche"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="notification">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {notification}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="text-center">
            <Spinner
              animation="border"
              variant="primary"
              className="loading-spinner"
            />
            <p className="loading-text">Chargement des invitations...</p>
          </div>
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="bi bi-people"></i>
          </div>
          <p className="empty-text">
            {searchTerm
              ? `Aucune invitation trouvée pour "${searchTerm}"`
              : "Aucune invitation en attente"}
          </p>
        </div>
      ) : (
        <div className="invitations-grid">
          {filteredInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className={`invitation-card ${
                processingIds.has(invitation.id) ? "processing" : ""
              }`}
            >
              <div className="invitation-header"></div>
              <div className="invitation-img-container">
                <img
                  src={invitation.photoUrl || "../images/profil.png"}
                  alt={`${invitation.prenom} ${invitation.nom}`}
                  className="invitation-img"
                  onError={(e) => {
                    e.target.src = "../images/profil.png";
                  }}
                />
              </div>
              <div className="invitation-body">
                <h5 className="invitation-name">
                  {invitation.prenom} {invitation.nom}
                </h5>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(invitation.id);
                  }}
                  className="view-profile-btn"
                  disabled={processingIds.has(invitation.id)}
                >
                  <i className="bi bi-arrow-right me-1"></i>
                  Voir Profil
                </button>

                <div className="invitation-actions">
                  <button
                    className="btn-accept"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInvitationAction(invitation.id, "accept");
                    }}
                    disabled={processingIds.has(invitation.id)}
                  >
                    {processingIds.has(invitation.id) ? (
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      <i className="bi bi-check-lg me-1"></i>
                    )}
                    Accepter
                  </button>
                  <button
                    className="btn-decline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInvitationAction(invitation.id, "decline");
                    }}
                    disabled={processingIds.has(invitation.id)}
                  >
                    {processingIds.has(invitation.id) ? (
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      <i className="bi bi-x-lg me-1"></i>
                    )}
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invitations;
