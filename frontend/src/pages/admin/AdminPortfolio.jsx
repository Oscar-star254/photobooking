import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Trash2, Image, Loader, X } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Graduation", "Weddings", "Portraits", "Events", "Corporate", "Birthday"];

export default function AdminPortfolio() {
  const [photos, setPhotos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [previews, setPreviews]     = useState([]);
  const [category, setCategory]     = useState("Graduation");
  const [filter, setFilter]         = useState("All");

  const fetchPhotos = useCallback(() => {
    api.get("/portfolio")
      .then(r => setPhotos(r.data.photos || []))
      .catch((err) => {
        console.error("Portfolio load failed", err);
        setPhotos([]);
        toast.error(err.response?.data?.error || "Failed to load portfolio");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const onDrop = useCallback((files) => {
    const newPreviews = files.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
  });

  const removePreview = (index) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async () => {
    if (!previews.length) return;
    setUploading(true);
    setProgress(0);

    let uploaded = 0;
    for (const p of previews) {
      const formData = new FormData();
      formData.append("photo", p.file);
      formData.append("category", category);
      formData.append("title", p.name.split(".")[0]);
      try {
        await api.post("/portfolio/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded++;
        setProgress(Math.round((uploaded / previews.length) * 100));
      } catch (err) {
        console.error(`Upload failed for ${p.name}`, err);
        toast.error(err.response?.data?.error || `Failed to upload ${p.name}`);
      }
    }

    if (uploaded > 0) {
      toast.success(`${uploaded} photo(s) uploaded!`);
    }
    previews.forEach(p => URL.revokeObjectURL(p.preview));
    setPreviews([]);
    setUploading(false);
    fetchPhotos();
  };

  const deletePhoto = async (id) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await api.delete(`/portfolio/${id}`);
      setPhotos(prev => prev.filter(p => p.id !== id));
      toast.success("Photo deleted");
    } catch (err) {
      toast.error("Failed to delete photo");
    }
  };

  const filtered = filter === "All" ? photos : photos.filter(p => p.category === filter);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Portfolio Manager</h1>
        <p className="text-gray-400 font-body mt-1">Upload and manage your portfolio photos</p>
      </div>

      {/* Upload Section */}
      <div className="card mb-8">
        <h2 className="font-display text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Upload className="w-5 h-5 text-brand-400" /> Upload Photos
        </h2>

        <div className="mb-4">
          <label className="label">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
            ${isDragActive ? "border-brand-500 bg-brand-500/10" : "border-white/10 hover:border-brand-500/50"}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          {isDragActive ? (
            <p className="text-brand-400 font-body font-medium">Drop photos here...</p>
          ) : (
            <>
              <p className="text-white font-body font-medium mb-1">Drag and drop photos here</p>
              <p className="text-gray-500 text-sm font-body">or click to browse</p>
            </>
          )}
        </div>

        {previews.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-300 font-body text-sm">{previews.length} photo(s) ready</p>
              <button onClick={() => { previews.forEach(p => URL.revokeObjectURL(p.preview)); setPreviews([]); }}
                className="text-gray-500 hover:text-red-400 text-xs">Clear all</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
              {previews.map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p.preview} alt={p.name}
                    className="w-full h-16 object-cover rounded-lg border border-white/10" />
                  <button onClick={() => removePreview(i)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Uploading...</span>
                  <span className="text-sm text-brand-400">{progress}%</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button onClick={uploadPhotos} disabled={uploading} className="btn-primary flex items-center gap-2">
              {uploading ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload {previews.length} photo(s) as {category}</>}
            </button>
          </div>
        )}
      </div>

      {/* Portfolio Grid */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-brand-400" /> Portfolio ({photos.length} photos)
          </h2>
          <div className="flex gap-2 flex-wrap">
            {["All", ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors
                  ${filter === c ? "bg-brand-500 text-white" : "bg-dark-600 text-gray-400 hover:text-white"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-body">No photos yet. Upload some above.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map((photo) => (
              <div key={photo.id} className="break-inside-avoid relative group">
                <img src={photo.url} alt={photo.title}
                  className="w-full object-cover rounded-lg border border-white/5" loading="lazy" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                  <span className="text-white text-xs font-body bg-brand-500/80 px-2 py-0.5 rounded-full">
                    {photo.category}
                  </span>
                  <button onClick={() => deletePhoto(photo.id)}
                    className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}