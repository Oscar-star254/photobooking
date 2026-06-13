import { Link } from "react-router-dom";
import { Camera, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Lens<span className="text-brand-400">Kenya</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm font-body leading-relaxed">
              Professional photography capturing Kenya's most precious moments.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[["Home", "/"], ["Portfolio", "/portfolio"], ["Book a Session", "/book"], ["Sign In", "/login"]].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-gray-400 hover:text-brand-400 text-sm font-body transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-display font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {["Graduation Shoots", "Wedding Photography", "Portrait Sessions", "Event Coverage", "Studio Portraits"].map((s) => (
                <li key={s}><span className="text-gray-400 text-sm font-body">{s}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {[
                [MapPin, "Nairobi, Kenya"],
                [Phone, "+254 700 000 000"],
                [Mail, "hello@lenskenya.com"],
              ].map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <Icon className="w-4 h-4 text-brand-400 shrink-0" />{text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-sm font-body">© 2025 LensKenya. All rights reserved.</p>
          <p className="text-gray-600 text-sm font-body">Made with ❤️ in Nairobi</p>
        </div>
      </div>
    </footer>
  );
}
