import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Welcome to LensKenya 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">Lens<span className="text-brand-400">Kenya</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 font-body mt-2">Start booking and managing your photos</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.full_name} onChange={update("full_name")}
                className="input-field" placeholder="Jane Mwangi" required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={update("email")}
                className="input-field" placeholder="jane@example.com" required />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" value={form.phone} onChange={update("phone")}
                className="input-field" placeholder="0712 345 678" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={update("password")}
                  className="input-field pr-12" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm font-body mt-5">
            Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}