import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="page-container">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">
              Get In Touch
            </span>

            <h1 className="section-title mt-2">Contact Us</h1>

            <p className="section-subtitle mx-auto">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Phone */}
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-brand-400" />
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-white mb-1">
                      Phone / WhatsApp
                    </h3>

                    <a
                      href="tel:+254758695620"
                      className="text-gray-400 text-sm hover:text-brand-400 transition-colors"
                    >
                      +254 758 695 620
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-brand-400" />
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-white mb-1">
                      Email
                    </h3>

                    <a
                      href="mailto:hello@lenskenya.com"
                      className="text-gray-400 text-sm hover:text-brand-400 transition-colors"
                    >
                      hello@lenskenya.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-brand-400" />
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-white mb-1">
                      Location
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Nairobi, Kenya
                      <br />
                      <span className="text-gray-500 text-xs">
                        We come to your preferred location for photography
                        sessions.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-brand-400" />
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-white mb-1">
                      Working Hours
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Monday – Saturday: 7:00 AM – 7:00 PM
                      <br />
                      Sunday: By appointment only
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/254758695620?text=Hi%20LensKenya!%20I'd%20like%20to%20book%20a%20photography%20session."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 hover:bg-green-500/20 transition duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    className="w-6 h-6"
                  />
                </div>

                <div>
                  <p className="text-green-400 font-medium">
                    Chat with us on WhatsApp
                  </p>

                  <p className="text-gray-400 text-xs">
                    Usually replies within minutes
                  </p>
                </div>
              </a>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Google Map */}
              <div
                className="rounded-xl overflow-hidden border border-white/10"
                style={{ height: "300px" }}
              >
                <iframe
                  title="LensKenya Location"
                  src="https://maps.google.com/maps?q=Nairobi&t=&z=11&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Contact Form */}
              <div className="card">
                <h3 className="font-display text-xl font-semibold text-white mb-5">
                  Send us a Message
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.open(
                      "https://wa.me/254758695620?text=Hi%20LensKenya!%20I'd%20like%20to%20book%20a%20photography%20session.",
                      "_blank"
                    );
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name</label>

                      <input
                        type="text"
                        className="input-field"
                        placeholder="Jane Mwangi"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Phone Number</label>

                      <input
                        type="tel"
                        className="input-field"
                        placeholder="0712 345 678"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Email Address</label>

                    <input
                      type="email"
                      className="input-field"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label className="label">Message</label>

                    <textarea
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Tell us about your photography needs..."
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Send via WhatsApp
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}