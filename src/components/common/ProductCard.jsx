import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="card group flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
        {product.images?.[0]?.url ? (
          <img
            src={resolveImageUrl(product.images[0].url)}
            alt={product.images[0].alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="badge bg-red-500 text-white text-xs px-2 py-1">
              -{product.discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="badge bg-amber-400 text-amber-900 text-xs px-2 py-1">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-700 text-white text-xs px-2 py-1">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/products/${product._id}`}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full w-fit mb-2">
          {product.category}
        </span>

        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-primary-600 transition-colors leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        {product.ratings?.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600">{product.ratings.average.toFixed(1)} ({product.ratings.count})</span>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              ₹{price.toLocaleString('en-IN')}
            </p>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
            )}
            <p className="text-xs text-gray-500">per {product.unit}</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            <ShoppingCart size={14} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
