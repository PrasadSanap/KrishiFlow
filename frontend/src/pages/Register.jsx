import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sprout, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { LANGUAGES } from '../utils/constants';

const initialForm = {
  fullName: '',
  mobileNumber: '',
  email: '',
  password: '',
  village: '',
  district: '',
  state: 'Maharashtra',
  preferredLanguage: 'en',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await register(form);
      toast.success(`Welcome to KrishiFlow, ${data.fullName.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 py-10">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2 font-bold text-xl text-primary-700 mb-8">
          <Sprout /> KrishiFlow
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold mb-1">Farmer Registration</h1>
          <p className="text-sm text-gray-500 mb-6">Create your account to start booking procurement slots</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input name="fullName" required className="input" value={form.fullName} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <input
                  name="mobileNumber"
                  required
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  className="input"
                  value={form.mobileNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" name="email" required className="input" value={form.email} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="input"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Village</label>
                <input name="village" required className="input" value={form.village} onChange={handleChange} />
              </div>
              <div>
                <label className="label">District</label>
                <input name="district" required className="input" value={form.district} onChange={handleChange} />
              </div>
              <div>
                <label className="label">State</label>
                <input name="state" required className="input" value={form.state} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Preferred Language</label>
                <select name="preferredLanguage" className="input" value={form.preferredLanguage} onChange={handleChange}>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
