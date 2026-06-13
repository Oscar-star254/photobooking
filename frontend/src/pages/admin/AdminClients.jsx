import { useEffect, useState } from "react";
import { Users, Phone, Mail } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    api.get("/admin/clients")
      .then(r => setClients(r.data.clients))
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Clients</h1>
          <p className="text-gray-400 font-body text-sm mt-0.5">{clients.length} registered client(s)</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-full sm:w-72"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-body">No clients found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-4 text-gray-400 font-medium">Client</th>
                  <th className="px-5 py-4 text-gray-400 font-medium">Phone</th>
                  <th className="px-5 py-4 text-gray-400 font-medium">Bookings</th>
                  <th className="px-5 py-4 text-gray-400 font-medium">Joined</th>
                  <th className="px-5 py-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-brand-400 font-bold text-xs">{c.full_name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{c.full_name}</div>
                          <div className="text-gray-500 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />{c.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />{c.phone}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-brand-500/10 text-brand-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {c.booking_count} booking(s)
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("en-KE") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={c.is_active ? "badge-completed" : "badge-cancelled"}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}