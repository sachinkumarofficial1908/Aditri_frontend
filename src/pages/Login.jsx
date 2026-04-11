import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300 hover:shadow-red-500/40 hover:scale-105 hover:border-red-400">
            <img src="/logo.png" alt="Aditri logo" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Aditri account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                type="email" className="input-field" placeholder="you@example.com" autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password required' })}
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10" placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <motion.button type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-3.5 justify-center text-base">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2"><LogIn size={18} /> Sign In</span>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs text-gray-500">
            <Shield size={14} className="text-primary-600" />
            Your data is encrypted and secure
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Register() {
  const [showPwd, setShowPwd] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const pwd = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, phone: data.phone });
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300 hover:shadow-red-500/40 hover:scale-105 hover:border-red-400">
            <img src="/logo.png" alt="Aditri logo" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Aditri Constructions Services</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name', { required: 'Name required' })} className="input-field" placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input {...register('phone')} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password', {
                  required: 'Password required',
                  minLength: { value: 8, message: 'Min 8 chars' },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must have uppercase, lowercase and number' }
                })}
                  type={showPwd ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input {...register('confirm', { validate: v => v === pwd || 'Passwords do not match' })}
                type="password" className="input-field" placeholder="••••••••" />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <motion.button type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-3.5 justify-center text-base mt-2">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;

