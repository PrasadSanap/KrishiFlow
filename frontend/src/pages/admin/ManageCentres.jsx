import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import adminService from '../../services/adminService';
import centreService from '../../services/centreService';
import { getErrorMessage } from '../../services/api';
import { CROPS } from '../../utils/constants';

const emptyForm = {
  name: '',
  address: '',
  district: '',
  state: 'Maharashtra',
  contactNumber: '',
  openingTime: '09:00',
  closingTime: '17:00',
  dailyCapacity: 150,
  supportedCrops: [...CROPS],
  averageProcessingTimeMinutes: 5,
};

const CentreFormModal = ({ initial, onClose, onSaved }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?._id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'dailyCapacity' || name === 'averageProcessingTimeMinutes' ? Number(value) : value });
  };

  const toggleCrop = (crop) => {
    setForm((f) => ({
      ...f,
      supportedCrops: f.supportedCrops.includes(crop)
        ? f.supportedCrops.filter((c) => c !== crop)
        : [...f.supportedCrops, crop],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await centreService.update(form._id, form);
        toast.success('Centre updated');
      } else {
        await centreService.create(form);
        toast.success('Centre created');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <h2 className="font-bold text-lg mb-4">{isEdit ? 'Edit' : 'Add'} Procurement Centre</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input name="name" required className="input" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Address</label>
            <input name="address" required className="input" value={form.address} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">District</label>
              <input name="district" required className="input" value={form.district} onChange={handleChange} />
            </div>
            <div>
              <label className="label">State</label>
              <input name="state" required className="input" value={form.state} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Contact Number</label>
              <input name="contactNumber" required maxLength={10} className="input" value={form.contactNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Daily Capacity</label>
              <input type="number" name="dailyCapacity" required className="input" value={form.dailyCapacity} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Opening Time</label>
              <input type="time" name="openingTime" required className="input" value={form.openingTime} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Closing Time</label>
              <input type="time" name="closingTime" required className="input" value={form.closingTime} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="label">Supported Crops</label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => (
                <button
                  type="button"
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${
                    form.supportedCrops.includes(crop) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-500'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : isEdit ? 'Save Changes' : 'Create Centre'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ManageCentres = () => {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    adminService.getCentres().then((res) => {
      setCentres(res.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this procurement centre?')) return;
    try {
      await centreService.remove(id);
      toast.success('Centre deactivated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Manage Procurement Centres</h1>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={16} /> Add Centre
          </button>
        </div>

        {centres.length === 0 ? (
          <EmptyState title="No procurement centres" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {centres.map((c) => (
              <div key={c._id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold">{c.name}</p>
                  <span className={`badge ${c.isActive ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-600'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{c.address}, {c.district}, {c.state}</p>
                <p className="text-xs text-gray-400 mb-3">{c.openingTime} - {c.closingTime} · Capacity {c.dailyCapacity}/day</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setModalOpen(true);
                    }}
                    className="btn-outline !py-1.5 !px-3 text-xs flex-1"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  {c.isActive && (
                    <button onClick={() => handleDeactivate(c._id)} className="btn-danger !py-1.5 !px-3 text-xs flex-1">
                      <Trash2 size={13} /> Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <CentreFormModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </MainLayout>
  );
};

export default ManageCentres;
