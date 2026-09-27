import React, { useEffect, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import notificationService from '../services/notificationService';
import { useSocket } from '../context/SocketContext';

const typeColors = {
  BOOKING: 'bg-blue-50 text-blue-600',
  QUEUE: 'bg-amber-50 text-amber-600',
  PROCUREMENT: 'bg-teal-50 text-teal-600',
  PAYMENT: 'bg-purple-50 text-purple-600',
  GENERAL: 'bg-gray-50 text-gray-600',
};

const Notifications = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationService.getAll().then((res) => {
      setNotifications(res.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => load();
    socket.on('notificationCreated', handler);
    return () => socket.off('notificationCreated', handler);
  }, [socket]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    load();
  };

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id);
    load();
  };

  if (loading) return <MainLayout><LoadingSpinner fullScreen /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Notifications</h1>
          <button onClick={handleMarkAllRead} className="btn-outline !py-1.5 !px-3 text-xs">
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>

        {notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up." />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
                className={`card w-full text-left flex items-start gap-3 !p-4 ${n.isRead ? '' : 'border-primary-200 bg-primary-50/40'}`}
              >
                <span className={`badge shrink-0 ${typeColors[n.type] || typeColors.GENERAL}`}>{n.type}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
