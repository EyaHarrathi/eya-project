import React, { useState, useEffect } from 'react';
import { Row, Col, Pagination } from 'react-bootstrap';
import { Mail, Phone, MapPin, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useParams } from 'react-router-dom';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#5fa1e2', '#b3a5e2', '#ff9076', '#4caf50', '#f9c74f', '#ef476f', '#06d6a0', '#118ab2'];

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, marginBottom: 10, fontWeight: 'bold' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metric: { width: '23%', padding: 10, border: '1 solid black', borderRadius: 5 },
  table: { border: '1 solid black', borderRadius: 5 },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid black' },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  tableCell: { padding: 8, flex: 1, borderRight: '1 solid black' },
  lastCell: { borderRight: '0' },
});

const ClientsPDF = ({ customers, metrics, clientTypeData, locationData, statusData, boutiqueId }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.header}>Tableau de Bord Clients - Boutique #{boutiqueId || 'N/A'}</Text>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Métriques Clés</Text>
        <View style={pdfStyles.metricRow}>
          <View style={pdfStyles.metric}><Text>Clients Totaux</Text><Text>{metrics?.totalClients || 0}</Text></View>
          <View style={pdfStyles.metric}><Text>Clients Premium</Text><Text>{metrics?.premiumClients || 0}</Text></View>
          <View style={pdfStyles.metric}><Text>Clients Standard</Text><Text>{metrics?.standardClients || 0}</Text></View>
          <View style={pdfStyles.metric}><Text>Pays Principal</Text><Text>{metrics?.topCountry?.country || 'Aucun'} ({metrics?.topCountry?.count || 0})</Text></View>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Clients</Text>
        <View style={pdfStyles.table}>
          <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
            <Text style={pdfStyles.tableCell}>Client</Text>
            <Text style={pdfStyles.tableCell}>Contact</Text>
            <Text style={pdfStyles.tableCell}>Statut</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>Type</Text>
          </View>
          {customers?.length > 0 ? customers.map((customer) => (
            <View key={customer.id || Math.random()} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableCell}>{customer.name || '-'}{customer.location ? `, ${customer.location}` : ''}</Text>
              <Text style={pdfStyles.tableCell}>{customer.email || '-'}{customer.phone ? `, ${customer.phone}` : ''}</Text>
              <Text style={pdfStyles.tableCell}>{customer.status || 'Inactif'}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>{customer.isPremium ? 'Premium' : 'Standard'}</Text>
            </View>
          )) : (
            <View style={pdfStyles.tableRow}><Text style={pdfStyles.tableCell}>Aucun client</Text></View>
          )}
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Répartition Premium vs Standard</Text>
        {clientTypeData?.length > 0 ? clientTypeData.map((item, index) => (
          <Text key={index}>{item.name}: {item.value || 0} clients</Text>
        )) : <Text>Aucune donnée</Text>}
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Répartition par Pays</Text>
        {locationData?.length > 0 ? locationData.map((item, index) => (
          <Text key={index}>{item.name}: {item.value || 0} clients</Text>
        )) : <Text>Aucune donnée</Text>}
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Statut des Clients</Text>
        {statusData?.length > 0 ? statusData.map((item, index) => (
          <Text key={index}>{item.name}: {item.value || 0} clients</Text>
        )) : <Text>Aucune donnée</Text>}
      </View>
    </Page>
  </Document>
);

const PDFDownloadComponent = ({ customers, metrics, clientTypeData, locationData, statusData, boutiqueId, useJsPDF = false }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || useJsPDF) {
    const generateJsPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Tableau de Bord Clients - Boutique #${boutiqueId || 'N/A'}`, 20, 20);
      doc.setFontSize(14);
      doc.text('Métriques Clés', 20, 40);
      doc.setFontSize(12);
      doc.text(`Clients Totaux: ${metrics?.totalClients || 0}`, 20, 50);
      doc.text(`Clients Premium: ${metrics?.premiumClients || 0}`, 20, 60);
      doc.text(`Clients Standard: ${metrics?.standardClients || 0}`, 20, 70);
      doc.text(`Pays Principal: ${metrics?.topCountry?.country || 'Aucun'} (${metrics?.topCountry?.count || 0})`, 20, 80);

      if (customers?.length > 0) {
        doc.text('Clients', 20, 100);
        doc.autoTable({
          startY: 110,
          head: [['Client', 'Contact', 'Statut', 'Type']],
          body: customers.map(c => [
            `${c.name || '-'}${c.location ? `, ${c.location}` : ''}`,
            `${c.email || '-'}${c.phone ? `, ${c.phone}` : ''}`,
            c.status || 'Inactif',
            c.isPremium ? 'Premium' : 'Standard'
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [240, 240, 240], textColor: 0 },
        });
      }

      if (clientTypeData?.length > 0) {
        doc.text('Répartition Premium vs Standard', 20, doc.lastAutoTable.finalY + 20);
        clientTypeData.forEach((item, index) => {
          doc.text(`${item.name}: ${item.value || 0} clients`, 20, doc.lastAutoTable.finalY + 30 + index * 10);
        });
      }

      if (locationData?.length > 0) {
        doc.text('Répartition par Pays', 20, doc.lastAutoTable.finalY + 50);
        locationData.forEach((item, index) => {
          doc.text(`${item.name}: ${item.value || 0} clients`, 20, doc.lastAutoTable.finalY + 60 + index * 10);
        });
      }

      if (statusData?.length > 0) {
        doc.text('Statut des Clients', 20, doc.lastAutoTable.finalY + 90);
        statusData.forEach((item, index) => {
          doc.text(`${item.name}: ${item.value || 0} clients`, 20, doc.lastAutoTable.finalY + 100 + index * 10);
        });
      }

      doc.save(`clients-boutique-${boutiqueId || 'unknown'}.pdf`);
    };

    return (
      <button
        onClick={generateJsPDF}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Exporter en PDF
      </button>
    );
  }

  try {
    return (
      <PDFDownloadLink
        document={
          <ClientsPDF
            customers={customers}
            metrics={metrics}
            clientTypeData={clientTypeData}
            locationData={locationData}
            statusData={statusData}
            boutiqueId={boutiqueId}
          />
        }
        fileName={`clients-boutique-${boutiqueId || 'unknown'}.pdf`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '500'
        }}
      >
        {({ loading }) => (loading ? 'Génération...' : <span>Exporter en PDF</span>)}
      </PDFDownloadLink>
    );
  } catch (error) {
    console.error('PDFDownloadLink error:', error);
    setHasError(true);
    return null;
  }
};

const styles = {
  container: { padding: '24px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f8f9fa' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  metricCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer', height: '100%' },
  metricCardHover: { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' },
  customerTable: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  customerAvatar: { width: '38px', height: '38px', backgroundColor: '#ebf8ff', color: '#4361ee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' },
  demographicsCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '16px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', color: '#2d3748', fontWeight: '600' },
  legendContainer: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' },
  legendItem: { display: 'flex', alignItems: 'center', margin: '0 8px 8px 0' },
  legendColor: { width: '12px', height: '12px', borderRadius: '3px', marginRight: '6px' },
  legendText: { fontSize: '13px', color: '#4a5568' },
  emptyState: { backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  emptyStateIcon: { color: '#4361ee', backgroundColor: '#ebf8ff', borderRadius: '50%', padding: '16px' },
  emptyStateText: { color: '#2d3748', fontSize: '18px', fontWeight: '500', margin: 0 },
  emptyStateSubText: { color: '#718096', fontSize: '14px', margin: 0 }
};

function App() {
  const { boutiqueId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!boutiqueId) {
        setError('Boutique ID is missing');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/boutique/${boutiqueId}/clients`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}: Failed to fetch customers data`);
        const data = await response.json();
        const mappedData = Array.isArray(data)
          ? data.map(customer => ({
              id: customer.id || '',
              name: customer.name || '',
              email: customer.email || '',
              location: customer.location || '',
              phone: customer.phone || '',
              orders: customer.orders || 0,
              spent: customer.spent || 0,
              lastOrder: customer.lastOrder || '',
              status: customer.status || 'Inactif',
              isPremium: customer.premium || false
            }))
          : [];
        setCustomersData(mappedData);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setCustomersData([]);
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [boutiqueId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCountryWithMostClients = () => {
    const countries = {};
    customersData.forEach(customer => {
      const country = customer.location.split(', ')[1] || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;
    });
    let maxCount = 0, maxCountry = 'None';
    for (const [country, count] of Object.entries(countries)) {
      if (count > maxCount) {
        maxCount = count;
        maxCountry = country;
      }
    }
    return { country: maxCountry, count: maxCount };
  };

  const clientTypeData = [
    { name: 'Premium', value: customersData.filter(c => c.isPremium).length },
    { name: 'Standard', value: customersData.filter(c => !c.isPremium).length }
  ];

  const getLocationData = () => {
    const countries = {};
    customersData.forEach(customer => {
      const country = customer.location.split(', ')[1] || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;
    });
    return Object.entries(countries).map(([name, value]) => ({ name, value }));
  };

  const statusData = [
    { name: 'Actif', value: customersData.filter(c => c.status === 'Actif').length },
    { name: 'Inactif', value: customersData.filter(c => c.status === 'Inactif').length }
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = customersData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(customersData.length / itemsPerPage);

  const getStatusStyle = (status) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    backgroundColor: status === 'Actif' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(239, 71, 111, 0.15)',
    color: status === 'Actif' ? '#48bb78' : '#f56565'
  });

  const getPremiumStyle = (isPremium) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    backgroundColor: isPremium ? 'rgba(79, 70, 229, 0.15)' : 'rgba(156, 163, 175, 0.15)',
    color: isPremium ? '#4f46e5' : '#6b7280'
  });

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const metrics = {
    totalClients: customersData.length,
    premiumClients: customersData.filter(c => c.isPremium).length,
    standardClients: customersData.filter(c => !c.isPremium).length,
    topCountry: getCountryWithMostClients()
  };

  if (loading) return <div style={styles.container}>Chargement...</div>;

  if (error) return (
    <div style={styles.container}>
      <div style={{ ...styles.pageHeader, flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
        <h3 style={{ margin: 0, color: '#2d3748', fontSize: '26px', fontWeight: '600' }}>Tableau de Bord Clients</h3>
      </div>
      <div style={styles.emptyState}>
        <BarChart2 size={48} style={styles.emptyStateIcon} />
        <p style={styles.emptyStateText}>Erreur</p>
        <p style={styles.emptyStateSubText}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={{ ...styles.pageHeader, flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
        <h3 style={{ margin: 0, color: '#2d3748', fontSize: '26px', fontWeight: '600' }}>Tableau de Bord Clients</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <PDFDownloadComponent
            customers={customersData}
            metrics={metrics}
            clientTypeData={clientTypeData}
            locationData={getLocationData()}
            statusData={statusData}
            boutiqueId={boutiqueId}
            useJsPDF={false} // Set to true to force jsPDF
          />
        </div>
      </div>
      <Row>
        <Col lg={8} md={12}>
          <Row className="mb-3">
            {[
              { title: 'Clients Totaux', value: customersData.length, icon: '👥', color: '#4361ee' },
              { title: 'Clients Premium', value: customersData.filter(c => c.isPremium).length, icon: '⭐', color: '#4f46e5' },
              { title: 'Clients Standard', value: customersData.filter(c => !c.isPremium).length, icon: '🔹', color: '#6b7280' },
              { title: `Pays Principal: ${getCountryWithMostClients().country}`, value: getCountryWithMostClients().count, icon: '🌎', color: '#06d6a0' },
            ].map((metric, index) => (
              <Col key={index} md={6} sm={6} className="mb-3">
                <div
                  style={{ ...styles.metricCard, ...(hoveredMetric === index ? styles.metricCardHover : {}) }}
                  onMouseEnter={() => setHoveredMetric(index)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{metric.icon}</div>
                  <p style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>{metric.title}</p>
                  <p style={{ color: metric.color, fontSize: '28px', fontWeight: 700, margin: 0 }}>{metric.value}</p>
                </div>
              </Col>
            ))}
          </Row>
          <div style={styles.customerTable}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Client', 'Contact', 'Statut', 'Type'].map((header, index) => (
                      <th key={index} style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#718096', fontWeight: '600' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map(customer => (
                      <tr key={customer.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={styles.customerAvatar}>
                              {customer.name ? customer.name.split(' ').map(n => n[0]).join('') : '-'}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, margin: 0, fontSize: '15px' }}>{customer.name || '-'}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#718096', fontSize: '13px', marginTop: '4px' }}>
                                <MapPin size={12} />
                                <span>{customer.location || '-'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ color: '#4a5568', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <Mail size={14} />
                              <span>{customer.email || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={14} />
                              <span>{customer.phone || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={getStatusStyle(customer.status)}>{customer.status}</span>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={getPremiumStyle(customer.isPremium)}>{customer.isPremium ? 'Premium' : 'Standard'}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#718096' }}>Aucun client trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
          </div>
        </Col>
        <Col lg={4} md={12}>
          {clientTypeData.some(item => item.value > 0) ? (
            <div style={styles.demographicsCard}>
              <h5 style={styles.cardTitle}>Répartition Premium vs Standard</h5>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {clientTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} clients`, name]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>Aucune donnée pour Premium vs Standard</p>
            </div>
          )}
          {getLocationData().length > 0 ? (
            <div style={styles.demographicsCard}>
              <h5 style={styles.cardTitle}>Répartition par Pays</h5>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getLocationData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    >
                      {getLocationData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} clients`, name]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.legendContainer}>
                {getLocationData().map((entry, index) => (
                  <div key={index} style={styles.legendItem}>
                    <div style={{ ...styles.legendColor, backgroundColor: COLORS[index % COLORS.length] }} />
                    <span style={styles.legendText}>{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>Aucune donnée pour la répartition par pays</p>
            </div>
          )}
          {statusData.some(item => item.value > 0) ? (
            <div style={styles.demographicsCard}>
              <h5 style={styles.cardTitle}>Statut des Clients</h5>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                    >
                      <Cell fill="#48bb78" />
                      <Cell fill="#f56565" />
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} clients`, name]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>Aucune donnée pour le statut des clients</p>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default App;