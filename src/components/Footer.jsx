import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Shield, Award, Facebook, Linkedin, Youtube } from 'lucide-react';

const links = {
  company: [{ to: '/about', label: 'About Us' }, { to: '/services', label: 'Services' }, { to: '/projects', label: 'Projects' }, { to: '/contact', label: 'Contact' }],
  services: ['C&I & Electrical', 'Civil Works', 'Mechanical', 'Solar Installation', 'Material Supply', 'Manpower'],
  products: [{ to: '/products?category=Cable', label: 'Cables' }, { to: '/products?category=Electrical', label: 'Electrical' }, { to: '/products?category=Safety', label: 'Safety' }, { to: '/products?category=Tools', label: 'Tools' }],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg hero-gradient flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">A</span>
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">Aditri Constructions</p>
                <p className="text-xs text-primary-400">Your Vision, Our Expertise</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              ISO certified construction and services company specializing in C&I, Electrical, Civil, and Mechanical works since 2019.
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 flex-shrink-0 text-primary-400"><Shield size={18} /></div>
              <div className="flex gap-2 flex-wrap">
                {['ISO 9001', 'ISO 14001', 'ISO 45001', 'MSME'].map(b => (
                  <span key={b} className="badge bg-primary-900/50 text-primary-400 border border-primary-800 text-xs">{b}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {[Facebook, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {links.company.map(({ to, label }) => (
                <li key={to}><Link to={to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Services</h3>
            <ul className="space-y-3">
              {links.services.map((s) => (
                <li key={s}><Link to="/services" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">A, Naini, Prayagraj<br />Uttar Pradesh - 211008</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <div className="text-sm text-gray-400">
                  <p>+91 9598033414</p>
                  <p>+91 7355411985</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <a href="mailto:aditri.c.services@gmail.com" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  aditri.c.services@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400">GSTIN: 09CDYPM7630P1ZC</p>
              <p className="text-xs text-gray-400 mt-1">MSME: UDYAM-UP-03-0014185</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Aditri Constructions Services. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
