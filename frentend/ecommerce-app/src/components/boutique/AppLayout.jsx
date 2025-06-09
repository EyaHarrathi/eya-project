import React, { useState, Suspense } from 'react';
import { Button, Nav, Collapse, Spinner } from 'react-bootstrap';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { 
  Package, ShoppingCart, ChevronRight, ChevronLeft, 
  Home, LogOut, ChevronDown, ChevronUp, 
  BarChart2, Users, Globe, Lightbulb
} from 'lucide-react';

// Define styles object
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#F8FAFC'
  },
  sidebar: (collapsed) => ({
    width: collapsed ? '64px' : '240px',
    background: 'linear-gradient(180deg, #4F46E5 0%, #3B82F6 100%)',
    color: '#FFFFFF',
    boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
    transition: 'width 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000
  }),
  header: (collapsed) => ({
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'space-between',
    height: '64px'
  }),
  headerTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#FFFFFF'
  },
  toggleButton: (collapsed) => ({
    padding: '0.25rem',
    color: '#FFFFFF',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    transition: 'background 0.2s',
    marginLeft: collapsed ? 0 : 'auto'
  }),
  toggleButtonHover: {
    background: 'rgba(255,255,255,0.1)'
  },
  nav: {
    flex: 1,
    padding: '0.75rem',
    overflowY: 'auto'
  },
  navLink: (isActive, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '0.75rem',
    margin: '0.25rem 0',
    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.9)',
    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontSize: '0.95rem',
    fontWeight: 500
  }),
  navLinkHover: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: 'scale(1.02)'
  },
  subNavLink: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    margin: '0.25rem 0',
    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.9)',
    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
    fontWeight: 500
  }),
  subNavLinkHover: {
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  submenu: {
    marginLeft: '1.75rem',
    borderLeft: '2px solid rgba(255,255,255,0.3)',
    paddingLeft: '0.75rem'
  },
  logoutButton: (collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: '#FECACA',
    background: 'none',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontSize: '0.95rem',
    fontWeight: 500
  }),
  logoutButtonHover: {
    background: 'rgba(255,255,255,0.1)',
    color: '#FCA5A5'
  },
  content: (collapsed) => ({
    flex: 1,
    marginLeft: collapsed ? '64px' : '240px',
    padding: '1.5rem',
    backgroundColor: '#F8FAFC',
    transition: 'margin-left 0.3s ease'
  }),
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  strategyButton: (collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: 'rgba(252, 211, 77, 0.15)',
    border: '1px solid rgba(252, 211, 77, 0.3)',
    color: '#FCD34D',
    padding: '0.75rem',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontSize: '0.95rem',
    fontWeight: 600,
    marginTop: '1rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
  }),
  strategyButtonHover: {
    background: 'rgba(252, 211, 77, 0.25)',
    transform: 'translateY(-2px)'
  }
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [dashboardSubmenuOpen, setDashboardSubmenuOpen] = useState(false);
  const [hoverStates, setHoverStates] = useState({ strategyButton: false });

  const navigate = useNavigate();
  const { boutiqueId } = useParams();

  // Redirect if boutiqueId is missing
  if (!boutiqueId) {
    console.log('Redirecting: boutiqueId is missing');
    navigate('/mesboutiques');
    return null;
  }

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (collapsed) setDashboardSubmenuOpen(false);
  };

  const toggleDashboardSubmenu = () => {
    setDashboardSubmenuOpen(!dashboardSubmenuOpen);
  };

  // Determine active tab based on URL
  const getActiveTab = () => {
    const path = window.location.pathname;
    console.log('Current path:', path); // Debugging
    if (path.includes('products')) return 'products';
    if (path.includes('orders')) return 'orders';
    if (path.includes('stats')) return 'stats';
    if (path.includes('clients')) return 'clients';
    if (path.includes('global-stats')) return 'global-stats';
    if (path.includes('weekly-strategy')) return 'weekly-strategy';
    return 'products';
  };

  const activeTab = getActiveTab();

  return (
    <div style={styles.container}>
      <div style={styles.sidebar(collapsed)}>
        <div style={styles.header(collapsed)}>
          {!collapsed && <h5 style={styles.headerTitle}>Espace Boutique</h5>}
          <Button 
            variant="link" 
            onClick={toggleSidebar}
            style={styles.toggleButton(collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        <Nav variant="pills" className="flex-column" style={styles.nav}>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'products'}
              onClick={() => navigate(`/boutique/${boutiqueId}/products`)}
              style={styles.navLink(activeTab === 'products', collapsed)}
              aria-current={activeTab === 'products' ? 'page' : undefined}
            >
              <Package size={20} />
              {!collapsed && <span style={{ marginLeft: '0.75rem' }}>Boutique</span>}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'orders'}
              onClick={() => navigate(`/boutique/${boutiqueId}/orders`)}
              style={styles.navLink(activeTab === 'orders', collapsed)}
              aria-current={activeTab === 'orders' ? 'page' : undefined}
            >
              <ShoppingCart size={20} />
              {!collapsed && <span style={{ marginLeft: '0.75rem' }}>Commandes</span>}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              onClick={toggleDashboardSubmenu}
              style={styles.navLink(dashboardSubmenuOpen, collapsed)}
              aria-expanded={dashboardSubmenuOpen}
              aria-controls="dashboard-submenu"
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Home size={20} />
                {!collapsed && <span style={{ marginLeft: '0.75rem' }}>Tableau de bord</span>}
              </div>
              {!collapsed && (dashboardSubmenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </Nav.Link>
            <Collapse in={dashboardSubmenuOpen && !collapsed}>
              <div id="dashboard-submenu" style={styles.submenu}>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'stats'}
                    onClick={() => navigate(`/boutique/${boutiqueId}/stats`)}
                    style={styles.subNavLink(activeTab === 'stats')}
                    aria-current={activeTab === 'stats' ? 'page' : undefined}
                  >
                    <BarChart2 size={18} />
                    <span style={{ marginLeft: '0.75rem' }}>Statistiques</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'clients'}
                    onClick={() => navigate(`/boutique/${boutiqueId}/clients`)}
                    style={styles.subNavLink(activeTab === 'clients')}
                    aria-current={activeTab === 'clients' ? 'page' : undefined}
                  >
                    <Users size={18} />
                    <span style={{ marginLeft: '0.75rem' }}>Clients</span>
                  </Nav.Link>
                </Nav.Item>
              </div>
            </Collapse>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'global-stats'}
              onClick={() => navigate(`/boutique/${boutiqueId}/global-stats`)}
              style={styles.navLink(activeTab === 'global-stats', collapsed)}
              aria-current={activeTab === 'global-stats' ? 'page' : undefined}
            >
              <Globe size={20} />
              {!collapsed && <span style={{ marginLeft: '0.75rem' }}>Statistiques Globales</span>}
            </Nav.Link>
          </Nav.Item>
          <div className="px-2 mt-auto mb-3">
            <Button
              variant="link"
              active={activeTab === 'weekly-strategy'}
              onClick={() => navigate(`/boutique/${boutiqueId}/weekly-strategy`)}
              style={{
                ...styles.strategyButton(collapsed),
                ...(hoverStates.strategyButton ? styles.strategyButtonHover : {})
              }}
              onMouseEnter={() => setHoverStates({ ...hoverStates, strategyButton: true })}
              onMouseLeave={() => setHoverStates({ ...hoverStates, strategyButton: false })}
              aria-current={activeTab === 'weekly-strategy' ? 'page' : undefined}
              className="position-relative"
            >
              <Lightbulb size={20} />
              {!collapsed && (
                <>
                  <span style={{ marginLeft: '0.75rem' }}>Voir la Stratégie de la Semaine</span>
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                    <span className="visually-hidden">New strategy</span>
                  </span>
                </>
              )}
              {collapsed && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">New strategy</span>
                </span>
              )}
            </Button>
          </div>
        </Nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Link
            to="/home"
            style={styles.logoutButton(collapsed)}
            aria-label="Quitter la boutique"
          >
            <LogOut size={20} />
            {!collapsed && <span style={{ marginLeft: '0.75rem' }}>Quitter</span>}
          </Link>
        </div>
      </div>

      <div style={styles.content(collapsed)}>
        <Suspense fallback={<div style={styles.spinnerContainer}><Spinner animation="border" variant="primary" /></div>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export default AppLayout;