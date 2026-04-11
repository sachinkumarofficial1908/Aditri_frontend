import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingCart, ArrowLeft, Package, Check, Star,
  Share2, Heart, Minus, Plus, Tag, Shield
} from 'lucide-react';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productAPI.getById(id).then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-3xl" />
        <div className="space-y-4 pt-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded w-2/3" />
          <div className="h-24 bg-gray-200 rounded mt-6" />
          <div className="h-12 bg-gray-200 rounded mt-6" />
        </div>
      </div>
    </div>
  );

  if (isError || !data?.product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Package size={48} className="text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Product not found</h2>
      <Link to="/products" className="btn-primary mt-4">Back to Products</Link>
    </div>
  );

  const product = data.product;
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(`${qty}× ${product.name} added to cart!`, { icon: '🛒' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/products" className="hover:text-primary-600 flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={16} /> Products
          </Link>
          <span>/</span>
          <span className="text-primary-600">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <motion.div
              className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-4"
              whileHover={{ scale: 1.01 }}
            >
              {product.images?.[activeImage]?.url ? (
                <img
                  src={product.images[activeImage].url}
                  alt={product.images[activeImage].alt || product.name}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Package size={80} className="text-gray-300" />
                </div>
              )}
            </motion.div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === i ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="pt-2">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="badge bg-primary-100 text-primary-700 text-xs mb-3">{product.category}</span>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>
              <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-all">
                <Heart size={20} />
              </button>
            </div>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={16}
                      className={s <= Math.round(product.ratings.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <p className="text-4xl font-display font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</p>
              <div>
                {hasDiscount && (
                  <>
                    <p className="text-base text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</p>
                    <span className="badge bg-red-100 text-red-600 text-xs">-{product.discountPercent}% OFF</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">Price per <strong>{product.unit}</strong> · Min order: {product.minOrderQty} {product.unit}</p>

            {/* Stock */}
            <div className={`flex items-center gap-2 mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? <Check size={16} /> : <Package size={16} />}
              <span className="text-sm font-medium">
                {product.stock > 0 ? `In Stock (${product.stock} ${product.unit}s available)` : 'Out of Stock'}
              </span>
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                <Tag size={12} /> SKU: {product.sku}
              </p>
            )}

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(product.minOrderQty || 1, q - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="text-base font-semibold w-10 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary flex-1 py-3.5 justify-center text-base"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </motion.button>

                <button className="p-3.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            )}

            {/* Description */}
            <div className="p-5 bg-gray-50 rounded-2xl mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {product.specifications.map(({ key, value }, i) => (
                    <div key={i} className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="px-4 py-2.5 font-medium text-gray-700 border-r border-gray-100">{key}</div>
                      <div className="px-4 py-2.5 text-gray-600">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map(tag => (
                  <span key={tag} className="badge bg-gray-100 text-gray-600 text-xs px-3 py-1">#{tag}</span>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, text: 'Quality Assured' },
                { icon: Package, text: 'Genuine Products' },
                { icon: Check, text: 'Bulk Orders' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-primary-50 rounded-xl text-center">
                  <Icon size={18} className="text-primary-600" />
                  <span className="text-xs font-medium text-primary-700">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
