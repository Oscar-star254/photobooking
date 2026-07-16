import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, Image, ArrowLeft, CheckCircle, X, Loader, Send, RefreshCw, Bell } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminGallery() {
  const { bookingId } = useParams();
  const [gallery, setGallery]               = useState(null);
  const [photos, setPhotos]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews]             = useState([]);
  const [markingReady, setMarkingReady]     = useState(false);
  const [resending, setResending]           = useState(false);

  const fetchGallery = useCallback(async () => {
    try {
      const bookingRes = await api.get(`/bookings/${bookingId}`);
      const galleryId  = bookingRes.data.booking.gallery_id;
      if (!galleryId) {
        await api.post(`/admin/bookings/${bookingId}/gallery`, {});
        fetchGallery();
        return;
      }
      const galleryRes = await api.get(`/galleries/${galleryId}`);
      setGallery(galleryRes.data.gallery);
      setPhotos(galleryRes.data.photos);
    } catch (err) {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const onDrop = useCallback((acceptedFiles) => {
    const newPreviews = acceptedFiles.map(f => ({
      file:    f,
      preview: URL.createObjectURL(f),
      name:    f.name,
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
  });

  const removePreview = (index) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async () => {
    if (!previews.length || !gallery) return;
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    previews.forEach(p => formData.append("photos", p.file));
    try {
      await api.post(`/galleries/${gallery.id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      toast.success(`${previews.length} photo(s) uploaded!`);
      previews.forEach(p => URL.revokeObjectURL(p.preview));
      setPreviews([]);
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const markAsReady = async () => {
    if (!gallery) return;
    if (!window.confirm("Mark this gallery as ready? This will send a WhatsApp notification to the client.")) return;
    setMarkingReady(true);
    try {
      const res = await api.post(`/galleries/${gallery.id}/mark-ready`);
      toast.success(res.data.whatsapp_message || "Gallery marked as ready!");
      if (res.data.whatsapp_sent) {
        toast.success("📱 WhatsApp notification sent to client!", { duration: 5000 });
      } else {
        toast.error("⚠️ Gallery ready but WhatsApp notification failed");
      }
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to mark gallery as ready");
    } finally {
      setMarkingReady(false);
    }
  };

  const resendWhatsApp = async () => {
    if (!gallery) return;
    setResending(true);
    try {
      const res = await api.post(`/galleries/${gallery.id}/resend-whatsapp`);
      if (res.data.whatsapp_sent) {
        toast.success("📱 WhatsApp notification resent successfully!");
      } else {
        toast.error("Failed to resend WhatsApp notification");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin/bookings" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{gallery?.title || "Gallery"}</h1>
            <p className="text-gray-400 font-body text-sm mt-0.5">
              {photos.length} photo(s) ·{" "}
              {gallery?.is_paid ? "✅ Paid" : "🔒 Unpaid"} ·{" "}
              {gallery?.is_ready ? "🟢 Ready" : "🟡 Pending"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {!gallery?.is_ready ? (
            <button
              onClick={markAsReady}
              disabled={markingReady || photos.length === 0}
              className="btn-primary flex items-center gap-2"
            >
              {markingReady ? (
                <><Loader className="w-4 h-4 animate-spin" /> Marking Ready...</>
              ) : (
                <><Bell className="w-4 h-4" /> Mark Gallery as Ready & Notify Client</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-body">Client Notified</span>
              </div>
              <button
                onClick={resendWhatsApp}
                disabled={resending}
                className="btn-outline flex items-center gap-2 text-sm py-2"
              >
                {resending ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Resending...</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Resend WhatsApp</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Status Banner */}
      {gallery?.is_ready && (
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white font-body font-medium text-sm">Gallery marked as ready</p>
            <p className="text-gray-400 text-xs font-body mt-0.5">
              WhatsApp notification {gallery?.whatsapp_notified ? "✅ sent successfully" : "❌ failed to send"} to client
            </p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="card mb-8">
        <h2 className="font-display text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Upload className="w-5 h-5 text-brand-400" /> Upload Photos
        </h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? "border-brand-500 bg-brand-500/10" : "border-white/10 hover:border-brand-500/50"}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          {isDragActive ? (
            <p className="text-brand-400 font-body font-medium">Drop photos here...</p>
          ) : (
            <>
              <p className="text-white font-body font-medium mb-1">Drag & drop photos here</p>
              <p className="text-gray-500 text-sm font-body">or click to browse — JPG, PNG, WEBP</p>
            </>
          )}
        </div>

        {previews.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-300 font-body text-sm font-medium">{previews.length} photo(s) ready</p>
              <button
                onClick={() => { previews.forEach(p => URL.revokeObjectURL(p.preview)); setPreviews([]); }}
                className="text-gray-500 hover:text-red-400 text-xs font-body">
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
              {previews.map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p.preview} alt={p.name}
                    className="w-full h-20 object-cover rounded-lg border border-white/10" />
                  <button onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-400 font-body">Uploading...</span>
                  <span className="text-sm text-brand-400 font-body font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <button onClick={uploadPhotos} disabled={uploading} className="btn-primary flex items-center gap-2">
              {uploading
                ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                : <><Upload className="w-4 h-4" /> Upload {previews.length} photo(s)</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Image className="w-5 h-5 text-brand-400" /> Gallery Photos ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-body">No photos yet. Upload some above.</p>
            <p className="text-gray-500 text-sm font-body mt-1">After uploading, click "Mark Gallery as Ready" to notify the client.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.thumbnail || photo.url}
                  alt={photo.filename}
                  className="w-full h-36 object-cover rounded-lg border border-white/5"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-gray-500 text-xs font-body mt-1 truncate">{photo.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}