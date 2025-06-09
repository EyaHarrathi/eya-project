// // // src/pages/CommandesPage.jsx
// // import React from 'react';
// // import LayoutWithSidebar from '../components/LayoutWithSidebar';

// // const CommandesPage = () => {
// //   return (
// //     <LayoutWithSidebar>
// //       <h2>Gestion des Commandes</h2>
// //       <p>Contenu de la page commandes à venir...</p>
// //     </LayoutWithSidebar>
// //   );
  
// // };

// export default CommandesPage;

// dashboard.js - Plain JavaScript version

// Mock data for icons (in a real app, you'd use actual icon libraries or SVGs)
const icons = {
  LayoutDashboard: '📊',
  Package: '📦',
  ShoppingCart: '🛒',
  TrendingUp: '📈',
  Clock: '⏱️',
  CheckCircle: '✅',
  XCircle: '❌',
  Loader2: '🔄',
  Filter: '🔎',
  Search: '🔍',
  ChevronDown: '⬇️',
  AlertCircle: '⚠️'
};

// Mock date-fns functionality
function formatDate(dateString, _formatStr) {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
}

// Order data structure
const mockOrders = [
  {
    id: '1',
    orderNumber: 'CMD-001',
    customerName: 'Jean Dupont',
    products: [
      { id: '1', name: 'Produit A', quantity: 2, price: 29.99 },
      { id: '2', name: 'Produit B', quantity: 1, price: 49.99 }
    ],
    totalAmount: 109.97,
    status: 'completed',
    createdAt: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    orderNumber: 'CMD-002',
    customerName: 'Marie Martin',
    products: [
      { id: '3', name: 'Produit C', quantity: 1, price: 79.99 }
    ],
    totalAmount: 79.99,
    status: 'pending',
    createdAt: '2024-03-16T14:20:00Z'
  }
];

// Dashboard implementation
class Dashboard {
  constructor() {
    this.orders = [];
    this.loading = true;
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.sortBy = 'date';
    this.stats = {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0
    };
    
    this.init();
  }
  
  init() {
    this.fetchOrders();
    this.render();
  }
  
  fetchOrders() {
    // Simulate API call
    setTimeout(() => {
      this.orders = mockOrders;
      this.calculateStats();
      this.loading = false;
      this.render();
    }, 1000);
  }
  
  calculateStats() {
    this.stats = {
      totalOrders: this.orders.length,
      totalRevenue: this.orders.reduce((sum, order) => sum + order.totalAmount, 0),
      pendingOrders: this.orders.filter(order => order.status === 'pending').length,
      completedOrders: this.orders.filter(order => order.status === 'completed').length
    };
  }
  
  getStatusColor(status) {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  }
  
  getStatusIcon(status) {
    switch (status) {
      case 'completed': return icons.CheckCircle;
      case 'pending': return icons.Clock;
      case 'cancelled': return icons.XCircle;
      default: return '';
    }
  }
  
  getFilteredOrders() {
    return this.orders
      .filter(order => {
        const matchesSearch = 
          order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (this.sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return b.totalAmount - a.totalAmount;
        }
      });
  }
  
  handleSearch(event) {
    this.searchTerm = event.target.value;
    this.render();
  }
  
  handleStatusFilter(event) {
    this.statusFilter = event.target.value;
    this.render();
  }
  
  handleSortBy(event) {
    this.sortBy = event.target.value;
    this.render();
  }
  
  render() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;
    
    if (this.loading) {
      appContainer.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner">${icons.Loader2}</div>
          <p>Chargement des commandes...</p>
        </div>
      `;
      return;
    }
    
    const filteredOrders = this.getFilteredOrders();
    
    appContainer.innerHTML = `
      <div class="dashboard-container">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="header-content">
            <span class="header-icon">${icons.LayoutDashboard}</span>
            <div>
              <h1>Tableau de bord</h1>
              <p>Gestion des commandes</p>
            </div>
          </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">${icons.ShoppingCart}</span>
            <div>
              <p>Total Commandes</p>
              <h2>${this.stats.totalOrders}</h2>
            </div>
          </div>
          
          <div class="stat-card">
            <span class="stat-icon">${icons.TrendingUp}</span>
            <div>
              <p>Chiffre d'affaires</p>
              <h2>${this.stats.totalRevenue.toFixed(2)}€</h2>
            </div>
          </div>
          
          <div class="stat-card">
            <span class="stat-icon">${icons.Clock}</span>
            <div>
              <p>En attente</p>
              <h2>${this.stats.pendingOrders}</h2>
            </div>
          </div>
          
          <div class="stat-card">
            <span class="stat-icon">${icons.CheckCircle}</span>
            <div>
              <p>Complétées</p>
              <h2>${this.stats.completedOrders}</h2>
            </div>
          </div>
        </div>
        
        <!-- Filters and Search -->
        <div class="filters-section">
          <div class="search-container">
            <span class="search-icon">${icons.Search}</span>
            <input 
              type="text" 
              placeholder="Rechercher une commande..." 
              value="${this.searchTerm}"
              oninput="dashboard.handleSearch(event)"
            />
          </div>
          
          <div class="filter-controls">
            <select 
              value="${this.statusFilter}"
              onchange="dashboard.handleStatusFilter(event)"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="completed">Complétée</option>
              <option value="cancelled">Annulée</option>
            </select>
            
            <select 
              value="${this.sortBy}"
              onchange="dashboard.handleSortBy(event)"
            >
              <option value="date">Trier par date</option>
              <option value="amount">Trier par montant</option>
            </select>
          </div>
        </div>
        
        <!-- Orders List -->
        ${this.renderOrdersList(filteredOrders)}
      </div>
    `;
  }
  
  renderOrdersList(filteredOrders) {
    if (this.orders.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-icon">${icons.Package}</span>
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore reçu de commandes</p>
        </div>
      `;
    }
    
    if (filteredOrders.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-icon">${icons.AlertCircle}</span>
          <h3>Aucun résultat</h3>
          <p>Aucune commande ne correspond à votre recherche</p>
        </div>
      `;
    }
    
    return `
      <div class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Produits</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(order => `
              <tr>
                <td>${order.orderNumber}</td>
                <td>${order.customerName}</td>
                <td>
                  ${order.products.map(product => `
                    <div>${product.quantity}x ${product.name}</div>
                  `).join('')}
                </td>
                <td>${order.totalAmount.toFixed(2)}€</td>
                <td>
                  <span class="status-badge ${this.getStatusColor(order.status)}">
                    ${this.getStatusIcon(order.status)}
                    ${order.status === 'completed' ? 'Complétée' : 
                      order.status === 'pending' ? 'En attente' : 
                      order.status === 'processing' ? 'En cours' : 
                      order.status === 'cancelled' ? 'Annulée' : ''}
                  </span>
                </td>
                <td>${formatDate(order.createdAt, 'dd MMM yyyy HH:mm')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Initialize the dashboard
const dashboard = new Dashboard();

// Make dashboard accessible globally for event handlers
window.dashboard = dashboard;