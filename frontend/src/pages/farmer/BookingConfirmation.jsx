import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Radar, FileText, Home } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import bookingService from '../../services/bookingService';
import queueService from '../../services/queueService';
import { formatDate, to12Hour } from '../../utils/constants';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getById(id).then((res) => {
      setBooking(res.data.booking);
      setQueueInfo(res.data.queueInfo);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;
  if (!booking) return null;

  return (
    <MainLayout>
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="card text-center">
          <CheckCircle2 className="mx-auto text-primary-600 mb-3" size={48} />
          <h1 className="text-xl font-bold text-primary-700 mb-1">SLOT CONFIRMED</h1>
          <p className="text-gray-500 text-sm mb-6">{booking.centre?.name}</p>

          <div className="flex justify-center gap-6 text-sm text-gray-500 mb-6">
            <span>{formatDate(booking.date)}</span>
            <span>{to12Hour(booking.startTime)}</span>
          </div>

          <div className="bg-primary-50 rounded-2xl py-6 mb-6">
            <p className="text-xs text-primary-600 font-semibold mb-1">QUEUE TOKEN</p>
            <p className="text-5xl font-extrabold text-primary-700">#{booking.token}</p>
          </div>

          {queueInfo && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold">{queueInfo.farmersAhead}</p>
                <p className="text-xs text-gray-500">Farmers Ahead</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold">{queueInfo.estimatedWaitingMinutes} min</p>
                <p className="text-xs text-gray-500">Est. Waiting</p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mb-6">Booking ID: {booking.bookingId}</p>

          <div className="flex flex-col gap-2">
            <Link to={`/queue/${booking._id}`} className="btn-primary w-full">
              <Radar size={16} /> Track Queue
            </Link>
            <Link to={`/procurement/${booking._id}`} className="btn-outline w-full">
              <FileText size={16} /> View Booking
            </Link>
            <Link to="/dashboard" className="btn-outline w-full">
              <Home size={16} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingConfirmation;
