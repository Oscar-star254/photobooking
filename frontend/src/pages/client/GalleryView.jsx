import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Lock, CreditCard, ArrowLeft, CheckCircle, Loader } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ReviewPopup from "../../components/ReviewPopup";

function PaymentModal({ booking, galleryTitle, onClose, onSuccess }) {
  const { user } = useAuth();
  const [phone, setPhone]     = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const pollStatus = useCallback((pid) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/payments/status?payment_id=${pid}`);
        if (res.data.status === "paid") {
          clearInterval(interval);
          setPolling(false);
          toast.success("Payment successful! Gallery unlocked 🎉");
          onSuccess();
        } else if (res.data.status === "failed") {
          clearInterval(interval);
          setPolling(false);
          toast.error("Payment failed or cancelled. Try again.");
        }
      } catch (e) {}
      if (attempts >= 30) {
        clearInterval(interval);
        setPolling(false);
        toast.error("Payment timed out. Please try again.");
      }
    }, 2000);
  }, [onSuccess]);

  const initiatePay = async () => {
    if (!phone) { toast.error("Enter your M-Pesa phone number"); return; }
    if (!booking) { toast.error("Booking information not found"); return; }
    if (!booking.id) { toast.error("Invalid booking ID"); return; }

    setLoading(true);
    try {
      const res = await api.post("/payments/initiate", {
        booking_id: booking.id,
        phone: phone,
      });
      setLoading(false);
      setPolling(true);
      toast.success("STK Push sent! Check your phone.");
      pollStatus(res.data.payment_id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment initiation failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-display text-xl font-bold text-white mb-1">Pay with M-Pesa</h3>
        <p className="text-gray-400 text-sm font-body mb-2">
          {galleryTitle}
        </p>
        <p className="text-brand-400 font-body font-semibold mb-6">
          KES {booking?.package_price?.toLocaleString()}
        </p>

        {!polling ? (
          <>
            <div className="mb-4">
              <label className="label">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-field"
                placeholder="0712 345 678"
              />
              <p className="text-gray-500 text-xs font-body mt-1.5">
                You'll receive a payment prompt on your phone
              </p>
            </div>
            <button
              onClick={initiatePay}
              disabled={loading}
              className="btn-primary w-full mb-3">
              {loading ? "Sending STK Push..." : `Pay KES ${booking?.package_price?.toLocaleString()}`}
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-400 hover:text-white py-2">
              Cancel
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <Loader className="w-10 h-10 text-brand-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-body font-medium">Waiting for payment...</p>
            <p className="text-gray-400 text-sm font-body mt-2">
              Enter your M-Pesa PIN on your phone to complete payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryView() {
  const { galleryId } = useParams();
  const [gallery, setGallery]         = useState(null);
  const [photos, setPhotos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [lightbox, setLightbox]       = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking]         = useState(null);
const [showReview, setShowReview] = useState(false);
const [hasReviewed, setHasReviewed] = useState(false);

useEffect(() => {
  if (booking?.id) {
    api.get(`/reviews/can-review/${booking.id}`)
      .then(r => setHasReviewed(!r.data.can_review))
      .catch(() => {});
  }
}, [booking]);


  const fetchGallery = useCallback(async () => {
    try {
      const res = await api.get(`/galleries/${galleryId}`);
      setGallery(res.data.gallery);
      setPhotos(res.data.photos);
    } catch (err) {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [galleryId]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  useEffect(() => {
    if (gallery?.booking_id) {
      api.get(`/bookings/${gallery.booking_id}`)
        .then(r => {
          setBooking(r.data.booking);
        })
        .catch(() => {
          toast.error("Could not load booking details");
        });
    }
  }, [gallery]);

 const downloadPhoto = async (photoId, filename) => {
  try {
    const res = await api.get(`/photos/${photoId}/download`);
    const a = document.createElement("a");
    a.href = res.data.download_url;
    a.download = filename;
    a.click();

    if (!hasReviewed) {
      setTimeout(() => setShowReview(true), 1500);
    }
  } catch (err) {
    toast.error(err.response?.data?.error || "Download failed");
  }
};

const downloadZip = async () => {
  try {
    toast("Preparing ZIP download...", { icon: "📦" });

    const res = await api.get(
      `/photos/gallery/${galleryId}/zip`,
      { responseType: "blob" }
    );

    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${gallery.title}_photos.zip`;
    a.click();

    URL.revokeObjectURL(url);

    if (!hasReviewed) {
      setTimeout(() => setShowReview(true), 1500);
    }
  } catch (err) {
    toast.error("ZIP download failed");
  }
};

  if (loading) return (
    <div className="min-h-screen bg-dark-900 lg:ml-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 lg:ml-64 p-6">

      {showPayment && booking && (
        <PaymentModal
          booking={booking}
          galleryTitle={gallery?.title}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); fetchGallery(); }}
        />
      )}

      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={photos[lightbox]?.url}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
      {showReview && booking && (
  <ReviewPopup
    bookingId={booking.id}
    onClose={() => { setShowReview(false); setHasReviewed(true); }}
  />
)}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/galleries" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{gallery?.title}</h1>
            <p className="text-gray-400 font-body text-sm mt-0.5">{photos.length} photos</p>
          </div>
        </div>

        {gallery?.is_paid ? (
          <button onClick={downloadZip} className="btn-outline flex items-center gap-2 text-sm py-2">
            <Download className="w-4 h-4" /> Download All (ZIP)
          </button>
        ) : (
          <button
            onClick={() => {
              if (!booking) {
                toast.error("Booking details not loaded yet. Please wait.");
                return;
              }
              setShowPayment(true);
            }}
            className="btn-primary flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pay with M-Pesa to Unlock
          </button>
        )}
      </div>

      {/* Lock banner + Payment Card */}
{!gallery?.is_paid && (
  <div className="space-y-4 mb-8">

    {/* Lock Banner */}
    <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-5 flex items-center gap-4">
      <Lock className="w-6 h-6 text-brand-400 shrink-0" />
      <div>
        <p className="text-white font-body font-medium">Gallery Locked</p>
        <p className="text-gray-400 text-sm font-body mt-0.5">
          Pay to download full-resolution photos without watermarks.
        </p>
      </div>
    </div>

    {/* Payment Card */}
    <div className="relative overflow-hidden rounded-2xl border border-brand-500/30"
      style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2a1200 40%, #1a0800 100%)",
      }}>

      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-600/10 rounded-full translate-y-1/2 -translate-x-1/4" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-brand-400/5 rounded-full -translate-y-1/2" />

      <div className="relative z-10 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-display text-white font-bold text-lg">LensKenya</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-red-500 rounded-full opacity-80" />
            <div className="w-6 h-6 bg-yellow-400 rounded-full opacity-80 -ml-2" />
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <p className="text-gray-400 text-xs font-body uppercase tracking-widest mb-1">Amount Due</p>
          <p className="font-display text-3xl font-bold text-brand-400">
            KES {booking?.package_price?.toLocaleString() || "—"}
          </p>
          <p className="text-gray-500 text-xs font-body mt-1">{gallery?.title}</p>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* M-Pesa Paybill */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs font-body uppercase tracking-widest mb-2">
              M-Pesa Paybill
            </p>
            <p className="font-display text-2xl font-bold text-white tracking-widest">
              522533
            </p>
            <p className="text-gray-500 text-xs font-body mt-1">Business Number</p>
          </div>

          {/* Account Number */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs font-body uppercase tracking-widest mb-2">
              Account Number
            </p>
            <p className="font-display text-2xl font-bold text-brand-400 tracking-widest">
              0758695620
            </p>
            <p className="text-gray-500 text-xs font-body mt-1">Oscar Aora</p>
          </div>

        </div>

        {/* Steps */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-5">
          <p className="text-gray-300 text-xs font-body font-medium mb-3 uppercase tracking-widest">
            How to Pay
          </p>
          <div className="space-y-2">
            {[
              "Go to M-Pesa → Lipa na M-Pesa → Paybill",
              "Enter Business No: 4096483",
              "Enter Account No: 333154",
              "Enter Amount: KES " + (booking?.package_price?.toLocaleString() || "—"),
              "Enter PIN and confirm",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-400 text-xs font-body">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-xs font-body">OR PAY VIA STK PUSH</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* STK Push Button */}
        <button
          onClick={() => setShowPayment(true)}
          className="w-full bg-brand-500 hover:bg-brand-400 text-white font-body font-medium py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Pay with M-Pesa STK Push
        </button>

        {/* Footer note */}
        <p className="text-gray-600 text-xs font-body text-center mt-4">
          🔒 Secure payment · Gallery unlocks automatically after payment
        </p>
      </div>
    </div>
  </div>
)}

      {/* Unlocked banner */}
      {gallery?.is_paid && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-300 font-body text-sm font-medium">
            Gallery unlocked — download your full-resolution photos below.
          </p>
        </div>
      )}

      {/* Booking info */}
      {booking && !gallery?.is_paid && (
        <div className="card mb-6">
          <p className="text-gray-400 text-sm font-body">
            <span className="text-white font-medium">Package:</span> {booking.package_name} —{" "}
            <span className="text-brand-400 font-semibold">KES {booking.package_price?.toLocaleString()}</span>
          </p>
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📸</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">Photos coming soon</h3>
          <p className="text-gray-400 font-body">Your photographer is still editing. Check back shortly!</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="break-inside-avoid relative group">
              <img
                src={photo.thumbnail || photo.url}
                alt={photo.filename}
                className="w-full rounded-lg cursor-pointer object-cover"
                loading="lazy"
                onClick={() => setLightbox(i)}
              />
              {photo.is_locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <Lock className="w-6 h-6 text-white/60" />
                </div>
              )}
              {!photo.is_locked && (
                <button
                  onClick={() => downloadPhoto(photo.id, photo.filename)}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                    bg-black/70 hover:bg-brand-500 rounded-lg p-2"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
