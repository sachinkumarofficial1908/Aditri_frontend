import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../utils/api';
import { Briefcase, LayoutDashboard, LogOut } from 'lucide-react';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function SupervisorDashboard() {
  const { user, logout } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['supervisor-dashboard'],
    queryFn: () => employeeAPI.getAll({ limit: 1 }).then((res) => res.data),
  });

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Supervisor Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your employee master and view key team metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white grid place-items-center">
                <LayoutDashboard size={24} />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Overview</span>
            </div>
            <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Supervisor'}.</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{data?.total ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">employees under your management</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white grid place-items-center">
                <Briefcase size={24} />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Employee Master</span>
            </div>
            <p className="text-sm text-gray-500">Create, terminate, and manage employee records.</p>
            <div className="mt-6">
              <Link
                to="/supervisor/employees"
                className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Open Employee Master
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white grid place-items-center">
                <LogOut size={24} />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Quick Actions</span>
            </div>
            <p className="text-sm text-gray-500">Sign out when you finish your employee management tasks.</p>
            <button
              onClick={handleLogout}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
