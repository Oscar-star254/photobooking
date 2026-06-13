import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Package, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  pending:   "badge-pending",
  confirmed: "badge-confirmed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/bookings/my")
      .then(r => setBookings(r.data.bookings))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-900 lg:ml-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 lg:ml-64 p-6">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-gray-400 font-body text-sm mt-0.5">{bookings.length} total booking(s)</p>
        </div>
        <Link to="/book" className="btn-primary ml-auto text-sm py-2 px-4">+ New Booking</Link>
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">No bookings yet</h3>
          <p className="text-gray-400 font-body mb-6">Book your first photography session today</p>
          <Link to="/book" className="btn-primary">Book Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card hover:border-white/10 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display font-semibold text-white">{b.package_name}</h3>
                    <span className={STATUS_BADGE[b.status] || "badge-pending"}>{b.status}</span>
                    <span className={b.payment_status === "paid" ? "badge-paid" : "badge-unpaid"}>
                      {b.payment_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-body">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(b.booking_date).toLocaleDateString("en-KE", { dateStyle: "full" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {b.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      KES {b.package_price?.toLocaleString()}
                    </span>
                  </div>
                  {b.notes && (
                    <p className="text-gray-500 text-sm font-body mt-2 italic">"{b.notes}"</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {b.gallery_id && (
                    <Link to={`/dashboard/gallery/${b.gallery_id}`} className="btn-primary text-sm py-1.5 px-4">
                      View Gallery
                    </Link>
                  )}
                  {["pending", "confirmed"].includes(b.status) && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                      Cancel booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}