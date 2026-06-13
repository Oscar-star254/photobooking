import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Camera, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ADMIN_NAV = [
  { label: "Dashboard", path: "/admin",          icon: LayoutDashboard },
  { label: "Bookings",  path: "/admin/bookings", icon: Calendar },
  { label: "Clients",   path: "/admin/clients",  icon: Users },
];

export function AdminSidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-white/5 z-50
        transform transition-transform duration-300 flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">Lens<span className="text-brand-400">Kenya</span></span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 mx-4 my-3 bg-brand-500/10 border border-brand-500/20 rounded-lg">
          <div className="text-brand-400 text-xs font-body font-semibold uppercase tracking-widest mb-1">Admin Panel</div>
          <div className="text-white text-sm font-body font-medium">{user?.full_name}</div>
        </div>

        <nav className="p-4 flex-1">
          {ADMIN_NAV.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-body font-medium transition-colors
                  ${active ? "bg-brand-500/15 text-brand-400" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-body text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-dark-900 flex">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-dark-800 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400"><Menu className="w-5 h-5" /></button>
          <span className="font-display font-bold text-white text-sm">Admin</span>
          <div className="w-5" />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}