import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, CheckCircle, UserCheck, XCircle, ArrowLeft } from 'lucide-react';
import { employeeAPI } from '../../utils/api';
import { AdminSidebar } from './Dashboard';
import toast from 'react-hot-toast';

const requiredFields = [
  'name',
  'fatherName',
  'addressLine1',
  'pincode',
  'siteName',
  'dob',
  'dateOfJoining',
  'aadharNo',
  'uanNo',
  'esicNo',
  'bankAccountNumber',
  'ifscCode',
  'bankAddress',
  'phone',
  'designation',
  'gradeOfWork',
  'dailyWagesRate',
];

const fieldLabels = {
  name: 'Name',
  fatherName: 'Father Name',
  addressLine1: 'Address Line 1',
  addressLine2: 'Address Line 2',
  pincode: 'Pincode',
  siteName: 'Site Name',
  dob: 'Date of Birth',
  dateOfJoining: 'Date of Joining',
  aadharNo: 'Aadhar Number',
  panNo: 'PAN Number',
  uanNo: 'UAN Number',
  esicNo: 'ESIC Number',
  bankAccountNumber: 'Bank Account',
  ifscCode: 'IFSC Code',
  bankAddress: 'Bank Address',
  phone: 'Phone',
  designation: 'Designation',
  gradeOfWork: 'Grade of Work',
  dailyWagesRate: 'Daily Wages Rate',
  photoUrl: 'Photo URL',
  clmsId: 'CLMS ID',
};

export default function AdminEmployees() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: () => employeeAPI.getAll({ limit: 100 }).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => employeeAPI.create(payload),
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      setShowForm(false);
      toast.success('Employee created successfully');
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });

  const terminateMutation = useMutation({
    mutationFn: (id) => employeeAPI.terminate(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      toast.success('Employee terminated');
    },
    onError: () => toast.error('Failed to terminate employee'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      toast.success('Employee deleted');
    },
    onError: () => toast.error('Failed to delete employee'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      fatherName: '',
      addressLine1: '',
      addressLine2: '',
      pincode: '',
      siteName: '',
      dob: '',
      dateOfJoining: '',
      aadharNo: '',
      panNo: '',
      uanNo: '',
      esicNo: '',
      bankAccountNumber: '',
      ifscCode: '',
      bankAddress: '',
      phone: '',
      designation: '',
      gradeOfWork: '',
      dailyWagesRate: '',
      photoUrl: '',
      clmsId: '',
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const confirmTerminate = (id) => {
    if (window.confirm('Terminate this employee?')) {
      terminateMutation.mutate(id);
    }
  };

  const confirmDelete = (id) => {
    if (window.confirm('Delete this employee permanently?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="employee-master" />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Employee Master</h1>
              <p className="text-sm text-gray-500 mt-1">Supervisors and admins can manage employee records here.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-all"
          >
            <Plus size={16} />
            {showForm ? 'Close Form' : 'Add Employee'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">New Employee</h2>
                <p className="text-sm text-gray-500">Fill in required details and save.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900">
                <XCircle size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
              {Object.entries(fieldLabels).map(([name, label]) => (
                <div key={name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{label}{requiredFields.includes(name) && <span className="text-red-500">*</span>}</label>
                  <input
                    type={name.includes('date') ? 'date' : name.includes('phone') || name.includes('pincode') || name.includes('rate') ? 'text' : 'text'}
                    {...register(name, { required: requiredFields.includes(name) })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none"
                  />
                  {errors[name] && <p className="text-xs text-red-500">{label} is required.</p>}
                </div>
              ))}

              <div className="lg:col-span-2 flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <UserCheck size={18} />
                  {createMutation.isLoading ? 'Creating...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Employee Records</h2>
              <p className="text-sm text-gray-500">{data?.total || 0} employees found.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {['Name', 'Phone', 'Site', 'Designation', 'Status', 'Joined', 'Actions'].map((heading) => (
                    <th key={heading} className="px-5 py-4">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, cell) => (
                      <td key={cell} className="px-5 py-4"><div className="h-4 w-24 rounded-full bg-gray-200" /></td>
                    ))}
                  </tr>
                ))}
                {!isLoading && data?.employees?.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{employee.name}</td>
                    <td className="px-5 py-4">{employee.phone || '—'}</td>
                    <td className="px-5 py-4">{employee.siteName || '—'}</td>
                    <td className="px-5 py-4">{employee.designation || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${employee.status === 'Terminated' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {employee.status === 'Terminated' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-5 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => confirmTerminate(employee._id)}
                        disabled={employee.status === 'Terminated' || terminateMutation.isLoading}
                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <UserCheck size={14} /> Terminate
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(employee._id)}
                        disabled={deleteMutation.isLoading}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && data?.employees?.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">No employees available. Add the first employee to get started.</div>
          )}
        </div>
      </main>
    </div>
  );
}
