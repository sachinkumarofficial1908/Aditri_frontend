import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../utils/imageUrl';
import { getGstRate } from '../utils/cartTotals';

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, tax, shipping, total, gstLabel, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5">
          <ShoppingCart size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add products to your cart to proceed</p>
        <Link to="/products" className="btn-primary">Browse Products <ArrowRight size={18} /></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Shopping Cart</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">Clear All</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div key={item._id} layout exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.images?.[0]?.url ? (
                      <img src={resolveImageUrl(item.images[0].url)} alt={item.name} className="w-full h-full object-cover" />
                    ) : <Package size={32} className="text-gray-300 m-auto mt-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{item.category} · per {item.unit} · GST {getGstRate(item)}%</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item._id, item.qty - 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, item.qty + 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Plus size={14} />
                        </button>
                        {/* <HELLO></HELLO> */}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-gray-900">₹{((item.discountPrice || item.price) * item.qty).toLocaleString('en-IN')}</p>
                        <button onClick={() => removeItem(item._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">{gstLabel}</span><span className="font-medium">₹{tax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full justify-center py-3.5">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <Link to="/products" className="btn-outline w-full justify-center mt-3 py-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
