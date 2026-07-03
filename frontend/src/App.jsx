import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage     from "./pages/LandingPage";
import PortfolioPage   from "./pages/PortfolioPage";
import BookingPage     from "./pages/BookingPage";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import ReviewPage      from "./pages/ReviewPage";

import ClientDashboard from "./pages/client/ClientDashboard";
import MyBookings      from "./pages/client/MyBookings";
import MyGallery       from "./pages/client/MyGallery";
import GalleryView     from "./pages/client/GalleryView";

import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminBookings   from "./pages/admin/AdminBookings";
import AdminClients    from "./pages/admin/AdminClients";
import AdminGallery    from "./pages/admin/AdminGallery";

function WhatsAppButton() {
  const phone = "254700000000";
  const message = "Hi LensKenya! I'd like to book a photography session.";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        width: "56px",
        height: "56px",
        backgroundColor: "#25D366",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
        textDecoration: "none",
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        style={{ width: "32px", height: "32px" }}
      />
    </a>
  );
}
