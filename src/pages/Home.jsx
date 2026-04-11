import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Zap, Building2, Wrench, Sun, ArrowRight, CheckCircle, Award,
  Users, Star, ChevronRight, Phone, Mail, Shield, Package, Play
} from 'lucide-react';
import AnimatedSection from '../components/common/AnimatedSection';
import ProductCard from '../components/common/ProductCard';
import { productAPI, projectAPI } from '../utils/api';

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
const slides = [
  {
    headline: 'Your Vision,\nOur Expertise',
    sub: 'ISO Certified Construction & Industrial Services Company in Prayagraj, UP',
    cta: 'Explore Services',
    ctaLink: '/services',
    accent: 'Trusted by Adani, Tata Power, Thermax & more',
  },
  {
    headline: 'Industrial\nExcellence',
    sub: 'Specialized in C&I, Electrical, Civil & Mechanical Works for power plants and infrastructure',
    cta: 'View Projects',
    ctaLink: '/projects',
    accent: '50+ Successful Projects Delivered',
  },
  {
    headline: 'Quality\nSupplies',
    sub: 'Premium electrical, safety, networking and mechanical supplies delivered to your doorstep',
    cta: 'Shop Now',
    ctaLink: '/products',
    accent: 'Competitive Pricing, Guaranteed Quality',
  },
];

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 150]);

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute inset-0 hero-gradient opacity-95" />
        <div className="absolute inset-0 grid-pattern" />
        {/* Animated shapes */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            {/* Slide indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm">
                <Shield size={14} className="text-primary-300" />
                {slide.accent}
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={current}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-tight text-shadow whitespace-pre-line mb-6"
              >
                {slide.headline}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${current}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed"
              >
                {slide.sub}
              </motion.p>
            </AnimatePresence>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to={slide.ctaLink} className="btn-primary text-base px-8 py-3.5 group">
                {slide.cta}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-base">
                Get a Quote
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: '50+', l: 'Projects' },
                { n: '₹3Cr+', l: 'Turnover FY24' },
                { n: '10+', l: 'Clients' },
              ].map(({ n, l }) => (
                <div key={l} className="text-center glass rounded-xl p-3">
                  <p className="text-2xl font-display font-bold text-white">{n}</p>
                  <p className="text-xs text-white/70 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Feature cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { icon: Zap, title: 'C&I & Electrical', desc: 'Cable laying, panel installation, solar & HV systems', color: 'from-amber-500 to-orange-500' },
              { icon: Building2, title: 'Civil Works', desc: 'Road, building, RCC structures, epoxy & interiors', color: 'from-blue-500 to-cyan-500' },
              { icon: Wrench, title: 'Mechanical', desc: 'HVAC, fabrication, AOH services & power plant works', color: 'from-purple-500 to-pink-500' },
              { icon: Sun, title: 'Solar Energy', desc: 'PV plant design, installation & grid synchronization', color: 'from-green-500 to-emerald-500' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="glass rounded-2xl p-5 cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex justify-center gap-2 mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full" fill="white">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </div>
  );
}

// ─── CLIENTS STRIP ─────────────────────────────────────────────────────────────
const clients = ['Adani', 'Tata Power', 'PPGCL', 'Thermax', 'Toshiba', 'Power Mech', 'Dilip Buildcon', 'JK Cement', 'Atharv Automation', 'MASCOT'];

function ClientsStrip() {
  return (
    <div className="py-10 bg-gray-50 border-y border-gray-200 overflow-hidden">
      <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
        Trusted by Industry Leaders
      </p>
      <div className="relative">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...clients, ...clients].map((c, i) => (
            <span key={i} className="text-gray-500 font-display font-semibold text-lg hover:text-primary-600 transition-colors cursor-default">
              {c}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── WHY CHOOSE US ────────────────────────────────────────────────────────────
const reasons = [
  { icon: Shield, title: 'ISO Certified', desc: 'Triple ISO certification — 9001, 14001 & 45001 — ensuring quality, environment & safety standards.' },
  { icon: Users, title: 'Expert Team', desc: 'Skilled professionals with years of experience in industrial and commercial projects.' },
  { icon: CheckCircle, title: 'On-Time Delivery', desc: 'Committed to delivering every project within schedule without compromising quality.' },
  { icon: Award, title: 'Cost Effective', desc: 'Competitive pricing with transparent quotations, no hidden charges.' },
  { icon: Star, title: 'Client First', desc: 'Customer-centric approach with open communication throughout the project lifecycle.' },
  { icon: Zap, title: 'A-Class License', desc: 'Holds Government of UP A-Class electrical contractor license for all HT/LT works.' },
];

// ─── STATS COUNTER ───────────────────────────────────────────────────────────
function StatCounter({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView.current) {
        inView.current = true;
        let start = 0;
        const num = parseInt(value);
        const step = Math.ceil(num / 50);
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { setCount(num); clearInterval(timer); }
          else setCount(start);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="stat-card">
      <p className="text-4xl font-display font-bold gradient-text">{count}{suffix}</p>
      <p className="text-gray-600 text-sm mt-1 font-medium">{label}</p>
    </div>
  );
}

// ─── MAIN HOME PAGE ──────────────────────────────────────────────────────────
export default function Home() {
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productAPI.getAll({ featured: 'true', limit: 8 }).then(r => r.data),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => projectAPI.getAll({ featured: 'true', limit: 6 }).then(r => r.data),
  });

  return (
    <div>
      <HeroSection />
      <ClientsStrip />

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCounter value="50" suffix="+" label="Projects Completed" />
            <StatCounter value="10" suffix="+" label="Major Clients" />
            <StatCounter value="5" suffix="+" label="Years Experience" />
            <StatCounter value="200" suffix="K+" label="Metres Cable Laid" />
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="section-title">Our Core <span className="gradient-text">Services</span></h2>
            <p className="section-subtitle mx-auto text-center mt-3">
              Comprehensive construction and industrial services delivered with precision and excellence
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'C&I & Electrical', desc: 'Cable laying, MCC panels, transformers, solar PV, testing & commissioning', link: '/services', color: 'from-amber-400 to-orange-500', bg: 'amber' },
              { icon: Building2, title: 'Civil Works', desc: 'Road construction, buildings, RCC structures, epoxy flooring, interior works', link: '/services', color: 'from-blue-400 to-blue-600', bg: 'blue' },
              { icon: Wrench, title: 'Mechanical', desc: 'HVAC, fabrication, insulation, AOH services, power plant relocation', link: '/services', color: 'from-purple-400 to-purple-600', bg: 'purple' },
              { icon: Package, title: 'Material Supply', desc: 'Electrical, safety, networking components and industrial aggregates', link: '/products', color: 'from-green-400 to-emerald-600', bg: 'green' },
            ].map(({ icon: Icon, title, desc, link, color }, i) => (
              <AnimatedSection key={title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -8 }} className="card p-6 h-full group cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-3">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{desc}</p>
                  <Link to={link} className="text-primary-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <ChevronRight size={16} />
                  </Link>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div className="relative">
                <div className="hero-gradient rounded-3xl p-8 text-white">
                  <h2 className="text-4xl font-display font-bold mb-4">Why Choose<br /><span className="text-primary-200">Aditri?</span></h2>
                  <p className="text-white/80 text-base leading-relaxed mb-6">
                    Founded in 2019, we have grown from a general contractor to a trusted main contractor delivering end-to-end solutions for industrial and commercial projects.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'A-Class License'].map(b => (
                      <div key={b} className="flex items-center gap-2 glass rounded-lg px-3 py-2">
                        <CheckCircle size={16} className="text-primary-300 flex-shrink-0" />
                        <span className="text-sm text-white/90">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100"
                >
                  <p className="text-3xl font-display font-bold text-primary-600">₹3Cr+</p>
                  <p className="text-sm text-gray-600">Annual Turnover FY24</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-primary-500 rounded-full" />
                    </div>
                    <span className="text-xs text-green-600 font-bold">+107%</span>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reasons.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-primary-50 group-hover:bg-primary-100 rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Icon size={20} className="text-primary-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projectsData?.projects?.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="flex items-end justify-between mb-12">
              <div>
                <h2 className="section-title">Featured <span className="gradient-text">Projects</span></h2>
                <p className="text-gray-600 mt-2">Delivering excellence across industries</p>
              </div>
              <Link to="/projects" className="btn-outline text-sm py-2 hidden sm:flex">
                View All <ArrowRight size={16} />
              </Link>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsData.projects.map((p, i) => (
                <AnimatedSection key={p._id} delay={i * 0.1}>
                  <motion.div whileHover={{ y: -6 }} className="card overflow-hidden group h-full">
                    <div className="h-40 bg-gradient-to-br from-primary-800 to-accent-700 flex items-end p-5 relative overflow-hidden">
                      <div className="absolute inset-0 grid-pattern opacity-50" />
                      <div className="relative">
                        <span className={`badge text-xs mb-2 ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {p.status}
                        </span>
                        <h3 className="text-white font-bold text-sm line-clamp-2">{p.title}</h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-primary-600 font-medium mb-1">{p.client}</p>
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">📍 {p.location}</p>
                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{p.description}</p>
                      {p.highlights?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.highlights.slice(0, 2).map((h) => (
                            <span key={h} className="badge bg-gray-100 text-gray-600 text-xs">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/projects" className="btn-outline">View All Projects</Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {productsData?.products?.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="flex items-end justify-between mb-12">
              <div>
                <h2 className="section-title">Featured <span className="gradient-text">Products</span></h2>
                <p className="text-gray-600 mt-2">Quality industrial supplies at competitive prices</p>
              </div>
              <Link to="/products" className="btn-outline text-sm py-2 hidden sm:flex">
                Shop All <ArrowRight size={16} />
              </Link>
            </AnimatedSection>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productsData.products.map((p, i) => (
                <AnimatedSection key={p._id} delay={i * 0.05}>
                  <ProductCard product={p} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-5">
              Ready to Start Your<br />Next Project?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Get a free consultation and quote from our team of experts. We deliver on time, every time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-base py-3.5 px-8 bg-white text-primary-700 hover:bg-gray-100">
                <Phone size={18} /> Get Free Quote
              </Link>
              <a href="tel:+919598033414" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-base">
                <Phone size={18} /> Call Now
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
