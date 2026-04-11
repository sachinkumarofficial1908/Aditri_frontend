// Loader.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary-200"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-3 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-lg">
            <img src="/favicon.svg" alt="Aditri favicon" className="w-9 h-9 object-contain" />
          </div>
        </div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading...</p>
      </motion.div>
    </div>
  );
}

