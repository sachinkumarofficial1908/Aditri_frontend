import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, LogIn } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { inquiryAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/common/AnimatedSection';
import toast from 'react-hot-toast';

const SERVICE_TYPES = ['general', 'electrical', 'civil', 'mechanical', 'supply', 'other'];

export default function Contact() {
  const { user, isAuthenticated } = useAuth();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
    }
  }, [setValue, user]);

  const mutation = useMutation({
    mutationFn: (data) => inquiryAPI.create(data),
    onSuccess: () => {
      toast.success('Inquiry submitted! We will contact you within 24 hours.', { duration: 5000, icon: '✅' });
      reset({ name: user?.name || '', email: user?.email || '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit. Try again.'),
  });

  const onSubmit = (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to send an inquiry.');
      return;
    }

    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">
            Get In <span className="text-primary-200">Touch</span>
          </motion.h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Reach out for inquiries, project requirements or to get a free quote
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <AnimatedSection direction="left" className="lg:col-span-2 space-y-5">
            {[
              { icon: MapPin, title: 'Address', content: 'A, Naini Prayagraj\nUttar Pradesh - 211008', color: 'bg-red-100 text-red-600' },
              { icon: Phone, title: 'Phone', content: '+91 9598033414 (Head)\n+91 7355411985 (Office)', color: 'bg-green-100 text-green-600' },
              { icon: Mail, title: 'Email', content: 'aditri.c.services@gmail.com', color: 'bg-blue-100 text-blue-600' },
              { icon: Clock, title: 'Working Hours', content: 'Mon – Sat: 9:00 AM – 6:00 PM\nSunday: On Request', color: 'bg-amber-100 text-amber-600' },
            ].map(({ icon: Icon, title, content, color }) => (
              <motion.div key={title} whileHover={{ x: 4 }} className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{title}</p>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{content}</p>
                </div>
              </motion.div>
            ))}

            {/* Map embed placeholder */}
            <div className="bg-gradient-to-br from-primary-800 to-accent-700 rounded-2xl p-5 text-white">
              <p className="font-semibold mb-2">GSTIN: 09CDYPM7630P1ZC</p>
              <p className="text-sm text-white/70 mb-1">MSME: UDYAM-UP-03-0014185</p>
              <p className="text-sm text-white/70">Electrical License: AD00001310</p>
            </div>
          </AnimatedSection>

          {/* Inquiry Form */}
          <AnimatedSection direction="right" className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Send an Inquiry</h2>

              {!isAuthenticated && (
                <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-primary-600 p-2 text-white">
                      <LogIn size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Login required</p>
                      <p className="mt-1 text-sm text-gray-600">Please login before sending a query so we can link it to your account.</p>
                      <Link to="/login" className="mt-3 inline-flex rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                        Login to Send Query
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Your Name *</label>
                    <input {...register('name', { required: 'Name is required' })}
                      className="input-field bg-gray-50" placeholder="Sandeep Kumar" readOnly />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                      type="email" className="input-field bg-gray-50 cursor-not-allowed" placeholder="you@company.com" readOnly />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      {...register('phone', {
                        pattern: { value: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' },
                        maxLength: { value: 10, message: 'Phone number must be exactly 10 digits' },
                        minLength: { value: 10, message: 'Phone number must be exactly 10 digits' },
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      minLength={10}
                      onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }}
                      className="input-field"
                      placeholder="9876543210"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input
                      {...register('pincode', {
                        pattern: { value: /^\d{6}$/, message: 'Pincode must be exactly 6 digits' },
                        maxLength: { value: 6, message: 'Pincode must be exactly 6 digits' },
                        minLength: { value: 6, message: 'Pincode must be exactly 6 digits' },
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      minLength={6}
                      onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }}
                      className="input-field"
                      placeholder="560001"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label">Company</label>
                  <input {...register('company')} className="input-field" placeholder="Your Company Name" />
                </div>

                <div>
                  <label className="label">Service Type</label>
                  <select {...register('serviceType')} className="input-field">
                    {SERVICE_TYPES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Subject *</label>
                  <input {...register('subject', { required: 'Subject is required' })}
                    className="input-field" placeholder="Project Inquiry / Product Quote" />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="label">Message *</label>
                  <textarea {...register('message', { required: 'Message required', minLength: { value: 10, message: 'Min 10 characters' } })}
                    rows={5} className="input-field resize-none"
                    placeholder="Describe your project requirements, quantity, timeline..." />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <motion.button
                  type="submit" disabled={mutation.isPending || !isAuthenticated}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full btn-primary py-3.5 text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={18} /> Send Inquiry
                    </span>
                  )}
                </motion.button>

                <p className="text-xs text-gray-500 text-center">
                  We respond within 24 business hours. Your information is kept confidential.
                </p>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
