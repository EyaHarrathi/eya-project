import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { CreditCard } from "lucide-react";
import PremiumBanner from "./PremiumBanner";

const FloatingButtons = () => {
  const [showPremium, setShowPremium] = useState(false);

  return (
    <>
      <style>{`
        .floating-buttons {
          position: fixed;
          right: 20px;
          bottom: 40px;
          z-index: 1000;
        }

        .floating-button {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
          background: rgba(255, 255, 255, 0.9);
          color: #059669;
          border: 2px solid #22c55e;
        }

        .floating-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
          z-index: 1;
        }

        .floating-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
        }

        .floating-button:active {
          transform: scale(0.95);
        }

        .button-tooltip {
          position: absolute;
          right: 75px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 10px 20px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          white-space: nowrap;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          transform: translateX(10px);
        }

        .floating-button:hover .button-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-5px);
        }

        .button-icon {
          position: relative;
          z-index: 2;
        }

        .modal-content {
          background-color: white;
          padding: 30px;
          border-radius: 12px;
          width: 150%;
          max-width: 1200px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          position: relative;
        }
      `}</style>

      <div className="floating-buttons">
        <div
          className="floating-button"
          onClick={() => setShowPremium(true)}
        >
          <CreditCard size={26} className="button-icon" />
          <span className="button-tooltip">Offre Premium</span>
        </div>
      </div>

      <Modal show={showPremium} onHide={() => setShowPremium(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🚀 Passez à Premium</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PremiumBanner />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FloatingButtons;