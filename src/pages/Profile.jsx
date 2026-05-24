import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI, getErrorMessage } from '../utils/api';

export default function Profile() {
  const [showPasswords, setShowPasswords] = useState(false);
  const { user, updateProfile } = useAuth();
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm();
  const newPassword = watch('newPassword');

  useEffect(() => {
    resetProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [resetProfile, user]);

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone || '',
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPasswordForm();
      toast.success('Password changed successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Account</p>
            <h1 className="mt-1 text-3xl font-display font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your contact details and password.</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-primary-100 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
            <ShieldCheck size={18} className="text-primary-700" />
            Signed in as {user?.role || 'user'}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <User size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
                <p className="text-sm text-gray-500">Keep your account information current.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  {...registerProfile('name', {
                    required: 'Name required',
                    maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                  })}
                  className="input-field"
                  placeholder="Your name"
                />
                {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerProfile('email')}
                    disabled
                    className="input-field pl-10 bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerProfile('phone', {
                      pattern: { value: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' },
                    })}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    className="input-field pl-10"
                    placeholder="9876543210"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                  />
                </div>
                {profileErrors.phone && <p className="text-red-500 text-xs mt-1">{profileErrors.phone.message}</p>}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={savingProfile}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : <><Save size={18} /> Save Profile</>}
            </motion.button>
          </motion.form>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-accent-700">
                <KeyRound size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Use a strong password with letters and numbers.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  type={showPasswords ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Current password"
                  autoComplete="current-password"
                />
                {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    {...registerPassword('newPassword', {
                      required: 'New password required',
                      minLength: { value: 8, message: 'Min 8 chars' },
                      pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must have uppercase, lowercase and number' },
                    })}
                    type={showPasswords ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="New password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  {...registerPassword('confirmPassword', { validate: value => value === newPassword || 'Passwords do not match' })}
                  type={showPasswords ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={savingPassword}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : <><KeyRound size={18} /> Change Password</>}
            </motion.button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Forgot your current password?{' '}
              <Link to="/forgot-password" className="font-semibold text-primary-700 hover:underline">
                Reset it by email
              </Link>
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
