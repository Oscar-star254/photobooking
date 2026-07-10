import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, Phone, Package } from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import BookingCalendar from "../components/booking/BookingCalendar";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function BookingPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [packages, setPackages]   = useState({});
  const [selected, setSelected]   = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ location: "", phone: user?.phone || "", notes: "" });
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.get("/bookings/packages")
      .then(r => setPackages(r.data.packages))
      .catch(() => {});
  }, []);

  const handleCalendarSelect = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time || selectedTime);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!selected) { toast.error("Please select a package"); return; }
    if (!selectedDate) { toast.error("Please select a date"); return; }
    if (!selectedTime) { toast.error("Please select a time slot"); return; }

    setLoading(true);
    try {
      const booking_date = `${selectedDate}T${selectedTime}:00`;
      await api.post("/bookings/", {
        package_key: selected,
        booking_date,
        location: form.location,
        phone: form.phone,
        notes: form.notes,
      });
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
          <p className="text-gray-400 font-body mb-2">
            📅 {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-KE", { dateStyle: "full" })}
          </p>
          <p className="text-gray-400 font-body mb-8">
            🕐 {selectedTime}
          </p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Go to Dashboard
          </button>
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
            <p className="section-subtitle mx-auto">Choose your package, pick a date and time.</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[
              { num: 1, label: "Package" },
              { num: 2, label: "Date & Time" },
              { num: 3, label: "Details" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all
                    ${step === s.num
                      ? "bg-brand-500 text-white"
                      : step > s.num
                        ? "bg-green-500/20 text-green-400"
                        : "bg-dark-600 text-gray-400"
                    }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${step === s.num ? "bg-white/20" : step > s.num ? "bg-green-500/30" : "bg-dark-500"}`}>
                    {step > s.num ? "✓" : s.num}
                  </span>
                  {s.label}
                </button>
                {i < 2 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">

            {/* Step 1 — Package Selection */}
            {step === 1 && (
              <div>
                <h3 className="font-display text-xl font-semibold text-white mb-5 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-400" /> Choose Your Package
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                <button
                  onClick={() => { if (!selected) { toast.error("Please select a package"); return; } setStep(2); }}
                  className="btn-primary w-full py-4"
                >
                  Continue to Date Selection →
                </button>
              </div>
            )}

            {/* Step 2 — Calendar */}
            {step === 2 && (
              <div>
                <h3 className="font-display text-xl font-semibold text-white mb-5">
                  📅 Pick a Date & Time
                </h3>
                <BookingCalendar
                  onSelect={handleCalendarSelect}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                />
                <button
                  onClick={() => {
                    if (!selectedDate) { toast.error("Please select a date"); return; }
                    if (!selectedTime) { toast.error("Please select a time slot"); return; }
                    setStep(3);
                  }}
                  className="btn-primary w-full py-4 mt-6"
                >
                  Continue to Details →
                </button>
              </div>
            )}

            {/* Step 3 — Details */}
            {step === 3 && (
              <div className="card">
                <h3 className="font-display text-xl font-semibold text-white mb-2">Session Details</h3>

                {/* Summary */}
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-4 mb-6">
                  <p className="text-brand-400 font-body text-sm font-medium">Booking Summary</p>
                  <div className="mt-2 space-y-1 text-gray-300 text-sm font-body">
                    <p>📦 Package: <span className="text-white font-medium">{packages[selected]?.name}</span></p>
                    <p>📅 Date: <span className="text-white font-medium">
                      {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("en-KE", { dateStyle: "full" })}
                    </span></p>
                    <p>🕐 Time: <span className="text-white font-medium">{selectedTime}</span></p>
                    <p>💰 Price: <span className="text-brand-400 font-semibold">KES {packages[selected]?.price?.toLocaleString()}</span></p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="label flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number (M-Pesa)
                    </label>
                    <input type="tel" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="input-field" placeholder="0712 345 678" required />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Location / Venue
                    </label>
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
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1 py-4">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 py-4">
                      {loading ? "Submitting..." : "Submit Booking"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}