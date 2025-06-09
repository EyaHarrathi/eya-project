"use client";

import { useState } from "react";
import {
  Crown,
  Star,
  TrendingUp,
  MessageCircle,
  Check,
  Loader2,
} from "lucide-react";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "../../utils/stripe";
import PaymentModal from "../Home/PaymentModal";
import { CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Star,
    title: "Design sur-mesure",
    description:
      "Personnalisation avancée de votre boutique avec des thèmes exclusifs",
  },
  {
    icon: TrendingUp,
    title: "Analytics Pro",
    description:
      "Tableaux de bord stratégiques en temps réel avec insights détaillés",
  },
  {
    icon: MessageCircle,
    title: "Support VIP",
    description: "Assistance prioritaire 24h/24 avec un conseiller dédié",
  },
];

const pricingPlans = [
  {
    id: "price_monthly_premium",
    name: "Mensuel",
    price: "29",
    period: "/mois",
    popular: false,
  },
  {
    id: "price_yearly_premium",
    name: "Annuel",
    price: "249",
    period: "/an",
    popular: true,
    savings: "Économisez 99DT",
  },
];

function PremiumBanner() {
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[1].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const selectedPlanDetails = pricingPlans.find(
    (plan) => plan.id === selectedPlan
  );

  // PremiumBanner.js
  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non authentifié");

      // 1. Création du paiement
      const paymentResponse = await fetch(
        "http://localhost:8080/api/payment/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount: Number.parseInt(selectedPlanDetails.price) * 100,
            currency: "eur",
            userId: userId,
          }),
        }
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || "Erreur de création de paiement");
      }

      const paymentData = await paymentResponse.json();

      // 2. Confirmation Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(paymentData.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: "Nom du client",
            },
          },
        });

      if (stripeError) throw stripeError;

      // 3. Mise à niveau utilisateur
      const planType = selectedPlanDetails.id.includes("monthly")
        ? "monthly"
        : "annual";

      const upgradeResponse = await fetch(
        `http://localhost:8080/utilisateur/${userId}/upgrade`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ planType }),
        }
      );

      if (!upgradeResponse.ok) {
        const errorData = await upgradeResponse.json();
        throw new Error(errorData.error || "Échec de la mise à niveau");
      }

      // Confirm payment
      const confirmResponse = await fetch(
        `http://localhost:8080/api/payment/confirm/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            planType: selectedPlanDetails.id.includes("monthly")
              ? "monthly"
              : "annual",
          }),
        }
      );

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(
          errorData.error || "Échec de la confirmation du paiement"
        );
      }
      const notificationResponse = await fetch(
        "http://localhost:8080/api/notifications/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: userId,
            type: "PREMIUM_UPGRADE",
            message:
              "Félicitations ! Vous êtes maintenant un utilisateur Premium. Profitez de vos avantages exclusifs ! 🎉",
            iconUrl: "/icons/premium-badge.png",
            relatedUserId: userId,
          }),
        }
      );

      if (!notificationResponse.ok) {
        console.error("Erreur lors de la création de la notification");
      }

      alert("Mise à niveau réussie !");
      setIsModalOpen(false);
      navigate("/CrerBoutique");
    } catch (error) {
      console.error("Erreur détaillée:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-light p-4 rounded shadow mb-4">
      <div className="row align-items-start">
        {/* LEFT: Features */}
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-success p-3 rounded-circle me-3">
              <Crown size={36} color="white" />
            </div>
            <div>
              <h2 className="h1 fw-bold mb-1 text-success">
                Premium Excellence
              </h2>
              <p className="fs-5 text-muted mb-0">
                Propulsez votre entreprise vers de nouveaux sommets
              </p>
            </div>
          </div>

          {features.map((feature, index) => (
            <div key={index} className="d-flex mb-3">
              <div className="bg-success bg-opacity-25 p-2 rounded-circle me-3">
                <feature.icon size={24} className="text-success" />
              </div>
              <div>
                <h5 className="fw-semibold mb-1">{feature.title}</h5>
                <p className="mb-0 text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Pricing */}
        <div className="col-lg-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-center mb-3">
              <p className="text-uppercase fw-bold text-secondary">
                Choisissez votre plan
              </p>
              <div className="btn-group mb-3" role="group">
                {pricingPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`btn ${
                      selectedPlan === plan.id
                        ? "btn-success"
                        : "btn-outline-success"
                    }`}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>
              {selectedPlanDetails && (
                <div>
                  <h3 className="fw-bold text-success">
                    {selectedPlanDetails.price}DT
                  </h3>
                  <p className="text-muted">{selectedPlanDetails.period}</p>
                  {selectedPlanDetails.popular && (
                    <span className="badge bg-light text-success border border-success mb-2">
                      {selectedPlanDetails.savings}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              className="btn w-100 btn-success d-flex align-items-center justify-content-center"
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2 spinner-border spinner-border-sm" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check size={20} className="me-2" />
                  Passer au Premium
                </>
              )}
            </button>
            <p className="text-center text-muted small mt-3 mb-0">
              Paiement sécurisé via Stripe
            </p>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlanDetails?.name}
        amount={selectedPlanDetails?.price}
        onSubmit={handlePaymentSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

// Wrapper nécessaire pour le contexte Stripe
export default function PremiumBannerWrapper() {
  return (
    <Elements stripe={getStripe()}>
      <PremiumBanner />
    </Elements>
  );
}
