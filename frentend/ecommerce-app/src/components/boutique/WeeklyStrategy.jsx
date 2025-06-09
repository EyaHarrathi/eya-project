"use client";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Alert, Spinner, Card, Table, Badge } from "react-bootstrap";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Tag,
  Package,
  Globe,
  ChevronRight,
  Calendar,
  BarChart2,
  Award,
  CheckCircle,
} from "lucide-react";

// Enhanced styles with comprehensive RTL support and modern design elements
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap');
  
  :root {
    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    --secondary-gradient: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    --accent-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    --hover-transform: translateY(-3px);
    --transition-speed: 0.3s;
  }
  
  .rtl {
    direction: rtl;
  }
  
  .ltr {
    direction: ltr;
  }
  
  /* Custom RTL utilities */
  @layer utilities {
    .rtl .text-right {
      text-align: right;
    }
    
    .rtl .text-left {
      text-align: left;
    }
    
    .rtl .flex-row-reverse {
      flex-direction: row-reverse;
    }
    
    .rtl .justify-end {
      justify-content: flex-end;
    }
    
    .rtl .justify-start {
      justify-content: flex-start;
    }
    
    /* RTL-specific margins and padding */
    .rtl .ml-auto {
      margin-left: auto;
      margin-right: 0;
    }
    
    .rtl .mr-auto {
      margin-right: auto;
      margin-left: 0;
    }
  }
  
  /* Arabic font support */
  .rtl {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }
  
  /* Smooth transitions for direction changes */
  * {
    transition: margin 0.3s ease, padding 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  /* Enhanced styling for the entire component */
  .strategy-container {
    background-color: #f8fafc;
    border-radius: 16px;
    padding: 2rem;
    max-width: 1200px;
  }
  
  /* Header styling */
  .strategy-header {
    background: var(--primary-gradient);
    border-radius: 12px 12px 0 0;
    padding: 1.25rem;
    position: relative;
    overflow: hidden;
  }
  
  .strategy-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.5;
  }
  
  /* Card styling */
  .strategy-card {
    border: none;
    border-radius: 12px;
    box-shadow: var(--card-shadow);
    overflow: hidden;
    transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  }
  
  .strategy-card:hover {
    transform: var(--hover-transform);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  /* Button styling */
  .btn-primary {
    background: var(--primary-gradient);
    border: none;
    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
    transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  }
  
  .btn-primary:hover {
    transform: var(--hover-transform);
    box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.6);
  }
  
  .btn-outline-light {
    border: 1px solid rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(4px);
    transition: transform var(--transition-speed), background-color var(--transition-speed);
  }
  
  .btn-outline-light:hover {
    transform: var(--hover-transform);
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  /* Table styling */
  .strategy-table {
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .strategy-table thead th {
    background-color: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    padding: 1rem;
    font-weight: 600;
    color: #475569;
  }
  
  .strategy-table tbody tr {
    transition: background-color var(--transition-speed);
  }
  
  .strategy-table tbody tr:hover {
    background-color: #f1f5f9;
  }
  
  .strategy-table td {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }
  
  /* Badge styling */
  .strategy-badge {
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }
  
  /* Summary list styling */
  .summary-list {
    list-style-type: none;
    padding-left: 0;
    padding-right: 0;
  }
  
  .summary-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .summary-list li:last-child {
    border-bottom: none;
  }
  
  /* Section headings with RTL support */
  .section-heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 1.25rem;
    color: #1e293b;
  }
  
  /* RTL specific section heading */
  .rtl-layout .section-heading {
    flex-direction: row-reverse;
    justify-content: flex-end;
    text-align: right;
    width: 100%;
  }
  
  .rtl-layout .section-heading h6 {
    text-align: right;
  }
  
  /* RTL specific card header */
  .rtl-layout .strategy-header {
    flex-direction: row-reverse;
    text-align: right;
  }
  
  .rtl-layout .strategy-header h5 {
    text-align: right;
  }
  
  /* RTL specific summary list */
  .rtl-layout .summary-list li {
    flex-direction: row-reverse;
    text-align: right;
  }
  
  .rtl-layout .summary-list li .icon-circle-secondary {
    order: 1;
  }
  
  .rtl-layout .summary-list li .text-content {
    order: 2;
    text-align: right;
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  .fade-in-up {
    animation: slideUp 0.8s ease-out forwards;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  /* Stats card */
  .stats-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  }
  
  .stats-card:hover {
    transform: var(--hover-transform);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .stats-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }
  
  .stats-label {
    font-size: 0.875rem;
    color: #64748b;
  }
  
  /* Icon styling */
  .icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-gradient);
    color: white;
  }
  
  .icon-circle-secondary {
    background: var(--secondary-gradient);
    color: #4f46e5;
  }
  
  .icon-circle-accent {
    background: var(--accent-gradient);
    color: white;
  }
`;

// Injecter les styles dans le DOM
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Component for handling Arabic text detection and RTL styling
function StrategyDisplay({ strategy, isRTL = false }) {
  const isArabic = /[\u0600-\u06FF]/.test(strategy.summary);

  return (
    <div
      className={isArabic || isRTL ? "rtl-content" : "ltr-content"}
      style={{
        direction: isArabic || isRTL ? "rtl" : "ltr",
        textAlign: isArabic || isRTL ? "right" : "left",
        lineHeight: "1.8",
        fontSize: "1rem",
        color: "#334155",
      }}
    >
      {strategy.summary}
    </div>
  );
}

// Enhanced component for text content with RTL support
function TextContent({ children, className = "", isRTL = false }) {
  const isArabic = /[\u0600-\u06FF]/.test(children);

  return (
    <div
      className={`${
        isArabic || isRTL ? "rtl-content" : "ltr-content"
      } ${className} text-content`}
      style={{
        direction: isArabic || isRTL ? "rtl" : "ltr",
        textAlign: isArabic || isRTL ? "right" : "left",
      }}
    >
      {children}
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, label, value, color = "primary" }) {
  return (
    <div className="stats-card d-flex align-items-center gap-3">
      <div className={`icon-circle icon-circle-${color}`}>{icon}</div>
      <div>
        <div className="stats-value">{value}</div>
        <div className="stats-label">{label}</div>
      </div>
    </div>
  );
}

const WeeklyStrategy = () => {
  const { boutiqueId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [translatedStrategy, setTranslatedStrategy] = useState(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Formater la date en français
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fetchStrategy = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8080/api/strategie/${boutiqueId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur inconnue");
      }

      setStrategy(data);
      setHasFetched(true);
    } catch (err) {
      setError("Échec de la génération de la stratégie : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const translateStrategy = async () => {
    if (!strategy) return;

    setLoading(true);
    setError(null);
    try {
      console.log("Initiating translation request for boutiqueId:", boutiqueId);
      const response = await fetch(
        `http://localhost:8080/api/strategie/translate/${boutiqueId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(strategy),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur inconnue lors de la traduction");
      }

      console.log("Translation successful:", data);
      setTranslatedStrategy(data);
      setIsTranslated(true);
    } catch (err) {
      console.error("Translation error:", err.message);
      setError("Échec de la traduction : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    if (!translatedStrategy) {
      translateStrategy();
    } else {
      setIsTranslated(!isTranslated);
    }
  };

  const specificErrorMessage =
    "Échec de la génération de la stratégie : Erreur IA: Error while extracting response for type [interface java.util.List] and content type [application/json]";

  // Mapper les catégories aux icônes
  const getActionIcon = (category) => {
    switch (category.toLowerCase()) {
      case "sales":
        return <Tag size={20} className="text-primary" />;
      case "inventory":
        return <Package size={20} className="text-primary" />;
      default:
        return <Brain size={20} className="text-primary" />;
    }
  };

  // Décomposer le résumé en points (si texte brut)
  const parseSummary = (summary) => {
    if (typeof summary === "string") {
      return summary
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().length > 0)
        .map((line) => line.replace(/^-/, "").trim());
    } else if (Array.isArray(summary)) {
      return summary;
    }
    return ["Résumé non disponible"];
  };

  // Déterminer la stratégie à afficher (originale ou traduite)
  const displayStrategy =
    isTranslated && translatedStrategy ? translatedStrategy : strategy;

  // Check if current content is Arabic or if we're in translated mode
  const isCurrentContentArabic =
    isTranslated ||
    (displayStrategy && /[\u0600-\u06FF]/.test(displayStrategy.summary));

  // Apply RTL layout class to the entire container
  const layoutClass = isCurrentContentArabic ? "rtl-layout" : "ltr-layout";

  return (
    <div
      className={`${layoutClass} strategy-container mx-auto py-8 px-4 fade-in`}
      style={{
        background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      }}
    >
      <div className="text-center mb-8">
        <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
          <div className="icon-circle pulse">
            <Brain size={24} />
          </div>
          <h1
            className="text-3xl font-bold m-0"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {isTranslated
              ? "الاستراتيجية الأسبوعية (مدعومة بالذكاء الاصطناعي)"
              : "Stratégie Hebdomadaire (Propulsée par l'IA)"}
          </h1>
          <Sparkles size={24} className="text-warning" />
        </div>

        <TextContent
          className="text-muted mb-5"
          style={{
            fontFamily: "'Roboto', sans-serif",
            maxWidth: "700px",
            margin: "0 auto",
            fontSize: "1.1rem",
            lineHeight: "1.6",
          }}
          isRTL={isCurrentContentArabic}
        >
          {isTranslated
            ? "يقوم الذكاء الاصطناعي بتحليل بيانات أداء متجرك لتوليد استراتيجيات مخصصة. تحديث يومي."
            : "Notre intelligence artificielle analyse les données de performance de votre boutique pour générer des stratégies personnalisées. Mise à jour quotidienne le " +
              today}
        </TextContent>

        <div className="d-flex justify-content-center gap-3 mb-5">
          <Button
            variant="primary"
            size="lg"
            className="rounded-pill px-5 py-3 d-flex align-items-center gap-2"
            onClick={fetchStrategy}
            disabled={loading}
            style={{
              fontSize: "1.1rem",
              fontWeight: "500",
              boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
            }}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" />
                <span>
                  {isTranslated
                    ? "جارٍ تحليل البيانات..."
                    : "Analyse des données en cours..."}
                </span>
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                <span>
                  {isTranslated
                    ? "الحصول على استراتيجية الأسبوع"
                    : "Obtenir la stratégie de la semaine"}
                </span>
              </>
            )}
          </Button>

          {strategy && (
            <Button
              variant="outline-primary"
              size="lg"
              className="rounded-pill px-4 py-3 d-flex align-items-center gap-2"
              onClick={toggleLanguage}
              disabled={loading}
              style={{
                fontSize: "1.1rem",
                fontWeight: "500",
                border: "2px solid #4f46e5",
                color: "#4f46e5",
              }}
            >
              <Globe size={20} />
              <span>
                {isTranslated ? "عرض بالفرنسية" : "Traduire en arabe"}
              </span>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        {displayStrategy && !loading && !error && (
          <div
            className="row g-4 mb-5 fade-in-up"
            style={{ maxWidth: "900px", margin: "0 auto" }}
          >
            <div className="col-md-4">
              <StatsCard
                icon={<Calendar size={20} />}
                label={isTranslated ? "تاريخ التحليل" : "Date d'analyse"}
                value={today}
              />
            </div>
            <div className="col-md-4">
              <StatsCard
                icon={<BarChart2 size={20} />}
                label={
                  isTranslated ? "إجراءات موصى بها" : "Actions recommandées"
                }
                value={
                  displayStrategy.actions ? displayStrategy.actions.length : 0
                }
                color="accent"
              />
            </div>
            <div className="col-md-4">
              <StatsCard
                icon={<Award size={20} />}
                label={isTranslated ? "تأثير متوقع" : "Impact prévu"}
                value={isTranslated ? "مرتفع" : "Élevé"}
                color="secondary"
              />
            </div>
          </div>
        )}
      </div>

      {error && error !== specificErrorMessage && (
        <Alert
          variant="danger"
          className="d-flex align-items-center gap-2 fade-in-up mb-4"
          style={{
            borderRadius: "10px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.1)",
          }}
        >
          <AlertCircle size={20} />
          <TextContent isRTL={isCurrentContentArabic}>{error}</TextContent>
        </Alert>
      )}

      {error === specificErrorMessage && (
        <Card
          className="strategy-card shadow-lg text-center fade-in-up mb-4"
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Card.Body className="p-5">
            <div className="icon-circle icon-circle-accent mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h5
              className="text-lg font-semibold text-dark mb-3"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.5rem",
              }}
            >
              {isTranslated
                ? "لا توجد بيانات للمعالجة"
                : "Aucune donnée à traiter"}
            </h5>
            <TextContent
              className="text-muted mb-4"
              style={{
                fontFamily: "'Roboto', sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "1.1rem",
                lineHeight: "1.6",
              }}
              isRTL={isCurrentContentArabic}
            >
              {isTranslated
                ? "متجرك ليس لديه بيانات لتحليلها بعد. أضف معلومات لتوليد استراتيجية."
                : "Votre boutique n'a pas encore de données à analyser. Ajoutez des informations pour générer une stratégie."}
            </TextContent>
            <Button
              variant="outline-primary"
              className="rounded-pill px-4 py-2"
              style={{
                border: "2px solid #4f46e5",
                color: "#4f46e5",
                fontWeight: "500",
              }}
            >
              {isTranslated ? "إضافة بيانات" : "Ajouter des données"}
            </Button>
          </Card.Body>
        </Card>
      )}

      {hasFetched && !loading && !error && !strategy && (
        <Card
          className="strategy-card shadow-lg text-center fade-in-up mb-4"
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Card.Body className="p-5">
            <div className="icon-circle icon-circle-accent mx-auto mb-4">
              <Package size={24} />
            </div>
            <h5
              className="text-lg font-semibold text-dark mb-3"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.5rem",
              }}
            >
              {isTranslated
                ? "لا توجد منتجات متاحة"
                : "Aucun produit disponible"}
            </h5>
            <TextContent
              className="text-muted mb-4"
              style={{
                fontFamily: "'Roboto', sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "1.1rem",
                lineHeight: "1.6",
              }}
              isRTL={isCurrentContentArabic}
            >
              {isTranslated
                ? "يبدو أن متجرك ليس لديه منتجات بعد. أضف منتجات لفتح استراتيجية مخصصة وتعزيز مبيعاتك!"
                : "Il semble que votre boutique n'ait pas encore de produits. Ajoutez des produits pour débloquer une stratégie personnalisée et booster vos ventes !"}
            </TextContent>
            <Button
              variant="primary"
              className="rounded-pill px-4 py-2"
              style={{
                background: "var(--primary-gradient)",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
                fontWeight: "500",
              }}
            >
              {isTranslated ? "إضافة منتجات" : "Ajouter des produits"}
            </Button>
          </Card.Body>
        </Card>
      )}

      {displayStrategy && !loading && !error && (
        <Card
          className="strategy-card shadow-lg fade-in-up"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Card.Header
            className={`strategy-header text-white d-flex align-items-center gap-3 p-4 ${
              isCurrentContentArabic
                ? "flex-row-reverse justify-content-between"
                : ""
            }`}
            style={{ borderBottom: "none" }}
          >
            <div
              className={`d-flex align-items-center gap-3 ${
                isCurrentContentArabic ? "flex-row-reverse" : ""
              }`}
            >
              <div className="icon-circle">
                <Brain size={20} />
              </div>
              <h5
                className="m-0"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  textAlign: isCurrentContentArabic ? "right" : "left",
                }}
              >
                📊{" "}
                {isTranslated
                  ? "الاستراتيجية الأسبوعية"
                  : "Stratégie Hebdomadaire"}
              </h5>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            <div
              className="d-flex align-items-center gap-2 pb-2 mb-4"
              style={{
                
                justifyContent: isCurrentContentArabic
                  ? "flex-end"
                  : "flex-start",
                borderBottom: "2px solid #e2e8f0",
                color: "#1e293b",
              }}
            >
              <Sparkles size={20} className="text-primary" />
              <h6
                className="font-semibold m-0"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  textAlign: isCurrentContentArabic ? "right" : "left",
                }}
              >
                {isTranslated ? "ملخص" : "Résumé"}
              </h6>
            </div>

            {/* Use StrategyDisplay component for the summary */}
            <div
              className="mb-5 p-3"
              style={{ background: "#f8fafc", borderRadius: "8px" }}
            >
              <StrategyDisplay
                strategy={displayStrategy}
                isRTL={isCurrentContentArabic}
              />
            </div>

            <div
              className="d-flex align-items-center gap-2 pb-2 mb-4"
              style={{
                
                justifyContent: isCurrentContentArabic
                  ? "flex-end"
                  : "flex-start",
                borderBottom: "2px solid #e2e8f0",
                color: "#1e293b",
              }}
            >
              <CheckCircle size={20} className="text-primary" />
              <h6
                className="font-semibold m-0"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  textAlign: isCurrentContentArabic ? "right" : "left",
                }}
              >
                {isTranslated ? "النقاط الرئيسية" : "Points Clés"}
              </h6>
            </div>

            <ul className="summary-list mb-5">
              {parseSummary(displayStrategy.summary).map((point, index) => (
                <li
                  key={index}
                  className={`d-flex align-items-start gap-3 p-3 fade-in ${
                    isCurrentContentArabic ? "flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="icon-circle-secondary"
                    style={{
                      minWidth: "32px",
                      height: "32px",
                      borderRadius: "50%",
                    }}
                  >
                    <ChevronRight
                      size={16}
                      style={{
                        transform: isCurrentContentArabic
                          ? "rotate(180deg)"
                          : "none",
                      }}
                    />
                  </div>
                  <TextContent
                    isRTL={isCurrentContentArabic}
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.6",
                      color: "#334155",
                      textAlign: isCurrentContentArabic ? "right" : "left",
                    }}
                  >
                    {point}
                  </TextContent>
                </li>
              ))}
            </ul>

            {displayStrategy.actions && displayStrategy.actions.length > 0 && (
              <>
                <div
                  className="d-flex align-items-center gap-2 pb-2 mb-4"
                  style={{
                   
                    justifyContent: isCurrentContentArabic
                      ? "flex-end"
                      : "flex-start",
                    borderBottom: "2px solid #e2e8f0",
                    color: "#1e293b",
                  }}
                >
                  <Tag size={20} className="text-primary" />
                  <h6
                    className="font-semibold m-0"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      textAlign: isCurrentContentArabic ? "right" : "left",
                    }}
                  >
                    {isTranslated
                      ? "الإجراءات الموصى بها"
                      : "Actions Recommandées"}
                  </h6>
                </div>

                <div className="table-responsive">
                  <Table
                    responsive
                    className="strategy-table mb-4"
                    style={{
                      borderCollapse: "separate",
                      borderSpacing: "0 8px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: isCurrentContentArabic
                              ? "right"
                              : "left",
                          }}
                        >
                          {isTranslated ? "الفئة" : "Catégorie"}
                        </th>
                        <th
                          style={{
                            textAlign: isCurrentContentArabic
                              ? "right"
                              : "left",
                          }}
                        >
                          {isTranslated ? "العنوان" : "Titre"}
                        </th>
                        <th
                          style={{
                            textAlign: isCurrentContentArabic
                              ? "right"
                              : "left",
                          }}
                        >
                          {isTranslated ? "الوصف" : "Description"}
                        </th>
                        <th
                          style={{
                            textAlign: isCurrentContentArabic
                              ? "right"
                              : "left",
                          }}
                        >
                          {isTranslated ? "الأولوية" : "Priorité"}
                        </th>
                        <th
                          style={{
                            textAlign: isCurrentContentArabic
                              ? "right"
                              : "left",
                          }}
                        >
                          {isTranslated ? "التأثير" : "Impact"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayStrategy.actions.map((action, index) => (
                        <tr
                          key={action.id}
                          className="fade-in"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            background: "white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            borderRadius: "8px",
                          }}
                        >
                          <td
                            className={`d-flex align-items-center gap-2 ${
                              isCurrentContentArabic ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className="icon-circle-secondary"
                              style={{ minWidth: "32px", height: "32px" }}
                            >
                              {getActionIcon(action.category)}
                            </div>
                            <TextContent isRTL={isCurrentContentArabic}>
                              {isTranslated
                                ? action.category === "sales"
                                  ? "المبيعات"
                                  : action.category === "inventory"
                                  ? "المخزون"
                                  : action.category
                                : action.category.charAt(0).toUpperCase() +
                                  action.category.slice(1)}
                            </TextContent>
                          </td>
                          <td>
                            <TextContent
                              isRTL={isCurrentContentArabic}
                              style={{ fontWeight: "500" }}
                            >
                              {action.title}
                            </TextContent>
                          </td>
                          <td>
                            <TextContent isRTL={isCurrentContentArabic}>
                              {action.description}
                            </TextContent>
                          </td>
                          <td>
                            <Badge
                              className="strategy-badge"
                              bg={
                                action.priority === "haute" ||
                                action.priority === "عالية"
                                  ? "danger"
                                  : action.priority === "moyenne" ||
                                    action.priority === "متوسطة"
                                  ? "warning"
                                  : "success"
                              }
                              style={{
                                padding: "0.5rem 0.75rem",
                                borderRadius: "9999px",
                                fontWeight: "500",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                              }}
                            >
                              <TextContent isRTL={isCurrentContentArabic}>
                                {action.priority}
                              </TextContent>
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              className="strategy-badge"
                              bg={
                                action.impact === "élevé" ||
                                action.impact === "مرتفع"
                                  ? "success"
                                  : "secondary"
                              }
                              style={{
                                padding: "0.5rem 0.75rem",
                                borderRadius: "9999px",
                                fontWeight: "500",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                              }}
                            >
                              <TextContent isRTL={isCurrentContentArabic}>
                                {action.impact}
                              </TextContent>
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Card.Body>

          <Card.Footer
            className={`text-muted d-flex align-items-center gap-3 p-4 ${
              isCurrentContentArabic ? "flex-row-reverse" : ""
            }`}
            style={{
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <div
              className="icon-circle-accent"
              style={{ minWidth: "32px", height: "32px" }}
            >
              <Sparkles size={16} />
            </div>
            <small
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "0.9rem",
              }}
            >
              <TextContent isRTL={isCurrentContentArabic}>
                {isTranslated
                  ? "الاستراتيجية تم إنشاؤها بواسطة الذكاء الاصطناعي بناءً على بيانات متجرك"
                  : "Stratégie générée par IA à partir des données de votre boutique"}
              </TextContent>
            </small>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
};

export default WeeklyStrategy;
