// AdminOrders.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { AdminSidebar } from './Dashboard';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => orderAPI.getAll({ status: statusFilter || undefined, limit: 50 }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => orderAPI.updateStatus(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-orders']); toast.success('Order updated!'); },
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="orders" />
      <main className="ml-64 flex-1 p-8 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">{data?.total || 0} total orders</p>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto text-sm py-2.5">
            <option value="">All Status</option>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))}
                {data?.orders?.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-xs text-gray-700 font-medium">{o.orderId}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{o.user?.name || o.guestInfo?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-400">{o.user?.email || o.guestInfo?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{o.items?.length} item(s)</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">₹{o.total?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${STATUS_COLORS[o.orderStatus]}`}>{o.orderStatus}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <select
                        value={o.orderStatus}
                        onChange={e => updateMutation.mutate({ id: o._id, data: { orderStatus: e.target.value } })}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && data?.orders?.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-40" />
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminOrders;
