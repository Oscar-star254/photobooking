import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Camera, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  const navLinks = [
    { label: "Home",      path: "/" },
    { label: "Portfolio", path: "/portfolio" },
    { label: "Book Now",  path: "/book" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-brand-500/20">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Lens<span className="text-brand-400">Kenya</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors duration-200
                  ${isActive(link.path)
                    ? "text-brand-400 bg-brand-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <div className="w-px h-5 bg-white/10" />
                <span className="text-sm text-gray-400">{user.full_name.split(" ")[0]}</span>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white"
            onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-white/5 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-body font-medium transition-colors
                  ${isActive(link.path) ? "text-brand-400 bg-brand-500/10" : "text-gray-300 hover:text-white"}`}>
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/5 mt-2 pt-2">
              {user ? (
                <>
                  <Link to={user.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-300">Sign In</Link>
                  <Link to="/register" onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-brand-400 font-medium">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}