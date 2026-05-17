import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Grid3X3, List, Tag } from 'lucide-react';
import { productAPI } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';
import ProductCard from '../components/common/ProductCard';
import AnimatedSection from '../components/common/AnimatedSection';

const CATEGORIES = ['All', 'Electrical', 'Cable', 'Networking', 'Safety', 'Mechanical', 'Tools', 'Civil', 'Other'];
const SUBCATEGORIES = [
  { label: 'All Products', value: '' },
  { label: 'Electrical & Electronics', value: 'Electrical & Electronics' },
  { label: 'Cables & Connectivity', value: 'Cables & Connectivity' },
  { label: 'Networking & Communication', value: 'Networking & Communication' },
  { label: 'Safety Materials / PPE', value: 'Safety Materials / PPE' },
  { label: 'Mechanical, Piping & Tools', value: 'Mechanical, Piping & Industrial Tools' },
  { label: 'Multimedia & Accessories', value: 'Multimedia & Accessories' },
  { label: 'Chemical & Miscellaneous', value: 'Chemical & Miscellaneous' },
  { label: 'Civil Supplies', value: 'Civil Supplies' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low → High' },
  { value: '-price', label: 'Price: High → Low' },
  { value: 'name', label: 'Name: A → Z' },
  { value: '-ratings.average', label: 'Top Rated' },
];

const SUBCATEGORY_ICONS = {
  'Electrical & Electronics': '⚡',
  'Cables & Connectivity': '🔌',
  'Networking & Communication': '📡',
  'Safety Materials / PPE': '🦺',
  'Mechanical, Piping & Industrial Tools': '🔧',
  'Multimedia & Accessories': '🖥️',
  'Chemical & Miscellaneous': '🧪',
  'Civil Supplies': '🏗️',
};

export default function Products() {
  const [category, setCategory] = useState('All');
  const [subcategory, setSubcategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [inputVal, setInputVal] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { category, subcategory, search, sort, page }],
    queryFn: () => productAPI.getAll({
      category: category === 'All' ? undefined : category,
      subcategory: subcategory || undefined,
      search: search || undefined,
      sort, page, limit: 12,
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputVal);
    setPage(1);
  };

  const clearSearch = () => { setSearch(''); setInputVal(''); setPage(1); };

  const handleSubcategory = (val) => {
    setSubcategory(val);
    setCategory('All');
    setPage(1);
  };

  const handleCategory = (c) => {
    setCategory(c);
    setSubcategory('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-display font-bold text-white mb-3"
          >
            Industrial <span className="text-primary-200">Supplies</span>
          </motion.h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Premium quality electrical, safety, networking, mechanical supplies at competitive prices
          </p>
        </div>
      </div>

      {/* Catalog Groups / Sub-category strip */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {SUBCATEGORIES.map(({ label, value }) => (
              <motion.button
                key={value} whileTap={{ scale: 0.95 }}
                onClick={() => handleSubcategory(value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  subcategory === value
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                {SUBCATEGORY_ICONS[value] && <span>{SUBCATEGORY_ICONS[value]}</span>}
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort bar */}
        <AnimatedSection className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Search products, SKU, brand..."
                  className="input-field pl-10 py-2.5 text-sm"
                />
              </div>
              <button type="submit" className="btn-primary py-2.5 px-5 text-sm">Search</button>
              {search && (
                <button type="button" onClick={clearSearch}
                  className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100">
                  <X size={18} />
                </button>
              )}
            </form>

            <div className="flex gap-2">
              <select
                value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="input-field w-auto text-sm py-2.5"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid3X3 size={17} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map(c => (
            <motion.button
              key={c} whileTap={{ scale: 0.97 }}
              onClick={() => handleCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === c && !subcategory
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>

        {/* Active filters summary */}
        {(search || subcategory || category !== 'All') && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {category !== 'All' && !subcategory && (
              <span className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full">
                <Tag size={11} /> {category}
                <button onClick={() => setCategory('All')} className="ml-1 hover:text-primary-900"><X size={11} /></button>
              </span>
            )}
            {subcategory && (
              <span className="flex items-center gap-1 bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full">
                {SUBCATEGORY_ICONS[subcategory]} {SUBCATEGORIES.find(s => s.value === subcategory)?.label}
                <button onClick={() => setSubcategory('')} className="ml-1 hover:text-primary-900"><X size={11} /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                🔍 "{search}"
                <button onClick={clearSearch} className="ml-1 hover:text-gray-900"><X size={11} /></button>
              </span>
            )}
            {data && (
              <span className="text-xs text-gray-400 ml-auto">
                {data.total} result{data.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Products grid / list */}
        {isLoading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
            : 'space-y-3'}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-5 bg-gray-200 rounded w-1/3 mt-3" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Search size={36} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-5">Try adjusting filters or search terms</p>
            <button onClick={() => { setCategory('All'); setSubcategory(''); clearSearch(); }}
              className="btn-primary">Clear all filters</button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${subcategory}-${search}-${page}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={isFetching ? 'opacity-60 pointer-events-none' : ''}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {data?.products.map((p) => (
                    <AnimatedSection key={p._id}><ProductCard product={p} /></AnimatedSection>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.products.map((p) => (
                    <ListProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </button>
            {Array.from({ length: data.pages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), Math.min(data.pages, page + 2)
            ).map(p => (
              <button
                key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  page === p ? 'bg-primary-600 text-white shadow-md' : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List view card ────────────────────────────────────────────────────────────
function ListProductCard({ product }) {
  const { addItem } = require('../context/CartContext').useCart();
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <motion.div whileHover={{ x: 4 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
        {product.images?.[0]?.url
          ? <img src={resolveImageUrl(product.images[0].url)} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{product.category}</span>
            <h3 className="font-semibold text-gray-900 text-sm mt-1 line-clamp-1">{product.name}</h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.shortDescription || product.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</p>
            {product.discountPrice > 0 && <p className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</p>}
            <p className="text-xs text-gray-400">/{product.unit}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
          </span>
          <button
            onClick={() => { addItem(product); require('react-hot-toast').default.success(`${product.name} added!`); }}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}
