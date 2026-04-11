// Projects.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { projectAPI } from '../utils/api';
import AnimatedSection from '../components/common/AnimatedSection';

const CATS = ['all', 'electrical', 'civil', 'mechanical', 'solar', 'other'];
const STATUS = ['all', 'completed', 'ongoing'];

export default function Projects() {
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['projects', cat, status],
    queryFn: () => projectAPI.getAll({ category: cat === 'all' ? undefined : cat, status: status === 'all' ? undefined : status, limit: 50 }).then(r => r.data),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold text-white mb-4">Our <span className="text-primary-200">Projects</span></motion.h1>
          <p className="text-white/80 text-lg">Delivering excellence across industries and regions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${cat === c ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {STATUS.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${status === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={`${cat}-${status}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.projects?.map((p, i) => (
                <AnimatedSection key={p._id} delay={i * 0.05}>
                  <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
                    <div className="h-44 bg-gradient-to-br from-primary-800 to-accent-700 p-6 flex flex-col justify-end relative overflow-hidden">
                      <div className="absolute inset-0 grid-pattern opacity-50" />
                      <div className="relative">
                        <div className="flex gap-2 mb-2">
                          <span className={`badge text-xs ${p.status === 'completed' ? 'bg-green-400/20 text-green-200' : 'bg-blue-400/20 text-blue-200'}`}>{p.status}</span>
                          <span className="badge bg-white/10 text-white/80 text-xs capitalize">{p.category}</span>
                        </div>
                        <h3 className="text-white font-bold text-base line-clamp-2">{p.title}</h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-primary-600 mb-1">{p.client}</p>
                      <p className="text-xs text-gray-500 mb-3">📍 {p.location}</p>
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{p.description}</p>
                      {p.highlights?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.highlights.slice(0, 3).map(h => (
                            <span key={h} className="badge bg-gray-100 text-gray-600 text-xs">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && data?.projects?.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No projects found for selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
