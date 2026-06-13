import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Image, DollarSign, Clock, CheckCircle, TrendingUp, Camera } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  pending:   "badge-pending",
  confirmed: "badge-confirmed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics")
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const a = data?.analytics;

  const CARDS = [
    { label: "Total Bookings",    value: a?.total_bookings,    icon: Calendar,    color: "text-blue-400",    bg: "bg-blue-500/10" },
    { label: "Total Clients",     value: a?.total_clients,     icon: Users,       color: "text-purple-400",  bg: "bg-purple-500/10" },
    { label: "Total Revenue",     value: a ? `KES ${(a.total_revenue || 0).toLocaleString()}` : "—", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Pending Bookings",  value: a?.pending_bookings,  icon: Clock,       color: "text-yellow-400",  bg: "bg-yellow-500/10" },
    { label: "Confirmed",         value: a?.confirmed_bookings,icon: CheckCircle, color: "text-brand-400",   bg: "bg-brand-500/10" },
    { label: "Total Galleries",   value: a?.total_galleries,   icon: Image,       color: "text-pink-400",    bg: "bg-pink-500/10" },
    { label: "Photos Stored",     value: a?.total_photos,      icon: Camera,      color: "text-cyan-400",    bg: "bg-cyan-500/10" },
    { label: "Completed Sessions",value: a?.completed_bookings,icon: TrendingUp,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 font-body mt-1">Overview of your photography business</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {CARDS.map((c) => (
              <div key={c.label} className="card">
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <div className={`font-display text-2xl font-bold ${c.color} mb-1`}>{c.value ?? "—"}</div>
                <div className="text-gray-500 text-sm font-body">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Link to="/admin/bookings" className="card hover:border-brand-500/30 hover:bg-dark-600 transition-all cursor-pointer">
              <Calendar className="w-6 h-6 text-brand-400 mb-3" />
              <h3 className="font-display font-semibold text-white mb-1">Manage Bookings</h3>
              <p className="text-gray-400 text-sm font-body">Approve, confirm or cancel bookings</p>
            </Link>
            <Link to="/admin/clients" className="card hover:border-brand-500/30 hover:bg-dark-600 transition-all cursor-pointer">
              <Users className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="font-display font-semibold text-white mb-1">View Clients</h3>
              <p className="text-gray-400 text-sm font-body">Browse all registered clients</p>
            </Link>
            <Link to="/book" className="card hover:border-brand-500/30 hover:bg-dark-600 transition-all cursor-pointer">
              <Camera className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-display font-semibold text-white mb-1">Test Booking</h3>
              <p className="text-gray-400 text-sm font-body">Preview the booking flow</p>
            </Link>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-white">Recent Bookings</h2>
              <Link to="/admin/bookings" className="text-brand-400 text-sm font-body hover:text-brand-300">View all →</Link>
            </div>
            {data?.recent_bookings?.length === 0 ? (
              <p className="text-gray-500 font-body text-sm text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {data?.recent_bookings?.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <span className="font-body font-medium text-white text-sm">{b.client}</span>
                      <span className="text-gray-500 text-xs font-body ml-2">— {b.package}</span>
                    </div>
                    <span className={STATUS_BADGE[b.status] || "badge-pending"}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}