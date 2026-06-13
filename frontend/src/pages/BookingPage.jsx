import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, MapPin, Phone, Package } from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState({});
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState({ booking_date: "", location: "", phone: user?.phone || "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get("/bookings/packages").then(r => setPackages(r.data.packages)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!selected) { toast.error("Please select a package"); return; }
    setLoading(true);
    try {
      await api.post("/bookings/", { package_key: selected, ...form });
      setSubmitted(true);
      toast.success("Booking submitted!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Booking Submitted!</h2>
          <p className="text-gray-400 font-body mb-8">We'll confirm within 24 hours. Check your dashboard for updates.</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">Go to Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <h1 className="section-title">Book a Session</h1>
            <p className="section-subtitle mx-auto">Choose your package and pick a date.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h3 className="font-display text-xl font-semibold text-white mb-5 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-400" /> Choose Your Package
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(packages).map(([key, pkg]) => (
                  <button key={key} onClick={() => setSelected(key)}
                    className={`card text-left transition-all duration-200 cursor-pointer
                      ${selected === key ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500" : "hover:border-brand-500/30"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-display font-semibold text-white">{pkg.name}</h4>
                      {selected === key && <CheckCircle className="w-5 h-5 text-brand-400 shrink-0" />}
                    </div>
                    <p className="text-gray-400 text-sm font-body mb-3">{pkg.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-400 font-body font-semibold">KES {pkg.price?.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs font-body">{pkg.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-display text-xl font-semibold text-white mb-6">Session Details</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Preferred Date & Time</label>
                    <input type="datetime-local" value={form.booking_date}
                      onChange={e => setForm({ ...form, booking_date: e.target.value })}
                      className="input-field" required min={new Date().toISOString().slice(0, 16)} />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number (M-Pesa)</label>
                    <input type="tel" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="input-field" placeholder="0712 345 678" required />
                  </div>
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location / Venue</label>
                  <input type="text" value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="input-field" placeholder="e.g. University of Nairobi Main Campus" required />
                </div>
                <div>
                  <label className="label">Additional Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="input-field resize-none" rows={3}
                    placeholder="Any special requests..." />
                </div>
                {!user && (
                  <p className="text-yellow-400 text-sm font-body bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                    You need to <a href="/login" className="underline">sign in</a> to submit a booking.
                  </p>
                )}
                <button type="submit" disabled={loading || !selected} className="btn-primary w-full py-4 text-base">
                  {loading ? "Submitting..." : "Submit Booking Request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}