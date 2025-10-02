import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = 'http://172.20.10.2:5001';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(180);

  useEffect(() => {
    if (user && token) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const initializeSocket = () => {

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('user:online', user._id);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('match:started', ({ matchId }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'active', matchId }));
    });

    socketRef.current.on('match:timeout', ({ matchId }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'timeout' }));
    });

    socketRef.current.on('match:extended', ({ matchId }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'extended' }));
    });

    socketRef.current.on('match:ended', ({ matchId, mutual, user1Decision, user2Decision }) => {
      setCurrentMatch(prev => ({
        ...prev,
        status: 'ended',
        mutual,
        user1Decision,
        user2Decision
      }));
    });

    socketRef.current.on('match:skipped', ({ matchId, skippedBy }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'skipped', skippedBy }));
    });

    socketRef.current.on('timer:update', ({ remaining, elapsed }) => {
      setTimeRemaining(remaining);
    });

    socketRef.current.on('helper:received', (helper) => {
      console.log('📨 helper:received event from server:', helper);
      console.log('📊 Helper data type:', typeof helper);
      console.log('📋 Helper has content:', !!helper?.content);
      console.log('🏷️ Helper type:', helper?.type);

      if (!helper) {
        console.log('⚠️ WARNING: Server returned null/undefined helper - might be out of content!');
      }

      setCurrentMatch(prev => ({
        ...prev,
        currentHelper: helper
      }));

      console.log('✅ currentMatch.currentHelper updated');
    });

    // Handle helper request errors (like running out of content)
    socketRef.current.on('helper:error', (error) => {
      console.log('❌ helper:error event from server:', error);
      console.log('🚨 This might indicate no more content available!');
    });

    // Video call events for demo purposes
    socketRef.current.on('video:call-started', ({ matchId, from }) => {
      console.log('Video call started:', matchId, from);
    });

    socketRef.current.on('video:call-ended', ({ matchId, from }) => {
      console.log('Video call ended:', matchId, from);
    });
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const joinMatch = (matchId) => {
    console.log('joinMatch called with:', { matchId, userId: user?._id, socketConnected: !!socketRef.current });
    if (socketRef.current && user) {
      console.log('Emitting match:join event');
      socketRef.current.emit('match:join', { matchId, userId: user._id });
      setCurrentMatch({ matchId, status: 'pending' });
    } else {
      console.log('Cannot join match - missing socket or user:', { socket: !!socketRef.current, user: !!user });
    }
  };

  const leaveMatch = (matchId) => {
    if (socketRef.current) {
      socketRef.current.emit('match:leave', { matchId });
      setCurrentMatch(null);
      setTimeRemaining(180);
    }
  };

  const makeDecision = (matchId, decision) => {
    if (socketRef.current && user) {
      socketRef.current.emit('match:decision', {
        matchId,
        decision,
        userId: user._id
      });
    }
  };

  const skipMatch = (matchId) => {
    console.log('skipMatch called with:', { matchId, userId: user?._id, socketConnected: !!socketRef.current });
    if (socketRef.current && user) {
      console.log('Emitting match:skip event');
      socketRef.current.emit('match:skip', {
        matchId,
        userId: user._id
      });
    } else {
      console.log('Cannot skip - missing socket or user:', { socket: !!socketRef.current, user: !!user });
    }
  };

  const requestHelper = (type, matchId) => {
    console.log('🚀 SocketContext.requestHelper called with:', { type, matchId });
    if (socketRef.current) {
      console.log('📡 Emitting helper:request to server');
      socketRef.current.emit('helper:request', { type, matchId });
    } else {
      console.log('❌ No socket connection available');
    }
  };

  const startVideoCall = (matchId, partnerId) => {
    if (socketRef.current) {
      socketRef.current.emit('video:call-started', { matchId, partnerId });
    }
  };

  const endVideoCall = (matchId, partnerId) => {
    if (socketRef.current) {
      socketRef.current.emit('video:call-ended', { matchId, partnerId });
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    currentMatch,
    timeRemaining,
    joinMatch,
    leaveMatch,
    makeDecision,
    skipMatch,
    requestHelper,
    startVideoCall,
    endVideoCall,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};