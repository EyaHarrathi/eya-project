"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import axios from "axios";
import Sidebar from "./Sidebar";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Filler } from "chart.js";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { useTheme } from "../theme-context"; // Import the theme context

// Enregistrer les composants ChartJS
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

// PDF styles
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

// PDF Document Component
const DashboardPDF = ({
  productStats,
  userStats,
  revenueStats,
  recentTransactions,
  monthlyRevenueData,
  isFiltered,
  dateRange,
  categoryMap,
}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.header}>Tableau de Bord Administrateur</Text>
      {isFiltered && dateRange.start && dateRange.end && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Période filtrée</Text>
          <Text>
            Du {new Date(dateRange.start).toLocaleDateString()} au{" "}
            {new Date(dateRange.end).toLocaleDateString()}
          </Text>
        </View>
      )}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Statistiques des Produits</Text>
        <View style={pdfStyles.metricRow}>
          <View style={pdfStyles.metric}>
            <Text>Total Produits</Text>
            <Text>{productStats?.totalProducts || 0}</Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Produits Actifs</Text>
            <Text>{productStats?.activeProducts || 0}</Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Produits Inactifs</Text>
            <Text>{productStats?.inactiveProducts || 0}</Text>
          </View>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>
          Statistiques des Utilisateurs
        </Text>
        <View style={pdfStyles.metricRow}>
          <View style={pdfStyles.metric}>
            <Text>Total Utilisateurs</Text>
            <Text>{userStats?.totalUsers || 0}</Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Utilisateurs Premium</Text>
            <Text>{userStats?.premiumUsers || 0}</Text>
          </View>
          <View style={pdfStyles.metric}>
            <Text>Utilisateurs Réguliers</Text>
            <Text>{userStats?.regularUsers || 0}</Text>
          </View>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Revenus</Text>
        <View style={pdfStyles.metricRow}>
          <View style={pdfStyles.metric}>
            <Text>Chiffre d'affaire</Text>
            <Text>{revenueStats?.totalRevenue || 0} DT</Text>
          </View>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Revenus Mensuels</Text>
        {monthlyRevenueData &&
          monthlyRevenueData.map((item, index) => (
            <Text key={index}>
              {item.month} {item.year}: {item.amount} DT ({item.count}{" "}
              transactions)
            </Text>
          ))}
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Transactions Récentes</Text>
        <View style={pdfStyles.table}>
          <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
            <Text style={pdfStyles.tableCell}>Date</Text>
            <Text style={pdfStyles.tableCell}>Produit</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>
              Montant (DT)
            </Text>
          </View>
          {recentTransactions &&
            recentTransactions.slice(0, 10).map((transaction, index) => (
              <View key={index} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCell}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
                <Text style={pdfStyles.tableCell}>
                  {transaction.productName || "N/A"}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.lastCell]}>
                  {transaction.amount.toFixed(3)}
                </Text>
              </View>
            ))}
        </View>
      </View>
    </Page>
  </Document>
);

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [productStats, setProductStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [initialAuthCheck, setInitialAuthCheck] = useState(true);
  const { currentTheme } = useTheme(); // Use the theme context
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Refs for charts to export
  const pieChartRef = useRef(null);
  const typeChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const signupsChartRef = useRef(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");

    if (!userData) {
      navigate("/admin-login");
      setInitialAuthCheck(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      if (parsedUser.role !== "ADMIN") {
        localStorage.removeItem("user");
        navigate("/admin-login");
        setInitialAuthCheck(false);
        return;
      }

      setUser(parsedUser);
      setInitialAuthCheck(false);
    } catch (error) {
      console.error("Erreur de parsing des données utilisateur:", error);
      localStorage.removeItem("user");
      navigate("/admin-login");
      setInitialAuthCheck(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productResponse = await fetch(
          "http://localhost:8080/api/products/stats"
        );
        if (!productResponse.ok) {
          throw new Error("Échec de récupération des statistiques de produits");
        }
        const productData = await productResponse.json();

        const userResponse = await fetch(
          "http://localhost:8080/utilisateur/stats"
        );
        if (!userResponse.ok) {
          throw new Error(
            "Échec de récupération des statistiques d'utilisateurs"
          );
        }
        const userData = await userResponse.json();

        setProductStats(productData);
        setUserStats(userData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/transactions/stats"
        );
        setRevenueStats(response.data);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des statistiques de revenus:",
          err
        );
      }
    };

    fetchRevenueStats();
    const interval = setInterval(fetchRevenueStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/transactions/recent"
        );
        const transactions = response.data;
        setRecentTransactions(transactions);
        setFilteredTransactions(transactions);
        processTransactionsForChart(transactions);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des transactions récentes:",
          err
        );
      }
    };

    fetchRecentTransactions();
    const interval = setInterval(fetchRecentTransactions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        console.log("Fetching categories...");
        const response = await axios.get(
          "http://localhost:8080/api/categories"
        );
        console.log("Categories response:", response.data);

        if (response.status === 200) {
          const categoriesData = response.data;
          setCategories(categoriesData);

          // Create a map of category IDs to category names
          const catMap = {};
          categoriesData.forEach((cat) => {
            catMap[cat.id] = cat.name; // Using 'name' field from your backend
          });
          console.log("Category map:", catMap);
          setCategoryMap(catMap);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        // Set empty map to avoid undefined errors
        setCategoryMap({});
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const processTransactionsForChart = (transactions) => {
    if (!transactions || transactions.length === 0) return;

    const monthlyData = {};
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: getMonthName(date.getMonth()),
          year: date.getFullYear(),
          amount: 0,
          count: 0,
        };
      }
      monthlyData[monthYear].amount += transaction.amount;
      monthlyData[monthYear].count += 1;
    });

    const chartData = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return getMonthIndex(a.month) - getMonthIndex(b.month);
    });

    setMonthlyRevenueData(chartData);
  };

  const getMonthName = (monthIndex) => {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return months[monthIndex];
  };

  const getMonthIndex = (monthName) => {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return months.indexOf(monthName);
  };

  // Function to get category name by ID
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || categoryId === "") return "Non catégorisé";
    const categoryName = categoryMap[categoryId];
    console.log(
      `Looking for category ID: ${categoryId}, found: ${categoryName}`
    );
    return categoryName || `Catégorie ${categoryId}`; // Show ID if name not found
  };

  const getCategoryChartData = () => {
    if (!productStats || !productStats.categoryDistribution) {
      console.log("No product stats or category distribution");
      return null;
    }

    console.log("Category distribution:", productStats.categoryDistribution);
    console.log("Category map:", categoryMap);

    // Map category IDs to category names
    const labels = productStats.categoryDistribution.map((item) => {
      const categoryName = getCategoryNameById(item.categoryId);
      console.log(`Mapping ${item.categoryId} to ${categoryName}`);
      return categoryName;
    });

    const data = productStats.categoryDistribution.map((item) => item.count);

    console.log("Chart labels:", labels);
    console.log("Chart data:", data);

    return {
      labels,
      datasets: [
        {
          label: "Produits par Catégorie",
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(199, 199, 199, 0.8)",
            "rgba(83, 102, 255, 0.8)",
            "rgba(40, 159, 64, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(199, 199, 199, 1)",
            "rgba(83, 102, 255, 1)",
            "rgba(40, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getTypeChartData = () => {
    if (!productStats || !productStats.typeDistribution) return null;
    const labels = productStats.typeDistribution.map((item) => item.type);
    const data = productStats.typeDistribution.map((item) => item.count);
    return {
      labels,
      datasets: [
        {
          label: "Produits par Type",
          data,
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(255, 206, 86, 0.8)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlySignupsData = () => {
    if (!userStats || !userStats.monthlySignups) return null;
    const labels = userStats.monthlySignups.map((item) =>
      item.month ? item.month : "Inconnu"
    );
    const data = userStats.monthlySignups.map((item) => item.count);
    return {
      labels,
      datasets: [
        {
          label: "Inscriptions Mensuelles",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const getRevenueChartData = () => {
    if (!monthlyRevenueData || monthlyRevenueData.length === 0) return null;
    const labels = monthlyRevenueData.map(
      (item) => `${item.month} ${item.year}`
    );
    const data = monthlyRevenueData.map((item) => item.amount);
    return {
      labels,
      datasets: [
        {
          label: "Revenus Mensuels (DT)",
          data,
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const COLORS = {
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
    yellow: "#f59e0b",
    purple: "#8b5cf6",
  };

  const SummaryCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color,
    bgColor,
  }) => {
    return (
      <div className="card stat-card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="card-subtitle text-muted mb-1">{title}</h6>
              <h3 className="card-title mb-0">{value}</h3>
              <p className="card-text small text-muted">{subtitle}</p>
            </div>
            <div
              className="card-icon"
              style={{ backgroundColor: bgColor, color: color }}
            >
              <i className={icon}></i>
            </div>
          </div>
          {trend !== undefined && (
            <div
              className={`trend-indicator ${
                trend >= 0 ? "text-success" : "text-danger"
              }`}
            >
              <i
                className={`bi ${trend >= 0 ? "bi-arrow-up" : "bi-arrow-down"}`}
              ></i>
              <span>
                {Math.abs(trend).toFixed(1)}% par rapport au mois dernier
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleShare = () => {
    const dashboardURL = window.location.href;
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = dashboardURL;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("Lien du tableau de bord copié dans le presse-papiers!");
  };

  const handleDownload = () => {
    const downloadMenu = document.getElementById("downloadMenu");
    if (downloadMenu) {
      const openDropdowns = document.querySelectorAll(".dropdown-menu.show");
      openDropdowns.forEach((menu) => {
        if (menu !== downloadMenu) menu.classList.remove("show");
      });
      downloadMenu.classList.toggle("show");
      const closeDropdown = (e) => {
        if (
          !e.target.matches(".dropdown-item") &&
          !e.target.closest(".dropdown")
        ) {
          downloadMenu.classList.remove("show");
          document.removeEventListener("click", closeDropdown);
        }
      };
      setTimeout(() => {
        document.addEventListener("click", closeDropdown);
      }, 100);
    }
  };

  const downloadAsExcel = () => {
    const workbook = XLSX.utils.book_new();
    if (productStats) {
      const productData = [
        ["Statistiques des Produits", ""],
        ["Total des Produits", productStats.totalProducts || 0],
        ["Produits Actifs", productStats.activeProducts || 0],
        ["Produits Inactifs", productStats.inactiveProducts || 0],
        ["Produits en Stock Faible", productStats.lowStockProducts || 0],
        ["", ""],
        ["Distribution par Catégorie", ""],
      ];
      if (productStats.categoryDistribution) {
        productStats.categoryDistribution.forEach((item) => {
          productData.push([getCategoryNameById(item.categoryId), item.count]);
        });
      }
      productData.push(["", ""]);
      productData.push(["Distribution par Type", ""]);
      if (productStats.typeDistribution) {
        productStats.typeDistribution.forEach((item) => {
          productData.push([item.type, item.count]);
        });
      }
      const productSheet = XLSX.utils.aoa_to_sheet(productData);
      XLSX.utils.book_append_sheet(workbook, productSheet, "Produits");
    }
    if (userStats) {
      const userData = [
        ["Statistiques des Utilisateurs", ""],
        ["Total des Utilisateurs", userStats.totalUsers || 0],
        ["Utilisateurs Premium", userStats.premiumUsers || 0],
        ["Utilisateurs Réguliers", userStats.regularUsers || 0],
        ["", ""],
        ["Inscriptions Mensuelles", ""],
      ];
      if (userStats.monthlySignups) {
        userStats.monthlySignups.forEach((item) => {
          userData.push([item.month || "Inconnu", item.count]);
        });
      }
      const userSheet = XLSX.utils.aoa_to_sheet(userData);
      XLSX.utils.book_append_sheet(workbook, userSheet, "Utilisateurs");
    }
    if (monthlyRevenueData && monthlyRevenueData.length > 0) {
      const revenueData = [
        ["Statistiques des Revenus", ""],
        ["Mois", "Année", "Montant (DT)", "Nombre de Transactions"],
      ];
      monthlyRevenueData.forEach((item) => {
        revenueData.push([item.month, item.year, item.amount, item.count]);
      });
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, "Revenus");
    }
    if (recentTransactions && recentTransactions.length > 0) {
      const transactionData = [
        ["Transactions Récentes", ""],
        ["Date", "Montant (DT)"],
      ];
      recentTransactions.forEach((transaction) => {
        transactionData.push([
          new Date(transaction.date).toLocaleDateString(),
          transaction.amount.toFixed(3),
        ]);
      });
      const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
      XLSX.utils.book_append_sheet(workbook, transactionSheet, "Transactions");
    }
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    saveAs(data, `tableau-de-bord-admin-${dateStr}.xlsx`);
  };

  const downloadAsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (productStats) {
      csvContent += "Statistiques des Produits\n";
      csvContent += `Total des Produits,${productStats.totalProducts || 0}\n`;
      csvContent += `Produits Actifs,${productStats.activeProducts || 0}\n`;
      csvContent += `Produits Inactifs,${productStats.inactiveProducts || 0}\n`;
      csvContent += `Produits en Stock Faible,${
        productStats.lowStockProducts || 0
      }\n\n`;
      csvContent += "Distribution par Catégorie\n";
      if (productStats.categoryDistribution) {
        csvContent += "Catégorie,Nombre\n";
        productStats.categoryDistribution.forEach((item) => {
          csvContent += `${getCategoryNameById(item.categoryId)},${
            item.count
          }\n`;
        });
      }
      csvContent += "\n";
    }
    if (userStats) {
      csvContent += "Statistiques des Utilisateurs\n";
      csvContent += `Total des Utilisateurs,${userStats.totalUsers || 0}\n`;
      csvContent += `Utilisateurs Premium,${userStats.premiumUsers || 0}\n`;
      csvContent += `Utilisateurs Réguliers,${userStats.regularUsers || 0}\n\n`;
      csvContent += "Inscriptions Mensuelles\n";
      if (userStats.monthlySignups) {
        csvContent += "Mois,Nombre\n";
        userStats.monthlySignups.forEach((item) => {
          csvContent += `${item.month || "Inconnu"},${item.count}\n`;
        });
      }
      csvContent += "\n";
    }
    if (monthlyRevenueData && monthlyRevenueData.length > 0) {
      csvContent += "Revenus Mensuels\n";
      csvContent += "Mois,Année,Montant (DT),Nombre de Transactions\n";
      monthlyRevenueData.forEach((item) => {
        csvContent += `${item.month},${item.year},${item.amount},${item.count}\n`;
      });
      csvContent += "\n";
    }
    if (recentTransactions && recentTransactions.length > 0) {
      csvContent += "Transactions Récentes\n";
      csvContent += "Date,Montant (DT)\n";
      recentTransactions.forEach((transaction) => {
        csvContent += `${new Date(
          transaction.date
        ).toLocaleDateString()},${transaction.amount.toFixed(3)}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tableau-de-bord-admin-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalendarClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateRangeChange = (event) => {
    const { name, value } = event.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyDateFilter = () => {
    if (!dateRange.start || !dateRange.end) {
      return;
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    // Filter transactions
    const filtered = recentTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    setFilteredTransactions(filtered);
    processTransactionsForChart(filtered);
    setIsFiltered(true);
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setDateRange({ start: null, end: null });
    setFilteredTransactions(recentTransactions);
    processTransactionsForChart(recentTransactions);
    setIsFiltered(false);
  };

  // Dashboard Content Component
  const DashboardContent = () => (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom sticky-top bg-light">
        <h1 className="h2">Tableau de bord</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleShare}
              title="Partager le tableau de bord"
            >
              <i className="bi bi-share"></i>
            </button>
            <div className="dropdown">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleDownload}
                title="Télécharger les données"
              >
                <i className="bi bi-download"></i>
              </button>
              <div id="downloadMenu" className="dropdown-menu">
                <a className="dropdown-item" onClick={downloadAsExcel}>
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  Excel (.xlsx)
                </a>
                <a className="dropdown-item" onClick={downloadAsCSV}>
                  <i className="bi bi-file-earmark-text me-2"></i>CSV (.csv)
                </a>
                <PDFDownloadLink
                  document={
                    <DashboardPDF
                      productStats={productStats}
                      userStats={userStats}
                      revenueStats={revenueStats}
                      recentTransactions={filteredTransactions}
                      monthlyRevenueData={monthlyRevenueData}
                      isFiltered={isFiltered}
                      dateRange={dateRange}
                      categoryMap={categoryMap}
                    />
                  }
                  fileName={`tableau-de-bord-admin-${
                    new Date().toISOString().split("T")[0]
                  }${isFiltered ? "-filtre" : ""}.pdf`}
                  className="dropdown-item"
                >
                  {({ loading }) => (
                    <>
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      {loading ? "Génération..." : "PDF (.pdf)"}
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </div>
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleCalendarClick}
              title="Filtrer par date"
            >
              <i className="bi bi-calendar"></i>
              {isFiltered && (
                <span className="ms-1 badge bg-primary">Filtré</span>
              )}
            </button>
            {showDatePicker && (
              <div className="date-picker-container">
                <div className="form-group">
                  <label htmlFor="startDate">Date de début</label>
                  <input
                    type="date"
                    id="startDate"
                    name="start"
                    className="form-control"
                    value={dateRange.start || ""}
                    onChange={handleDateRangeChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">Date de fin</label>
                  <input
                    type="date"
                    id="endDate"
                    name="end"
                    className="form-control"
                    value={dateRange.end || ""}
                    onChange={handleDateRangeChange}
                  />
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Annuler
                  </button>
                  {isFiltered && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={clearDateFilter}
                    >
                      Réinitialiser
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={applyDateFilter}
                    disabled={!dateRange.start || !dateRange.end}
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-3 mb-4">
          <div className="card stat-card h-100 bg-primary text-white">
            <div className="card-body text-center">
              <div className="card-icon mx-auto bg-white text-primary mb-3">
                <i className="bi bi-box-seam fs-4"></i>
              </div>
              <h2 className="mb-0">{productStats?.totalProducts || 0}</h2>
              <p className="small mb-0">Produits</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card stat-card h-100 bg-success text-white">
            <div className="card-body text-center">
              <div className="card-icon mx-auto bg-white text-success mb-3">
                <i className="bi bi-check-circle fs-4"></i>
              </div>
              <h2 className="mb-0">{productStats?.activeProducts || 0}</h2>
              <p className="small mb-0">Actifs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card stat-card h-100 bg-danger text-white">
            <div className="card-body text-center">
              <div className="card-icon mx-auto bg-white text-danger mb-3">
                <i className="bi bi-x-circle fs-4"></i>
              </div>
              <h2 className="mb-0">{productStats?.inactiveProducts || 0}</h2>
              <p className="small mb-0">Inactifs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card stat-card h-100 bg-warning text-white">
            <div className="card-body text-center">
              <div className="card-icon mx-auto bg-white text-warning mb-3">
                <i className="bi bi-exclamation-triangle fs-4"></i>
              </div>
              <h2 className="mb-0">{productStats?.lowStockProducts || 0}</h2>
              <p className="small mb-0">Stock Faible</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <SummaryCard
            title="Chiffre d'affaire"
            value={`${formatNumber(revenueStats?.totalRevenue || 0)} DT`}
            subtitle="ce mois-ci"
            icon="bi bi-currency-dollar fs-4"
            trend={calculateChange(
              revenueStats?.currentMonthRevenue || 0,
              revenueStats?.previousMonthRevenue || 0
            )}
            color={COLORS.purple}
            bgColor="rgba(139, 92, 246, 0.1)"
          />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card stat-card h-100">
            <div className="card-header bg-white d-flex align-items-center">
              <i className="bi bi-pie-chart me-2"></i>
              <h5 className="card-title mb-0">Catégories</h5>
            </div>
            <div className="card-body chart-container">
              {categoriesLoading ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">
                      Chargement des catégories...
                    </span>
                  </div>
                </div>
              ) : getCategoryChartData() ? (
                <Pie
                  data={getCategoryChartData()}
                  options={{ maintainAspectRatio: false }}
                  ref={pieChartRef}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-muted">
                    Aucune donnée de catégorie disponible
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card stat-card h-100">
            <div className="card-header bg-white d-flex align-items-center">
              <i className="bi bi-pie-chart me-2"></i>
              <h5 className="card-title mb-0">Types</h5>
            </div>
            <div className="card-body chart-container">
              {getTypeChartData() && (
                <Pie
                  data={getTypeChartData()}
                  options={{ maintainAspectRatio: false }}
                  ref={typeChartRef}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-lg-8 mb-4">
          <div className="card chart-card h-100">
            <div className="card-body">
              <div className="chart-header">
                <div>
                  <h5 className="chart-title">
                    Tendances du Chiffre d'affaires
                  </h5>
                  <p className="chart-subtitle">
                    Analyse du chiffre d'affaires mensuel
                  </p>
                </div>
              </div>
              <div className="chart-container">
                {getRevenueChartData() ? (
                  <Bar
                    data={getRevenueChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Montant (DT)",
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: "Période",
                          },
                        },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) =>
                              `Revenu: ${context.parsed.y.toFixed(3)} DT`,
                          },
                        },
                      },
                    }}
                    ref={revenueChartRef}
                  />
                ) : (
                  <div className="chart-placeholder">
                    Chargement des données de revenus...
                  </div>
                )}
              </div>
              <div className="revenue-insights">
                <h6>Analyse des revenus</h6>
                <ul>
                  <li>
                    <strong>Chiffre d'affaire total:</strong>{" "}
                    {formatNumber(calculateTotalRevenue())} DT sur la période
                    affichée
                  </li>
                  <li>
                    <strong>Transactions récentes:</strong>{" "}
                    {recentTransactions.length} transactions enregistrées
                  </li>
                  {Object.entries(calculateTransactionsPerDay()).length > 0 && (
                    <li>
                      <strong>Activité par jour:</strong>{" "}
                      {Object.entries(calculateTransactionsPerDay()).map(
                        ([date, count], index) => (
                          <span key={date}>
                            {date}:{" "}
                            <span className="transaction-highlight">
                              {count}
                            </span>{" "}
                            transaction(s)
                            {index <
                            Object.entries(calculateTransactionsPerDay())
                              .length -
                              1
                              ? ", "
                              : ""}
                          </span>
                        )
                      )}
                    </li>
                  )}
                  {monthlyRevenueData.length > 0 && (
                    <li>
                      <strong>Mois le plus actif:</strong>{" "}
                      {
                        monthlyRevenueData.reduce((max, current) =>
                          current.amount > max.amount ? current : max
                        ).month
                      }{" "}
                      avec{" "}
                      <span className="transaction-highlight">
                        {formatNumber(
                          monthlyRevenueData.reduce((max, current) =>
                            current.amount > max.amount ? current : max
                          ).amount
                        )}{" "}
                        DT
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className="bi bi-receipt me-2"></i>
                <h5 className="card-title mb-0">Transactions Récentes</h5>
              </div>
              {isFiltered && (
                <span className="badge bg-primary">
                  {filteredTransactions.length} sur {recentTransactions.length}
                </span>
              )}
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <i className="bi bi-calendar-date me-1"></i>
                        Date
                      </th>
                      <th>
                        <i className="bi bi-box me-1"></i>
                        Produit
                      </th>
                      <th>
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions && filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction, index) => (
                        <tr key={transaction.id || index}>
                          <td>
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td>{transaction.productName || "N/A"}</td>
                          <td>{transaction.amount.toFixed(3)} DT</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          {loading ? (
                            <div className="d-flex justify-content-center">
                              <div
                                className="spinner-border spinner-border-sm text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Chargement...
                                </span>
                              </div>
                            </div>
                          ) : isFiltered ? (
                            <div>
                              <i className="bi bi-exclamation-circle me-2"></i>
                              Aucune transaction dans cette période
                            </div>
                          ) : (
                            <i className="bi bi-inbox me-2"></i>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2 className="mt-4 mb-3">Statistiques des Utilisateurs</h2>
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card stat-card h-100 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Total Utilisateurs</h6>
                  <h2 className="mb-0">{userStats?.totalUsers || 0}</h2>
                </div>
                <div className="card-icon bg-white text-info">
                  <i className="bi bi-people fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card stat-card h-100 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Utilisateurs Premium</h6>
                  <h2 className="mb-0">{userStats?.premiumUsers || 0}</h2>
                </div>
                <div className="card-icon bg-white text-primary">
                  <i className="bi bi-star fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card stat-card h-100 bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Utilisateurs Réguliers</h6>
                  <h2 className="mb-0">{userStats?.regularUsers || 0}</h2>
                </div>
                <div className="card-icon bg-white text-secondary">
                  <i className="bi bi-person fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card stat-card h-100">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">
                Inscriptions Mensuelles d'Utilisateurs
              </h5>
            </div>
            <div className="card-body chart-container">
              {getMonthlySignupsData() && (
                <Bar
                  data={getMonthlySignupsData()}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                  ref={signupsChartRef}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const calculateTotalRevenue = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return 0;
    return filteredTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
  };

  const calculateTransactionsPerDay = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return {};
    const transactionsByDay = {};
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!transactionsByDay[date]) {
        transactionsByDay[date] = 0;
      }
      transactionsByDay[date]++;
    });
    return transactionsByDay;
  };

  if (initialAuthCheck) {
    return <div>Vérification de l'authentification...</div>;
  }

  if (loading) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Erreur: {error}
        </div>
      </div>
    );
  }

  // Determine which content to render based on the current route
  const isDashboardRoute =
    location.pathname === "/dash" || location.pathname === "/dash/dashboard";

  return (
    <div className={`dashboard-admin ${currentTheme}`}>
      <style jsx>{`
        .dashboard-admin {
          font-family: "Poppins", sans-serif;
        }
        .stat-card {
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .card-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .chart-container {
          height: 300px;
          position: relative;
        }
        .navbar-brand {
          font-weight: 700;
          font-size: 1.5rem;
        }
        .sidebar {
          min-height: 100vh;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }
        .main-content {
          min-height: 100vh;
        }
        .chart-card {
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .chart-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .chart-subtitle {
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 0;
        }
        .chart-placeholder {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
        .trend-indicator {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .nav-link {
          border-radius: 8px;
          margin: 5px 10px;
          transition: all 0.3s ease;
        }
        .nav-link:hover,
        .nav-link.active {
          background-color: rgba(13, 110, 253, 0.1);
        }
        .nav-link.active {
          border-left: 3px solid #0d6efd;
        }
        .revenue-insights {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
          border-left: 4px solid #6366f1;
        }
        .revenue-insights h6 {
          color: #4f46e5;
          font-weight: 600;
        }
        .revenue-insights ul {
          margin-top: 10px;
          padding-left: 20px;
        }
        .revenue-insights li {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .transaction-highlight {
          font-weight: 600;
          color: #4f46e5;
        }
        .user-profile {
          display: flex;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
        }
        .user-info h5 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .user-info p {
          margin: 0;
          font-size: 14px;
          color: #6c757d;
        }
        .logout-button {
          margin-top: auto;
          padding: 15px;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 10px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          color: #dc3545;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background-color: #dc3545;
          color: white;
        }
        .logout-btn i {
          margin-right: 8px;
        }
        .dashboard-container {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }
        .main-content {
          flex: 1;
          margin-left: 250px;
          height: 100vh;
          overflow-y: auto;
        }
        .content-wrapper {
          padding: 20px;
          padding-bottom: 40px;
        }
        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .dropdown {
          position: relative;
        }
        .dropdown-menu {
          display: none;
          position: absolute;
          background-color: #fff;
          min-width: 160px;
          box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
          z-index: 1050;
          border-radius: 4px;
          padding: 8px 0;
          right: 0;
          top: 100%;
          margin-top: 2px;
        }
        .dropdown-menu.show {
          display: block;
        }
        .dropdown-item {
          padding: 8px 16px;
          text-decoration: none;
          display: block;
          color: #212529;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }
        .date-picker-container {
          position: absolute;
          right: 0;
          top: 40px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          z-index: 1000;
          width: 300px;
        }
        .date-picker-container .form-group {
          margin-bottom: 12px;
        }
        .date-picker-container label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          font-size: 14px;
        }
        .date-picker-container .btn-group {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
        }

        /* Dark theme styles */
        .dashboard-admin.dark {
          background-color: #121212;
          color: #f8f9fa;
        }

        .dashboard-admin.dark .main-content {
          background-color: #121212;
        }

        .dashboard-admin.dark .card {
          background-color: #1e1e1e;
          border-color: #333;
        }

        .dashboard-admin.dark .card-header {
          background-color: #2a2a2a !important;
          border-color: #333;
          color: #f8f9fa;
        }

        .dashboard-admin.dark .table {
          color: #f8f9fa;
        }

        .dashboard-admin.dark .table thead th {
          border-color: #333;
        }

        .dashboard-admin.dark .table td {
          border-color: #333;
        }

        .dashboard-admin.dark .bg-light {
          background-color: #2a2a2a !important;
          color: #f8f9fa;
        }

        .dashboard-admin.dark .text-muted {
          color: #adb5bd !important;
        }

        .dashboard-admin.dark .border-bottom {
          border-color: #333 !important;
        }

        .dashboard-admin.dark .revenue-insights {
          background-color: #2a2a2a;
        }

        .dashboard-admin.dark .dropdown-menu {
          background-color: #2a2a2a;
          border-color: #333;
        }

        .dashboard-admin.dark .dropdown-item {
          color: #f8f9fa;
        }

        .dashboard-admin.dark .dropdown-item:hover {
          background-color: #333;
        }

        .dashboard-admin.dark .date-picker-container {
          background-color: #2a2a2a;
          border-color: #333;
        }

        .dashboard-admin.dark .form-control {
          background-color: #333;
          border-color: #444;
          color: #f8f9fa;
        }

        .dashboard-admin.dark .btn-outline-secondary {
          color: #adb5bd;
          border-color: #adb5bd;
        }

        .dashboard-admin.dark .btn-outline-secondary:hover {
          background-color: #333;
          color: #f8f9fa;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          .mobile-toggle {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            border: none;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <Sidebar user={user} handleLogout={handleLogout} />
        <div className="main-content">
          <div className="content-wrapper">
            {isDashboardRoute ? <DashboardContent /> : <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
