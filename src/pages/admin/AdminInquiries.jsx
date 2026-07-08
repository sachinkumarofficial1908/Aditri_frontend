import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Eye, ArrowLeft } from 'lucide-react';
import { getErrorMessage, inquiryAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  new: 'bg-red-100 text-red-700',
  read: 'bg-blue-100 text-blue-700',
  replied: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

function InquiryModal({ inquiry, onClose }) {
  const [reply, setReply] = useState('');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => inquiryAPI.updateStatus(inquiry._id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries(['admin-inquiries']);
      toast.success(variables?.adminReply ? 'Reply sent to customer!' : 'Updated!');
      onClose();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || 'Unable to update inquiry.');
    },
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display font-bold text-xl">Inquiry Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              ['Name', inquiry.name], ['Email', inquiry.email], ['Phone', inquiry.phone || '—'],
              ['Company', inquiry.company || '—'], ['Service', inquiry.serviceType], ['Status', inquiry.status],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{k}</p>
                <p className="text-gray-900 font-medium">{v}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Subject</p>
            <p className="text-gray-900 font-semibold">{inquiry.subject}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Message</p>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
          </div>

          {inquiry.adminReply && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-2">Your Reply</p>
              <p className="text-gray-700">{inquiry.adminReply}</p>
            </div>
          )}

          <div>
            <label className="label">Reply to Customer (email will be sent)</label>
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              className="input-field resize-none" rows={4}
              placeholder="Type your reply here..." />
          </div>

          <div className="flex gap-3">
            <select
              defaultValue={inquiry.status}
              onChange={e => mutation.mutate({ status: e.target.value })}
              className="input-field flex-1 py-2.5 text-sm"
            >
              {['new', 'read', 'replied', 'closed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={() => mutation.mutate({ status: 'replied', adminReply: reply })}
              disabled={!reply || mutation.isPending}
              className="btn-primary py-2.5 px-5 disabled:opacity-50">
              <Send size={16} /> Send Reply
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminInquiries() {
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inquiries', status],
    queryFn: () => inquiryAPI.getAll({ status: status || undefined, limit: 50 }).then(r => r.data),
  });

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Inquiries</h1>
              <p className="text-sm text-gray-500 mt-1">{data?.total || 0} total</p>
            </div>
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input-field w-auto text-sm py-2.5">
            <option value="">All Status</option>
            {['new', 'read', 'replied', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
          {data?.inquiries?.map((inq) => (
            <motion.div key={inq._id} whileHover={{ x: 3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelected(inq)}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={18} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{inq.name}</p>
                    <span className={`badge text-xs ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
                    {inq.status === 'new' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-sm text-gray-700 font-medium truncate">{inq.subject}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{inq.email} · {inq.serviceType}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">{new Date(inq.createdAt).toLocaleDateString('en-IN')}</p>
                <button className="mt-2 p-1.5 rounded-lg text-primary-600 hover:bg-primary-50">
                  <Eye size={15} />
                </button>
              </div>
            </motion.div>
          ))}
          {!isLoading && data?.inquiries?.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
              <p>No inquiries found</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selected && <InquiryModal inquiry={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
