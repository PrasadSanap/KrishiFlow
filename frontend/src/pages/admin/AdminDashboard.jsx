import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building2, CalendarCheck, Clock, PackageCheck, PackageX,
  Wallet, IndianRupee, Settings,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/constants';

const COLORS = ['#16a34a', '#f59e0b', '#a855f7', '#ef4444', '#0ea5e9'];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={18} />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then((res) => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">System-wide analytics and management</p>
          </div>
          <Link to="/admin/centres" className="btn-outline">
            <Settings size={16} /> Manage Centres
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Total Farmers" value={stats.totalFarmers} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Building2} label="Total Centres" value={stats.totalCentres} color="bg-teal-50 text-teal-600" />
          <StatCard icon={CalendarCheck} label="Today's Bookings" value={stats.todaysBookings} color="bg-primary-50 text-primary-600" />
          <StatCard icon={Clock} label="Waiting Farmers" value={stats.waitingFarmers} color="bg-amber-50 text-amber-600" />
          <StatCard icon={PackageCheck} label="Completed Procurement" value={stats.completedProcurements} color="bg-indigo-50 text-indigo-600" />
          <StatCard icon={PackageX} label="Pending Procurement" value={stats.pendingProcurements} color="bg-orange-50 text-orange-600" />
          <StatCard icon={Wallet} label="Completed Payments" value={stats.completedPayments} color="bg-purple-50 text-purple-600" />
          <StatCard icon={IndianRupee} label="Total Procurement Amount" value={formatCurrency(stats.totalProcurementAmount)} color="bg-green-50 text-green-600" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Daily Bookings</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.dailyBookingStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip labelFormatter={(d) => formatDate(d)} />
                <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Centre-wise Queue</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.centreWiseStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="centreName" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Payment Status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={stats.paymentStatusStats} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                  {stats.paymentStatusStats.map((entry, index) => (
                    <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Procurement Status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={[
                  { name: 'Completed', value: stats.completedProcurements },
                  { name: 'Pending', value: stats.pendingProcurements },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
