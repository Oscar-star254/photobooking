import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Image, Lock, Unlock, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function MyGallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/galleries/my")
      .then(r => setGalleries(r.data.galleries))
      .catch(() => toast.error("Failed to load galleries"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-dark-900 lg:ml-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 lg:ml-64 p-6">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Galleries</h1>
          <p className="text-gray-400 font-body text-sm mt-0.5">{galleries.length} gallery(s)</p>
        </div>
      </div>

      {galleries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🖼️</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">No galleries yet</h3>
          <p className="text-gray-400 font-body mb-6">
            Your galleries will appear here after your photo session is complete.
          </p>
          <Link to="/book" className="btn-primary">Book a Session</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleries.map((g) => (
            <Link
              key={g.id}
              to={`/dashboard/gallery/${g.id}`}
              className="card group hover:border-brand-500/30 hover:bg-dark-600 transition-all duration-200"
            >
              <div className="w-full h-40 bg-dark-600 rounded-lg mb-4 overflow-hidden relative">
                {g.cover_url ? (
                  <img
                    src={g.cover_url}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-body font-medium flex items-center gap-1
                  ${g.is_paid ? "bg-green-500/80 text-white" : "bg-black/70 text-gray-300"}`}>
                  {g.is_paid ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {g.is_paid ? "Unlocked" : "Locked"}
                </div>
              </div>

              <h3 className="font-display font-semibold text-white mb-1 truncate">{g.title}</h3>
              <p className="text-gray-500 text-sm font-body">{g.photo_count} photo(s)</p>

              {!g.is_paid && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-brand-400 text-xs font-body font-medium">
                    Pay with M-Pesa to unlock downloads →
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}