import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import paymentService from '../../services/paymentService';
import { useSocket } from '../../context/SocketContext';
import { formatCurrency, formatDate } from '../../utils/constants';

const statusMeta = {
  PENDING: { icon: Clock, color: 'text-gray-400', label: 'Pending' },
  PROCESSING: { icon: Clock, color: 'text-purple-600', label: 'Processing' },
  COMPLETED: { icon: CheckCircle2, color: 'text-primary-600', label: 'Payment Completed' },
  FAILED: { icon: AlertCircle, color: 'text-red-600', label: 'Failed' },
};

const PaymentStatus = () => {
  const { bookingId } = useParams();
  const { socket } = useSocket();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = () => {
    paymentService
      .getByBooking(bookingId)
      .then((res) => setPayment(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [bookingId]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on('paymentUpdated', refresh);
    return () => socket.off('paymentUpdated', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, bookingId]);

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  if (notFound || !payment) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-4 py-10">
          <EmptyState title="No payment records" description="Payment details will appear once procurement is completed." />
        </div>
      </MainLayout>
    );
  }

  const meta = statusMeta[payment.status] || statusMeta.PENDING;
  const Icon = meta.icon;

  return (
    <MainLayout>
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="card text-center">
          <p className="text-xs text-amber-600 bg-amber-50 rounded-full px-3 py-1 inline-block mb-4">
            Prototype / Simulated Payment System
          </p>
          <Icon className={`mx-auto mb-3 ${meta.color}`} size={44} />
          <p className="text-sm text-gray-500 mb-1">Payment Amount</p>
          <p className="text-3xl font-extrabold mb-4">{formatCurrency(payment.amount)}</p>

          <div className={`badge mb-6 ${meta.color} bg-gray-50`}>{meta.label}</div>

          <div className="space-y-2 text-sm text-left border-t border-gray-100 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium">{payment.transactionId || 'Pending'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Date</span>
              <span className="font-medium">{payment.paymentDate ? formatDate(payment.paymentDate) : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentStatus;
