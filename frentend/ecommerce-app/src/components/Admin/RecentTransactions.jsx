// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Eye, ExternalLink, Download } from "lucide-react";

// const RecentTransactions = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchRecentTransactions = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:8080/api/transactions/stats"
//         );

//         setTransactions(response.data.recentTransactions || []);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to fetch recent transactions.");
//         setLoading(false);
//       }
//     };

//     fetchRecentTransactions();
//   }, []);

//   const handleViewDetails = (transactionId) => {
//     // This would typically open a modal or navigate to a details page
//     console.log(`Viewing details for transaction ${transactionId}`);
//     // You could implement a modal or navigation here
//   };

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   if (loading) {
//     return (
//       <div className="card h-100">
//         <div
//           className="card-body d-flex justify-content-center align-items-center"
//           style={{ minHeight: "300px" }}
//         >
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="card h-100">
//         <div className="card-body">
//           <div className="alert alert-danger" role="alert">
//             {error}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="card h-100 recent-transactions-card">
//       <div className="card-header bg-white d-flex justify-content-between align-items-center">
//         <h5 className="card-title mb-0">Recent Transactions</h5>
//         <div className="dropdown">
//           <button
//             className="btn btn-sm btn-outline-secondary dropdown-toggle"
//             type="button"
//             id="dropdownMenuButton"
//             data-bs-toggle="dropdown"
//             aria-expanded="false"
//           >
//             <i className="bi bi-three-dots-vertical"></i>
//           </button>
//           <ul
//             className="dropdown-menu dropdown-menu-end"
//             aria-labelledby="dropdownMenuButton"
//           >
//             <li>
//               <a className="dropdown-item" href="#">
//                 <i className="bi bi-download me-2"></i> Export
//               </a>
//             </li>
//             <li>
//               <a className="dropdown-item" href="#">
//                 <i className="bi bi-printer me-2"></i> Print
//               </a>
//             </li>
//             <li>
//               <hr className="dropdown-divider" />
//             </li>
//             <li>
//               <a className="dropdown-item" href="#">
//                 <i className="bi bi-gear me-2"></i> Settings
//               </a>
//             </li>
//           </ul>
//         </div>
//       </div>
//       <div className="card-body p-0">
//         <div className="table-responsive">
//           <table className="table table-hover mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th className="border-0">Product</th>
//                 <th className="border-0">Amount</th>
//                 <th className="border-0 d-none d-md-table-cell">Date</th>
//                 <th className="border-0">Status</th>
//                 <th className="border-0 text-end">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.map((transaction) => (
//                 <tr key={transaction.id}>
//                   <td>
//                     <div className="d-flex align-items-center">
//                       <div className="avatar-sm bg-light rounded-circle p-2 me-2">
//                         <i className="bi bi-box text-primary"></i>
//                       </div>
//                       <div>
//                         <div className="fw-medium">
//                           {transaction.productName}
//                         </div>
//                         <div className="small text-muted">
//                           {transaction.id.substring(0, 8)}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td>
//                     <div className="fw-semibold">
//                       ${transaction.amount.toFixed(2)}
//                     </div>
//                   </td>
//                   <td className="d-none d-md-table-cell">
//                     <div>{formatDate(transaction.dateTransaction)}</div>
//                     <div className="small text-muted">
//                       {new Date(transaction.date).toLocaleTimeString()}
//                     </div>
//                   </td>
//                   <td>
//                     <span
//                       className={`badge ${getStatusBadgeClass(
//                         transaction.status
//                       )}`}
//                     >
//                       {transaction.status || "Completed"}
//                     </span>
//                   </td>
//                   <td className="text-end">
//                     <button
//                       className="btn btn-sm btn-icon btn-outline-primary me-1"
//                       onClick={() => handleViewDetails(transaction.id)}
//                       title="View Details"
//                     >
//                       <i className="bi bi-eye"></i>
//                     </button>
//                     <button
//                       className="btn btn-sm btn-icon btn-outline-secondary"
//                       title="Download Receipt"
//                     >
//                       <i className="bi bi-download"></i>
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <div className="card-footer bg-white border-top-0 text-center">
//         <a href="#" className="text-decoration-none">
//           View All Transactions <i className="bi bi-arrow-right ms-1"></i>
//         </a>
//       </div>
//     </div>
//   );
// };

// // Helper function to determine badge class based on status
// const getStatusBadgeClass = (status) => {
//   switch (status?.toLowerCase()) {
//     case "completed":
//       return "bg-success";
//     case "pending":
//       return "bg-warning";
//     case "failed":
//       return "bg-danger";
//     case "processing":
//       return "bg-info";
//     default:
//       return "bg-success"; // Default to success if no status provided
//   }
// };

// export default RecentTransactions;
