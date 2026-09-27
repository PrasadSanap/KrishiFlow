import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProcurementTimeline from '../../components/ProcurementTimeline';
import bookingService from '../../services/bookingService';
import { useSocket } from '../../context/SocketContext';
import { formatCurrency } from '../../utils/constants';

const ProcurementTracking = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    bookingService.getById(id).then((res) => {
      setBooking(res.data.booking);
      setLoading(false);
    });
  };

  useEffect(load, [id]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on('bookingUpdated', refresh);
    socket.on('procurementUpdated', refresh);
    return () => {
      socket.off('bookingUpdated', refresh);
      socket.off('procurementUpdated', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id]);

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold mb-1">Procurement Tracking</h1>
        <p className="text-gray-500 text-sm mb-6">Booking ID: {booking.bookingId}</p>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Progress</h2>
            <ProcurementTimeline status={booking.status} />
          </div>

          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-3">Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Crop</span><span className="font-medium">{booking.crop}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Estimated Quantity</span><span className="font-medium">{booking.estimatedQuantityKg} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Centre</span><span className="font-medium">{booking.centre?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Token</span><span className="font-medium">#{booking.token}</span></div>
              </div>
            </div>

            {['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(booking.status) && (
              <Link to={`/payment/${booking._id}`} className="btn-primary w-full">
                <Wallet size={16} /> View Payment Status
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProcurementTracking;
