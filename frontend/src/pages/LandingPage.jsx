import { Link } from "react-router-dom";
import { ArrowRight, Star, Camera } from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

const STATS = [
  { value: "500+", label: "Sessions Done" },
  { value: "4.9★", label: "Average Rating" },
  { value: "8",    label: "Years Experience" },
  { value: "100%", label: "Client Satisfaction" },
];

const SERVICES = [
  { icon: "🎓", title: "Graduation",  desc: "Capture your milestone in style.", price: "From KES 8,000" },
  { icon: "💍", title: "Weddings",    desc: "Full-day coverage of your special day.", price: "From KES 35,000" },
  { icon: "🎂", title: "Birthdays",   desc: "Celebrate with beautiful photography.", price: "From KES 6,000" },
  { icon: "🏢", title: "Events",      desc: "Professional corporate & social coverage.", price: "From KES 15,000" },
  { icon: "👤", title: "Portraits",   desc: "Timeless studio and outdoor portraits.", price: "From KES 4,000" },
  { icon: "💼", title: "Corporate",   desc: "Professional headshots & brand photography.", price: "Custom Quote" },
];

const TESTIMONIALS = [
  { name: "Amina Wanjiku",   role: "Graduation Client", text: "LensKenya made my graduation so special! Every photo tells a story.", rating: 5 },
  { name: "David & Sarah",   role: "Wedding Clients",   text: "Our wedding photos are absolutely breathtaking. Every emotion captured.", rating: 5 },
  { name: "Marcus Odhiambo", role: "Portrait Client",   text: "Professional and creative. My portrait session exceeded expectations.", rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,136,30,0.15),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="page-container relative z-10 pt-24 pb-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
              <Camera className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-body font-medium">Based in Nairobi, Kenya</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
              Every Moment<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                Deserves to Last
              </span>
            </h1>
            <p className="text-gray-400 text-xl font-body leading-relaxed mb-10 max-w-2xl">
              Professional photography for graduations, weddings, portraits & events.
              Book your session, receive your gallery, download your memories.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/book" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                Book a Session <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/portfolio" className="btn-outline flex items-center gap-2 text-base px-8 py-4">
                View Portfolio
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/5">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-bold text-brand-400">{s.value}</div>
                  <div className="text-gray-500 text-sm font-body mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-dark-800">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">What We Offer</span>
            <h2 className="section-title mt-2">Photography Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div key={s.title} className="card hover:border-brand-500/30 hover:bg-dark-600 transition-all duration-300 group">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 font-body text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-400 font-body font-medium text-sm">{s.price}</span>
                  <Link to="/book" className="text-gray-500 hover:text-brand-400 text-sm font-body flex items-center gap-1">
                    Book <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">The Process</span>
            <h2 className="section-title mt-2">Simple. Seamless. Beautiful.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "📅", title: "Book Online",       desc: "Choose your package and preferred date." },
              { step: "02", icon: "📸", title: "The Shoot",         desc: "We capture every precious moment." },
              { step: "03", icon: "🖼️", title: "View Your Gallery", desc: "Edited photos in your private gallery in 48hrs." },
              { step: "04", icon: "💳", title: "Pay & Download",    desc: "Pay with M-Pesa and download instantly." },
            ].map((item) => (
              <div key={item.step} className="card h-full">
                <span className="font-mono text-xs text-brand-500/50 font-bold">{item.step}</span>
                <div className="text-3xl my-3">{item.icon}</div>
                <h4 className="font-display text-lg font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-gray-400 font-body text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-dark-800">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">Client Love</span>
            <h2 className="section-title mt-2">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
                  ))}
                </div>
                <p className="text-gray-300 font-body text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <div className="font-display font-semibold text-white">{t.name}</div>
                  <div className="text-gray-500 text-xs font-body mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="page-container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="section-title mb-4">Ready to Create Something Beautiful?</h2>
            <p className="section-subtitle mx-auto mb-8">Book your session today.</p>
            <Link to="/book" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
              Book Your Session <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}