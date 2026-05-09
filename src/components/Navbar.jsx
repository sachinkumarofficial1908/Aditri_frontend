import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown, Phone, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Products', to: '/products' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setUserMenu(false); }, [location]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-800 text-white text-xs py-1.5 px-4 hidden md:flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Phone size={12} />
          +91-9598033414 | aditri.c.services@gmail.com
        </span>
        <span className="flex items-center gap-1">
          <Shield size={12} />
          ISO 9001 | 14001 | 45001 Certified | MSME Registered
        </span>
      </div>

      <motion.nav
        initial={false}
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-red-500/40 hover:scale-105 hover:border-red-400">
                <img
                  src="/logo.png"
                  alt="Aditri logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-gray-900 text-sm leading-tight">Aditri Constructions Services</p>
                <p className="text-xs text-primary-600 font-medium">Your Vision, Our Expertise</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(({ label, to }) => (
                <NavLink key={to} to={to} className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100 hover:text-primary-700'}`
                }>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-all">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all text-sm font-medium">
                    <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                      >
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 font-medium">
                            <Shield size={15} /> Admin Panel
                          </Link>
                        )}
                        {user?.role === 'supervisor' && (
                          <Link to="/supervisor" className="flex items-center gap-2 px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 font-medium">
                            <Briefcase size={15} /> Supervisor Panel
                          </Link>
                        )}
                        <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User size={15} /> My Orders
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={15} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4">Login</Link>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ label, to }) => (
                  <NavLink key={to} to={to}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
                {isAuthenticated && user?.role === 'supervisor' && (
                  <Link to="/supervisor" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary-700 hover:bg-primary-50">
                    Supervisor Panel
                  </Link>
                )}
                {!isAuthenticated && (
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Link to="/login" className="btn-primary text-sm py-2 text-center">Login</Link>
                    <Link to="/register" className="btn-outline text-sm py-2 text-center">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
