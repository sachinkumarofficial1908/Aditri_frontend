import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, CheckCircle, UserCheck, XCircle, ArrowLeft, Upload, X, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { employeeAPI } from '../../utils/api';
import { resolveImageUrl } from '../../utils/imageUrl';
import { validations, formatField, validateField, formatBackendErrors } from '../../utils/validations';
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
  'clmsId',
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
  govDailyWage: 'Daily Wage as per Government',
  clmsId: 'CLMS ID',
  photo: 'Photo',
};

const gradeOptions = ['Skilled', 'Semi-skilled', 'Unskilled'];
const statusOptions = ['Valid', 'Terminate', 'Debarred'];

const exportFields = [
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'name', label: 'Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'siteName', label: 'Site Name' },
  { key: 'designation', label: 'Designation' },
  { key: 'gradeOfWork', label: 'Grade of Work' },
  { key: 'status', label: 'Status' },
  { key: 'dateOfJoining', label: 'Date of Joining', type: 'date' },
  { key: 'dob', label: 'Date of Birth', type: 'date' },
  { key: 'addressLine1', label: 'Address Line 1' },
  { key: 'addressLine2', label: 'Address Line 2' },
  { key: 'pincode', label: 'Pincode' },
  { key: 'aadharNo', label: 'Aadhar Number' },
  { key: 'panNo', label: 'PAN Number' },
  { key: 'uanNo', label: 'UAN Number' },
  { key: 'esicNo', label: 'ESIC Number' },
  { key: 'bankAccountNumber', label: 'Bank Account' },
  { key: 'ifscCode', label: 'IFSC Code' },
  { key: 'bankAddress', label: 'Bank Address' },
  { key: 'dailyWagesRate', label: 'Daily Wages Rate' },
  { key: 'govDailyWage', label: 'Daily Wage as per Government' },
  { key: 'clmsId', label: 'CLMS ID' },
  { key: 'createdAt', label: 'Created Date', type: 'date' },
];

const defaultExportFieldKeys = [
  'employeeId',
  'name',
  'phone',
  'siteName',
  'designation',
  'gradeOfWork',
  'status',
  'dateOfJoining',
  'dailyWagesRate',
  'clmsId',
];

export default function AdminEmployees() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusModalEmployee, setStatusModalEmployee] = useState(null);
  const [newStatus, setNewStatus] = useState('Valid');
  const [viewEmployee, setViewEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedExportFields, setSelectedExportFields] = useState(defaultExportFieldKeys);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees', searchTerm, selectedDesignation, selectedGrade, selectedStatus],
    queryFn: () =>
      employeeAPI
        .getAll({
          limit: 100,
          search: searchTerm || undefined,
          status: selectedStatus || undefined,
        })
        .then((res) => res.data),
  });

  // Filter employees locally by designation and grade
  const filteredEmployees = data?.employees?.filter((emp) => {
    const matchesDesignation = !selectedDesignation || emp.designation === selectedDesignation;
    const matchesGrade = !selectedGrade || emp.gradeOfWork === selectedGrade;
    return matchesDesignation && matchesGrade;
  }) || [];

  const formatExportValue = (employee, field) => {
    const value = employee[field.key];
    if (field.type === 'date') {
      return value ? new Date(value).toLocaleDateString('en-IN') : '';
    }
    return value ?? '';
  };

  const toggleExportField = (fieldKey) => {
    setSelectedExportFields((current) => (
      current.includes(fieldKey)
        ? current.filter((key) => key !== fieldKey)
        : [...current, fieldKey]
    ));
  };

  const handleExportEmployees = async () => {
    if (!selectedExportFields.length) {
      toast.error('Select at least one header to export');
      return;
    }

    setIsExporting(true);
    try {
      const response = await employeeAPI.getAll({
        limit: 10000,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
      });

      const exportEmployees = (response.data?.employees || []).filter((emp) => {
        const matchesDesignation = !selectedDesignation || emp.designation === selectedDesignation;
        const matchesGrade = !selectedGrade || emp.gradeOfWork === selectedGrade;
        return matchesDesignation && matchesGrade;
      });

      if (!exportEmployees.length) {
        toast.error('No employees available to export');
        return;
      }

      const fields = exportFields.filter((field) => selectedExportFields.includes(field.key));
      const rows = exportEmployees.map((employee) => fields.reduce((row, field) => {
        row[field.label] = formatExportValue(employee, field);
        return row;
      }, {}));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = fields.map((field) => ({
        wch: Math.max(field.label.length + 4, 18),
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
      XLSX.writeFile(workbook, `employees-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${exportEmployees.length} employees`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export employees');
    } finally {
      setIsExporting(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload) => {
      const formData = new FormData();
      
      // Add all text fields to FormData
      Object.keys(payload).forEach((key) => {
        if (key !== 'photo' && payload[key]) {
          formData.append(key, payload[key]);
        }
      });
      
      // Add photo file if exists
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      return employeeAPI.createWithFile(formData);
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      setShowForm(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setBackendErrors({});
      toast.success('Employee created successfully');
      reset();
    },
    onError: (error) => {
      const errorData = error.response?.data;
      
      if (errorData?.errors) {
        // Handle validation errors from backend
        const formattedErrors = formatBackendErrors(errorData.errors);
        setBackendErrors(formattedErrors);
        const firstError = errorData.errors[0];
        toast.error(firstError?.msg || 'Validation failed');
      } else {
        const message = errorData?.message || error.response?.statusText || 'Failed to create employee';
        setBackendErrors({});
        toast.error(message);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => {
      if (photoFile) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          if (key !== 'photo' && payload[key] !== undefined) {
            formData.append(key, payload[key]);
          }
        });
        formData.append('photo', photoFile);
        return employeeAPI.updateWithFile(id, formData);
      }
      return employeeAPI.update(id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      setShowForm(false);
      setIsEditMode(false);
      setEditingEmployee(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      setBackendErrors({});
      toast.success('Employee updated successfully');
      reset();
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const formattedErrors = formatBackendErrors(errorData.errors);
        setBackendErrors(formattedErrors);
        const firstError = errorData.errors[0];
        toast.error(firstError?.msg || 'Validation failed');
      } else {
        const message = errorData?.message || error.response?.statusText || 'Failed to update employee';
        setBackendErrors({});
        toast.error(message);
      }
    },
  });

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
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
      govDailyWage: '',
      clmsId: '',
    },
  });

  const handlePhotoSelect = useCallback((file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must not exceed 5MB');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handlePhotoChange = (e) => {
    handlePhotoSelect(e.target.files?.[0]);
  };

  const handleEditEmployee = (employee) => {
    setShowForm(true);
    setIsEditMode(true);
    setEditingEmployee(employee);
    setBackendErrors({});
    setPhotoFile(null);
    setPhotoPreview(resolveImageUrl(employee.photoUrl || employee.photoPath) || null);

    const formattedEmployee = {
      ...employee,
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().slice(0, 10) : '',
      dob: employee.dob ? new Date(employee.dob).toISOString().slice(0, 10) : '',
    };

    Object.keys(formattedEmployee).forEach((key) => {
      if (key in fieldLabels) {
        setValue(key, formattedEmployee[key] ?? '');
      }
    });
  };

  const handleViewEmployee = (employee) => {
    setViewEmployee(employee);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setIsEditMode(false);
    setEditingEmployee(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setBackendErrors({});
    reset();
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleFieldChange = (fieldName, value) => {
    // Format the value based on field rules
    const formatted = formatField(fieldName, value);
    setValue(fieldName, formatted);
    
    // Clear backend error for this field when user changes it
    if (backendErrors[fieldName]) {
      setBackendErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const onSubmit = (formData) => {
    // Clear previous errors
    setBackendErrors({});
    
    // Final validation on client side
    const validationErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        validationErrors[field] = `${fieldLabels[field]} is required`;
      } else if (!validateField(field, formData[field])) {
        validationErrors[field] = validations[field]?.message || `${fieldLabels[field]} is invalid`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setBackendErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    // Format dates to ISO 8601 format with time
    const processedData = { ...formData };
    if (processedData.dob) {
      const dobDate = new Date(processedData.dob);
      // Set to noon to avoid timezone issues
      dobDate.setUTCHours(12, 0, 0, 0);
      processedData.dob = dobDate.toISOString();
    }
    if (processedData.dateOfJoining) {
      const joinDate = new Date(processedData.dateOfJoining);
      // Set to noon to avoid timezone issues
      joinDate.setUTCHours(12, 0, 0, 0);
      processedData.dateOfJoining = joinDate.toISOString();
    }

    if (isEditMode && editingEmployee) {
      updateMutation.mutate({ id: editingEmployee._id, payload: processedData });
      return;
    }

    createMutation.mutate(processedData);
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

  const terminateMutation = useMutation({
    mutationFn: (id) => employeeAPI.terminate(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      toast.success('Employee status updated');
    },
    onError: () => toast.error('Failed to update employee status'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => employeeAPI.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      setStatusModalEmployee(null);
      toast.success('Employee status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-employees']);
      toast.success('Employee deleted');
    },
    onError: () => toast.error('Failed to delete employee'),
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-100 text-green-700';
      case 'Terminate':
        return 'bg-red-100 text-red-700';
      case 'Debarred':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
            onClick={() => {
              setShowForm((value) => {
                const next = !value;
                if (next) {
                  setIsEditMode(false);
                  setEditingEmployee(null);
                  setBackendErrors({});
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  reset();
                }
                return next;
              });
            }}
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
                <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Edit Employee' : 'New Employee'}</h2>
                <p className="text-sm text-gray-500">Fill in required details and save. Fields marked with * are required.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
              {/* Photo Upload */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Photo</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition">
                      <Upload size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Photo (JPG/PNG, max 5MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {photoPreview && (
                    <div className="relative w-24 h-24">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={handlePhotoRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Input Fields */}
              {Object.entries(fieldLabels)
                .filter(([key]) => key !== 'photo')
                .map(([name, label]) => {
                  if (name === 'gradeOfWork') {
                    // Dropdown for Grade of Work
                    return (
                      <div key={name} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                          {requiredFields.includes(name) && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          {...register(name, { required: requiredFields.includes(name) })}
                          className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none transition ${
                            backendErrors[name] || errors[name]
                              ? 'border-red-500 bg-red-50 focus:border-red-500'
                              : 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white'
                          }`}
                        >
                          <option value="">Select {label}</option>
                          {gradeOptions.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                        {(errors[name] || backendErrors[name]) && (
                          <p className="text-xs text-red-500">{backendErrors[name] || `${label} is required`}</p>
                        )}
                      </div>
                    );
                  }

                  // Date inputs
                  if (name.includes('date')) {
                    return (
                      <div key={name} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                          {requiredFields.includes(name) && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="date"
                          {...register(name, { required: requiredFields.includes(name) })}
                          className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none transition ${
                            backendErrors[name] || errors[name]
                              ? 'border-red-500 bg-red-50 focus:border-red-500'
                              : 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white'
                          }`}
                        />
                        {(errors[name] || backendErrors[name]) && (
                          <p className="text-xs text-red-500">{backendErrors[name] || `${label} is required`}</p>
                        )}
                      </div>
                    );
                  }

                  // Regular text inputs with validation
                  return (
                    <div key={name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {label}
                        {requiredFields.includes(name) && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        {...register(name, { 
                          required: requiredFields.includes(name),
                          onChange: (e) => handleFieldChange(name, e.target.value),
                        })}
                        maxLength={validations[name]?.maxLength || 255}
                        placeholder={
                          name === 'aadharNo'
                            ? '12 digits'
                            : name === 'panNo'
                              ? '10 characters'
                              : name === 'phone' || name === 'pincode'
                                ? 'Numbers only'
                                : ''
                        }
                        className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none transition ${
                          backendErrors[name] || errors[name]
                            ? 'border-red-500 bg-red-50 focus:border-red-500'
                            : 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white'
                        }`}
                      />
                      {(errors[name] || backendErrors[name]) && (
                        <p className="text-xs text-red-500">{backendErrors[name] || `${label} is required`}</p>
                      )}
                    </div>
                  );
                })}

              <div className="lg:col-span-2 flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <UserCheck size={18} />
                  {createMutation.isPending ? 'Creating...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Employee Records</h2>
                <p className="text-sm text-gray-500">{filteredEmployees.length || 0} employees found.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportPanel((value) => !value)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <Download size={15} />
                Download Data
              </button>
            </div>

            {showExportPanel && (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Excel Export</h3>
                    <p className="text-xs text-gray-600">Choose the headers you want, then export the filtered employees.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExportFields(exportFields.map((field) => field.key))}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExportFields(defaultExportFieldKeys)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExportFields([])}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleExportEmployees}
                    disabled={isExporting || !selectedExportFields.length}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Download size={15} />
                    {isExporting ? 'Exporting...' : 'Export Excel'}
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {exportFields.map((field) => (
                  <label key={field.key} className="flex min-h-[38px] items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedExportFields.includes(field.key)}
                      onChange={() => toggleExportField(field.key)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
            )}

            {/* Search and Filters */}
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search by Name, Phone, or Aadhar</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                >
                  <option value="">All Designations</option>
                  {[...new Set(data?.employees?.map((emp) => emp.designation) || [])].map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Grade of Work</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                >
                  <option value="">All Grades</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                >
                  <option value="">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
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
                {!isLoading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                      No employees found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
                {!isLoading && filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{employee.name}</td>
                    <td className="px-5 py-4">{employee.phone || '—'}</td>
                    <td className="px-5 py-4">{employee.siteName || '—'}</td>
                    <td className="px-5 py-4">{employee.designation || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(employee.status)}`}>
                        {employee.status === 'Valid' && <CheckCircle size={14} />}
                        {employee.status === 'Terminate' && <XCircle size={14} />}
                        {employee.status === 'Debarred' && <UserCheck size={14} />}
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-5 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleViewEmployee(employee)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditEmployee(employee)}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusModalEmployee(employee);
                          setNewStatus(employee.status);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <UserCheck size={14} /> Status
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(employee._id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {viewEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
                  <p className="text-sm text-gray-500">View full record for {viewEmployee.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewEmployee(null)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries({
                  Name: viewEmployee.name,
                  'Father Name': viewEmployee.fatherName,
                  'Site Name': viewEmployee.siteName,
                  Designation: viewEmployee.designation,
                  'Grade of Work': viewEmployee.gradeOfWork,
                  'CLMS ID': viewEmployee.clmsId,
                  'Daily Wage Rate': viewEmployee.dailyWagesRate,
                  'Gov Daily Wage': viewEmployee.govDailyWage,
                  Phone: viewEmployee.phone,
                  'Aadhar No': viewEmployee.aadharNo,
                  'UAN No': viewEmployee.uanNo,
                  'ESIC No': viewEmployee.esicNo,
                  'Bank Account': viewEmployee.bankAccountNumber,
                  IFSC: viewEmployee.ifscCode,
                  'Bank Address': viewEmployee.bankAddress,
                  'Date of Joining': viewEmployee.dateOfJoining ? new Date(viewEmployee.dateOfJoining).toLocaleDateString('en-IN') : '—',
                  DOB: viewEmployee.dob ? new Date(viewEmployee.dob).toLocaleDateString('en-IN') : '—',
                  Status: viewEmployee.status,
                }).map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">{label}</p>
                    <p className="text-sm text-gray-800">{value || '—'}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewEmployee(null)}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {statusModalEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Employee Status</h3>
              <p className="text-sm text-gray-600 mb-4">
                Employee: <strong>{statusModalEmployee.name}</strong>
              </p>

              <div className="space-y-3 mb-6">
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={newStatus === status}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-900">{status}</span>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        status === 'Valid'
                          ? 'bg-green-500'
                          : status === 'Terminate'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                      }`}
                    />
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalEmployee(null)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => updateStatusMutation.mutate({ id: statusModalEmployee._id, status: newStatus })}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {updateStatusMutation.isPending ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
