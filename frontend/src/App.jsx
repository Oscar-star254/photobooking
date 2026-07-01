import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage     from "./pages/LandingPage";
import PortfolioPage   from "./pages/PortfolioPage";
import BookingPage     from "./pages/BookingPage";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";

import ClientDashboard from "./pages/client/ClientDashboard";
import MyBookings      from "./pages/client/MyBookings";
import MyGallery       from "./pages/client/MyGallery";
import GalleryView     from "./pages/client/GalleryView";

import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminBookings   from "./pages/admin/AdminBookings";
import AdminClients    from "./pages/admin/AdminClients";
import AdminGallery    from "./pages/admin/AdminGallery";
import WhatsAppButton from "./components/WhatsAppButton";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-body text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/"          element={<LandingPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/book"      element={<BookingPage />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/register"  element={<RegisterPage />} />

      {/* Client */}
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

      {/* Admin */}
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
    <WhatsAppButton />
  );
}
