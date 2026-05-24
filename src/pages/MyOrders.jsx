import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from 'lucide-react';
import { orderAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import { getGstRate } from '../utils/cartTotals';

const STATUS_ICON = {
  pending: Clock, confirmed: CheckCircle, processing: Package,
  shipped: Truck, delivered: CheckCircle, cancelled: XCircle,
};
const STATUS_COLOR = {
  pending: 'text-yellow-600 bg-yellow-50',
  confirmed: 'text-blue-600 bg-blue-50',
  processing: 'text-purple-600 bg-purple-50',
  shipped: 'text-indigo-600 bg-indigo-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
};

const getOrderItemGstAmount = (item) => {
  const storedAmount = Number(item.gstAmount);
  if (Number.isFinite(storedAmount) && storedAmount > 0) return storedAmount;
  return Math.round(((item.price || 0) * (item.qty || 0) * getGstRate(item)) / 100);
};

export default function MyOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderAPI.getMyOrders().then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Orders</h1>

        {data?.orders?.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {data?.orders?.map((order) => {
              const Icon = STATUS_ICON[order.orderStatus] || Clock;
              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                      <p className="font-mono text-sm font-bold text-gray-900">{order.orderId}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLOR[order.orderStatus]}`}>
                        <Icon size={13} /> {order.orderStatus}
                      </span>
                      <p className="font-bold text-gray-900">₹{order.total?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item) => (
                        <div key={item._id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                            <p className="text-xs text-gray-400">GST {getGstRate(item)}%: ₹{getOrderItemGstAmount(item).toLocaleString('en-IN')}</p>
                          </div>
                          <span className="font-medium">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST</span>
                        <span>₹{order.tax?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost?.toLocaleString('en-IN')}`}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 mt-3 border-t border-gray-100">
                      <span>📍 {order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                      <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
