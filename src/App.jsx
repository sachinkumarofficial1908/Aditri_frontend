import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SalaryProvider } from './context/SalaryContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/common/Loader';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Projects = lazy(() => import('./pages/Projects'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminEmployees = lazy(() => import('./pages/admin/AdminEmployees'));
const AdminMuster = lazy(() => import('./pages/admin/AdminMuster'));
const AdminAttendance = lazy(() => import('./pages/admin/AdminAttendance'));
const AdminWageSlipGenerator = lazy(() => import('./pages/admin/AdminWageSlipGenerator'));
const AdminPaymentReceipts = lazy(() => import('./pages/admin/AdminPaymentReceipts'));
const SalaryGeneration = lazy(() => import('./pages/admin/SalaryGeneration'));
const SupervisorDashboard = lazy(() => import('./pages/supervisor/Dashboard'));
const AttendanceEntry = lazy(() => import('./pages/supervisor/AttendanceEntry'));
const BulkAttendanceUpload = lazy(() => import('./pages/supervisor/BulkAttendanceUpload'));

// Protected route wrappers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const SupervisorRoute = ({ children }) => {
  const { isAdmin, isSupervisor, isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin && !isSupervisor) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">{children}</div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/products/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/login" element={<GuestRoute><PublicLayout><Login /></PublicLayout></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><PublicLayout><Register /></PublicLayout></GuestRoute>} />

        {/* Protected user routes */}
        <Route path="/checkout" element={<ProtectedRoute><PublicLayout><Checkout /></PublicLayout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><PublicLayout><MyOrders /></PublicLayout></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
        <Route path="/admin/inquiries" element={<AdminRoute><AdminLayout><AdminInquiries /></AdminLayout></AdminRoute>} />
        <Route path="/admin/projects" element={<AdminRoute><AdminLayout><AdminProjects /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
        <Route path="/admin/employees" element={<SupervisorRoute><AdminLayout><AdminEmployees /></AdminLayout></SupervisorRoute>} />
        <Route path="/supervisor" element={<SupervisorRoute><AdminLayout><SupervisorDashboard /></AdminLayout></SupervisorRoute>} />
        <Route path="/supervisor/employees" element={<SupervisorRoute><AdminLayout><AdminEmployees /></AdminLayout></SupervisorRoute>} />
        <Route path="/admin/muster-roll" element={<AdminRoute><AdminLayout><AdminMuster /></AdminLayout></AdminRoute>} />
        <Route path="/admin/attendance-generator" element={<AdminRoute><AdminLayout><AdminAttendance /></AdminLayout></AdminRoute>} />
        <Route path="/admin/wage-slip-generator" element={<AdminRoute><AdminLayout><AdminWageSlipGenerator /></AdminLayout></AdminRoute>} />
        <Route path="/admin/payment-receipts" element={<AdminRoute><AdminLayout><AdminPaymentReceipts /></AdminLayout></AdminRoute>} />
        <Route path="/admin/salary/generate" element={<AdminRoute><AdminLayout><SalaryGeneration /></AdminLayout></AdminRoute>} />
        
        {/* Supervisor Salary/Attendance routes */}
        <Route path="/supervisor/attendance/entry" element={<SupervisorRoute><AdminLayout><AttendanceEntry /></AdminLayout></SupervisorRoute>} />
        <Route path="/supervisor/attendance/bulk" element={<SupervisorRoute><AdminLayout><BulkAttendanceUpload /></AdminLayout></SupervisorRoute>} />

        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </Suspense>
  );
}

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-8xl font-display font-bold text-primary-600">404</h1>
    <p className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</p>
    <a href="/" className="btn-primary mt-6">Back to Home</a>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SalaryProvider>
            <ScrollToTop />
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' } }} />
            <AppRoutes />
          </SalaryProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
