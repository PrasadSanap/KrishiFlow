import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sprout, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.fullName.split(' ')[0]}!`);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'centre') navigate('/centre');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-bold text-xl text-primary-700 mb-8">
          <Sprout /> KrishiFlow
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold mb-1">Login to KrishiFlow</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                required
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                required
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Login'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            New farmer?{' '}
            <Link to="/register" className="text-primary-700 font-semibold">
              Register here
            </Link>
          </p>

          <div className="mt-6 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600">Demo accounts:</p>
            <p>Farmer: farmer@KrishiFlow.com / Farmer@123</p>
            <p>Centre: centre@KrishiFlow.com / Centre@123</p>
            <p>Admin: admin@KrishiFlow.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
