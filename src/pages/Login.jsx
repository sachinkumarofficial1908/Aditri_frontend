import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Chrome, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, getErrorMessage } from '../utils/api';
import toast from 'react-hot-toast';

export function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('oauthError');
    if (oauthError) {
      toast.error(oauthError);
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate]);

  const startGoogleOAuth = () => {
    window.location.assign(authAPI.getGoogleOAuthUrl({ mode: 'login', redirect: '/' }));
  };

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
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

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={startGoogleOAuth}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Chrome size={18} />
            Continue with Google
          </button>

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
  const [emailVerificationId, setEmailVerificationId] = useState('');
  const [emailVerificationToken, setEmailVerificationToken] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [emailOtpExpiresAt, setEmailOtpExpiresAt] = useState(0);
  const [emailOtpSecondsLeft, setEmailOtpSecondsLeft] = useState(0);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm();
  const pwd = watch('password');
  const email = watch('email', '');
  const emailOtp = watch('emailOtp', '');
  const isEmailValid = /^\S+@\S+\.\S+$/.test(email || '');
  const isEmailVerified = isEmailValid && verifiedEmail === email && !!emailVerificationToken;

  useEffect(() => {
    if (email !== verifiedEmail) {
      setEmailVerificationToken('');
    }
  }, [email, verifiedEmail]);

  useEffect(() => {
    if (!emailOtpExpiresAt) {
      setEmailOtpSecondsLeft(0);
      return undefined;
    }

    const tick = () => {
      const seconds = Math.max(0, Math.ceil((emailOtpExpiresAt - Date.now()) / 1000));
      setEmailOtpSecondsLeft(seconds);
      if (seconds === 0) setEmailVerificationId('');
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [emailOtpExpiresAt]);

  const sendEmailOtp = async () => {
    if (!isEmailValid) {
      toast.error('Enter a valid email first.');
      return;
    }

    try {
      setSendingEmailOtp(true);
      const res = await authAPI.sendRegisterEmailOtp(email);
      setEmailVerificationId(res.data.verificationId);
      setEmailVerificationToken('');
      setVerifiedEmail('');
      setEmailOtpExpiresAt(Date.now() + (res.data.expiresInSeconds || 300) * 1000);
      setValue('emailOtp', '');
      toast.success('OTP sent to your email.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!emailVerificationId || !/^\d{6}$/.test(emailOtp || '')) {
      toast.error('Enter the 6-digit email OTP.');
      return;
    }

    try {
      setVerifyingEmailOtp(true);
      const res = await authAPI.verifyRegisterEmailOtp({ verificationId: emailVerificationId, email, otp: emailOtp });
      setVerifiedEmail(res.data.email);
      setEmailVerificationToken(res.data.emailVerificationToken);
      setEmailOtpExpiresAt(0);
      setEmailVerificationId('');
      toast.success('Email verified.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  const startGoogleOAuth = () => {
    window.location.assign(authAPI.getGoogleOAuthUrl({ mode: 'register', redirect: '/' }));
  };

  const onSubmit = async (data) => {
    try {
      if (!isEmailVerified) {
        toast.error('Please verify your email OTP before creating account.');
        return;
      }

      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        emailVerificationToken,
      });
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
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
              <div className="flex gap-2">
                <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  type="email" className="input-field" placeholder="you@example.com" />
                <button
                  type="button"
                  onClick={sendEmailOtp}
                  disabled={!isEmailValid || sendingEmailOtp}
                  className="shrink-0 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingEmailOtp ? 'Sending...' : emailVerificationId ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              {isEmailVerified && <p className="text-green-600 text-xs mt-1">Email verified</p>}
              {!isEmailVerified && emailOtpSecondsLeft > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  OTP expires in {Math.floor(emailOtpSecondsLeft / 60)}:{String(emailOtpSecondsLeft % 60).padStart(2, '0')}
                </p>
              )}
            </div>
            <div>
              <label className="label">Email OTP *</label>
              <div className="flex gap-2">
                <input
                  {...register('emailOtp', {
                    required: 'Email OTP is required',
                    pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' },
                  })}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="input-field"
                  placeholder="123456"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
                  }}
                />
                <button
                  type="button"
                  onClick={verifyEmailOtp}
                  disabled={isEmailVerified || !emailVerificationId || !/^\d{6}$/.test(emailOtp || '') || verifyingEmailOtp}
                  className="shrink-0 rounded-xl border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEmailVerified ? 'Verified' : verifyingEmailOtp ? 'Checking...' : 'Verify'}
                </button>
              </div>
              {errors.emailOtp && <p className="text-red-500 text-xs mt-1">{errors.emailOtp.message}</p>}
            </div>
            <div>
              <label className="label">Phone *</label>
              <input
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' },
                })}
                type="text"
                inputMode="numeric"
                maxLength={10}
                className="input-field"
                placeholder="9876543210"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                }}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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

            <motion.button type="submit" disabled={isSubmitting || !isEmailVerified}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-3.5 justify-center text-base mt-2 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={startGoogleOAuth}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Chrome size={18} />
            Sign up with Google
          </button>

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
