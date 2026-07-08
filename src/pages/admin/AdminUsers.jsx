import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Users, ToggleLeft, ToggleRight, Shield, PlusCircle, Phone, UserPlus, ArrowLeft } from 'lucide-react';
import { adminAPI, getErrorMessage } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers({ limit: 100 }).then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleUser(id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User status updated'); },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      fatherName: '',
      siteName: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const createSupervisorMutation = useMutation({
    mutationFn: (payload) => adminAPI.createSupervisor(payload),
    onSuccess: (response) => {
      qc.invalidateQueries(['admin-users']);
      const credentials = response.data.credentials;
      if (credentials) {
        toast.success(`Supervisor created: ${credentials.email} / ${credentials.password}`, { duration: 8000 });
      } else {
        toast.success('Supervisor created');
      }
      reset();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || 'Could not create supervisor');
    },
  });

  const onCreateSupervisor = (formData) => {
    createSupervisorMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Users</h1>
              <p className="text-sm text-gray-500 mt-1">{data?.total || 0} registered users</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-3 shadow-sm">
            <PlusCircle size={18} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Create Supervisor</span>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Supervisor</h2>
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Name</span>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Father Name</span>
              <input
                type="text"
                {...register('fatherName', { required: 'Father name is required' })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none"
              />
              {errors.fatherName && <p className="text-xs text-red-500">{errors.fatherName.message}</p>}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Site Name</span>
              <input
                type="text"
                {...register('siteName', { required: 'Site name is required' })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none"
              />
              {errors.siteName && <p className="text-xs text-red-500">{errors.siteName.message}</p>}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Mobile Number</span>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-4 top-4 text-gray-400" />
                <input
                  type="tel"
                  {...register('phone', { required: 'Mobile number is required' })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none"
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </label>
          </div>
          <div className="grid gap-4 lg:grid-cols-4 mt-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </label>
            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit(onCreateSupervisor)}
              disabled={createSupervisorMutation.isLoading || isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <UserPlus size={16} />
              {createSupervisorMutation.isLoading ? 'Creating...' : 'Create Supervisor'}
            </button>
            <span className="text-sm text-gray-500">The supervisor will use these email and password credentials to log in.</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Email', 'Phone', 'Role', 'Last Login', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))}
                {data?.users?.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs flex items-center gap-1 w-fit ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'admin' && <Shield size={11} />} {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleMutation.mutate(u._id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          {u.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} className="text-gray-400" />}
                          {u.isActive ? 'Block' : 'Unblock'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && data?.users?.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
