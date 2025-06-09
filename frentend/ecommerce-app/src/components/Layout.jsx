"use client";
import Sidebar from "./Admin/Sidebar";
import { Container } from "react-bootstrap";
import { useTheme } from "./theme-context";

const Layout = ({ children }) => {
  const { currentTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className={`admin-layout ${currentTheme}`}>
      <Sidebar user={user} />
      <div className="content-area">
        <Container fluid className="py-4">
          {children}
        </Container>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }

        .content-area {
          flex: 1;
          margin-left: 250px;
          overflow-y: auto;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .admin-layout.dark {
          background-color: #121212;
          color: #f8f9fa;
        }

        .admin-layout.light {
          background-color: #f8f9fa;
          color: #212529;
        }

        @media (max-width: 768px) {
          .content-area {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
