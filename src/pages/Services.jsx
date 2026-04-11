import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Building2, Wrench, Sun, Package, CheckCircle } from 'lucide-react';
import AnimatedSection from '../components/common/AnimatedSection';

const services = [
  {
    icon: Zap, title: 'C&I and Electrical Works', color: 'from-amber-400 to-orange-500',
    items: ['Underground & Overhead Cable Laying', 'LV & HV Cable Pulling', 'Cable Joints & Terminations', 'MCC Panels, Bus Ducts & Transformers', 'DG Set Installation', 'Transmission Lines & RTD Installations', 'Testing & Commissioning of Electrical Systems', 'Lighting & Earthing System Installation', 'Control & Instrumentation Wiring', 'Power & Control Panel Installation', 'Maintenance of HT/LT Switchgear'],
  },
  {
    icon: Sun, title: 'Solar Power Plant Installation', color: 'from-yellow-400 to-amber-500',
    items: ['Solar PV Plant Design & Engineering', 'Supply and Installation of Solar PV Modules', 'Module Mounting Structure Installation', 'Solar Inverter Installation', 'DC & AC Cable Laying for Solar Systems', 'Earthing & Lightning Protection', 'Grid Synchronization & Commissioning', 'Solar Plant Testing & Performance Monitoring'],
  },
  {
    icon: Building2, title: 'Civil Works', color: 'from-blue-400 to-blue-600',
    items: ['Road & Water Tank Construction', 'Building Construction & Foundation Work', 'RCC Structures & Formwork', 'Interior Design & False Ceiling Work', 'Tile, Flooring & Cladding Work', 'Epoxy Flooring, Brickwork & Plastering', 'Building & Structural Painting', 'Civil Contour Surveys', 'Excavation & Earthwork', 'Earthing System Installation'],
  },
  {
    icon: Wrench, title: 'Mechanical Works', color: 'from-purple-400 to-purple-600',
    items: ['HVAC System Installation & Maintenance', 'Ducting & Piping Works', 'Insulation & Sheeting', 'Platforms, Handrails & Structural Fabrication', 'Mechanical Equipment Installation & Alignment', 'Pipe & Valve Installation', 'Power Plant Relocation & Installation', 'AOH (Annual Overhaul) Services', 'Scaffolding Services'],
  },
  {
    icon: Package, title: 'Material Supply & Other Services', color: 'from-green-400 to-emerald-600',
    items: ['Supply of All Construction Materials', 'Manpower Management & Supply', 'Site Supervision & Project Management', 'Housekeeping Services', 'Rental Vehicle Services', 'Aggregate Supply (sand, stone grit)', 'School & Institutional Services'],
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold text-white mb-4">
            Our <span className="text-primary-200">Services</span>
          </motion.h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">Comprehensive industrial and construction services delivered with precision</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        {services.map(({ icon: Icon, title, color, items }, i) => (
          <AnimatedSection key={title} delay={i * 0.05}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`p-8 bg-gradient-to-r ${color}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Icon size={28} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
