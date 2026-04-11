import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { AdminSidebar } from './Dashboard';
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="users" />
      <main className="ml-64 flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total || 0} registered users</p>
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
