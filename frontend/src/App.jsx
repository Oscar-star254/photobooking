import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import PortfolioPage from "./pages/PortfolioPage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";
import ClientDashboard from "./pages/client/ClientDashboard";
import MyBookings from "./pages/client/MyBookings";
import MyGallery from "./pages/client/MyGallery";
import GalleryView from "./pages/client/GalleryView";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminClients from "./pages/admin/AdminClients";
import AdminGallery from "./pages/admin/AdminGallery";
import { useEffect } from "react";

function WhatsAppButton() {
  useEffect(() => {
    const btn = document.createElement("a");
    btn.href = "https://wa.me/254758695620";
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.id = "whatsapp-btn";
    btn.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,0.4);text-decoration:none;";
    const img = document.createElement("img");
    img.src = "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";
    img.alt = "WhatsApp";
    img.style.cssText = "width:32px;height:32px;";
    btn.appendChild(img);
    document.body.appendChild(btn);
    return () => {
      const el = document.getElementById("whatsapp-btn");
      if (el) el.remove();
    };
  }, []);
  return null;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reviews" element={<ReviewPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><ClientDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/bookings" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />
        <Route path="/dashboard/galleries" element={
          <ProtectedRoute><MyGallery /></ProtectedRoute>
        } />
        <Route path="/dashboard/gallery/:galleryId" element={
          <ProtectedRoute><GalleryView /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>
        } />
        <Route path="/admin/clients" element={
          <ProtectedRoute role="admin"><AdminClients /></ProtectedRoute>
        } />
        <Route path="/admin/gallery/:bookingId" element={
          <ProtectedRoute role="admin"><AdminGallery /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <WhatsAppButton />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: "#d4881e", secondary: "#fff" } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
