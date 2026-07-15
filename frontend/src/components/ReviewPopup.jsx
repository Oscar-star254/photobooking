import { useState, useCallback } from "react";
import { Star, Loader } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ReviewPopup({ bookingId, onClose }) {
  const [rating, setRating]       = useState(0);
  const [hover, setHover]         = useState(0);
  const [comment, setComment]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }
    setLoading(true);
    try {
      await api.post("/reviews", { booking_id: bookingId, rating, comment });
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
      setTimeout(onClose, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        {submitted ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Thank you!</h3>
            <p className="text-gray-400 font-body">Your feedback means a lot to us.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-display text-xl font-bold text-white mb-1">
                We'd Love Your Feedback!
              </h3>
              <p className="text-gray-400 text-sm font-body">
                Thank you for choosing LensKenya. How was your experience?
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-10 h-10 transition-colors
                    ${star <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-600 fill-gray-600"}`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-brand-400 font-body text-sm mb-4">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
              </p>
            )}

            <div className="mb-5">
              <label className="label">Write a review (optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Tell us about your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white font-body text-sm transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !rating}
                className="flex-1 btn-primary py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : "Submit Review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}