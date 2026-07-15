import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

export default function ReviewPage() {
  const { user } = useAuth();
  const [reviews, setReviews]     = useState([]);
  const [stats, setStats]         = useState({ total: 0, average: 0 });
  const [bookings, setBookings]   = useState([]);
  const [form, setForm]           = useState({ booking_id: "", rating: 0, comment: "" });
  const [hover, setHover]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get("/reviews")
      .then(r => {
        setReviews(r.data.reviews);
        setStats({ total: r.data.total, average: r.data.average });
      })
      .catch(() => {});

    if (user) {
      api.get("/bookings/my")
        .then(r => {
          const paid = r.data.bookings.filter(b => b.payment_status === "paid");
          setBookings(paid);
          if (paid.length > 0) {
            setForm(prev => ({ ...prev, booking_id: paid[0].id }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to leave a review"); return; }
    if (!form.rating) { toast.error("Please select a star rating"); return; }
    if (!form.booking_id) { toast.error("Please select a booking"); return; }

    setLoading(true);
    try {
      await api.post("/reviews", {
        booking_id: form.booking_id,
        rating:     form.rating,
        comment:    form.comment,
      });
      toast.success("Review submitted! Thank you 🎉");
      setSubmitted(true);
      api.get("/reviews").then(r => {
        setReviews(r.data.reviews);
        setStats({ total: r.data.total, average: r.data.average });
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">Verified Reviews</span>
            <h1 className="font-display text-3xl font-bold text-white mt-2 mb-2">Client Reviews</h1>
            {stats.total > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(stats.average) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} />
                  ))}
                </div>
                <span className="text-white font-body font-semibold">{stats.average}</span>
                <span className="text-gray-400 font-body text-sm">({stats.total} reviews)</span>
              </div>
            )}
          </div>

          {/* Review Form */}
          {user ? (
            !submitted ? (
              <div className="card mb-10">
                <h2 className="font-display text-xl font-bold text-white mb-1">Leave a Review</h2>
                <p className="text-gray-400 font-body text-sm mb-6">Only verified clients with paid bookings can review</p>

                {bookings.length === 0 ? (
                  <div className="text-center py-6 bg-dark-600 rounded-xl">
                    <p className="text-gray-400 font-body text-sm mb-3">You need a completed paid booking to leave a review.</p>
                    <Link to="/book" className="btn-primary text-sm py-2 px-4">Book a Session</Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="label">Select Booking</label>
                      <select
                        value={form.booking_id}
                        onChange={e => setForm({ ...form, booking_id: e.target.value })}
                        className="input-field"
                        required
                      >
                        {bookings.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.package_name} — {new Date(b.booking_date).toLocaleDateString("en-KE")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setForm({ ...form, rating: star })}
                            className="transition-transform hover:scale-110"
                          >
                            <Star className={`w-9 h-9 transition-colors ${star <= (hover || form.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} />
                          </button>
                        ))}
                      </div>
                      {form.rating > 0 && (
                        <p className="text-brand-400 text-sm font-body mt-1">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][form.rating]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Your Review (optional)</label>
                      <textarea
                        value={form.comment}
                        onChange={e => setForm({ ...form, comment: e.target.value })}
                        className="input-field resize-none"
                        rows={4}
                        placeholder="Tell us about your experience..."
                      />
                    </div>

                    <button type="submit" disabled={loading || !form.rating} className="btn-primary w-full">
                      {loading ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="card text-center py-10 mb-10">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Thank you!</h3>
                <p className="text-gray-400 font-body">Your review has been submitted and is now live.</p>
              </div>
            )
          ) : (
            <div className="card text-center py-8 mb-10">
              <p className="text-gray-400 font-body mb-4">Please login to leave a review</p>
              <Link to="/login" className="btn-primary">Sign In</Link>
            </div>
          )}

          {/* Reviews List */}
          <h2 className="font-display text-2xl font-bold text-white mb-6">
            All Reviews {stats.total > 0 && <span className="text-gray-500 text-lg">({stats.total})</span>}
          </h2>

          {reviews.length === 0 ? (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-gray-400 font-body">No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="card hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-brand-400 font-bold">{r.full_name?.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-white font-body font-medium">{r.full_name}</div>
                        <div className="text-gray-500 text-xs font-body">{r.package_name}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-gray-300 text-sm font-body leading-relaxed">"{r.comment}"</p>
                  )}
                  <p className="text-gray-600 text-xs font-body mt-2">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("en-KE", { dateStyle: "medium" }) : ""}
                    {r.package_name && <span className="ml-2 text-brand-500/60">· {r.package_name}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}