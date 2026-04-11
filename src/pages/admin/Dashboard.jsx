import React, { useState } from 'react';
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
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
  { to: '/admin/projects', icon: Folder, label: 'Projects' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

function AdminSidebar({ active, isMobileOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity lg:hidden ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-red-500/40 hover:scale-105 hover:border-red-400 flex-shrink-0">
                <img src="/logo.png" alt="Aditri logo" className="w-9 h-9 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-sm">Aditri Admin</p>
                <p className="text-xs text-gray-400 truncate">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === label.toLowerCase()
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <Settings size={18} /> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-900/30 transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export { AdminSidebar };

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
        </div>
        <TrendingUp size={16} className="text-green-500" />
      </div>
      <p className="text-2xl sm:text-3xl font-display font-bold text-gray-900 break-words">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const openMobileSidebar = () => setIsMobileSidebarOpen(true);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:ml-64 lg:p-8 animate-pulse">
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
      <AdminSidebar active="dashboard" isMobileOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

      <main className="flex-1 w-full lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
          </div>
          <button
            onClick={openMobileSidebar}
            className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm"
            aria-label="Open menu"
          >
            <Menu size={18} />
            Menu
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} label="Users" value={s.users || 0} color="bg-blue-500" />
          <StatCard icon={Package} label="Products" value={s.products || 0} color="bg-purple-500" />
          <StatCard icon={ShoppingBag} label="Orders" value={s.orders || 0} color="bg-orange-500" />
          <StatCard
            icon={MessageSquare}
            label="New Inquiries"
            value={s.newInquiries || 0}
            color="bg-red-500"
            sub="Awaiting response"
          />
          <StatCard icon={Folder} label="Projects" value={s.projects || 0} color="bg-teal-500" />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={`\u20B9${((s.totalRevenue || 0) / 100000).toFixed(1)}L`}
            color="bg-green-500"
            sub="Paid orders"
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


