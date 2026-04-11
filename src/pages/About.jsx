// About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Zap, CheckCircle } from 'lucide-react';
import AnimatedSection from '../components/common/AnimatedSection';

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold text-white mb-4">About <span className="text-primary-200">Aditri</span></motion.h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">Your Vision, Our Expertise — ISO Certified Industrial Construction Company</p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <h2 className="section-title mb-6">Who We <span className="gradient-text">Are</span></h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>M/S Aditri Construction Services (ACS) was founded by <strong>Mr. Sandeep Kumar Mishra</strong> on February 14, 2019, and formally registered on May 20, 2019. In just a few years, we have grown into a trusted leader in small to medium-sized industrial and commercial projects.</p>
                <p>Originally starting as a general contractor, ACS now excels as a <strong>main contractor</strong>, offering end-to-end project management and specialized design and engineering solutions across C&I, Electrical, Civil, and Mechanical disciplines.</p>
                <p>Our approach involves meticulous planning, seamless communication, and real-time progress monitoring, ensuring that every project is executed to the highest standards — on time, with uncompromising quality.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[['Feb 2019', 'Founded'], ['₹3Cr+', 'FY24 Turnover'], ['50+', 'Projects'], ['10+', 'Major Clients']].map(([v, l]) => (
                  <div key={l} className="p-4 bg-primary-50 rounded-xl">
                    <p className="text-2xl font-display font-bold text-primary-700">{v}</p>
                    <p className="text-sm text-gray-600">{l}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Triple ISO Certified', desc: 'ISO 9001:2015, ISO 14001:2015 & ISO 45001:2018 certified for quality, environmental & safety management.', color: 'bg-blue-100 text-blue-600' },
                  { icon: Award, title: 'MSME & Licensed', desc: 'Registered MSME (UDYAM-UP-03-0014185) with A-Class UP Electrical Contractor License (AD00001310).', color: 'bg-green-100 text-green-600' },
                  { icon: Users, title: 'Experienced Team', desc: 'Our seasoned professionals deliver precision and reliability in every project we undertake.', color: 'bg-purple-100 text-purple-600' },
                  { icon: Zap, title: 'End-to-End Delivery', desc: 'From design & engineering to installation, testing and commissioning — all under one roof.', color: 'bg-amber-100 text-amber-600' },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl">
                    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <h2 className="section-title">Our <span className="gradient-text">Clients</span></h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {['Adani', 'Tata Power', 'PPGCL', 'Thermax', 'Toshiba', 'Power Mech', 'Dilip Buildcon', 'JK Cement', 'MASCOT', 'Atharv Automation'].map((c) => (
              <AnimatedSection key={c}>
                <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
                  <p className="font-display font-bold text-gray-700 text-sm">{c}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
