// Checkout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { orderAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 10000 ? 0 : 200;
  const total = subtotal + tax + shipping;

  const mutation = useMutation({
    mutationFn: (data) => orderAPI.create(data),
    onSuccess: (res) => {
      clearCart();
      toast.success(`Order placed! ID: ${res.data.order.orderId}`, { duration: 6000 });
      navigate('/my-orders');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Order failed'),
  });

  const onSubmit = (form) => {
    mutation.mutate({
      items: items.map(i => ({ product: i._id, qty: i.qty })),
      shippingAddress: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      paymentMethod: form.paymentMethod,
      notes: form.notes,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-display font-bold text-lg mb-5">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Street Address *</label>
                  <input {...register('street', { required: 'Required' })} className="input-field" placeholder="House/Plot No., Street Name" />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[['city', 'City *'], ['state', 'State *'], ['pincode', 'PIN Code *']].map(([k, l]) => (
                    <div key={k}>
                      <label className="label">{l}</label>
                      <input {...register(k, { required: 'Required' })} className="input-field" />
                      {errors[k] && <p className="text-red-500 text-xs mt-1">{errors[k].message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-display font-bold text-lg mb-5">Payment Method</h2>
              <div className="space-y-3">
                {[{ v: 'cod', l: 'Cash on Delivery' }, { v: 'bank_transfer', l: 'Bank Transfer' }, { v: 'upi', l: 'UPI' }].map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                    <input {...register('paymentMethod')} type="radio" value={v} defaultChecked={v === 'cod'} className="accent-primary-600" />
                    <span className="text-sm font-medium">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <label className="label">Additional Notes</label>
              <textarea {...register('notes')} className="input-field resize-none" rows={3} placeholder="Any special instructions..." />
            </div>
            <motion.button type="submit" disabled={mutation.isPending}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-4 justify-center text-base">
              {mutation.isPending ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString('en-IN')}`}
            </motion.button>
          </form>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4">Order ({items.length} items)</h2>
            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
              {items.map(i => (
                <div key={i._id} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1 mr-2">{i.name} ×{i.qty}</span>
                  <span className="font-medium flex-shrink-0">₹{((i.discountPrice || i.price) * i.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <hr className="border-gray-100 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">GST (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
