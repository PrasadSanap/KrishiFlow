import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Radio } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import bookingService from '../../services/bookingService';
import queueService from '../../services/queueService';
import { useSocket } from '../../context/SocketContext';

const LiveQueue = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const [booking, setBooking] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const bRes = await bookingService.getById(id);
    setBooking(bRes.data.booking);
    setQueueInfo(bRes.data.queueInfo);

    const qRes = await queueService.getCentreQueue(bRes.data.booking.centre._id, bRes.data.booking.date);
    setQueueList(qRes.queue);
    setLoading(false);
    return bRes.data.booking;
  };

  useEffect(() => {
    let centreId;
    loadAll().then((b) => {
      centreId = b.centre._id;
      if (socket) socket.emit('joinCentreQueue', { centreId });
    });

    return () => {
      if (socket && centreId) socket.emit('leaveCentreQueue', { centreId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, socket]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => loadAll();
    socket.on('queueUpdated', refresh);
    socket.on('farmerCalled', refresh);
    socket.on('bookingUpdated', refresh);
    return () => {
      socket.off('queueUpdated', refresh);
      socket.off('farmerCalled', refresh);
      socket.off('bookingUpdated', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id]);

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Radio className="text-primary-600 animate-pulse" size={18} />
          <h1 className="text-xl font-bold">Live Queue — {booking.centre?.name}</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card text-center !p-4">
            <p className="text-2xl font-bold text-primary-700">#{queueInfo?.currentServingToken ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Currently Serving</p>
          </div>
          <div className="card text-center !p-4 bg-primary-600 text-white border-none">
            <p className="text-2xl font-bold">#{booking.token}</p>
            <p className="text-xs text-primary-100 mt-1">Your Token</p>
          </div>
          <div className="card text-center !p-4">
            <p className="text-2xl font-bold">{queueInfo?.farmersAhead ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Farmers Ahead</p>
          </div>
          <div className="card text-center !p-4">
            <p className="text-2xl font-bold">{queueInfo?.estimatedWaitingMinutes ?? 0} min</p>
            <p className="text-xs text-gray-500 mt-1">Estimated Wait</p>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Queue List</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {queueList.map((q) => {
              const isMe = q.token === booking.token;
              const isDone = ['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(q.status);
              const isServing = ['ARRIVED', 'QUALITY_CHECK', 'WEIGHING'].includes(q.status);
              return (
                <div
                  key={q._id}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${
                    isMe ? 'bg-primary-50 font-semibold' : ''
                  }`}
                >
                  <span>#{q.token} — {isMe ? 'YOU' : q.farmerName}</span>
                  <span
                    className={
                      isDone
                        ? 'text-primary-600'
                        : isServing
                        ? 'text-amber-600'
                        : q.status === 'CANCELLED'
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }
                  >
                    {isDone ? 'Completed' : isServing ? 'Serving' : q.status === 'CANCELLED' ? 'Cancelled' : 'Waiting'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LiveQueue;
