
// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   LoaderCircle,
//   Star,
//   MapPin,
//   Award,
//   Calendar,
//   Filter,
//   Users,
// } from "lucide-react";

// const Recommendations = ({ initialCategoryId }) => {
//   const [categoryId, setCategoryId] = useState(initialCategoryId || "");
//   const [recommendations, setRecommendations] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [animateIn, setAnimateIn] = useState(false);
//   const [hoveredCard, setHoveredCard] = useState(null);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/categories");
//         setCategories(response.data);
//       } catch (error) {
//         console.error("Erreur lors de la récupération des catégories :", error);
//       }
//     };
//     fetchCategories();
//     setTimeout(() => setAnimateIn(true), 100);
//   }, []);

//   useEffect(() => {
//     if (!categoryId) {
//       setRecommendations([]);
//       return;
//     }

//     const fetchRecommendations = async () => {
//       setLoading(true);
//       setAnimateIn(false);

//       try {
//         const url =
//           categoryId === "all"
//             ? "http://localhost:8080/api/intermediaries/recommendations/all"
//             : `http://localhost:8080/api/intermediaries/recommendations/${categoryId}`;

//         const response = await axios.get(url);
//         setRecommendations(response.data);

//         setTimeout(() => {
//           setLoading(false);
//           setTimeout(() => setAnimateIn(true), 100);
//         }, 500);
//       } catch (error) {
//         console.error("Erreur lors de la récupération des recommandations :", error);
//         setLoading(false);
//       }
//     };

//     fetchRecommendations();
//   }, [categoryId]);

//   return (
//     <div className="recommendations-wrapper">
//       <style jsx>{`
//         .recommendations-wrapper {
//           padding: 2rem;
//         }

//         .filter-section {
//           background: white;
//           padding: 1.5rem;
//           border-radius: 15px;
//           margin-bottom: 2rem;
//           box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
//         }

//         .select-container {
//           position: relative;
//           max-width: 400px;
//         }

//         .custom-select {
//           width: 100%;
//           padding: 0.8rem 1rem;
//           border: 2px solid #e2e8f0;
//           border-radius: 10px;
//           appearance: none;
//           background: white;
//           font-size: 1rem;
//           color: #1a202c;
//           transition: all 0.2s;
//         }

//         .custom-select:focus {
//           border-color: #6366f1;
//           box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
//           outline: none;
//         }

//         .masonry-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
//           gap: 1.5rem;
//           padding: 0.5rem;
//         }

//         .card {
//           background: white;
//           border-radius: 20px;
//           overflow: hidden;
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
//         }

//         .card:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
//         }

//         .card-image {
//           position: relative;
//           padding-top: 66.67%;
//           overflow: hidden;
//         }

//         .card-image img {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           transition: transform 0.5s ease;
//         }

//         .card:hover .card-image img {
//           transform: scale(1.05);
//         }

//         .rating-badge {
//           position: absolute;
//           top: 1rem;
//           right: 1rem;
//           background: rgba(255, 255, 255, 0.95);
//           padding: 0.4rem 0.8rem;
//           border-radius: 20px;
//           display: flex;
//           align-items: center;
//           gap: 0.3rem;
//           font-weight: 600;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//         }

//         .card-content {
//           padding: 1.5rem;
//         }

//         .name-section {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           margin-bottom: 1rem;
//         }

//         .name {
//           font-size: 1.25rem;
//           font-weight: 700;
//           color: #1a202c;
//           margin: 0;
//         }

//         .top-rated {
//           background: linear-gradient(135deg, #6366f1, #4f46e5);
//           color: white;
//           padding: 0.3rem 0.8rem;
//           border-radius: 15px;
//           font-size: 0.8rem;
//           font-weight: 600;
//         }

//         .location {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           color: #64748b;
//           margin-bottom: 1rem;
//         }

//         .info-item {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           margin-bottom: 0.5rem;
//           color: #475569;
//         }

//         .empty-state {
//           text-align: center;
//           padding: 4rem 2rem;
//           background: white;
//           border-radius: 20px;
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
//         }

//         .empty-icon {
//           width: 60px;
//           height: 60px;
//           margin: 0 auto 1.5rem;
//           color: #94a3b8;
//         }

//         .loading-state {
//           text-align: center;
//           padding: 4rem 2rem;
//         }

//         .spinner {
//           animation: spin 1s linear infinite;
//           color: #6366f1;
//         }

//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         @media (max-width: 768px) {
//           .recommendations-wrapper {
//             padding: 1rem;
//           }

//           .masonry-grid {
//             grid-template-columns: 1fr;
//           }
//         }
//       `}</style>

//       <div className="filter-section">
//         <div className="select-container">
//           <select
//             className="custom-select"
//             value={categoryId}
//             onChange={(e) => setCategoryId(e.target.value)}
//           >
//             <option value="">Sélectionnez une catégorie</option>
//             <option value="all">Toutes les catégories</option>
//             {categories.map((cat) => (
//               <option key={cat.id} value={cat.id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {!categoryId ? (
//         <div className="empty-state">
//           <div className="empty-icon">
//             <Filter size={60} />
//           </div>
//           <h2>Choisissez une catégorie</h2>
//           <p>Sélectionnez une catégorie pour voir les recommandations personnalisées</p>
//         </div>
//       ) : loading ? (
//         <div className="loading-state">
//           <LoaderCircle size={48} className="spinner" />
//           <p>Chargement des recommandations...</p>
//         </div>
//       ) : recommendations.length > 0 ? (
//         <div className="masonry-grid">
//           {recommendations.map((user) => (
//             <div
//               key={user.userId}
//               className="card"
//               onMouseEnter={() => setHoveredCard(user.userId)}
//               onMouseLeave={() => setHoveredCard(null)}
//             >
//               <div className="card-image">
//                 <img
//                   src={user.photoUrl || "https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg"}
//                   alt={`${user.prenom} ${user.nom}`}
//                 />
//                 {user.rating && (
//                   <div className="rating-badge">
//                     <Star size={14} fill="#ffc107" />
//                     <span>{user.rating}</span>
//                   </div>
//                 )}
//               </div>
//               <div className="card-content">
//                 <div className="name-section">
//                   <h3 className="name">
//                     {user.prenom} {user.nom}
//                   </h3>
//                   {user.isTopRated && (
//                     <span className="top-rated">
//                       <Award size={12} /> Top Évalué
//                     </span>
//                   )}
//                 </div>
//                 {user.location && (
//                   <div className="location">
//                     <MapPin size={16} />
//                     <span>{user.location}</span>
//                   </div>
//                 )}
//                 {user.specialty && (
//                   <div className="info-item">
//                     <Award size={16} />
//                     <span>{user.specialty}</span>
//                   </div>
//                 )}
//                 {user.experience && (
//                   <div className="info-item">
//                     <Calendar size={16} />
//                     <span>{user.experience}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="empty-state">
//           <div className="empty-icon">
//             <Users size={60} />
//           </div>
//           <h2>Aucune recommandation trouvée</h2>
//           <p>Essayez de sélectionner une autre catégorie ou revenez plus tard</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Recommendations;