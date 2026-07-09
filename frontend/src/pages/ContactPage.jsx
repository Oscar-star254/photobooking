import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="page-container">

          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">Get In Touch</span>
            <h1 className="section-title mt-2">Contact Us</h1>
            <p className="section-subtitle mx-auto">
              Have questions? Send us a message and we will respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white mb-0.5">Phone / WhatsApp</h3>
                    <a href="tel:+254758695620" className="text-gray-400 font-body text-sm hover:text-brand-400 transition-colors">
                      +254 758 695 620
                    </a>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white mb-0.5">Email</h3>
                    <a href="mailto:hello@lenskenya.com" className="text-gray-400 font-body text-sm hover:text-brand-400 transition-colors">
                      hello@lenskenya.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white mb-0.5">Location</h3>
                    <p className="text-gray-400 font-body text-sm">
                      Nairobi, Kenya
                    </p>
                    <p className="text-gray-500 text-xs font-body">
                      We come to you — shoots at your preferred location
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white mb-0.5">Working Hours</h3>
                    <p className="text-gray-400 font-body text-sm">Mon to Sat: 7:00 AM to 7:00 PM</p>
                    <p className="text-gray-500 text-xs font-body">Sunday: By appointment only</p>
                  </div>
                </div>
              </div>

              
                href="https://wa.me/254758695620?text=Hi%20LensKenya!%20I'd%20like%20to%20inquire%20about%20a%20photography%20session."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 hover:bg-green-500/20 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <p className="text-green-400 font-body font-medium text-sm">Chat on WhatsApp</p>
                  <p className="text-gray-400 text-xs font-body">Usually responds within minutes</p>
                </div>
              </a>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden border border-white/5" style={{ height: "280px" }}>
                <iframe
                  title="LensKenya Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.35853743787!2d36.68258485!3d-1.3028617999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="card">
                <h3 className="font-display text-lg font-semibold text-white mb-5">Send us a Message</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = e.target[0].value;
                    const msg = `Hi LensKenya! My name is ${name}. I'd like to inquire about a photography session.`;
                    window.open("https://wa.me/254758695620?text=" + encodeURIComponent(msg), "_blank");
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name</label>
                      <input type="text" className="input-field" placeholder="Jane Mwangi" required />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input type="tel" className="input-field" placeholder="0712 345 678" required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" className="input-field" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea
                      className="input-field resize-none"
                      rows={4}
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
