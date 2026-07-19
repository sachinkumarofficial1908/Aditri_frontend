import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  DollarSign,
  Folder,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
  { to: '/admin/projects', icon: Folder, label: 'Projects' },
  { to: '/admin/muster-roll', icon: UploadCloud, label: 'Muster Roll' },
  { to: '/admin/attendance-generator', icon: UploadCloud, label: 'Timing Attendance' },
  { to: '/admin/wage-slip-generator', icon: UploadCloud, label: 'Wage Slip Generator' },
  { to: '/admin/payment-receipts', icon: UploadCloud, label: 'Payment Receipts' },
  { to: '/admin/salary/generate', icon: DollarSign, label: 'Salary Management' },
  { to: '/admin/employees', icon: Briefcase, label: 'Employee Master' },
  { to: '/admin/activity-logs', icon: Clock, label: 'Activity Logs' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

const SUPERVISOR_NAV = [
  { to: '/supervisor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/supervisor/employees', icon: Briefcase, label: 'Employee Master' },
  { to: '/supervisor/attendance/entry', icon: DollarSign, label: 'Attendance Entry' },
  { to: '/supervisor/attendance/bulk', icon: UploadCloud, label: 'Bulk Upload' },
];

function getPageTitle(pathname, nav) {
  const current = [...nav].sort((a, b) => b.to.length - a.to.length).find((item) => {
    if (item.end) return pathname === item.to;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });

  return current?.label || 'Dashboard';
}

export function AdminSidebar({ isMobileOpen = false, onClose = () => {} }) {
  const { user, logout, isSupervisor } = useAuth();
  const nav = isSupervisor ? SUPERVISOR_NAV : ADMIN_NAV;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-gray-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-gray-800 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-black shadow-lg transition-all duration-300 hover:scale-105 hover:border-red-400 hover:shadow-red-500/40">
                <img src="/logo.png" alt="Aditri logo" className="h-9 w-9 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold">Aditri Admin</p>
                <p className="truncate text-xs text-gray-400">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-800 lg:hidden"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-gray-800 p-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
          >
            <Settings size={18} /> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-900/30"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { isSupervisor } = useAuth();
  const nav = isSupervisor ? SUPERVISOR_NAV : ADMIN_NAV;
  const title = getPageTitle(pathname, nav);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 lg:pl-64">
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm"
          aria-label="Open menu"
        >
          <Menu size={18} />
          Menu
        </button>
        <p className="min-w-0 truncate text-sm font-semibold text-gray-900">{title}</p>
      </header>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
