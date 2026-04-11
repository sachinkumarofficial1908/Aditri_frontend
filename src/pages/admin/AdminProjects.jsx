import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Folder, X, Check } from 'lucide-react';
import { projectAPI } from '../../utils/api';
import { AdminSidebar } from './Dashboard';
import toast from 'react-hot-toast';

function ProjectForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    title: '', client: '', location: '', category: 'electrical',
    description: '', status: 'completed', isFeatured: false, highlights: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="font-display font-bold text-xl">{initial ? 'Edit Project' : 'Add Project'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, highlights: form.highlights ? form.highlights.split('\n').filter(Boolean) : [] }); }} className="p-6 space-y-4">
          <div>
            <label className="label">Project Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className="input-field" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Client *</label>
              <input value={form.client} onChange={e => set('client', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label">Location *</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                {['electrical', 'civil', 'mechanical', 'solar', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                {['completed', 'ongoing', 'upcoming'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-field resize-none" rows={3} required />
          </div>
          <div>
            <label className="label">Highlights (one per line)</label>
            <textarea value={form.highlights} onChange={e => set('highlights', e.target.value)} className="input-field resize-none" rows={3} placeholder="Grid Synchronization&#10;Panel Installation&#10;Cable Laying" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="pfeat" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="pfeat" className="text-sm font-medium cursor-pointer">Featured on Homepage</label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center"><Check size={16} /> {initial ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminProjects() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => projectAPI.getAll({ limit: 100 }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: projectAPI.create,
    onSuccess: () => { qc.invalidateQueries(['admin-projects']); setShowForm(false); toast.success('Project added!'); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-projects']); setEditItem(null); toast.success('Updated!'); },
  });
  const deleteMutation = useMutation({
    mutationFn: projectAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['admin-projects']); toast.success('Deleted'); },
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="projects" />
      <main className="ml-64 flex-1 p-8 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-900">Projects</h1>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> Add Project</button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 bg-white rounded-2xl animate-pulse" />)}
          {data?.projects?.map((p) => (
            <motion.div key={p._id} whileHover={{ y: -3 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`p-4 ${p.status === 'completed' ? 'bg-green-50' : p.status === 'ongoing' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`badge text-xs mb-2 ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                    {p.isFeatured && <span className="badge bg-amber-100 text-amber-700 text-xs ml-1">Featured</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditItem(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => window.confirm('Delete?') && deleteMutation.mutate(p._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">{p.title}</h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-primary-600 font-medium mb-0.5">{p.client}</p>
                <p className="text-xs text-gray-500">📍 {p.location}</p>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showForm && <ProjectForm onSave={createMutation.mutate} onClose={() => setShowForm(false)} />}
          {editItem && <ProjectForm initial={editItem} onSave={(data) => updateMutation.mutate({ id: editItem._id, data })} onClose={() => setEditItem(null)} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
