import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  List,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Couleurs pour les graphiques
const COLORS = [
  "#4338ca",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
];

// Styles pour le PDF (unchanged)
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
    width: "22%",
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

// Composant PDF (unchanged)
const StatisticsPDF = ({
  metrics,
  timeSeriesData,
  distributionData,
  recentData,
  timeRange,
}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.header}>Tableau de Bord des Statistiques</Text>
      <Text style={{ marginBottom: 20, textAlign: "center" }}>
        Période: {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
      </Text>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Métriques Clés</Text>
        <View style={pdfStyles.metricRow}>
          <View style={pdfStyles.metric}>
            <Text>Chiffre d'Affaires Total</Text>
            <Text>
              {metrics.totalValue} DT ({metrics.totalValueTrend}%)
            </Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Total des Transactions</Text>
            <Text>
              {metrics.totalCount} ({metrics.totalCountTrend}%)
            </Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Valeur Moyenne</Text>
            <Text>
              {metrics.averageValue} DT ({metrics.averageValueTrend}%)
            </Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Taux de Conversion</Text>
            <Text>
              {metrics.conversionRate}% ({metrics.conversionRateTrend}%)
            </Text>
          </View>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Tendances de Performance</Text>
        {timeSeriesData.map((item, index) => (
          <Text key={index}>
            {item.period}: {item.valeur} DT
          </Text>
        ))}
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Analyse de Distribution</Text>
        {distributionData.map((item, index) => (
          <Text key={index}>
            {item.nom}: {item.valeur} DT
          </Text>
        ))}
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Activités Récentes</Text>
        <View style={pdfStyles.table}>
          <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
            <Text style={pdfStyles.tableCell}>ID</Text>
            <Text style={pdfStyles.tableCell}>Nom</Text>
            <Text style={pdfStyles.tableCell}>Catégorie</Text>
            <Text style={pdfStyles.tableCell}>Date</Text>
            <Text style={pdfStyles.tableCell}>Valeur</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>
              Statut
            </Text>
          </View>
          {recentData.map((item) => (
            <View key={item.id} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.tableCell}>#{item.id}</Text>
              <Text style={pdfStyles.tableCell}>{item.nom}</Text>
              <Text style={pdfStyles.tableCell}>{item.categorie}</Text>
              <Text style={pdfStyles.tableCell}>{item.date}</Text>
              <Text style={pdfStyles.tableCell}>{item.valeur} DT</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>
                {item.statut.toLowerCase() === "livree"
                  ? "Livré"
                  : item.statut.toLowerCase() === "en cours"
                  ? "En Cours"
                  : "En Attente"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

// Fonctions utilitaires (unchanged)
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

const formatPeriod = (period) => {
  return period.charAt(0).toUpperCase() + period.slice(1, 3); // Format for monthly (e.g., "Jan")
};

function App() {
  const { boutiqueId } = useParams();
  const [timeRange] = useState("mensuel"); // Fixed to 'mensuel'
  const [selectedChart, setSelectedChart] = useState("histogramme");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [distributionData, setDistributionData] = useState([]); // Ensure initial state is an array
  const [recentData, setRecentData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalValue: 0,
    totalCount: 0,
    averageValue: 0,
    conversionRate: 0,
    totalValueTrend: 0,
    totalCountTrend: 0,
    averageValueTrend: 0,
    conversionRateTrend: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true; // Prevent state updates after unmount
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch time series data
        const timeSeriesUrl = `http://localhost:8080/api/boutiques/${boutiqueId}/chiffreaffairesparmois`;
        const timeSeriesResponse = await fetch(timeSeriesUrl);
        const timeSeriesRawData = await timeSeriesResponse.json();

        const formattedTimeSeriesData = timeSeriesRawData.map((item) => ({
          period: formatPeriod(item.mois),
          valeur: item.valeur,
          cible: item.valeur * 1.1,
        }));

        // Fetch distribution data
        const distributionResponse = await fetch(
          `http://localhost:8080/api/boutiques/topproduits/${boutiqueId}`
        );
        const distributionRawData = await distributionResponse.json();
        console.log("Distribution Data:", distributionRawData); // Debug API response

        // Ensure distributionData is an array and format it
        const formattedDistributionData = Array.isArray(distributionRawData)
          ? distributionRawData.map((item) => ({
              nom: item.nom || item.productName || "Produit Inconnu", // Adjust based on API response
              valeur: item.valeur || item.total || 0, // Adjust based on API response
            }))
          : [];

        // Fetch recent data
        const recentDataResponse = await fetch(
          `http://localhost:8080/api/boutiques/${boutiqueId}/commandes`
        );
        const recentRawData = await recentDataResponse.json();

        const formattedRecentData = recentRawData.map((item) => ({
          id: item.id,
          nom: item.client,
          categorie: item.produits,
          date: formatDate(item.date),
          valeur: parseFloat(item.montant.replace(",", ".")).toFixed(2),
          statut: item.statut,
        }));

        // Calculate metrics
        const totalValue = timeSeriesRawData.reduce(
          (sum, item) => sum + item.valeur,
          0
        );
        const totalCount = recentRawData.length;
        const averageValue = totalCount > 0 ? totalValue / totalCount : 0;

        const montants = recentRawData.map((item) =>
          parseFloat(item.montant.replace(",", "."))
        );
        const montantMoyen =
          montants.length > 0
            ? montants.reduce((sum, val) => sum + val, 0) / montants.length
            : 0;
        const commandesFortesValeur = montants.filter(
          (montant) => montant > montantMoyen
        ).length;
        const conversionRate =
          totalCount > 0
            ? ((commandesFortesValeur / totalCount) * 100).toFixed(1)
            : 0;

        let totalValueTrend = 0;
        let totalCountTrend = 0;
        let averageValueTrend = 0;
        let conversionRateTrend = 0;

        if (timeSeriesRawData.length >= 2) {
          const dernier =
            timeSeriesRawData[timeSeriesRawData.length - 1].valeur;
          const avantDernier =
            timeSeriesRawData[timeSeriesRawData.length - 2].valeur;
          totalValueTrend =
            avantDernier > 0
              ? (((dernier - avantDernier) / avantDernier) * 100).toFixed(1)
              : 0;

          const totalCountPrecedent = totalCount * 0.9;
          totalCountTrend =
            totalCountPrecedent > 0
              ? (
                  ((totalCount - totalCountPrecedent) / totalCountPrecedent) *
                  100
                ).toFixed(1)
              : 0;

          const averageValuePrecedent =
            totalCountPrecedent > 0 ? avantDernier / totalCountPrecedent : 0;
          averageValueTrend =
            averageValuePrecedent > 0
              ? (
                  ((averageValue - averageValuePrecedent) /
                    averageValuePrecedent) *
                  100
                ).toFixed(1)
              : 0;

          const commandesFortesValeurPrecedent = commandesFortesValeur * 0.9;
          const conversionRatePrecedent =
            totalCountPrecedent > 0
              ? (commandesFortesValeurPrecedent / totalCountPrecedent) * 100
              : 0;
          conversionRateTrend =
            conversionRatePrecedent > 0
              ? (
                  ((conversionRate - conversionRatePrecedent) /
                    conversionRatePrecedent) *
                  100
                ).toFixed(1)
              : 0;
        }

        if (mounted) {
          setTimeSeriesData(formattedTimeSeriesData);
          setDistributionData(formattedDistributionData);
          setRecentData(formattedRecentData);
          setMetrics({
            totalValue: totalValue.toFixed(2),
            totalCount,
            averageValue: averageValue.toFixed(2),
            conversionRate,
            totalValueTrend,
            totalCountTrend,
            averageValueTrend,
            conversionRateTrend,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        if (mounted) {
          setDistributionData([]); // Fallback to empty array on error
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      mounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [boutiqueId]);

  // Composant de carte de statistique (unchanged)
  const StatCard = ({ title, value, unit, trend, icon, colorClass }) => {
    const isPositive = trend >= 0;
    const trendClass = isPositive ? "text-success" : "text-danger";

    return (
      <div className="col">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className={`rounded-circle p-2 icon-bg-${colorClass}`}>
                {icon}
              </div>
              <div className={`d-flex align-items-center ${trendClass}`}>
                {isPositive ? (
                  <ArrowUpRight size={16} className="me-1" />
                ) : (
                  <ArrowDownRight size={16} className="me-1" />
                )}
                <span>{Math.abs(trend)}%</span>
              </div>
            </div>
            <h4 className="fw-bold mb-1">
              {value} {unit}
            </h4>
            <p className="text-muted mb-0">{title}</p>
          </div>
        </div>
      </div>
    );
  };

  // Composant de bascule des graphiques (unchanged)
  const ChartToggle = () => (
    <div className="btn-group bg-light rounded-3 p-1">
      <button
        className={`btn ${
          selectedChart === "histogramme" ? "btn-primary" : "btn-light"
        }`}
        onClick={() => setSelectedChart("histogramme")}
      >
        <BarChart3 size={16} className="me-1" />
        Histogramme
      </button>
      <button
        className={`btn ${
          selectedChart === "ligne" ? "btn-primary" : "btn-light"
        }`}
        onClick={() => setSelectedChart("ligne")}
      >
        <Activity size={16} className="me-1" />
        Ligne
      </button>
      <button
        className={`btn ${
          selectedChart === "radar" ? "btn-primary" : "btn-light"
        }`}
        onClick={() => setSelectedChart("radar")}
      >
        <PieChartIcon size={16} className="me-1" />
        Radar
      </button>
    </div>
  );

  // Sélecteur de période (unchanged)
  const TimeRangeSelector = () => (
    <div className="bg-light rounded-3 p-2">
      <span className="btn btn-primary disabled">Mensuel</span>
    </div>
  );

  // Graphique temporel basé sur le type sélectionné (unchanged)
  const renderTimeSeriesChart = () => {
    switch (selectedChart) {
      case "histogramme":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeSeriesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value} DT`, "Valeur"]}
              />
              <Legend />
              <Bar
                dataKey="valeur"
                name="Actuel"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "ligne":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeSeriesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value} DT`, "Valeur"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="valeur"
                name="Actuel"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="cible"
                name="Cible"
                stroke="#16a34a"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "radar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={timeSeriesData}
            >
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="period" stroke="#94a3b8" />
              <PolarRadiusAxis
                angle={30}
                domain={[0, "auto"]}
                stroke="#94a3b8"
              />
              <Radar
                name="Actuel"
                dataKey="valeur"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value} DT`, "Valeur"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Graphique de distribution (updated with fallback)
  const renderDistributionChart = () => {
    if (!Array.isArray(distributionData) || distributionData.length === 0) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100%" }}
        >
          <p className="text-muted">
            Aucune donnée disponible pour la distribution
          </p>
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            dataKey="valeur"
            nameKey="nom"
            label={({ nom, percent }) =>
              `${nom.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`
            }
          >
            {distributionData.map((entry, index) => (
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
            formatter={(value, name, props) => [`${value}`, props.payload.nom]}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 statistics-dashboard">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      />
      <style>
        {`
          .statistics-dashboard {
            --bs-primary: #6366f1;
            --bs-primary-rgb: 99, 102, 241;
            --bs-secondary: #8b5cf6;
            --bs-success: #10b981;
            --bs-info: #0ea5e9;
            --bs-warning: #f59e0b;
            --bs-danger: #ef4444;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .statistics-dashboard .btn-primary {
            background-color: var(--bs-primary);
            border-color: var(--bs-primary);
          }
          .statistics-dashboard .btn-primary:hover {
            background-color: #4f46e5;
            border-color: #4f46e5;
          }
          .statistics-dashboard .btn-export-pdf {
            background-color: #16a34a;
            border-color: #16a34a;
            color: white;
          }
          .statistics-dashboard .btn-export-pdf:hover {
            background-color: #13893b;
            border-color: #13893b;
          }
          .statistics-dashboard .card {
            border: none;
            border-radius: 12px;
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .statistics-dashboard .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
          }
          .statistics-dashboard .icon-bg-primary {
            background-color: rgba(var(--bs-primary-rgb), 0.1);
            color: var(--bs-primary);
          }
          .statistics-dashboard .icon-bg-info {
            background-color: rgba(14, 165, 233, 0.1);
            color: var(--bs-info);
          }
          .statistics-dashboard .icon-bg-warning {
            background-color: rgba(245, 158, 11, 0.1);
            color: var(--bs-warning);
          }
          .statistics-dashboard .icon-bg-success {
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--bs-success);
          }
          .statistics-dashboard .metric-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
          }
          .statistics-dashboard .metric-icon.primary {
            color: var(--bs-primary);
          }
          .statistics-dashboard .metric-icon.info {
            color: var(--bs-info);
          }
          .statistics-dashboard .metric-icon.warning {
            color: var(--bs-warning);
          }
          .statistics-dashboard .metric-icon.success {
            color: var(--bs-success);
          }
          .statistics-dashboard .table {
            color: #334155;
          }
          .statistics-dashboard .table-light {
            background-color: #f8fafc;
          }
          .statistics-dashboard .table > :not(caption) > * > * {
            padding: 1rem 0.75rem;
          }
          .statistics-dashboard .badge {
            padding: 0.35em 0.65em;
            font-weight: 500;
          }
          .statistics-dashboard .card-header {
            background-color: transparent;
            padding: 1.25rem 1.5rem;
          }
          @media (max-width: 767.98px) {
            .statistics-dashboard .card-header {
              padding: 1rem;
            }
            .statistics-dashboard .card-body {
              padding: 1rem;
            }
            .statistics-dashboard [class*="col-"] {
              margin-bottom: 1rem;
            }
          }
        `}
      </style>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h3 className="fw-bold mb-0">Tableau de Bord des Statistiques</h3>
          <p className="text-muted">Aperçu des métriques de performance clés</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <TimeRangeSelector />
          <PDFDownloadLink
            document={
              <StatisticsPDF
                metrics={metrics}
                timeSeriesData={timeSeriesData}
                distributionData={distributionData}
                recentData={recentData}
                timeRange={timeRange}
              />
            }
            fileName={`statistiques-${timeRange}-${boutiqueId}.pdf`}
            className="btn btn-export-pdf"
          >
            {({ loading }) => (loading ? "Génération..." : "Exporter en PDF")}
          </PDFDownloadLink>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 mb-4">
        <StatCard
          title="Chiffre d'Affaires Total"
          value={metrics.totalValue}
          unit="DT"
          trend={metrics.totalValueTrend}
          icon={<div className="metric-icon primary">DT</div>}
          colorClass="primary"
        />
        <StatCard
          title="Total des Transactions"
          value={metrics.totalCount}
          unit=""
          trend={metrics.totalCountTrend}
          icon={<div className="metric-icon info">#</div>}
          colorClass="info"
        />
        <StatCard
          title="Valeur Moyenne"
          value={metrics.averageValue}
          unit="DT"
          trend={metrics.averageValueTrend}
          icon={<div className="metric-icon warning">~</div>}
          colorClass="warning"
        />
        <StatCard
          title="Taux de Conversion"
          value={metrics.conversionRate}
          unit="%"
          trend={metrics.conversionRateTrend}
          icon={<div className="metric-icon success">%</div>}
          colorClass="success"
        />
      </div>
      <div className="row g-3 mb-4">
        <div className="col-lg-8 col-md-12">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Tendances de Performance</h5>
              <ChartToggle />
            </div>
            <div className="card-body">
              <div style={{ height: 350 }}>{renderTimeSeriesChart()}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-12">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="mb-0">Analyse de Distribution</h5>
            </div>
            <div className="card-body">
              <div style={{ height: 350 }}>{renderDistributionChart()}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Activités Récentes</h5>
              <div className="d-flex align-items-center">
                <List size={16} className="me-2" />
                <span>{recentData.length} entrées</span>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Date</th>
                      <th>Valeur</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentData.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{item.nom}</td>
                        <td>{item.categorie}</td>
                        <td>{item.date}</td>
                        <td>{item.valeur} DT</td>
                        <td>
                          <span
                            className={`badge rounded-pill bg-${
                              item.statut.toLowerCase() === "livree"
                                ? "success"
                                : item.statut.toLowerCase() === "en cours"
                                ? "warning"
                                : "info"
                            }`}
                          >
                            {item.statut.toLowerCase() === "livree"
                              ? "Livré"
                              : item.statut.toLowerCase() === "en cours"
                              ? "En Cours"
                              : "En Attente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
