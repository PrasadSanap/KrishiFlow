import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Radar, Package, Bell } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import notificationService from '../../services/notificationService';
import queueService from '../../services/queueService';
import { formatDate, to12Hour } from '../../utils/constants';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeBooking = bookings.find((b) =>
    ['BOOKED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHING'].includes(b.status)
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsRes, notifRes] = await Promise.all([
          bookingService.getMy(),
          notificationService.getAll(),
        ]);
        setBookings(bookingsRes.data);
        setNotifications(notifRes.data.slice(0, 5));

        const active = bookingsRes.data.find((b) =>
          ['BOOKED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHING'].includes(b.status)
        );
        if (active) {
          const qRes = await queueService.getBookingQueueInfo(active._id);
          setQueueInfo(qRes.data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">Good Morning, {user?.fullName?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mb-6">Here's what's happening with your procurement.</p>

        {activeBooking ? (
          <div className="card mb-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none">
            <p className="text-primary-100 text-sm font-medium mb-3">Active Booking</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-primary-100 text-xs">Centre</p>
                <p className="font-semibold">{activeBooking.centre?.name}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Date</p>
                <p className="font-semibold">{formatDate(activeBooking.date)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Time</p>
                <p className="font-semibold">{to12Hour(activeBooking.startTime)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-xs">Token</p>
                <p className="font-bold text-2xl">#{activeBooking.token}</p>
              </div>
            </div>
            {queueInfo && (
              <div className="grid grid-cols-3 gap-3 bg-white/10 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{queueInfo.farmersAhead}</p>
                  <p className="text-xs text-primary-100">Farmers Ahead</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{queueInfo.estimatedWaitingMinutes}m</p>
                  <p className="text-xs text-primary-100">Est. Waiting</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">#{queueInfo.currentServingToken}</p>
                  <p className="text-xs text-primary-100">Now Serving</p>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Link to={`/queue/${activeBooking._id}`} className="btn bg-white text-primary-700 hover:bg-primary-50">
                <Radar size={16} /> Track Queue
              </Link>
              <Link to={`/procurement/${activeBooking._id}`} className="btn bg-white/10 text-white hover:bg-white/20 border border-white/30">
                <Package size={16} /> View Procurement
              </Link>
            </div>
          </div>
        ) : (
          <div className="card mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold">No active booking</p>
              <p className="text-sm text-gray-500">Book a slot to get your digital queue token.</p>
            </div>
            <Link to="/book-slot" className="btn-primary">
              <CalendarPlus size={18} /> Book New Slot
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h2 className="font-semibold mb-4">Recent Bookings</h2>
            {bookings.length === 0 ? (
              <EmptyState title="No active bookings" description="Book your first procurement slot to see it here." />
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b._id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                    <div>
                      <p className="font-medium text-sm">{b.centre?.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(b.date)} · {to12Hour(b.startTime)} · Token #{b.token}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Notifications</h2>
              <Bell size={16} className="text-gray-400" />
            </div>
            {notifications.length === 0 ? (
              <EmptyState title="No notifications" />
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n._id} className={`text-sm p-3 rounded-xl ${n.isRead ? 'bg-gray-50' : 'bg-primary-50'}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FarmerDashboard;
