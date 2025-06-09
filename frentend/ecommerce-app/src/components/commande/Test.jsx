import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaEllipsisV, FaTrash } from "react-icons/fa"; // Removed FaBan
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";

const Amis = () => {
  const [amis, setAmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
      fetchAmis(parsedUser.id);
    }
  }, []);

  const fetchAmis = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/friends/list/${userId}`
      );
      setAmis(response.data);
      setLoading(false);
    } catch (error) {
      setError("Erreur lors du chargement des amis");
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setLoading(true);
    try {
      // Suppression optimiste
      const tempAmis = amis.filter((ami) => ami.id !== friendId);
      setAmis(tempAmis);

      await axios.delete(
        `http://localhost:8080/api/friends/remove/${userId}/${friendId}`
      );

      // Re-fetch pour synchronisation
      await fetchAmis(userId);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ami", error);
      setAmis([...amis]); // Annule la suppression optimiste
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid ">
      <div className="row justify-content-center">
        <div className="col-8 w-100">
          <div
            className="card-text p-4 m-2 w-100"
            style={{
              width: "750px",
              backgroundColor: "rgba(220, 220, 220, 0.85)",
              borderRadius: "10px",
            }}
          >
            <h3 className="mb-4">
              <FaUser className="me-2" /> Liste d'amis ({amis.length})
            </h3>

            {amis.length === 0 ? (
              <div className="text-muted">Aucun ami pour le moment</div>
            ) : (
              amis.map((ami) => (
                <div
                  key={ami.id}
                  className="d-flex align-items-center justify-content-between friend-item mb-3 p-3"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <Link
                      to={`/amis/${ami.userId}`}
                      className="d-flex align-items-center"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        flex: 1,
                      }}
                    >
                      <img
                        src={ami.photoUrl || "https://via.placeholder.com/40"}
                        alt={`${ami.prenom} ${ami.nom}`}
                        className="rounded-circle me-2"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <h5 className="m-0">
                          {ami.prenom} {ami.nom}
                        </h5>
                        <small className="text-muted">{ami.email}</small>
                      </div>
                    </Link>
                  </div>
                  <div key={ami.id}>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        id="dropdown-actions"
                        className="text-dark"
                      >
                        <FaEllipsisV />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => handleRemoveFriend(ami.userId)}
                          className="text-light "
                        >
                          <FaTrash className="me-2" /> Supprimer
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .dropdown-toggle::after {
            display: none !important;
          }
          
          .dropdown-menu {
            min-width: 150px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: none;
            background-color: #11171DFF;
          }
          
          .dropdown-item {
            padding: 8px 16px;
            margin: 4px 7px;
            transition: all 0.2s;
            position: relative;
          }
          
          .dropdown-item:hover {
            background-color: #080E16DA;
            width: 90%;
          }

          .friend-item {
            transition: all 0.3s ease;
            animation: fadeIn 0.3s ease-out;
          }

          .friend-item:hover {
            background-color: #9EC6F3FF !important;
            transform: translateX(5px);
          }

          @keyframes fadeIn {
            from { 
              opacity: 0;
              transform: translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }

          .friend-item:hover .dropdown-toggle {
            visibility: visible;
          }
        `}
      </style>
    </div>
  );
};

export default Amis;
