import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, PhoneCall, UserCheck, ScanLine, Scale, IndianRupee, X } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import centreDashboardService from '../../services/centreDashboardService';
import queueService from '../../services/queueService';
import procurementService from '../../services/procurementService';
import paymentService from '../../services/paymentService';
import { getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/constants';

const todayISO = () => new Date().toISOString().slice(0, 10);

const ActionModal = ({ booking, onClose, onDone }) => {
  const [weightKg, setWeightKg] = useState(booking.estimatedQuantityKg || '');
  const [ratePerKg, setRatePerKg] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const totalAmount =
    weightKg && ratePerKg ? (Number(weightKg) * Number(ratePerKg)).toFixed(2) : null;

  const act = async (fn, successMsg) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <p className="text-xs text-gray-400 mb-1">Token #{booking.token} · {booking.bookingId}</p>
        <h2 className="font-bold text-lg mb-1">{booking.farmer?.fullName || booking.farmerName}</h2>
        <div className="mb-4"><StatusBadge status={booking.status} /></div>

        {booking.status === 'ARRIVED' && (
          <button
            disabled={busy}
            onClick={() => act(() => procurementService.startQuality(booking._id), 'Quality check started')}
            className="btn-primary w-full"
          >
            <ScanLine size={16} /> Start Quality Check
          </button>
        )}

        {booking.status === 'QUALITY_CHECK' && (
          <div className="space-y-3">
            <div>
              <label className="label">Notes (optional)</label>
              <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Meets FAQ standard" />
            </div>
            <div className="flex gap-2">
              <button
                disabled={busy}
                onClick={() => act(() => procurementService.completeQuality(booking._id, { passed: true, notes }), 'Quality check completed')}
                className="btn-primary flex-1"
              >
                Passed
              </button>
              <button
                disabled={busy}
                onClick={() => act(() => procurementService.completeQuality(booking._id, { passed: false, notes }), 'Quality check completed')}
                className="btn-outline flex-1"
              >
                Failed
              </button>
            </div>
          </div>
        )}

        {booking.status === 'WEIGHING' && (
          <div className="space-y-3">
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" className="input" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
            <div>
              <label className="label">Rate (₹/kg)</label>
              <input type="number" className="input" value={ratePerKg} onChange={(e) => setRatePerKg(e.target.value)} />
            </div>
            {totalAmount && (
              <p className="text-sm bg-primary-50 text-primary-700 rounded-lg p-3 font-semibold">
                Total: {formatCurrency(totalAmount)}
              </p>
            )}
            <button
              disabled={busy || !weightKg || !ratePerKg}
              onClick={() =>
                act(
                  () => procurementService.completeWeighing(booking._id, { weightKg: Number(weightKg), ratePerKg: Number(ratePerKg) }),
                  'Procurement completed'
                )
              }
              className="btn-primary w-full"
            >
              <Scale size={16} /> Complete Procurement
            </button>
          </div>
        )}

        {booking.status === 'PROCUREMENT_COMPLETED' && (
          <button
            disabled={busy}
            onClick={() => act(() => paymentService.process(booking._id), 'Payment moved to processing')}
            className="btn-primary w-full"
          >
            <IndianRupee size={16} /> Move Payment to Processing
          </button>
        )}

        {booking.status === 'PAYMENT_PROCESSING' && (
          <button
            disabled={busy}
            onClick={() => act(() => paymentService.complete(booking._id), 'Payment completed')}
            className="btn-primary w-full"
          >
            <IndianRupee size={16} /> Mark Payment Completed
          </button>
        )}

        {['BOOKED', 'PAYMENT_COMPLETED', 'CANCELLED'].includes(booking.status) && (
          <p className="text-sm text-gray-400 text-center py-4">
            {booking.status === 'BOOKED' ? 'Call this farmer next from the queue to begin.' : 'No further action needed.'}
          </p>
        )}
      </div>
    </div>
  );
};

const CentreDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => {
    centreDashboardService.getSummary(todayISO()).then((res) => {
      setSummary(res);
      setLoading(false);
    });
  };

  useEffect(load, []);

  useEffect(() => {
    if (!user?.centre?._id) return;
    if (socket) socket.emit('joinCentreQueue', { centreId: user.centre._id });
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on('queueUpdated', refresh);
    socket.on('farmerCalled', refresh);
    socket.on('procurementUpdated', refresh);
    socket.on('paymentUpdated', refresh);
    return () => {
      socket.off('queueUpdated', refresh);
      socket.off('farmerCalled', refresh);
      socket.off('procurementUpdated', refresh);
      socket.off('paymentUpdated', refresh);
    };
  }, [socket]);

  const handleCallNext = async (bookingId) => {
    try {
      await queueService.callNext(bookingId);
      toast.success('Farmer called');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const res = await centreDashboardService.search(query.trim(), todayISO());
    setSearchResults(res.data);
  };

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  const nextWaiting = summary.queue.find((q) => q.status === 'BOOKED');
  const displayList = searchResults ?? summary.queue;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">{user?.centre?.name || 'Centre Dashboard'}</h1>
        <p className="text-gray-500 mb-6">Live queue and procurement management</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold">{summary.stats.totalBookings}</p>
            <p className="text-xs text-gray-500 mt-1">Today's Bookings</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-amber-600">{summary.stats.waiting}</p>
            <p className="text-xs text-gray-500 mt-1">Waiting</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-600">{summary.stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-purple-600">{summary.stats.pendingPayments}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Payments</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              className="input"
              placeholder="Search by token, name or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-outline"><Search size={16} /></button>
            {searchResults && (
              <button type="button" onClick={() => { setQuery(''); setSearchResults(null); }} className="btn-outline">
                <X size={16} />
              </button>
            )}
          </form>
          <button
            disabled={!nextWaiting}
            onClick={() => handleCallNext(nextWaiting._id)}
            className="btn-primary whitespace-nowrap"
          >
            <PhoneCall size={16} /> Call Next Farmer {nextWaiting ? `(#${nextWaiting.token})` : ''}
          </button>
        </div>

        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Token</th>
                  <th className="text-left px-4 py-3">Farmer</th>
                  <th className="text-left px-4 py-3">Crop</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState title="No farmers waiting" description="The queue is empty right now." />
                    </td>
                  </tr>
                ) : (
                  displayList.map((q) => (
                    <tr key={q._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold">#{q.token}</td>
                      <td className="px-4 py-3">{q.farmerName || q.farmer?.fullName}</td>
                      <td className="px-4 py-3">{q.crop}</td>
                      <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                      <td className="px-4 py-3">
                        {q.status === 'BOOKED' ? (
                          <button onClick={() => handleCallNext(q._id)} className="btn-outline !py-1 !px-2.5 text-xs">
                            <UserCheck size={13} /> Call
                          </button>
                        ) : (
                          <button onClick={() => setSelected(q)} className="btn-outline !py-1 !px-2.5 text-xs">
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <ActionModal
          booking={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </MainLayout>
  );
};

export default CentreDashboard;
