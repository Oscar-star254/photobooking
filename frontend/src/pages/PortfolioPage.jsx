import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

const CATEGORIES = ["All", "Graduation", "Weddings", "Portraits", "Events"];

const PORTFOLIO = [
  { id: 1, category: "Graduation", title: "Campus Graduation",  src: "https://images.unsplash.com/photo-1627556704302-624286467c65?w=600&q=80" },
  { id: 2, category: "Weddings",   title: "Garden Wedding",     src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80" },
  { id: 3, category: "Portraits",  title: "Studio Portrait",    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80" },
  { id: 4, category: "Events",     title: "Corporate Event",    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80" },
  { id: 5, category: "Graduation", title: "Outdoor Ceremony",   src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80" },
  { id: 6, category: "Portraits",  title: "Natural Light",      src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80" },
  { id: 7, category: "Weddings",   title: "Ceremony Aisle",     src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80" },
  { id: 8, category: "Events",     title: "Birthday Party",     src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80" },
  { id: 9, category: "Portraits",  title: "Professional Shot",  src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const filtered = activeCategory === "All" ? PORTFOLIO : PORTFOLIO.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={filtered[lightbox]?.src?.replace("w=600", "w=1200")} alt=""
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

          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {filtered.map((item, i) => (
              <div key={item.id} className="break-inside-avoid relative group cursor-pointer"
                onClick={() => setLightbox(i)}>
                <img src={item.src} alt={item.title}
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