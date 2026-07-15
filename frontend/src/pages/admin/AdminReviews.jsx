import { useEffect, useState } from "react";
import { Star, Trash2, Search } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminReviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");
  const [search, setSearch]     = useState("");
  const [stats, setStats]       = useState({ total: 0, average: 0 });

  const fetchReviews = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.append("rating", filter);
    if (search) params.append("search", search);

    api.get(`/reviews?${params}`)
      .then(r => {
        setReviews(r.data.reviews);
        setStats({ total: r.data.total, average: r.data.average });
      })
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [filter, search]);

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Client Reviews</h1>
        <p className="text-gray-400 font-body mt-1">
          {stats.total} reviews · Average: {stats.average}⭐
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[5, 4, 3, 2, 1].slice(0, 4).map((star) => {
          const count = reviews.filter(r => r.rating === star).length;
          return (
            <div key={star} className="card text-center">
              <div className="text-2xl font-display font-bold text-brand-400">{count}</div>
              <div className="flex justify-center gap-0.5 mt-1">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 w-56"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors
              ${filter === "" ? "bg-brand-500 text-white" : "bg-dark-600 text-gray-400 hover:text-white"}`}>
            All
          </button>
          {[5, 4, 3, 2, 1].map(s => (
            <button key={s} onClick={() => setFilter(String(s))}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors flex items-center gap-1
                ${filter === String(s) ? "bg-brand-500 text-white" : "bg-dark-600 text-gray-400 hover:text-white"}`}>
              {s}⭐
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-gray-400 font-body">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-brand-400 font-bold text-sm">{r.full_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-white font-body font-medium">{r.full_name}</div>
                    <div className="text-gray-500 text-xs font-body">{r.package_name}</div>
                  </div>
                </div>
                <button onClick={() => deleteReview(r.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} />
                ))}
              </div>
              {r.comment && (
                <p className="text-gray-300 text-sm font-body">"{r.comment}"</p>
              )}
              <p className="text-gray-600 text-xs font-body mt-2">
                {r.created_at ? new Date(r.created_at).toLocaleDateString("en-KE") : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}