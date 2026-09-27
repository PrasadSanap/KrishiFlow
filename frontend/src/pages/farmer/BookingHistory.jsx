import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, XCircle } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import bookingService from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import { formatDate, to12Hour } from '../../utils/constants';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    bookingService.getMy().then((res) => {
      setBookings(res.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancel(id);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold mb-6">Booking History</h1>

        {bookings.length === 0 ? (
          <EmptyState title="No active bookings" description="You haven't booked any procurement slots yet." />
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const canCancel = ['BOOKED'].includes(b.status);
              return (
                <div key={b._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{b.centre?.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(b.date)} · {to12Hour(b.startTime)} · {b.crop} · {b.estimatedQuantityKg} kg
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Token #{b.token} · {b.bookingId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <Link to={`/procurement/${b._id}`} className="btn-outline !px-3 !py-1.5 text-xs">
                      <Eye size={14} /> View
                    </Link>
                    {canCancel && (
                      <button onClick={() => handleCancel(b._id)} className="btn-danger !px-3 !py-1.5 text-xs">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BookingHistory;
