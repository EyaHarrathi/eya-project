// "use client";

// import { useState, useEffect } from "react";
// import { Card, Row, Col, Form, Button, Dropdown, Modal } from "react-bootstrap";

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterRole, setFilterRole] = useState("All");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [newUser, setNewUser] = useState({
//     name: "",
//     email: "",
//     role: "Customer",
//     status: "Active",
//     joinDate: "",
//     lastLogin: "",
//   });

//   // Mock user data
//   const mockUsers = [
//     {
//       id: 1,
//       name: "John Doe",
//       email: "john.doe@example.com",
//       role: "Admin",
//       status: "Active",
//       joinDate: "2023-01-15",
//       lastLogin: "2023-05-20",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     {
//       id: 2,
//       name: "Jane Smith",
//       email: "jane.smith@example.com",
//       role: "Manager",
//       status: "Active",
//       joinDate: "2023-02-10",
//       lastLogin: "2023-05-19",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     {
//       id: 3,
//       name: "Robert Johnson",
//       email: "robert.johnson@example.com",
//       role: "Customer",
//       status: "Inactive",
//       joinDate: "2023-03-05",
//       lastLogin: "2023-04-15",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     {
//       id: 4,
//       name: "Emily Wilson",
//       email: "emily.wilson@example.com",
//       role: "Customer",
//       status: "Active",
//       joinDate: "2023-03-20",
//       lastLogin: "2023-05-18",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     {
//       id: 5,
//       name: "Michael Brown",
//       email: "michael.brown@example.com",
//       role: "Vendor",
//       status: "Active",
//       joinDate: "2023-04-10",
//       lastLogin: "2023-05-17",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     {
//       id: 6,
//       name: "Sarah Davis",
//       email: "sarah.davis@example.com",
//       role: "Customer",
//       status: "Suspended",
//       joinDate: "2023-04-25",
//       lastLogin: "2023-05-10",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//   ];

//   useEffect(() => {
//     // Simulate API call
//     setTimeout(() => {
//       setUsers(mockUsers);
//       setFilteredUsers(mockUsers);
//     }, 500);
//   }, []);

//   useEffect(() => {
//     filterUsers();
//   }, [searchTerm, filterRole, filterStatus, users]);

//   const filterUsers = () => {
//     let filtered = [...users];

//     // Filter by search term
//     if (searchTerm) {
//       filtered = filtered.filter(
//         (user) =>
//           user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           user.email.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Filter by role
//     if (filterRole !== "All") {
//       filtered = filtered.filter((user) => user.role === filterRole);
//     }

//     // Filter by status
//     if (filterStatus !== "All") {
//       filtered = filtered.filter((user) => user.status === filterStatus);
//     }

//     setFilteredUsers(filtered);
//   };

//   const handleAddUser = () => {
//     const id =
//       users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
//     const currentDate = new Date().toISOString().split("T")[0];

//     const userToAdd = {
//       ...newUser,
//       id,
//       joinDate: currentDate,
//       lastLogin: currentDate,
//       avatar: "/placeholder.svg?height=40&width=40",
//     };

//     setUsers([...users, userToAdd]);
//     setShowAddModal(false);
//     resetNewUser();
//   };

//   const handleEditUser = () => {
//     const updatedUsers = users.map((user) =>
//       user.id === currentUser.id ? currentUser : user
//     );
//     setUsers(updatedUsers);
//     setShowEditModal(false);
//   };

//   const handleDeleteUser = (id) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       setUsers(users.filter((user) => user.id !== id));
//     }
//   };

//   const resetNewUser = () => {
//     setNewUser({
//       name: "",
//       email: "",
//       role: "Customer",
//       status: "Active",
//       joinDate: "",
//       lastLogin: "",
//     });
//   };

//   const openEditModal = (user) => {
//     setCurrentUser({ ...user });
//     setShowEditModal(true);
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case "Active":
//         return "bg-success-subtle text-success";
//       case "Inactive":
//         return "bg-secondary-subtle text-secondary";
//       case "Suspended":
//         return "bg-danger-subtle text-danger";
//       default:
//         return "bg-secondary-subtle text-secondary";
//     }
//   };

//   const getRoleBadgeClass = (role) => {
//     switch (role) {
//       case "Admin":
//         return "bg-primary-subtle text-primary";
//       case "Manager":
//         return "bg-info-subtle text-info";
//       case "Vendor":
//         return "bg-warning-subtle text-warning";
//       case "Customer":
//         return "bg-success-subtle text-success";
//       default:
//         return "bg-secondary-subtle text-secondary";
//     }
//   };

//   return (
//     <div className="user-management-container">
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">User Management</h1>
//           <p className="page-subtitle">
//             Manage your platform users and their permissions
//           </p>
//         </div>
//         <Button
//           variant="primary"
//           className="add-user-btn"
//           onClick={() => setShowAddModal(true)}
//         >
//           <i className="fas fa-plus me-2"></i>Add New User
//         </Button>
//       </div>

//       <Card className="filter-card">
//         <Card.Body>
//           <Row>
//             <Col lg={4} md={6} className="mb-3 mb-md-0">
//               <div className="search-input-wrapper">
//                 <i className="fas fa-search search-icon"></i>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search users..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="search-input"
//                 />
//               </div>
//             </Col>
//             <Col lg={8} md={6}>
//               <div className="d-flex gap-3 flex-wrap">
//                 <Form.Group className="filter-group">
//                   <Form.Label className="filter-label">Role</Form.Label>
//                   <Form.Select
//                     value={filterRole}
//                     onChange={(e) => setFilterRole(e.target.value)}
//                   >
//                     <option value="All">All Roles</option>
//                     <option value="Admin">Admin</option>
//                     <option value="Manager">Manager</option>
//                     <option value="Vendor">Vendor</option>
//                     <option value="Customer">Customer</option>
//                   </Form.Select>
//                 </Form.Group>
//                 <Form.Group className="filter-group">
//                   <Form.Label className="filter-label">Status</Form.Label>
//                   <Form.Select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                   >
//                     <option value="All">All Status</option>
//                     <option value="Active">Active</option>
//                     <option value="Inactive">Inactive</option>
//                     <option value="Suspended">Suspended</option>
//                   </Form.Select>
//                 </Form.Group>
//                 <div className="ms-auto d-flex align-items-end">
//                   <Button
//                     variant="outline-secondary"
//                     className="filter-reset-btn"
//                     onClick={() => {
//                       setSearchTerm("");
//                       setFilterRole("All");
//                       setFilterStatus("All");
//                     }}
//                   >
//                     <i className="fas fa-redo-alt me-2"></i>Reset
//                   </Button>
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       <Card className="users-card">
//         <Card.Body>
//           <div className="table-responsive">
//             <table className="table table-hover align-middle">
//               <thead>
//                 <tr>
//                   <th>User</th>
//                   <th>Role</th>
//                   <th>Status</th>
//                   <th>Join Date</th>
//                   <th>Last Login</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map((user) => (
//                   <tr key={user.id}>
//                     <td>
//                       <div className="d-flex align-items-center">
//                         <div className="user-avatar-table">
//                           <img
//                             src={user.avatar || "/placeholder.svg"}
//                             alt={user.name}
//                           />
//                         </div>
//                         <div className="ms-3">
//                           <h6 className="user-name-table mb-0">{user.name}</h6>
//                           <p className="user-email-table mb-0">{user.email}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <span className={`badge ${getRoleBadgeClass(user.role)}`}>
//                         {user.role}
//                       </span>
//                     </td>
//                     <td>
//                       <span
//                         className={`badge ${getStatusBadgeClass(user.status)}`}
//                       >
//                         {user.status}
//                       </span>
//                     </td>
//                     <td>{new Date(user.joinDate).toLocaleDateString()}</td>
//                     <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
//                     <td>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-sm btn-icon"
//                           onClick={() => openEditModal(user)}
//                         >
//                           <i className="fas fa-edit"></i>
//                         </button>
//                         <button
//                           className="btn btn-sm btn-icon btn-danger-light"
//                           onClick={() => handleDeleteUser(user.id)}
//                         >
//                           <i className="fas fa-trash-alt"></i>
//                         </button>
//                         <Dropdown>
//                           <Dropdown.Toggle
//                             variant="light"
//                             size="sm"
//                             className="btn-icon"
//                           >
//                             <i className="fas fa-ellipsis-v"></i>
//                           </Dropdown.Toggle>
//                           <Dropdown.Menu>
//                             <Dropdown.Item>
//                               <i className="fas fa-user-shield me-2"></i>Change
//                               Role
//                             </Dropdown.Item>
//                             <Dropdown.Item>
//                               <i className="fas fa-key me-2"></i>Reset Password
//                             </Dropdown.Item>
//                             <Dropdown.Divider />
//                             <Dropdown.Item className="text-danger">
//                               <i className="fas fa-ban me-2"></i>Suspend Account
//                             </Dropdown.Item>
//                           </Dropdown.Menu>
//                         </Dropdown>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredUsers.length === 0 && (
//             <div className="empty-state">
//               <div className="empty-icon">
//                 <i className="fas fa-users"></i>
//               </div>
//               <h3>No Users Found</h3>
//               <p>Try adjusting your search or filter criteria</p>
//             </div>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Add User Modal */}
//       <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add New User</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Full Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter full name"
//                 value={newUser.name}
//                 onChange={(e) =>
//                   setNewUser({ ...newUser, name: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Email Address</Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter email address"
//                 value={newUser.email}
//                 onChange={(e) =>
//                   setNewUser({ ...newUser, email: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Role</Form.Label>
//               <Form.Select
//                 value={newUser.role}
//                 onChange={(e) =>
//                   setNewUser({ ...newUser, role: e.target.value })
//                 }
//               >
//                 <option value="Customer">Customer</option>
//                 <option value="Vendor">Vendor</option>
//                 <option value="Manager">Manager</option>
//                 <option value="Admin">Admin</option>
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Status</Form.Label>
//               <Form.Select
//                 value={newUser.status}
//                 onChange={(e) =>
//                   setNewUser({ ...newUser, status: e.target.value })
//                 }
//               >
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//                 <option value="Suspended">Suspended</option>
//               </Form.Select>
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowAddModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleAddUser}>
//             Add User
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Edit User Modal */}
//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit User</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {currentUser && (
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Full Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter full name"
//                   value={currentUser.name}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, name: e.target.value })
//                   }
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Email Address</Form.Label>
//                 <Form.Control
//                   type="email"
//                   placeholder="Enter email address"
//                   value={currentUser.email}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, email: e.target.value })
//                   }
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Role</Form.Label>
//                 <Form.Select
//                   value={currentUser.role}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, role: e.target.value })
//                   }
//                 >
//                   <option value="Customer">Customer</option>
//                   <option value="Vendor">Vendor</option>
//                   <option value="Manager">Manager</option>
//                   <option value="Admin">Admin</option>
//                 </Form.Select>
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Status</Form.Label>
//                 <Form.Select
//                   value={currentUser.status}
//                   onChange={(e) =>
//                     setCurrentUser({ ...currentUser, status: e.target.value })
//                   }
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                   <option value="Suspended">Suspended</option>
//                 </Form.Select>
//               </Form.Group>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEditModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleEditUser}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <style jsx>{`
//         /* User Management Styles */
//         .user-management-container {
//           padding: 24px;
//           background-color: #f9fafb;
//           min-height: calc(100vh - 61px);
//         }

//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//         }

//         .page-title {
//           font-size: 1.75rem;
//           font-weight: 700;
//           color: #111827;
//           margin-bottom: 8px;
//         }

//         .page-subtitle {
//           color: #6b7280;
//           margin-bottom: 0;
//         }

//         .add-user-btn {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background-color: #6366f1;
//           border-color: #6366f1;
//         }

//         .add-user-btn:hover {
//           background-color: #4f46e5;
//           border-color: #4f46e5;
//         }

//         /* Filter Card */
//         .filter-card {
//           border: none;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           margin-bottom: 24px;
//         }

//         .search-input-wrapper {
//           position: relative;
//         }

//         .search-icon {
//           position: absolute;
//           left: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//         }

//         .search-input {
//           padding-left: 36px;
//         }

//         .filter-group {
//           min-width: 150px;
//         }

//         .filter-label {
//           font-size: 0.75rem;
//           font-weight: 600;
//           color: #6b7280;
//           margin-bottom: 4px;
//         }

//         .filter-reset-btn {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         /* Users Card */
//         .users-card {
//           border: none;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//         }

//         .table th {
//           font-weight: 500;
//           color: #6b7280;
//           border-bottom-width: 1px;
//           font-size: 0.875rem;
//         }

//         .table td {
//           padding: 12px 16px;
//           vertical-align: middle;
//           color: #111827;
//           border-color: #f3f4f6;
//         }

//         .user-avatar-table {
//           width: 40px;
//           height: 40px;
//           border-radius: 50%;
//           overflow: hidden;
//           background-color: #f3f4f6;
//         }

//         .user-avatar-table img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .user-name-table {
//           font-size: 0.875rem;
//           font-weight: 600;
//           color: #111827;
//         }

//         .user-email-table {
//           font-size: 0.75rem;
//           color: #6b7280;
//         }

//         .badge {
//           font-weight: 500;
//           padding: 0.35em 0.65em;
//           font-size: 0.75em;
//         }

//         .bg-primary-subtle {
//           background-color: rgba(99, 102, 241, 0.1);
//         }

//         .bg-success-subtle {
//           background-color: rgba(16, 185, 129, 0.1);
//         }

//         .bg-warning-subtle {
//           background-color: rgba(245, 158, 11, 0.1);
//         }

//         .bg-danger-subtle {
//           background-color: rgba(239, 68, 68, 0.1);
//         }

//         .bg-info-subtle {
//           background-color: rgba(59, 130, 246, 0.1);
//         }

//         .bg-secondary-subtle {
//           background-color: rgba(107, 114, 128, 0.1);
//         }

//         .text-primary {
//           color: #6366f1 !important;
//         }

//         .text-success {
//           color: #10b981 !important;
//         }

//         .text-warning {
//           color: #f59e0b !important;
//         }

//         .text-danger {
//           color: #ef4444 !important;
//         }

//         .text-info {
//           color: #3b82f6 !important;
//         }

//         .text-secondary {
//           color: #6b7280 !important;
//         }

//         .btn-icon {
//           width: 32px;
//           height: 32px;
//           padding: 0;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 8px;
//           background-color: #f9fafb;
//           color: #6b7280;
//           border: 1px solid #e5e7eb;
//         }

//         .btn-danger-light {
//           background-color: rgba(239, 68, 68, 0.1);
//           color: #ef4444;
//           border-color: transparent;
//         }

//         .btn-danger-light:hover {
//           background-color: rgba(239, 68, 68, 0.2);
//           color: #ef4444;
//         }

//         /* Empty State */
//         .empty-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 48px 0;
//           text-align: center;
//         }

//         .empty-icon {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background-color: #f3f4f6;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 24px;
//           color: #6b7280;
//           margin-bottom: 16px;
//         }

//         .empty-state h3 {
//           font-size: 1.125rem;
//           font-weight: 600;
//           color: #111827;
//           margin-bottom: 8px;
//         }

//         .empty-state p {
//           font-size: 0.875rem;
//           color: #6b7280;
//           margin-bottom: 0;
//         }

//         /* Responsive Adjustments */
//         @media (max-width: 992px) {
//           .page-header {
//             flex-direction: column;
//             align-items: flex-start;
//             gap: 16px;
//           }

//           .add-user-btn {
//             width: 100%;
//             justify-content: center;
//           }
//         }

//         @media (max-width: 768px) {
//           .user-management-container {
//             padding: 16px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default UserManagement;
