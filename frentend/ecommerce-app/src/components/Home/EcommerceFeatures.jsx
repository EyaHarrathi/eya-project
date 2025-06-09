import React from "react";
import { BsLightningCharge, BsPhone } from "react-icons/bs";
import { FiSliders } from "react-icons/fi";
import { GiModernCity } from "react-icons/gi";

const EcommerceFeatures = () => {
  const features = [
    {
      icon: <BsLightningCharge className="text-primary" size={48} />,
      title: "Fast Shopping",
      text: "Experience lightning-fast, seamless shopping with our optimized platform.",
    },
    {
      icon: <FiSliders className="text-success" size={48} />,
      title: "Customizable",
      text: "Tailor your shopping experience with personalized recommendations.",
    },
    {
      icon: <BsPhone className="text-info" size={48} />,
      title: "Mobile Friendly",
      text: "Shop effortlessly on any device with our responsive design.",
    },
    {
      icon: <GiModernCity className="text-warning" size={48} />,
      title: "Modern Design",
      text: "Enjoy a sleek, intuitive interface crafted for modern shoppers.",
    },
  ];

  return (
    <main className="container my-5">
      <section className="row g-4 justify-content-center">
        {features.map((feature, index) => (
          <div key={index} className="col-lg-3 col-md-6">
            <div
              className="card h-100 border-0 shadow-lg rounded-lg p-4 feature-card"
              style={{
                background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
              }}
            >
              <div className="card-body text-center d-flex flex-column align-items-center">
                <div className="feature-icon mb-4 p-3 rounded-circle">
                  {feature.icon}
                </div>
                <h4 className="card-title mb-3 fw-bold">{feature.title}</h4>
                <p className="card-text text-muted">{feature.text}</p>
                <button className="btn btn-outline-primary mt-auto px-4 py-2 rounded-pill">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <style jsx>{`
        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 15px;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
        }

        .feature-icon {
          background: rgba(var(--bs-primary-rgb), 0.1);
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }

        .btn-outline-primary {
          transition: all 0.3s ease;
        }

        .btn-outline-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(var(--bs-primary-rgb), 0.2);
        }
      `}</style>
    </main>
  );
};

export default EcommerceFeatures;