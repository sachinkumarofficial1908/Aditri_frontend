import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Search, Package, X, Check,
  Upload, ImageIcon, Star, Eye, EyeOff, ChevronDown, ArrowLeft,
} from 'lucide-react';
import { productAPI, uploadAPI } from '../../utils/api';
import { resolveImageUrl } from '../../utils/imageUrl';
import { AdminSidebar } from './Dashboard';
import toast from 'react-hot-toast';

// ─── Constants matching backend ────────────────────────────────────────────────
const CATEGORIES = ['Electrical', 'Cable', 'Networking', 'Safety', 'Mechanical', 'Tools', 'Civil', 'Other'];
const SUBCATEGORIES = [
  'Electrical & Electronics',
  'Cables & Connectivity',
  'Networking & Communication',
  'Safety Materials / PPE',
  'Mechanical, Piping & Industrial Tools',
  'Multimedia & Accessories',
  'Chemical & Miscellaneous',
  'Civil Supplies',
];
const UNITS = ['piece', 'meter', 'kg', 'pack', 'set', 'roll', 'box', 'pair', 'kit', 'MT', 'CFT', 'sq.ft', 'bundle', 'bag', 'liter'];

// ─── Image Uploader Component ─────────────────────────────────────────────────
function ImageUploader({ images = [], onChange, productId }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('images', f));
      const res = await uploadAPI.images(formData);
      const newImgs = res.data.images;
      onChange([...images, ...newImgs]);
      toast.success(`${newImgs.length} image(s) uploaded!`);
    } catch {
      toast.error('Upload failed. Max 5MB per image, images only.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const setAltText = (idx, alt) => {
    const updated = [...images];
    updated[idx] = { ...updated[idx], alt };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group"
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <Upload size={22} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Click or drag images here</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP up to 5MB each · Max 5 images</p>
            </div>
          </div>
        )}
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
            >
              <div className="aspect-square">
                <img
                  src={resolveImageUrl(img.url)}
                  alt={img.alt || `Product image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-300"><svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>'; }}
                />
              </div>
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-amber-400 text-amber-900 text-xs px-1.5 py-0.5 rounded font-bold">Main</span>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          First image is used as the main product image. Drag to reorder (in next update).
        </p>
      )}
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '',
    price: '', discountPrice: '',
    category: 'Electrical', subcategory: 'Electrical & Electronics',
    stock: '', unit: 'piece', minOrderQty: 1,
    brand: '', sku: '',
    isFeatured: false, isActive: true,
    tags: '', images: [],
    specifications: [],
    ...(initial ? {
      ...initial,
      tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : '',
      images: initial.images || [],
      specifications: initial.specifications || [],
    } : {}),
  });

  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSpec = () => {
    if (specKey && specVal) {
      set('specifications', [...form.specifications, { key: specKey, value: specVal }]);
      setSpecKey(''); setSpecVal('');
    }
  };

  const removeSpec = (i) => set('specifications', form.specifications.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      discountPrice: parseFloat(form.discountPrice) || 0,
      stock: parseInt(form.stock) || 0,
      minOrderQty: parseInt(form.minOrderQty) || 1,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    onSave(payload);
  };

  const TABS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing & Stock' },
    { id: 'images', label: `Images (${form.images.length})` },
    { id: 'specs', label: 'Specs & Tags' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900">
              {initial ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in all required fields</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-7 gap-1">
          {TABS.map(t => (
            <button
              key={t.id} type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === t.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-7">

            {/* ── TAB: Basic Info ── */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Product Name *</label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className="input-field" required
                    placeholder="e.g. SS 304 Ball Valve 2 Inch Flanged"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Sub-Category (Catalog Group)</label>
                    <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)} className="input-field">
                      <option value="">-- Select --</option>
                      {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Short Description</label>
                  <input
                    value={form.shortDescription}
                    onChange={e => set('shortDescription', e.target.value)}
                    className="input-field" maxLength={500}
                    placeholder="Brief one-line product summary"
                  />
                </div>

                <div>
                  <label className="label">Full Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    className="input-field resize-none" rows={4} required
                    placeholder="Detailed product description, applications, certifications..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Brand / Make</label>
                    <input
                      value={form.brand}
                      onChange={e => set('brand', e.target.value)}
                      className="input-field" placeholder="Siemens / 3M / ISI Equivalent"
                    />
                  </div>
                  <div>
                    <label className="label">SKU / Product Code</label>
                    <input
                      value={form.sku}
                      onChange={e => set('sku', e.target.value)}
                      className="input-field font-mono" placeholder="ACS-ELE-001"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={form.isFeatured}
                      onChange={e => set('isFeatured', e.target.checked)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Star size={14} className="text-amber-500" /> Featured Product
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={form.isActive}
                      onChange={e => set('isActive', e.target.checked)}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Eye size={14} /> Active / Visible
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ── TAB: Pricing & Stock ── */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Selling Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number" value={form.price}
                        onChange={e => set('price', e.target.value)}
                        className="input-field pl-7" required min="0" step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Discounted Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number" value={form.discountPrice}
                        onChange={e => set('discountPrice', e.target.value)}
                        className="input-field pl-7" min="0" step="0.01"
                        placeholder="0.00 (leave 0 for no discount)"
                      />
                    </div>
                    {form.price && form.discountPrice && parseFloat(form.discountPrice) > 0 && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        {Math.round(((parseFloat(form.price) - parseFloat(form.discountPrice)) / parseFloat(form.price)) * 100)}% discount applied
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Stock Quantity *</label>
                    <input
                      type="number" value={form.stock}
                      onChange={e => set('stock', e.target.value)}
                      className="input-field" required min="0"
                    />
                  </div>
                  <div>
                    <label className="label">Unit</label>
                    <select value={form.unit} onChange={e => set('unit', e.target.value)} className="input-field">
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Min Order Qty</label>
                    <input
                      type="number" value={form.minOrderQty}
                      onChange={e => set('minOrderQty', e.target.value)}
                      className="input-field" min="1"
                    />
                  </div>
                </div>

                {/* Price preview */}
                {form.price && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Price Preview</p>
                    <div className="flex items-baseline gap-3">
                      <p className="text-3xl font-display font-bold text-gray-900">
                        ₹{(parseFloat(form.discountPrice) > 0 ? parseFloat(form.discountPrice) : parseFloat(form.price)).toLocaleString('en-IN')}
                      </p>
                      {parseFloat(form.discountPrice) > 0 && (
                        <>
                          <p className="text-lg text-gray-400 line-through">₹{parseFloat(form.price).toLocaleString('en-IN')}</p>
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                            -{Math.round(((parseFloat(form.price) - parseFloat(form.discountPrice)) / parseFloat(form.price)) * 100)}%
                          </span>
                        </>
                      )}
                      <span className="text-sm text-gray-500">per {form.unit || 'piece'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Images ── */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-100">
                  <p className="font-semibold mb-1">📷 Image Upload Guidelines</p>
                  <ul className="text-xs space-y-0.5 text-blue-600 list-disc list-inside">
                    <li>Accept: JPG, PNG, WebP (max 5MB per image)</li>
                    <li>Upload up to 5 images per product</li>
                    <li>First image becomes the main product image</li>
                    <li>Use white/light background for product images</li>
                    <li>Minimum recommended: 800×800px for best quality</li>
                  </ul>
                </div>
                <ImageUploader
                  images={form.images}
                  onChange={(imgs) => set('images', imgs)}
                  productId={initial?._id}
                />
              </div>
            )}

            {/* ── TAB: Specs & Tags ── */}
            {activeTab === 'specs' && (
              <div className="space-y-5">
                {/* Specifications */}
                <div>
                  <label className="label">Technical Specifications</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={specKey} onChange={e => setSpecKey(e.target.value)}
                      className="input-field flex-1 py-2" placeholder="e.g. Voltage Rating"
                    />
                    <input
                      value={specVal} onChange={e => setSpecVal(e.target.value)}
                      className="input-field flex-1 py-2" placeholder="e.g. 415V AC"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())}
                    />
                    <button
                      type="button" onClick={addSpec}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {form.specifications.length > 0 && (
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      {form.specifications.map((s, i) => (
                        <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <div className="flex gap-4 flex-1">
                            <span className="font-medium text-gray-700 w-36 truncate">{s.key}</span>
                            <span className="text-gray-600">{s.value}</span>
                          </div>
                          <button type="button" onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 p-1">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="label">Search Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={e => set('tags', e.target.value)}
                    className="input-field"
                    placeholder="ball valve, ss304, flanged, piping, industrial"
                  />
                  <p className="text-xs text-gray-400 mt-1">Tags improve product searchability</p>
                  {form.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                        <span key={i} className="bg-primary-100 text-primary-700 text-xs px-2.5 py-1 rounded-full">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-7 py-5 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-3xl">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center py-3">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center py-3 text-base">
              <Check size={18} /> {initial ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Admin Products Page ─────────────────────────────────────────────────
export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, categoryFilter, subcategoryFilter],
    queryFn: () => productAPI.getAll({
      search: search || undefined,
      category: categoryFilter || undefined,
      subcategory: subcategoryFilter || undefined,
      limit: 100,
      sort: '-createdAt',
    }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); setShowForm(false); toast.success('✅ Product created!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); setEditProduct(null); toast.success('✅ Product updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); toast.success('Product deleted'); },
  });

  const toggleFeatured = async (product) => {
    await updateMutation.mutateAsync({ id: product._id, data: { isFeatured: !product.isFeatured } });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const products = data?.products || [];

  // Subcategory counts for badge
  const subCatCounts = {};
  products.forEach(p => { if (p.subcategory) subCatCounts[p.subcategory] = (subCatCounts[p.subcategory] || 0) + 1; });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="products" />

      <main className="ml-64 flex-1 p-8 bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500 mt-1">
                {data?.total || 0} total · {products.filter(p => p.isFeatured).length} featured · {products.filter(p => p.stock === 0).length} out of stock
              </p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Sub-category quick filters */}
        <div className="mb-5 overflow-x-auto">
          <div className="flex flex-wrap gap-2 pb-2 w-full min-w-min lg:flex-nowrap lg:min-w-max">
            <button
              onClick={() => setSubcategoryFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${!subcategoryFilter ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              All ({data?.total || 0})
            </button>
            {SUBCATEGORIES.map(s => (
              <button
                key={s}
                onClick={() => setSubcategoryFilter(subcategoryFilter === s ? '' : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  subcategoryFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-primary-50 hover:border-primary-200'
                }`}
              >
                {s} {subCatCounts[s] ? `(${subCatCounts[s]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 text-sm py-2.5"
              placeholder="Search by name, SKU, tag, brand..."
            />
          </div>
          <select
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="input-field w-auto text-sm py-2.5"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Product table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Category / Sub', 'Price', 'Stock', 'Featured', 'Images', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

                {products.map((p) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Product name + SKU */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 max-w-[220px]">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {p.images?.[0]?.url ? (
                            <img src={resolveImageUrl(p.images[0].url)} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.sku || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="badge bg-primary-50 text-primary-700 text-xs">{p.category}</span>
                      {p.subcategory && (
                        <p className="text-xs text-gray-400 mt-1 max-w-[130px] truncate">{p.subcategory}</p>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{((p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price) || 0).toLocaleString('en-IN')}
                      </p>
                      {p.discountPrice > 0 && (
                        <p className="text-xs text-gray-400 line-through">₹{p.price.toLocaleString('en-IN')}</p>
                      )}
                      <p className="text-xs text-gray-400">/{p.unit}</p>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      <span className={`badge text-xs font-medium ${
                        p.stock > 20 ? 'bg-green-100 text-green-700' :
                        p.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          p.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                        }`}
                        title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star size={15} className={p.isFeatured ? 'fill-amber-500' : ''} />
                      </button>
                    </td>

                    {/* Image count */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon size={14} className={p.images?.length ? 'text-primary-500' : 'text-gray-300'} />
                        <span className={`text-xs font-medium ${p.images?.length ? 'text-primary-600' : 'text-gray-400'}`}>
                          {p.images?.length || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {!isLoading && products.length === 0 && (
              <div className="text-center py-16">
                <Package size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showForm && (
            <ProductForm
              onSave={(data) => createMutation.mutate(data)}
              onClose={() => setShowForm(false)}
            />
          )}
          {editProduct && (
            <ProductForm
              initial={editProduct}
              onSave={(data) => updateMutation.mutate({ id: editProduct._id, data })}
              onClose={() => setEditProduct(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
