import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import api from "../services/api";

const CATEGORIES = ["All", "Graduation", "Weddings", "Portraits", "Events", "Corporate", "Birthday"];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/portfolio")
      .then((r) => setPhotos(r.data.photos))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All" ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={filtered[lightbox]?.url} alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          <button className="absolute top-6 right-6 text-gray-400 hover:text-white text-2xl"
            onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}

      <div className="pt-28 pb-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">Our Work</span>
            <h1 className="section-title mt-2">Photography Portfolio</h1>
            <p className="section-subtitle mx-auto">A curated selection of our finest work.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-body font-medium transition-all duration-200
                  ${activeCategory === cat
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "bg-dark-700 text-gray-400 hover:text-white border border-white/5"}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">No photos yet</h3>
              <p className="text-gray-400 font-body">Portfolio photos will appear here once uploaded.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
              {filtered.map((item, i) => (
                <div key={item.id} className="break-inside-avoid relative group cursor-pointer"
                  onClick={() => setLightbox(i)}>
                  <img src={item.url} alt={item.title}
                    className="w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end p-4">
                    <div>
                      <p className="text-white font-display font-semibold text-sm">{item.title}</p>
                      <p className="text-brand-300 text-xs font-body mt-0.5">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <p className="text-gray-400 font-body mb-5">Love what you see? Let's create your story.</p>
            <Link to="/book" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              Book a Session <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}