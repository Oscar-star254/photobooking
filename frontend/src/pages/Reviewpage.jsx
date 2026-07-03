import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function ReviewPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: "", package_name: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get("/reviews")
      .then(r => setReviews(r.data.reviews))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to leave a review"); return; }
    setLoading(true);
    try {
      await api.post("/reviews", form);
      toast.success("Review submitted! Thank you");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Leave a Review</h1>
        <p className="text-gray-400 font-body mb-8">Share your experience with LensKenya</p>

        {!submitted ? (
          <div className="card mb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                    >
                      <Star className={`w-8 h-8 transition-colors ${star <= form.rating ? "fill-brand-400 text-brand-400" : "text-gray-600"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Package</label>
                <select
                  value={form.package_name}
                  onChange={e => setForm({ ...form, package_name: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select package</option>
                  <option value="Graduation Shoot">Graduation Shoot</option>
                  <option value="Wedding Shoot">Wedding Shoot</option>
                  <option value="Birthday Shoot">Birthday Shoot</option>
                  <option value="Studio Portrait">Studio Portrait</option>
                  <option value="Event Coverage">Event Coverage</option>
                </select>
              </div>
              <div>
                <label className="label">Your Review</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Tell us about your experience..."
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        ) : (
          <div className="card text-center py-10 mb-10">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Thank you!</h3>
            <p className="text-gray-400 font-body">Your review has been submitted.</p>
          </div>
        )}

        <h2 className="font-display text-2xl font-bold text-white mb-6">Client Reviews</h2>
        {reviews.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-400 font-body">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
                    <span className="text-brand-400 font-bold">{r.full_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-white font-body font-medium">{r.full_name}</div>
                    <div className="text-gray-500 text-xs font-body">{r.package_name}</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm font-body">"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
