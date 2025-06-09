// Fichier: src/utils/stripe.js
import { loadStripe } from "@stripe/stripe-js";

let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      "pk_test_51RGN92FL0RrQaJxDTXGyfqBIOXivmI8d3k9By2L24SMPfCmeuv5aInWyx4x9ZDIz5vdjCCELXXbRkDolJA5PjYxA006OiFlN3B"
    );
  }
  return stripePromise;
};
