// Checkout.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { authAPI, orderAPI } from '../utils/api';
import { getFirebaseAuth } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TEST_OTP_PHONE = '9999999999';

export function Checkout() {
  const { items, subtotal, clearCart, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const recaptchaVerifierRef = useRef(null);
  const confirmationResultRef = useRef(null);
  const [testVerificationId, setTestVerificationId] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 10000 ? 0 : 200;
  const total = subtotal + tax + shipping;
  const deliveryPhone = watch('phone', '');
  const otp = watch('otp', '');
  const isPhoneValid = /^\d{10}$/.test(deliveryPhone || '');
  const isTestPhone = deliveryPhone === TEST_OTP_PHONE;
  const isPhoneVerified = isPhoneValid && verifiedPhone === deliveryPhone && !!phoneVerificationToken;
  const hasOtpSession = isTestPhone ? !!testVerificationId : !!confirmationResultRef.current;
  const canVerifyOtp = !isPhoneVerified && hasOtpSession && otpSecondsLeft > 0 && isPhoneValid && /^\d{6}$/.test(otp || '');

  useEffect(() => {
    if (user?.phone) setValue('phone', user.phone);
  }, [setValue, user?.phone]);

  useEffect(() => {
    if (deliveryPhone !== verifiedPhone) {
      setPhoneVerificationToken('');
    }
  }, [deliveryPhone, verifiedPhone]);

  useEffect(() => {
    if (!otpExpiresAt) {
      setOtpSecondsLeft(0);
      return undefined;
    }

    const tick = () => {
      const seconds = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setOtpSecondsLeft(seconds);
      if (seconds === 0) {
        confirmationResultRef.current = null;
        setTestVerificationId('');
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [otpExpiresAt]);

  useEffect(() => () => {
    recaptchaVerifierRef.current?.clear?.();
  }, []);

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      if (!isPhoneValid) throw new Error('Phone number must be exactly 10 digits');

      if (isTestPhone) {
        return authAPI.sendPhoneOtp(deliveryPhone).then((res) => ({ type: 'test', data: res.data }));
      }

      if (!recaptchaVerifierRef.current) {
        const firebaseAuth = getFirebaseAuth();
        recaptchaVerifierRef.current = new RecaptchaVerifier(firebaseAuth, 'checkout-recaptcha-container', {
          size: 'invisible',
        });
      }

      const confirmationResult = await signInWithPhoneNumber(getFirebaseAuth(), `+91${deliveryPhone}`, recaptchaVerifierRef.current);
      return { type: 'firebase', confirmationResult };
    },
    onSuccess: (result) => {
      confirmationResultRef.current = result.type === 'firebase' ? result.confirmationResult : null;
      setTestVerificationId(result.type === 'test' ? result.data.verificationId : '');
      setOtpExpiresAt(Date.now() + 3 * 60 * 1000);
      setVerifiedPhone('');
      setPhoneVerificationToken('');
      setValue('otp', '');
      toast.success(result.type === 'test' ? `Testing OTP: ${result.data.devOtp}` : `OTP sent to +91 ${deliveryPhone}`);
    },
    onError: (err) => {
      recaptchaVerifierRef.current?.clear?.();
      recaptchaVerifierRef.current = null;
      toast.error(err.message || 'Unable to send OTP');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!canVerifyOtp) throw new Error('OTP expired or incomplete. Please resend OTP.');
      if (isTestPhone) {
        const res = await authAPI.verifyPhoneOtp({ verificationId: testVerificationId, phone: deliveryPhone, otp });
        return { phoneVerificationToken: res.data.phoneVerificationToken };
      }
      const credential = await confirmationResultRef.current.confirm(otp);
      return { phoneVerificationToken: await credential.user.getIdToken() };
    },
    onSuccess: ({ phoneVerificationToken: verifiedToken }) => {
      setVerifiedPhone(deliveryPhone);
      setPhoneVerificationToken(verifiedToken);
      setOtpExpiresAt(0);
      confirmationResultRef.current = null;
      setTestVerificationId('');
      toast.success('Phone number verified.');
    },
    onError: (err) => toast.error(err.message || 'Invalid OTP'),
  });

  const mutation = useMutation({
    mutationFn: (data) => orderAPI.create(data),
    onSuccess: (res) => {
      clearCart();
      toast.success(`Order placed! ID: ${res.data.order.orderId}`, { duration: 6000 });
      navigate('/my-orders');
    },
    onError: (err) => {
      const data = err.response?.data;
      if (data?.code === 'PRODUCT_UNAVAILABLE') {
        data.invalidProducts?.forEach((id) => removeItem(id));
        toast.error(data.message || 'Some cart products are no longer available.');
        return;
      }

      const validationMessage = data?.errors?.[0]?.msg;
      toast.error(validationMessage || data?.message || 'Unable to place order. Please check your cart and try again.');
    },
  });

  const onSubmit = (form) => {
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      navigate('/cart');
      return;
    }

    const invalidCartItem = items.find((item) => !item._id);
    if (invalidCartItem) {
      toast.error('Your cart contains an invalid product. Please remove it and add the product again.');
      return;
    }

    if (!isPhoneVerified) {
      toast.error('Please verify your delivery phone number before placing the order.');
      return;
    }

    mutation.mutate({
      items: items.map(i => ({ product: i._id, qty: i.qty })),
      shippingAddress: {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
      },
      phoneVerificationToken,
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
                  <div>
                    <label className="label">City *</label>
                    <input {...register('city', { required: 'City is required' })} className="input-field" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input {...register('state', { required: 'State is required' })} className="input-field" />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="label">PIN Code *</label>
                    <input
                      {...register('pincode', {
                        required: 'PIN code is required',
                        pattern: { value: /^\d{6}$/, message: 'PIN code must be exactly 6 digits' },
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="input-field"
                      placeholder="123456"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
                      }}
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Delivery Phone *</label>
                    <div className="flex gap-2">
                      <input
                        {...register('phone', {
                          required: 'Delivery phone number is required',
                          pattern: { value: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' },
                        })}
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        className="input-field"
                        placeholder="9876543210"
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => sendOtpMutation.mutate()}
                        disabled={!isPhoneValid || sendOtpMutation.isPending}
                        className="shrink-0 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sendOtpMutation.isPending ? 'Sending...' : confirmationResultRef.current ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    {isPhoneVerified && <p className="text-green-600 text-xs mt-1">Phone number verified</p>}
                    {!isPhoneVerified && otpSecondsLeft > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        OTP session expires in {Math.floor(otpSecondsLeft / 60)}:{String(otpSecondsLeft % 60).padStart(2, '0')}
                      </p>
                    )}
                    {isTestPhone && !isPhoneVerified && (
                      <p className="text-xs text-gray-500 mt-1">Testing number uses OTP 123456.</p>
                    )}
                  </div>
                  <div>
                    <label className="label">OTP *</label>
                    <div className="flex gap-2">
                      <input
                        {...register('otp', {
                          required: 'OTP is required',
                          pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' },
                        })}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="input-field"
                        placeholder="123456"
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => verifyOtpMutation.mutate()}
                        disabled={!canVerifyOtp || verifyOtpMutation.isPending || isPhoneVerified}
                        className="shrink-0 rounded-xl border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPhoneVerified ? 'Verified' : verifyOtpMutation.isPending ? 'Checking...' : 'Verify'}
                      </button>
                    </div>
                    {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
                  </div>
                </div>
                <div id="checkout-recaptcha-container" />
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
            <motion.button type="submit" disabled={mutation.isPending || !isPhoneVerified}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-4 justify-center text-base disabled:cursor-not-allowed disabled:opacity-60">
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
