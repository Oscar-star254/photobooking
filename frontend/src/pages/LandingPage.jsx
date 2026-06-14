import { Link } from "react-router-dom";
import { ArrowRight, Star, Camera, Instagram, Twitter, Facebook } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

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

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a00] to-[#0a0a0a]" />

        {/* Gold radial glow top right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500 opacity-20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

        {/* Gold radial glow bottom left */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-600 opacity-15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        {/* Purple accent glow */}
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-900 opacity-20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />

        {/* Animated grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,136,30,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,136,30,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px"
          }}
        />

        {/* Diagonal light streak */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-500/30 to-transparent transform -rotate-12 scale-150" />
          <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-brand-400/10 to-transparent transform -rotate-12 scale-150" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/10 to-transparent transform rotate-12 scale-150" />
        </div>

        {/* Floating circles decoration */}
        <div className="absolute right-10 top-32 w-64 h-64 border border-brand-500/10 rounded-full" />
        <div className="absolute right-20 top-40 w-48 h-48 border border-brand-500/20 rounded-full" />
        <div className="absolute right-32 top-48 w-32 h-32 border border-brand-500/30 rounded-full" />
        <div className="absolute left-10 bottom-32 w-48 h-48 border border-purple-500/10 rounded-full" />
        <div className="absolute left-20 bottom-40 w-32 h-32 border border-purple-500/20 rounded-full" />

        {/* Floating dots */}
        {[...Array(12)].map((_, i) => (
          <div key={i}
            className="absolute w-1 h-1 bg-brand-400 rounded-full opacity-40"
            style={{
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 13) % 90}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        <div className="page-container relative z-10 pt-24 pb-16">
          <div className="max-w-4xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              <Camera className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-body font-medium">Based in Nairobi, Kenya</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
              Every Moment<br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-brand-600">
                  Deserves to Last
                </span>
                {/* Underline glow */}
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
              </span>
            </h1>

            <p className="text-gray-400 text-xl font-body leading-relaxed mb-10 max-w-2xl">
              Professional photography for graduations, weddings, portraits & events.
              Book your session, receive your private gallery, download your memories.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/book"
                className="btn-primary flex items-center gap-2 text-base px-8 py-4 shadow-lg shadow-brand-500/25">
                Book a Session <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/portfolio"
                className="btn-outline flex items-center gap-2 text-base px-8 py-4 backdrop-blur-sm">
                View Portfolio
              </Link>
            </div>

            {/* Stats */}
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

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />
      </section>

      {/* ── Services ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-[80px] -translate-x-1/2" />

        <div className="page-container relative z-10">
          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">What We Offer</span>
            <h2 className="section-title mt-2">Photography Services</h2>
            <p className="section-subtitle mx-auto">
              From intimate portraits to grand weddings, we bring creativity to every shoot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div key={s.title}
                className="relative group bg-dark-700/50 backdrop-blur-sm border border-white/5 rounded-xl p-6
                  hover:border-brand-500/40 hover:bg-dark-600/80 transition-all duration-300
                  hover:shadow-lg hover:shadow-brand-500/10">
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 group-hover:to-transparent transition-all duration-300" />
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 font-body text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-400 font-body font-medium text-sm">{s.price}</span>
                  <Link to="/book"
                    className="text-gray-500 hover:text-brand-400 text-sm font-body flex items-center gap-1 transition-colors">
                    Book <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-[#120800] to-dark-900" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px]" />

        <div className="page-container relative z-10">
          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">The Process</span>
            <h2 className="section-title mt-2">Simple. Seamless. Beautiful.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "📅", title: "Book Online",       desc: "Choose your package and preferred date." },
              { step: "02", icon: "📸", title: "The Shoot",         desc: "We capture every precious moment with artistry." },
              { step: "03", icon: "🖼️", title: "View Your Gallery", desc: "Edited photos in your private gallery within 48hrs." },
              { step: "04", icon: "💳", title: "Pay & Download",    desc: "Pay with M-Pesa and download instantly." },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-brand-500/30 to-transparent z-10" />
                )}
                <div className="relative bg-dark-700/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 h-full
                  hover:border-brand-500/30 transition-all duration-300">
                  <span className="font-mono text-xs text-brand-500/50 font-bold">{item.step}</span>
                  <div className="text-3xl my-3">{item.icon}</div>
                  <h4 className="font-display text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 font-body text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

        <div className="page-container relative z-10">
          <div className="text-center mb-14">
            <span className="text-brand-400 font-body text-sm font-medium uppercase tracking-widest">Client Love</span>
            <h2 className="section-title mt-2">What Our Clients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name}
                className="relative bg-dark-700/50 backdrop-blur-sm border border-white/5 rounded-xl p-6
                  hover:border-brand-500/20 transition-all duration-300">
                {/* Quote mark */}
                <div className="absolute top-4 right-4 text-5xl text-brand-500/10 font-display font-black leading-none">"</div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
                  ))}
                </div>
                <p className="text-gray-300 font-body text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs font-body mt-0.5">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-[#1a0800] to-dark-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,136,30,0.15),transparent_70%)]" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(212,136,30,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,136,30,0.03) 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }}
        />

        <div className="page-container relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6">
              <Camera className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-body">Limited slots available this month</span>
            </div>
            <h2 className="section-title mb-4">Ready to Create Something Beautiful?</h2>
            <p className="section-subtitle mx-auto mb-8">
              Book your session today and let us capture your most precious moments.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/book"
                className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 shadow-xl shadow-brand-500/25">
                Book Your Session <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/portfolio"
                className="btn-outline text-base px-8 py-4 inline-flex items-center gap-2">
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}