import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, getErrorMessage } from '../utils/api';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSendError('');
      await authAPI.forgotPassword({
        email: data.email,
        clientUrl: window.location.origin,
      });
      setSent(true);
      toast.success('Password reset instructions sent.');
    } catch (err) {
      const message = getErrorMessage(err);
      setSendError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img src="/logo.png" alt="Aditri logo" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive a secure reset link</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <Mail size={22} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Check your inbox</h2>
              <p className="mt-2 text-sm text-gray-600">
                If the email is registered, you will receive a password reset link shortly.
              </p>
              <Link to="/login" className="btn-primary mt-6 w-full justify-center">
                <ArrowLeft size={18} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  {...register('email', {
                    required: 'Email required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full btn-primary py-3.5 justify-center text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : <><Send size={18} /> Send Reset Link</>}
              </motion.button>
              {sendError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {sendError}
                </p>
              )}
            </form>
          )}

          {!sent && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
