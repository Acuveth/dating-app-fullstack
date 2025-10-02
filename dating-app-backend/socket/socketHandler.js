const User = require('../models/User');
const Match = require('../models/Match');
const { iceBreakers, wouldYouRatherQuestions, topics } = require('../utils/conversationHelpers');

const activeConnections = new Map();
const matchRooms = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('user:online', async (userId) => {
      try {
        activeConnections.set(userId, socket.id);
        socket.userId = userId;

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastActive: new Date()
        });

        socket.broadcast.emit('user:status', { userId, isOnline: true });
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    });

    socket.on('match:join', async ({ matchId, userId }) => {
      try {
        const match = await Match.findById(matchId);
        if (!match) return;

        const roomId = `match_${matchId}`;
        socket.join(roomId);

        if (!matchRooms.has(roomId)) {
          matchRooms.set(roomId, {
            users: new Set(),
            startTime: Date.now(),
            timerInterval: null
          });
        }

        const room = matchRooms.get(roomId);
        room.users.add(userId);

        // Start match when first user joins (for testing) or when both users join
        if ((room.users.size >= 1) && match.status === 'pending') {
          match.status = 'active';
          await match.save();

          io.to(roomId).emit('match:started', { matchId });

          // Start timer immediately when match becomes active
          room.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
            const remaining = 180 - elapsed;

            io.to(roomId).emit('timer:update', { remaining, elapsed });

            if (remaining <= 0) {
              clearInterval(room.timerInterval);
              io.to(roomId).emit('match:timeout', { matchId });
              handleMatchTimeout(matchId);
            }
          }, 1000);
        }

        socket.emit('match:joined', { roomId, matchId });
      } catch (error) {
        console.error('Error joining match:', error);
      }
    });

    socket.on('webrtc:offer', ({ offer, to, matchId }) => {
      const targetSocket = activeConnections.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('webrtc:offer', { offer, from: socket.userId });
      }
    });

    socket.on('webrtc:answer', ({ answer, to, matchId }) => {
      const targetSocket = activeConnections.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('webrtc:answer', { answer, from: socket.userId });
      }
    });

    socket.on('webrtc:ice-candidate', ({ candidate, to, matchId }) => {
      const targetSocket = activeConnections.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('webrtc:ice-candidate', {
          candidate,
          from: socket.userId
        });
      }
    });

    socket.on('helper:request', ({ type, matchId }) => {
      const roomId = `match_${matchId}`;
      let helper;

      switch (type) {
        case 'icebreaker':
          helper = {
            type: 'icebreaker',
            content: iceBreakers[Math.floor(Math.random() * iceBreakers.length)]
          };
          break;
        case 'wouldyourather':
          helper = {
            type: 'wouldyourather',
            content: wouldYouRatherQuestions[Math.floor(Math.random() * wouldYouRatherQuestions.length)]
          };
          break;
        case 'topic':
          helper = {
            type: 'topic',
            content: topics[Math.floor(Math.random() * topics.length)]
          };
          break;
        default:
          return;
      }

      io.to(roomId).emit('helper:received', helper);
    });

    socket.on('match:decision', async ({ matchId, decision, userId }) => {
      try {
        const match = await Match.findById(matchId);
        if (!match) return;

        const isUser1 = match.user1.toString() === userId;
        if (isUser1) {
          match.user1Decision = decision;
        } else {
          match.user2Decision = decision;
        }

        await match.save();

        const roomId = `match_${matchId}`;

        // Check if both users have made decisions or if testing with single user
        const bothDecided = match.user1Decision !== 'pending' && match.user2Decision !== 'pending';
        const singleUserDecided = match.user1Decision !== 'pending' || match.user2Decision !== 'pending';

        if (match.user1Decision === 'yes' && match.user2Decision === 'yes') {
          // Both chose to continue - extend the match
          match.status = 'extended';
          match.extended = true;
          await match.save();

          io.to(roomId).emit('match:extended', { matchId });

          // Stop the timer when match is extended
          const room = matchRooms.get(roomId);
          if (room && room.timerInterval) {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
          }
        } else if (bothDecided || (singleUserDecided && process.env.NODE_ENV !== 'production')) {
          // Handle when both decided or single user for testing
          if (match.user1Decision === 'no' || match.user2Decision === 'no') {
            match.status = 'ended';
            match.endedAt = new Date();
            await match.save();

            io.to(roomId).emit('match:ended', {
              matchId,
              mutual: false,
              user1Decision: match.user1Decision,
              user2Decision: match.user2Decision
            });

            cleanupMatchRoom(roomId);
          } else if (match.user1Decision === 'yes' && match.user2Decision === 'pending') {
            // Single user said yes, treat as continue for testing
            match.status = 'extended';
            match.extended = true;
            match.user2Decision = 'yes'; // Auto-accept for testing
            await match.save();

            io.to(roomId).emit('match:extended', { matchId });

            const room = matchRooms.get(roomId);
            if (room && room.timerInterval) {
              clearInterval(room.timerInterval);
              room.timerInterval = null;
            }
          }
        }
      } catch (error) {
        console.error('Error handling decision:', error);
      }
    });

    socket.on('match:skip', async ({ matchId, userId }) => {
      console.log('🚫 MATCH SKIP RECEIVED:', { matchId, userId, socketId: socket.id });
      try {
        const match = await Match.findById(matchId);
        if (!match) {
          console.log('❌ Match not found:', matchId);
          return;
        }

        console.log('⚰️ Ending match:', matchId);
        match.status = 'ended';
        match.endedAt = new Date();

        const isUser1 = match.user1.toString() === userId;
        if (isUser1) {
          match.user1Decision = 'no';
        } else {
          match.user2Decision = 'no';
        }

        await match.save();
        console.log('💾 Match saved with status:', match.status);

        // Send skip notification to the user who skipped (direct socket response)
        socket.emit('match:skipped', { matchId, skippedBy: userId });
        console.log('📡 Emitted match:skipped directly to socket:', socket.id);

        // Also try sending to room in case other user is connected
        const roomId = `match_${matchId}`;
        io.to(roomId).emit('match:skipped', { matchId, skippedBy: userId });
        console.log('📡 Also emitted match:skipped to room:', roomId);

        cleanupMatchRoom(roomId);
        console.log('🧹 Match room cleaned up');
      } catch (error) {
        console.error('Error skipping match:', error);
      }
    });

    socket.on('match:leave', ({ matchId }) => {
      const roomId = `match_${matchId}`;
      socket.leave(roomId);

      if (matchRooms.has(roomId)) {
        const room = matchRooms.get(roomId);
        room.users.delete(socket.userId);

        if (room.users.size === 0) {
          cleanupMatchRoom(roomId);
        }
      }
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        activeConnections.delete(socket.userId);

        try {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastActive: new Date()
          });

          socket.broadcast.emit('user:status', {
            userId: socket.userId,
            isOnline: false
          });
        } catch (error) {
          console.error('Error updating user offline status:', error);
        }
      }
    });
  });

  async function handleMatchTimeout(matchId) {
    try {
      const match = await Match.findById(matchId);
      if (!match || match.status !== 'active') return;

      if (match.user1Decision === 'pending' || match.user2Decision === 'pending') {
        match.status = 'ended';
        match.endedAt = new Date();
        await match.save();

        const roomId = `match_${matchId}`;
        cleanupMatchRoom(roomId);
      }
    } catch (error) {
      console.error('Error handling match timeout:', error);
    }
  }

  function cleanupMatchRoom(roomId) {
    if (matchRooms.has(roomId)) {
      const room = matchRooms.get(roomId);
      if (room.timerInterval) {
        clearInterval(room.timerInterval);
      }
      matchRooms.delete(roomId);
    }
  }
};

module.exports = socketHandler;