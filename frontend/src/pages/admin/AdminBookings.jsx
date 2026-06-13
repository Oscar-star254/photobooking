import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ChevronDown, Image, Plus } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const BADGE = {
  pending:   "badge-pending",
  confirmed: "badge-confirmed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");
  const [creating, setCreating] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = (status = "") => {
    setLoading(true);
    api.get(`/admin/bookings${status ? `?status=${status}` : ""}`)
      .then(r => setBookings(r.data.bookings))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(filter); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      toast.success(`Booking marked as ${status}`);
      fetchBookings(filter);
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const createGallery = async (bookingId) => {
    setCreating(bookingId);
    try {
      await api.post(`/admin/bookings/${bookingId}/gallery`, {});
      toast.success("Gallery created!");
      navigate(`/admin/gallery/${bookingId}`);
    } catch (err) {
      if (err.response?.data?.gallery_id) {
        navigate(`/admin/gallery/${bookingId}`);
      } else {
        toast.error(err.response?.data?.error || "Failed to create gallery");
      }
    } finally {
      setCreating(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">All Bookings</h1>
          <p className="text-gray-400 font-body text-sm mt-0.5">{bookings.length} booking(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors
              ${filter === "" ? "bg-brand-500 text-white" : "bg-dark-600 text-gray-400 hover:text-white"}`}>
            All
          </button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium capitalize transition-colors
                ${filter === s ? "bg-brand-500 text-white" : "bg-dark-600 text-gray-400 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-400 font-body">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-display font-semibold text-white">{b.package_name}</h3>
                    <span className={BADGE[b.status] || "badge-pending"}>{b.status}</span>
                    <span className={b.payment_status === "paid" ? "badge-paid" : "badge-unpaid"}>
                      {b.payment_status}
                    </span>
                  </div>
                  <p className="text-brand-400 text-sm font-body font-medium mb-2">
                    {b.client_name} — {b.client_email}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-body">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(b.booking_date).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {b.location}
                    </span>
                    <span className="text-brand-300 font-medium">
                      KES {b.package_price?.toLocaleString()}
                    </span>
                  </div>
                  {b.notes && (
                    <p className="text-gray-500 text-xs font-body mt-2 italic">"{b.notes}"</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className="relative group">
                    <button className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5">
                      Update Status <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-36 bg-dark-600 border border-white/10 rounded-lg shadow-xl z-10
                      hidden group-hover:block">
                      {STATUSES.filter(s => s !== b.status).map(s => (
                        <button key={s} onClick={() => updateStatus(b.id, s)}
                          className="w-full text-left px-4 py-2 text-sm font-body text-gray-300 hover:text-white hover:bg-white/5 capitalize first:rounded-t-lg last:rounded-b-lg">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {b.gallery_id ? (
                    <button onClick={() => navigate(`/admin/gallery/${b.id}`)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5" /> Manage Gallery
                    </button>
                  ) : (
                    <button onClick={() => createGallery(b.id)} disabled={creating === b.id}
                      className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 border border-white/10">
                      <Plus className="w-3.5 h-3.5" />
                      {creating === b.id ? "Creating..." : "Create Gallery"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}