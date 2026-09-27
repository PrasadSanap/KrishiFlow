import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, User } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import farmerService from '../services/farmerService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../utils/constants';

const Profile = () => {
  const { setUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    farmerService.getProfile().then((res) => {
      setForm(res.data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await farmerService.updateProfile(form);
      setUser((prev) => ({ ...prev, ...res.data }));
      localStorage.setItem('kq_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('kq_user')), ...res.data }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-primary-600" />
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input name="fullName" className="input" value={form.fullName || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Mobile Number</label>
            <input name="mobileNumber" className="input" value={form.mobileNumber || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50" value={form.email || ''} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Village</label>
              <input name="village" className="input" value={form.village || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">District</label>
              <input name="district" className="input" value={form.district || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">State</label>
              <input name="state" className="input" value={form.state || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Preferred Language</label>
              <select name="preferredLanguage" className="input" value={form.preferredLanguage || 'en'} onChange={handleChange}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default Profile;
