import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Image, LogOut, Camera, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const NAV = [
  { label: "Overview",  path: "/dashboard",           icon: LayoutDashboard },
  { label: "Bookings",  path: "/dashboard/bookings",  icon: Calendar },
  { label: "Galleries", path: "/dashboard/galleries", icon: Image },
];

function Sidebar({ open, setOpen }) {
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
        <div className="p-5 border-b border-white/5">
          <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center mb-3">
            <span className="font-display font-bold text-brand-400 text-sm">{user?.full_name?.charAt(0)}</span>
          </div>
          <div className="font-body font-medium text-white text-sm">{user?.full_name}</div>
          <div className="text-gray-500 text-xs font-body mt-0.5">{user?.email}</div>
        </div>
        <nav className="p-4 flex-1">
          {NAV.map(({ label, path, icon: Icon }) => {
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

export default function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/bookings/my"), api.get("/galleries/my")])
      .then(([b, g]) => setStats({
        totalBookings: b.data.bookings.length,
        pendingBookings: b.data.bookings.filter(x => x.status === "pending").length,
        galleries: g.data.galleries.length,
        paidGalleries: g.data.galleries.filter(x => x.is_paid).length,
      }))
      .catch(() => {});
  }, []);

  const CARDS = [
    { label: "Total Bookings",     value: stats?.totalBookings   ?? "—", color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Pending Bookings",   value: stats?.pendingBookings ?? "—", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Your Galleries",     value: stats?.galleries       ?? "—", color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Unlocked Galleries", value: stats?.paidGalleries   ?? "—", color: "text-green-400",  bg: "bg-green-500/10" },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-dark-800 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400"><Menu className="w-5 h-5" /></button>
          <span className="font-display font-bold text-white text-sm">LensKenya</span>
          <div className="w-5" />
        </div>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-white">
              Welcome back, {user?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-400 font-body mt-1">Manage your bookings and photo galleries</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {CARDS.map((c) => (
              <div key={c.label} className="card">
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                  <span className={`font-display font-bold text-lg ${c.color}`}>{c.value}</span>
                </div>
                <div className="text-gray-400 text-sm font-body">{c.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onClick={() => navigate("/book")}
              className="card cursor-pointer hover:border-brand-500/30 hover:bg-dark-600 transition-all">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-display font-semibold text-white mb-1">Book a Session</h3>
              <p className="text-gray-400 text-sm font-body">Schedule a new photography session</p>
            </div>
            <div onClick={() => navigate("/dashboard/galleries")}
              className="card cursor-pointer hover:border-brand-500/30 hover:bg-dark-600 transition-all">
              <div className="text-3xl mb-3">🖼️</div>
              <h3 className="font-display font-semibold text-white mb-1">View Galleries</h3>
              <p className="text-gray-400 text-sm font-body">Access your private photo galleries</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}