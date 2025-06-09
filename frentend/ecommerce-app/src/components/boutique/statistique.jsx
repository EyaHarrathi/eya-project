import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = [
  "#4361ee",
  "#4f46e5",
  "#f72585",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metric: {
    width: "30%",
    padding: 10,
    border: "1 solid black",
    borderRadius: 5,
  },
  table: {
    border: "1 solid black",
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid black",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 8,
    flex: 1,
    borderRight: "1 solid black",
  },
  lastCell: {
    borderRight: "0",
  },
});

const DashboardPDF = ({
  stats,
  salesData,
  topProductsData,
  recentOrders,
  timeRange,
  boutiqueId,
}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.header}>
        Tableau de Bord - Boutique #{boutiqueId}
      </Text>
      <Text style={{ marginBottom: 20, textAlign: "center" }}>
        Période: {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
      </Text>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Métriques Clés</Text>
        <View style={pdfStyles.metricRow}>
          <View style={pdfStyles.metric}>
            <Text>Chiffre d'Affaires</Text>
            <Text>
              {stats.totalCA} DT ({stats.totalCATrend}%)
            </Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Commandes Totales</Text>
            <Text>
              {stats.totalOrders} ({stats.totalOrdersTrend}%)
            </Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Panier Moyen</Text>
            <Text>
              {stats.averageCart} DT ({stats.averageCartTrend}%)
            </Text>
          </View>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>
          Évolution du Chiffre d'Affaires
        </Text>
        {salesData.map((item, index) => (
          <Text key={index}>
            {item.mois}: {item.valeur} DT
          </Text>
        ))}
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Produits Populaires</Text>
        {topProductsData.map((item, index) => (
          <Text key={index}>
            {item.nom}: {item.valeur} DT
          </Text>
        ))}
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Commandes Récentes</Text>
        <View style={pdfStyles.table}>
          <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
            <Text style={pdfStyles.tableCell}>N° Commande</Text>
            <Text style={pdfStyles.tableCell}>Client</Text>
            <Text style={pdfStyles.tableCell}>Produits</Text>
            <Text style={pdfStyles.tableCell}>Date</Text>
            <Text style={pdfStyles.tableCell}>Montant</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>
              Statut
            </Text>
          </View>
          {recentOrders.map((order) => (
            <View key={order.id} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableCell}>{order.id}</Text>
              <Text style={pdfStyles.tableCell}>{order.client}</Text>
              <Text style={pdfStyles.tableCell}>{order.produits}</Text>
              <Text style={pdfStyles.tableCell}>{order.date}</Text>
              <Text style={pdfStyles.tableCell}>{order.montant}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>
                {order.statut.charAt(0).toUpperCase() + order.statut.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

const formatMonth = (mois) => {
  const months = {
    janvier: "Jan",
    février: "Fév",
    mars: "Mar",
    avril: "Avr",
    mai: "Mai",
    juin: "Juin",
    juillet: "Juil",
    août: "Août",
    septembre: "Sep",
    octobre: "Oct",
    novembre: "Nov",
    décembre: "Déc",
  };
  return months[mois.toLowerCase()] || mois;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Dashboard() {
  const { boutiqueId } = useParams();
  const [timeRange] = useState("mensuel"); // Fixed to 'mensuel'
  const [salesData, setSalesData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalCA: 0,
    totalOrders: 0,
    averageCart: 0,
    totalCATrend: 0,
    totalOrdersTrend: 0,
    averageCartTrend: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use only the monthly endpoint
        const caResponse = await fetch(
          `http://localhost:8080/api/boutiques/${boutiqueId}/chiffre-affaires-par-mois`
        );
        if (!caResponse.ok) {
          throw new Error(
            `Erreur ${caResponse.status} sur /chiffre-affaires-par-mois: ${caResponse.statusText}`
          );
        }
        const caData = await caResponse.json();
        const formattedCaData = caData.map((item) => ({
          mois: formatMonth(item.mois),
          valeur: item.valeur,
        }));

        const totalCA = caData.reduce((sum, item) => sum + item.valeur, 0);

        let ordersResponse = await fetch(
          `http://localhost:8080/api/boutiques/${boutiqueId}/order`
        );
        if (!ordersResponse.ok) {
          // Fallback to singular /boutique/ if /boutiques/ fails
          ordersResponse = await fetch(
            `http://localhost:8080/api/boutique/${boutiqueId}/order`
          );
          if (!ordersResponse.ok) {
            throw new Error(
              `Erreur ${ordersResponse.status} sur /commandes: ${ordersResponse.statusText}`
            );
          }
        }
        const ordersData = await ordersResponse.json();
        const totalOrders = ordersData.length;
        const averageCart = totalOrders > 0 ? totalCA / totalOrders : 0;

        let totalCATrend = 0;
        let totalOrdersTrend = 0;
        let averageCartTrend = 0;

        if (caData.length >= 2) {
          const dernierMois = caData[caData.length - 1].valeur;
          const avantDernierMois = caData[caData.length - 2].valeur;
          totalCATrend =
            avantDernierMois > 0
              ? (
                  ((dernierMois - avantDernierMois) / avantDernierMois) *
                  100
                ).toFixed(1)
              : 0;

          const totalOrdersPrecedent = totalOrders * 0.9;
          totalOrdersTrend =
            totalOrdersPrecedent > 0
              ? (
                  ((totalOrders - totalOrdersPrecedent) /
                    totalOrdersPrecedent) *
                  100
                ).toFixed(1)
              : 0;

          const averageCartPrecedent =
            totalOrdersPrecedent > 0
              ? avantDernierMois / totalOrdersPrecedent
              : 0;
          averageCartTrend =
            averageCartPrecedent > 0
              ? (
                  ((averageCart - averageCartPrecedent) /
                    averageCartPrecedent) *
                  100
                ).toFixed(1)
              : 0;
        }

        let topResponse = await fetch(
          `http://localhost:8080/api/boutiques/${boutiqueId}/top-produits`
        );
        if (!topResponse.ok) {
          // Fallback to singular /boutique/ if /boutiques/ fails
          topResponse = await fetch(
            `http://localhost:8080/api/boutique/${boutiqueId}/top-produits`
          );
          if (!topResponse.ok) {
            throw new Error(
              `Erreur ${topResponse.status} sur /top-produits: ${topResponse.statusText}`
            );
          }
        }
        const topData = await topResponse.json();

        setSalesData(formattedCaData);
        setTopProductsData(topData);
        setRecentOrders(
          ordersData.map((order) => ({
            ...order,
            date: formatDate(order.date),
            montant:
              parseFloat(order.montant.replace(",", ".")).toFixed(2) + " DT",
          }))
        );
        setStats({
          totalCA: totalCA.toFixed(2),
          totalOrders,
          averageCart: averageCart.toFixed(2),
          totalCATrend,
          totalOrdersTrend,
          averageCartTrend,
        });
      } catch (error) {
        console.error("Erreur de récupération des données:", error.message);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [boutiqueId]);

  const StatCard = ({ title, value, trend, icon, color }) => {
    const isPositive = trend >= 0;
    const trendClass = isPositive ? "text-success" : "text-danger";
    const iconClass = `bg-${color} bg-opacity-10 text-${color}`;

    return (
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className={`rounded-circle p-3 ${iconClass}`}>{icon}</div>
            <div className={`d-flex align-items-center ${trendClass}`}>
              {isPositive ? (
                <ArrowUpRight size={16} className="me-1" />
              ) : (
                <ArrowDownRight size={16} className="me-1" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          </div>
          <h4 className="fw-bold mb-1">{value}</h4>
          <p className="text-muted mb-0">{title}</p>
        </Card.Body>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Container fluid className="p-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erreur de chargement des données</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Vérifiez que le serveur est en cours d'exécution et que les
            endpoints API sont corrects.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h3 className="fw-bold mb-0">Tableau de Bord - Boutique</h3>
        <div className="d-flex align-items-center gap-2">
          <div className="bg-light rounded-3 p-2">
            <span className="btn btn-white shadow-sm disabled">Mensuel</span>
          </div>
          <PDFDownloadLink
            document={
              <DashboardPDF
                stats={stats}
                salesData={salesData}
                topProductsData={topProductsData}
                recentOrders={recentOrders}
                timeRange={timeRange}
                boutiqueId={boutiqueId}
              />
            }
            fileName={`dashboard-boutique-${boutiqueId}-${timeRange}.pdf`}
            className="btn btn-success"
          >
            {({ loading }) => (loading ? "Génération..." : "Exporter en PDF")}
          </PDFDownloadLink>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xl={4} lg={6} md={6} xs={12}>
          <StatCard
            title="Chiffre d'Affaires"
            value={`${stats.totalCA} DT`}
            trend={stats.totalCATrend}
            icon={<DollarSign size={22} />}
            color="primary"
          />
        </Col>
        <Col xl={4} lg={6} md={6} xs={12}>
          <StatCard
            title="Commandes Totales"
            value={stats.totalOrders}
            trend={stats.totalOrdersTrend}
            icon={<ShoppingBag size={22} />}
            color="info"
          />
        </Col>
        <Col xl={4} lg={6} md={6} xs={12}>
          <StatCard
            title="Panier Moyen"
            value={`${stats.averageCart} DT`}
            trend={stats.averageCartTrend}
            icon={<Star size={22} />}
            color="warning"
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={8} md={12}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Évolution du Chiffre d'Affaires</h5>
              <TrendingUp size={20} className="text-primary" />
            </Card.Header>
            <Card.Body>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4361ee"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4361ee"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mois" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value) => [`${value} DT`, "Valeur"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="valeur"
                      stroke="#4361ee"
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={12}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0">Produits Populaires</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <div style={{ height: 300, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart
                    margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
                  >
                    <Pie
                      data={topProductsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius="80%"
                      dataKey="valeur"
                      nameKey="nom"
                    >
                      {topProductsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name, props) => [
                        `${value} DT`,
                        props.payload.nom,
                      ]}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: 10 }}
                      formatter={(value) =>
                        value.length > 20
                          ? `${value.substring(0, 20)}...`
                          : value
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Commandes Récentes</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>N° Commande</th>
                      <th>Client</th>
                      <th>Produits</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.client}</td>
                        <td>{order.produits}</td>
                        <td>{order.date}</td>
                        <td>{order.montant}</td>
                        <td>
                          <span
                            className={`badge ${
                              order.statut === "livree"
                                ? "bg-success"
                                : order.statut === "en cours"
                                ? "bg-warning"
                                : "bg-info"
                            } bg-opacity-10 text-${
                              order.statut === "livree"
                                ? "success"
                                : order.statut === "en cours"
                                ? "bg-warning"
                                : "info"
                            }`}
                          >
                            {order.statut.charAt(0).toUpperCase() +
                              order.statut.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
