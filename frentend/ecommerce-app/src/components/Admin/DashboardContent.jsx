import { useOutletContext } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DashboardPDF from "./DashboardPDF"; // Adjust the import path as needed

const DashboardContent = () => {
  const {
    productStats,
    userStats,
    revenueStats,
    recentTransactions,
    monthlyRevenueData,
    handleShare,
    handleDownload,
    downloadAsExcel,
    downloadAsCSV,
    showDatePicker,
    handleCalendarClick,
    dateRange,
    handleDateRangeChange,
    applyDateFilter,
    getCategoryChartData,
    getTypeChartData,
    getMonthlySignupsData,
    getRevenueChartData,
    formatNumber,
    calculateChange,
    COLORS,
    SummaryCard,
    pieChartRef,
    typeChartRef,
    revenueChartRef,
    signupsChartRef,
    calculateTotalRevenue,
    calculateTransactionsPerDay,
    transactionsPerDay,
    totalRevenue,
  } = useOutletContext();

  return (
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
                  <i className="bi bi-file-earmark-text me-2"></i>CSV
                  (.csv)
                </a>
                <PDFDownloadLink
                  document={
                    <DashboardPDF
                      productStats={productStats}
                      userStats={userStats}
                      revenueStats={revenueStats}
                      recentTransactions={recentTransactions}
                      monthlyRevenueData={monthlyRevenueData}
                    />
                  }
                  fileName={`tableau-de-bord-admin-${
                    new Date().toISOString().split("T")[0]
                  }.pdf`}
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
            title="Revenu Total"
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
              {getCategoryChartData() && (
                <Pie
                  data={getCategoryChartData()}
                  options={{ maintainAspectRatio: false }}
                  ref={pieChartRef}
                />
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
                  <h5 className="chart-title">Tendances des Revenus</h5>
                  <p className="chart-subtitle">Analyse des revenus mensuels</p>
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
                    <strong>Revenu total:</strong>{" "}
                    {formatNumber(totalRevenue)} DT sur la période affichée
                  </li>
                  <li>
                    <strong>Transactions récentes:</strong>{" "}
                    {recentTransactions.length} transactions enregistrées
                  </li>
                  {Object.entries(transactionsPerDay).length > 0 && (
                    <li>
                      <strong>Activité par jour:</strong>{" "}
                      {Object.entries(transactionsPerDay).map(
                        ([date, count], index) => (
                          <span key={date}>
                            {date}:{" "}
                            <span className="transaction-highlight">
                              {count}
                            </span>{" "}
                            transaction(s)
                            {index < Object.entries(transactionsPerDay).length - 1
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
            <div className="card-header bg-white d-flex align-items-center">
              <i className="bi bi-receipt me-2"></i>
              <h5 className="card-title mb-0">Transactions Récentes</h5>
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
                        <i className="bi bi-currency-dollar me-1"></i>
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions && recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction, index) => (
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
                          <i className="bi bi-inbox me-2"></i>
                          Aucune transaction
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
};

export default DashboardContent;