import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Pagination } from 'react-bootstrap';
import { Search, AlertCircle, PackageOpen, Package, CheckCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const inventoryData = [
  { id: 1, name: 'Robe Florale d\'Été', sku: 'DRS-001', category: 'Robes', stock: 24, price: 89.99, status: 'En Stock' },
  { id: 2, name: 'Robe de Soirée Élégante', sku: 'DRS-002', category: 'Robes', stock: 12, price: 149.99, status: 'En Stock' },
  { id: 3, name: 'Jean Décontracté', sku: 'BTM-001', category: 'Pantalons', stock: 36, price: 59.99, status: 'En Stock' },
  { id: 4, name: 'Veste en Cuir', sku: 'JKT-001', category: 'Vestes', stock: 8, price: 199.99, status: 'En Stock' },
  { id: 5, name: 'Robe Bohème Longue', sku: 'DRS-003', category: 'Robes', stock: 5, price: 79.99, status: 'Stock Faible' },
  { id: 6, name: 'Foulard en Soie - Floral', sku: 'ACC-001', category: 'Accessoires', stock: 42, price: 29.99, status: 'En Stock' },
  { id: 7, name: 'T-Shirt en Coton - Blanc', sku: 'TOP-001', category: 'Hauts', stock: 50, price: 24.99, status: 'En Stock' },
  { id: 8, name: 'Manteau d\'Hiver en Laine', sku: 'JKT-002', category: 'Vestes', stock: 0, price: 249.99, status: 'Rupture de Stock' },
  { id: 9, name: 'Boucles d\'Oreilles en Argent', sku: 'ACC-002', category: 'Accessoires', stock: 18, price: 34.99, status: 'En Stock' },
  { id: 10, name: 'Chemise en Lin', sku: 'TOP-002', category: 'Hauts', stock: 3, price: 44.99, status: 'Stock Faible' },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [selectedStatus, setSelectedStatus] = useState('Tout');
  const [currentPage, setCurrentPage] = useState(1);
  const [animateStats, setAnimateStats] = useState(false);
  const itemsPerPage = 5;
  
  const categories = ['Tout', ...new Set(inventoryData.map(item => item.category))];
  const statuses = ['Tout', 'En Stock', 'Stock Faible', 'Rupture de Stock'];
  
  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tout' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Tout' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'En Stock': return 'bg-success bg-opacity-10 text-success';
      case 'Stock Faible': return 'bg-warning bg-opacity-10 text-warning';
      case 'Rupture de Stock': return 'bg-danger bg-opacity-10 text-danger';
      default: return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  return (
    <div className="min-vh-100 bg-light py-4">
      <Container fluid className="px-4">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Gestion des Stocks</h2>
          <p className="text-muted">Gérez efficacement votre inventaire de produits</p>
        </div>
        
        <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
          <Row>
            <Col lg={6} md={6} sm={12} className="mb-3 mb-md-0">
              <div className="position-relative">
                <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                <Form.Control
                  type="text"
                  placeholder="Rechercher par nom ou SKU"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5 form-control-lg"
                />
              </div>
            </Col>
            <Col lg={3} md={3} sm={6} className="mb-3 mb-md-0">
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select-lg"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={3} md={3} sm={6}>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select-lg"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </div>

        <Row className="mb-4">
          <Col lg={3} md={6} sm={6} className="mb-4">
            <div className="bg-white rounded-3 shadow-sm p-4 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                  <PackageOpen size={24} className="text-primary" />
                </div>
                <div>
                  <div className="text-muted small">Total Produits</div>
                  <div className="h4 mb-0 fw-bold">{inventoryData.length}</div>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6} sm={6} className="mb-4">
            <div className="bg-white rounded-3 shadow-sm p-4 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                  <AlertCircle size={24} className="text-warning" />
                </div>
                <div>
                  <div className="text-muted small">Stock Faible</div>
                  <div className="h4 mb-0 fw-bold">
                    {inventoryData.filter(item => item.status === 'Stock Faible').length}
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6} sm={6} className="mb-4">
            <div className="bg-white rounded-3 shadow-sm p-4 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-3 rounded-3 me-3">
                  <Package size={24} className="text-danger" />
                </div>
                <div>
                  <div className="text-muted small">Rupture de Stock</div>
                  <div className="h4 mb-0 fw-bold">
                    {inventoryData.filter(item => item.status === 'Rupture de Stock').length}
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6} sm={6} className="mb-4">
            <div className="bg-white rounded-3 shadow-sm p-4 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                  <CheckCircle size={24} className="text-success" />
                </div>
                <div>
                  <div className="text-muted small">Produits Disponibles</div>
                  <div className="h4 mb-0 fw-bold">
                    {inventoryData.filter(item => item.status === 'En Stock').length}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="bg-white rounded-3 shadow-sm p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="border-0 text-muted">Nom du Produit</th>
                  <th className="border-0 text-muted">SKU</th>
                  <th className="border-0 text-muted">Catégorie</th>
                  <th className="border-0 text-muted">Stock</th>
                  <th className="border-0 text-muted">Prix</th>
                  <th className="border-0 text-muted">Statut</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td>{item.stock}</td>
                    <td>{item.price.toFixed(2)} €</td>
                    <td>
                      <span className={`badge rounded-pill ${getStatusBadgeClass(item.status)} px-3 py-2`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
          
          <div className="text-center text-muted mt-3">
            <small>Affichage de {currentItems.length} sur {filteredInventory.length} produits</small>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;