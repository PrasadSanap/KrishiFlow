/**
 * Socket.IO connection handler.
 *
 * Rooms:
 *  - `user:<userId>`   -> personal room for notifications and booking updates for one farmer
 *  - `centre:<centreId>` -> room for a procurement centre's live queue (operators + farmers currently in that queue)
 *
 * Client-emitted events:
 *  - joinUserRoom      { userId }
 *  - joinCentreQueue   { centreId }
 *  - leaveCentreQueue  { centreId }
 *
 * Server-emitted (broadcast) events:
 *  - queueUpdated        (centre room)  - the whole queue list changed
 *  - farmerCalled        (centre room)  - operator called the next farmer
 *  - bookingUpdated       (user room)   - a specific farmer's booking status changed
 *  - notificationCreated  (user room)   - a new notification was created
 *  - procurementUpdated   (centre + user room)
 *  - paymentUpdated       (centre + user room)
 */

const initSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinUserRoom', ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on('joinCentreQueue', ({ centreId }) => {
      if (centreId) socket.join(`centre:${centreId}`);
    });

    socket.on('leaveCentreQueue', ({ centreId }) => {
      if (centreId) socket.leave(`centre:${centreId}`);
    });

    socket.on('disconnect', () => {
      // no-op; rooms are cleaned up automatically by socket.io
    });
  });
};

module.exports = initSocket;
