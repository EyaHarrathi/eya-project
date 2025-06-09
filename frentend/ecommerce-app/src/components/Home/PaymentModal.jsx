import React from "react";
import { CardElement } from "@stripe/react-stripe-js";

const PaymentModal = ({
  isOpen,
  onClose,
  planName,
  amount,
  onSubmit,
  isLoading,
}) => {
  return (
    <div
      className={`modal fade ${isOpen ? "show" : ""}`}
      style={{
        display: isOpen ? "block" : "none",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Paiement pour {planName}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
            />
          </div>
          <div className="modal-body">
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": { color: "#aab7c4" },
                      },
                    },
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={isLoading}
              >
                {isLoading ? "Traitement..." : `Payer ${amount}DT`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
