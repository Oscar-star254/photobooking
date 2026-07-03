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
  return (
    
      href="https://wa.me/254700000000?text=Hi%20LensKenya!%20I'd%20like%20to%20book%20a%20photography%20session."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group"
    >
      <span className="hidden group-hover:flex bg-white text-gray-800 text-sm font-body font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
        Chat with us!
      </span>
      <div className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 transition-all duration-200 hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
