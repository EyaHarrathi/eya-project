import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner } from "react-bootstrap";
import { ThemeProvider } from "./components/theme-context"; // Import ThemeProvider
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./components/Home/Home";
import Signup from "./components/signup";
import Login from "./components/login";
import Profile from "./components/Profile";
import Sidebar from "./components/network/Sidebar"; // Note: This is a different Sidebar; consider renaming for clarity
import ForgotPassword from "./components/password";
import Accueil from "./components/network/Accueil";
import Invitations from "./components/network/Invitations";
import Amis from "./components/network/Amis";
import Profil from "./components/product/Profil";
import AppLayout from "./components/boutique/AppLayout";
import Panier from "./components/commande/panier";
import Acceuil from "./components/acceuil/acceuil";
import Pai from "./components/commande/paiment";
import CommandesClient from "./components/commande/commandeachteur";
import CommandesVendeur from "./components/commande/commandevendeur";
import Acceuilprofile from "./components/product/Acceuilprofile";
import AmisProfil from "./components/product/AmisProfil";
import Recommendation from "./components/recomend/Recommendation";
import REcommendForFree from "./components/recomend/REcommendForFree";
import OrderDetails from "./components/boutique/orders/OrderDetails";
import Indexe from "./components/boutique/creerboutique1";
import Lboutique from "./components/boutique/listeboutique";
import CreateShop from "./components/boutique/crerboutique";
import AffichageBoutique from "./components/boutique/AffichageBoutique";
import LLboutique from "./components/boutique/amilisteboutique";
import AmisProduct from "./components/product/AmisProduct";
import LoginForm from "./components/Admin/login-form";
import SignupForm from "./components/Admin/signup-form";
import PremiumBannerWrapper from "./components/Home/PremiumBanner";
import AdminProfile from "./components/Admin/AdminProfile";
import DashboardAdmin from "./components/Admin/DashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";
import Quitter from "./components/Quitter";
import Dashboard from "./components/boutique/dashboardcommande";
import BoutiqueAdmin from "./components/Admin/boutique-admin";
import UserManagement from "./components/Admin/UserManagement";
import ParametreAdmin from "./components/Admin/parametre-admin";
import BoutiqueProtectedRoute from "./components/BoutiqueProtectedRoute";

import PremiumRoute from "./components/PremiumRoute";
// Lazy-loaded components
const Products = lazy(() => import("./components/boutique/boutique"));
const Orders = lazy(() => import("./components/boutique/dashboardcommande"));
const Statistics = lazy(() => import("./components/boutique/statistique"));
const Clients = lazy(() => import("./components/boutique/client"));
const GlobalStatistics = lazy(() =>
  import("./components/boutique/globalStatistique")
);
const WeeklyStrategy = lazy(() =>
  import("./components/boutique/WeeklyStrategy")
);

function App() {
  return (
    <ThemeProvider>
      {" "}
      {/* Wrap the entire application with ThemeProvider */}
      <Router>
        <Routes>
          {/* Routes principales */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/:userId" element={<AdminProfile />} />
          <Route path="/password" element={<ForgotPassword />} />
          <Route path="/Profil" element={<Profil />} />
          <Route
            path="/home"
            element={
              <UserProtectedRoute>
                <Home />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <Profile />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/monpanier"
            element={
              <UserProtectedRoute>
                <Panier />
              </UserProtectedRoute>
            }
          />
          <Route path="/" element={<Acceuil />} />
          <Route path="/paiment" element={<Pai />} />
          <Route path="/commandeachteur" element={<CommandesClient />} />
          <Route path="/commandevendeur" element={<CommandesVendeur />} />
          <Route path="/acceuilprofile/:userId" element={<Acceuilprofile />} />
          <Route path="/amis/:userId" element={<AmisProfil />} />
          <Route path="/recom" element={<Recommendation />} />
          <Route path="/freerecom" element={<REcommendForFree />} />
          <Route
            path="/CrerBoutique"
            element={
              <PremiumRoute>
                <Indexe />
              </PremiumRoute>
            }
          />

          <Route
            path="/mesboutiques"
            element={
              <BoutiqueProtectedRoute>
                <Lboutique />
              </BoutiqueProtectedRoute>
            }
          />
          <Route
            path="/novelle_boutique"
            element={
              <BoutiqueProtectedRoute>
                <CreateShop />
              </BoutiqueProtectedRoute>
            }
          />
          <Route
            path="/amiboutique/:boutiqueId"
            element={<AffichageBoutique />}
          />
          <Route path="/listeboutiques" element={<LLboutique />} />
          <Route path="/amisproduct/:userId" element={<AmisProduct />} />
          <Route path="/admin-login" element={<LoginForm />} />
          <Route path="/admin-signup" element={<SignupForm />} />
          <Route path="/premium" element={<PremiumBannerWrapper />} />
          <Route path="/quitter" element={<Quitter />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin Dashboard Route with Nested Routes */}
          <Route
            path="/dash"
            element={
              <ProtectedRoute>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          >
            <Route index element={<div>Tableau de bord</div>} />
            <Route path="dashboard" element={<div>Tableau de bord</div>} />
            <Route path="boutiques" element={<BoutiqueAdmin />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<ParametreAdmin />} />
            <Route path="*" element={<div>404 - Page non trouvée</div>} />
          </Route>

          {/* Route imbriquée pour la boutique avec ErrorBoundary */}
          <Route
            path="/boutique/:boutiqueId"
            element={
              <ErrorBoundary>
                <AppLayout />
              </ErrorBoundary>
            }
          >
            <Route
              index
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <Products />
                </Suspense>
              }
            />
            <Route
              path="products"
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <Products />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <Orders />
                </Suspense>
              }
            />
            <Route
              path="orders/:orderId"
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <OrderDetails />
                </Suspense>
              }
            />
            <Route
              path="stats"
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <Statistics />
                </Suspense>
              }
            />
            <Route
              path="clients"
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <Clients />
                </Suspense>
              }
            />
            <Route
              path="global-stats"
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <GlobalStatistics />
                </Suspense>
              }
            />
            <Route
              path="weekly-strategy"
              element={
                <Suspense
                  fallback={<Spinner animation="border" variant="primary" />}
                >
                  <WeeklyStrategy />
                </Suspense>
              }
            />
            <Route path="*" element={<div>404 - Page non trouvée</div>} />
          </Route>

          {/* Routes imbriquées pour le réseau */}
          <Route
            path="/network"
            element={
              <UserProtectedRoute>
                <Sidebar />
              </UserProtectedRoute>
            }
          >
            <Route index element={<Accueil />} />
            <Route path="accueil" element={<Accueil />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="amis" element={<Amis />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
