import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-white/95 backdrop-blur">
      <div className="page-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-body text-brand-500 uppercase tracking-[0.32em]">LensKenya</p>
            <p className="text-sm font-medium text-slate-950">Photography</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <Link to="/portfolio" className="hover:text-brand-500">Portfolio</Link>
          <Link to="/book" className="hover:text-brand-500">Book</Link>
          <Link to="/login" className="hover:text-brand-500">Sign In</Link>
          <Link to="/register" className="btn-primary px-5 py-2">Register</Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden text-slate-700"
          aria-label="Toggle navigation">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-white/95">
          <div className="page-container flex flex-col gap-3 py-4 text-slate-700">
            <Link onClick={() => setMenuOpen(false)} to="/" className="block hover:text-brand-500">Home</Link>
            <Link onClick={() => setMenuOpen(false)} to="/portfolio" className="block hover:text-brand-500">Portfolio</Link>
            <Link onClick={() => setMenuOpen(false)} to="/book" className="block hover:text-brand-500">Book</Link>
            <Link onClick={() => setMenuOpen(false)} to="/login" className="block hover:text-brand-500">Sign In</Link>
            <Link
              onClick={() => setMenuOpen(false)}
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2 text-white hover:bg-brand-400">
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
