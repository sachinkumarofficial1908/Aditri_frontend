import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Users,
  Package,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  Folder,
  ChevronRight,
} from 'lucide-react';
import { adminAPI } from '../../utils/api';

function StatCard({ icon: Icon, label, value, color, sub, to }) {
  const content = (
    <motion.div
      whileHover={{ y: -3 }}
      className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${color}`}>
          <Icon size={20} className="text-white sm:h-[22px] sm:w-[22px]" />
        </div>
        <TrendingUp size={16} className="text-green-500" />
      </div>
      <p className="break-words font-display text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </motion.div>
  );

  return (
    to ? <Link to={to} className="block h-full">{content}</Link> : content
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 sm:h-36 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.stats || {};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} label="Users" value={s.users || 0} color="bg-blue-500" to="/admin/users" />
          <StatCard icon={Package} label="Products" value={s.products || 0} color="bg-purple-500" to="/admin/products" />
          <StatCard icon={ShoppingBag} label="Orders" value={s.orders || 0} color="bg-orange-500" to="/admin/orders" />
          <StatCard
            icon={MessageSquare}
            label="New Inquiries"
            value={s.newInquiries || 0}
            color="bg-red-500"
            sub="Awaiting response"
            to="/admin/inquiries"
          />
          <StatCard icon={Folder} label="Projects" value={s.projects || 0} color="bg-teal-500" to="/admin/projects" />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={`\u20B9${((s.totalRevenue || 0) / 100000).toFixed(1)}L`}
            color="bg-green-500"
            sub="Paid orders"
            to="/admin/orders"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-5">Monthly Revenue (\u20B9)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `\u20B9${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`\u20B9${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="amount" fill="#388e3c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-5">Order Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {data?.recentOrders?.length === 0 && <p className="text-sm text-gray-400 p-5 text-center">No orders yet</p>}
              {data?.recentOrders?.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{order.orderId}</p>
                    <p className="text-xs text-gray-500 truncate">{order.user?.name || order.guestInfo?.name || 'Guest'}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-semibold text-gray-900">\u20B9{order.total?.toLocaleString('en-IN')}</p>
                    <span
                      className={`badge text-xs ${
                        order.orderStatus === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.orderStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Inquiries</h3>
              <Link to="/admin/inquiries" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {data?.recentInquiries?.length === 0 && (
                <p className="text-sm text-gray-400 p-5 text-center">No inquiries yet</p>
              )}
              {data?.recentInquiries?.map((inq) => (
                <div key={inq._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{inq.name}</p>
                      <p className="text-xs text-gray-500 truncate">{inq.subject}</p>
                    </div>
                    <span
                      className={`badge text-xs flex-shrink-0 ${
                        inq.status === 'new'
                          ? 'bg-red-100 text-red-700'
                          : inq.status === 'replied'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

