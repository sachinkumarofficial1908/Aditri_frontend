import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI, getErrorMessage } from '../utils/api';

export default function ResetPassword() {
  const [showPwd, setShowPwd] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.resetPassword(token, { password: data.password });
      completeOAuthLogin({ token: res.data.token, user: res.data.user });
      toast.success('Password updated successfully.');
      navigate('/profile', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
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
          <h1 className="text-3xl font-display font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Choose a new password for your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password required',
                    minLength: { value: 8, message: 'Min 8 chars' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must have uppercase, lowercase and number' },
                  })}
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                {...register('confirm', { validate: value => value === password || 'Passwords do not match' })}
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-3.5 justify-center text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Updating...' : <><KeyRound size={18} /> Update Password</>}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Link expired?{' '}
            <Link to="/forgot-password" className="text-primary-600 font-semibold hover:underline">
              Request a new one
            </Link>
          </div>

          <Link to="/login" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700">
            <LogIn size={16} />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
