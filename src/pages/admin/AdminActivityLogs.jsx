import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Filter, Search, Download } from 'lucide-react';
import { AdminSidebar } from './Dashboard';
import toast from 'react-hot-toast';

const activityLogAPI = {
  getAll: (params) => fetch(`/api/activity-logs?${new URLSearchParams(params)}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
  }).then(r => r.json()),
};

const actionLabels = {
  employee_create: { label: 'Create Employee', color: 'bg-green-100 text-green-800' },
  employee_update: { label: 'Update Employee', color: 'bg-blue-100 text-blue-800' },
  employee_delete: { label: 'Delete Employee', color: 'bg-red-100 text-red-800' },
  employee_status_change: { label: 'Change Status', color: 'bg-purple-100 text-purple-800' },
  project_create: { label: 'Create Project', color: 'bg-green-100 text-green-800' },
  project_update: { label: 'Update Project', color: 'bg-blue-100 text-blue-800' },
  project_delete: { label: 'Delete Project', color: 'bg-red-100 text-red-800' },
  salary_generate: { label: 'Generate Salary', color: 'bg-yellow-100 text-yellow-800' },
  login: { label: 'Login', color: 'bg-indigo-100 text-indigo-800' },
  logout: { label: 'Logout', color: 'bg-gray-100 text-gray-800' },
};

export default function AdminActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', searchTerm, selectedAction, page, limit],
    queryFn: () => activityLogAPI.getAll({
      search: searchTerm || undefined,
      action: selectedAction || undefined,
      page,
      limit,
    }),
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="activity-logs" />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Activity Logs</h1>
              <p className="text-sm text-gray-500 mt-1">Track all admin activities and changes</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                >
                  <option value="">All Actions</option>
                  {Object.entries(actionLabels).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <label className="flex-1">
                  <span className="text-xs font-medium text-gray-700 mb-1 block">Items per page</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Admin</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Target</th>
                  <th className="px-5 py-4">Date & Time</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-32 rounded-full bg-gray-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 rounded-full bg-gray-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 rounded-full bg-gray-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-36 rounded-full bg-gray-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 rounded-full bg-gray-200" /></td>
                  </tr>
                ))}
                {!isLoading && data?.logs?.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                )}
                {!isLoading && data?.logs?.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{log.adminName}</div>
                      <div className="text-xs text-gray-500">{log.adminEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${actionLabels[log.action]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {actionLabels[log.action]?.label || log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{log.targetName || '—'}</div>
                      <div className="text-xs text-gray-500">{log.targetType}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.logs && data.total > 0 && (
            <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 text-sm">
                  Page <span className="font-medium">{page}</span> of <span className="font-medium">{Math.ceil(data.total / limit)}</span>
                </div>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(data.total / limit)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
